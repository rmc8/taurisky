/**
 * Storage module for secure credential management
 *
 * Provides encrypted file-based storage for accounts and authentication tokens
 */

pub mod columns;
mod crypto;
mod persistence;

use crate::types::{Account, AuthError, AuthToken};
use persistence::{PersistentStorage, StorageData};
use std::path::PathBuf;
use std::sync::Mutex;

/// Storage manager for authentication data
/// Uses encrypted file-based storage for persistence
pub struct StorageManager {
    /// Persistent storage backend
    persistence: Mutex<PersistentStorage>,
    /// In-memory cache (synchronized with disk)
    cache: Mutex<StorageData>,
}

impl StorageManager {
    /// Create a new storage manager
    ///
    /// # Arguments
    /// * `data_dir` - Directory to store encrypted files
    pub fn new(data_dir: PathBuf) -> Result<Self, AuthError> {
        // Use a default password for now
        // In production, this should be derived from device-specific or user-specific credentials
        let password = "taurisky_default_password_v1";

        let persistence = PersistentStorage::new(data_dir, password)?;

        // Load existing data or create new
        let cache = persistence.load()?;

        Ok(Self {
            persistence: Mutex::new(persistence),
            cache: Mutex::new(cache),
        })
    }

    /// Save current cache to disk
    fn persist(&self) -> Result<(), AuthError> {
        let cache = self.cache.lock().map_err(|e| {
            AuthError::StorageError(format!("Cache lock error: {}", e))
        })?;

        let persistence = self.persistence.lock().map_err(|e| {
            AuthError::StorageError(format!("Persistence lock error: {}", e))
        })?;

        persistence.save(&cache)
    }

    /// Save an authentication token (encrypted and persisted to disk)
    pub async fn save_auth_token(&self, token: &AuthToken) -> Result<(), AuthError> {
        let mut cache = self.cache.lock().map_err(|e| {
            AuthError::StorageError(format!("Cache lock error: {}", e))
        })?;

        cache.tokens.insert(token.account_id.clone(), token.clone());

        // Release lock before persisting
        drop(cache);

        // Persist to disk
        self.persist()
    }

    /// Get an authentication token from storage
    pub async fn get_auth_token(&self, account_id: &str) -> Result<AuthToken, AuthError> {
        let cache = self.cache.lock().map_err(|e| {
            AuthError::StorageError(format!("Cache lock error: {}", e))
        })?;

        cache
            .tokens
            .get(account_id)
            .cloned()
            .ok_or_else(|| AuthError::AccountNotFound(account_id.to_string()))
    }

    /// Delete an authentication token from storage
    pub async fn delete_auth_token(&self, account_id: &str) -> Result<(), AuthError> {
        let mut cache = self.cache.lock().map_err(|e| {
            AuthError::StorageError(format!("Cache lock error: {}", e))
        })?;

        cache.tokens.remove(account_id);

        // Release lock before persisting
        drop(cache);

        // Persist to disk
        self.persist()
    }

    /// Save an account (persisted to disk)
    pub async fn save_account(&self, account: &Account) -> Result<(), AuthError> {
        let mut cache = self.cache.lock().map_err(|e| {
            AuthError::StorageError(format!("Cache lock error: {}", e))
        })?;

        cache.accounts.insert(account.id.clone(), account.clone());

        // Release lock before persisting
        drop(cache);

        // Persist to disk
        self.persist()
    }

    /// Get an account by ID
    pub async fn get_account(&self, account_id: &str) -> Result<Account, AuthError> {
        let cache = self.cache.lock().map_err(|e| {
            AuthError::StorageError(format!("Cache lock error: {}", e))
        })?;

        cache
            .accounts
            .get(account_id)
            .cloned()
            .ok_or_else(|| AuthError::AccountNotFound(account_id.to_string()))
    }

    /// List all accounts
    pub async fn list_accounts(&self) -> Result<Vec<Account>, AuthError> {
        let cache = self.cache.lock().map_err(|e| {
            AuthError::StorageError(format!("Cache lock error: {}", e))
        })?;

        Ok(cache.accounts.values().cloned().collect())
    }

    /// Delete an account
    pub async fn delete_account(&self, account_id: &str) -> Result<(), AuthError> {
        let mut cache = self.cache.lock().map_err(|e| {
            AuthError::StorageError(format!("Cache lock error: {}", e))
        })?;

        cache.accounts.remove(account_id);

        // Release lock before persisting
        drop(cache);

        // Persist to disk
        self.persist()
    }

    /// Clear all stored data (for logout all or reset)
    #[allow(dead_code)]
    pub async fn clear_all(&self) -> Result<(), AuthError> {
        let mut cache = self.cache.lock().map_err(|e| {
            AuthError::StorageError(format!("Cache lock error: {}", e))
        })?;

        cache.accounts.clear();
        cache.tokens.clear();

        // Release lock before persisting
        drop(cache);

        // Also clear persistent storage
        let persistence = self.persistence.lock().map_err(|e| {
            AuthError::StorageError(format!("Persistence lock error: {}", e))
        })?;

        persistence.clear()
    }
}
