/**
 * Storage module for secure credential management using Tauri Plugin Stronghold
 *
 * Stronghold provides encrypted vault storage for sensitive data like authentication tokens
 */

use crate::types::{Account, AuthError, AuthToken};
use std::collections::HashMap;
use std::sync::Mutex;

/// Storage manager for authentication data
/// Uses Stronghold for encrypted token storage
pub struct StorageManager {
    /// In-memory cache of accounts (non-sensitive data)
    accounts: Mutex<HashMap<String, Account>>,
    /// In-memory cache of tokens (temporary, encrypted in Stronghold)
    tokens: Mutex<HashMap<String, AuthToken>>,
}

impl StorageManager {
    /// Create a new storage manager
    pub fn new() -> Self {
        Self {
            accounts: Mutex::new(HashMap::new()),
            tokens: Mutex::new(HashMap::new()),
        }
    }

    /// Save an authentication token to Stronghold (encrypted)
    pub async fn save_auth_token(&self, token: &AuthToken) -> Result<(), AuthError> {
        // TODO: Implement Stronghold persistence
        // For now, store in memory
        let mut tokens = self
            .tokens
            .lock()
            .map_err(|e| AuthError::StorageError(format!("Lock error: {}", e)))?;

        tokens.insert(token.account_id.clone(), token.clone());
        Ok(())
    }

    /// Get an authentication token from Stronghold
    pub async fn get_auth_token(&self, account_id: &str) -> Result<AuthToken, AuthError> {
        let tokens = self
            .tokens
            .lock()
            .map_err(|e| AuthError::StorageError(format!("Lock error: {}", e)))?;

        tokens
            .get(account_id)
            .cloned()
            .ok_or_else(|| AuthError::AccountNotFound(account_id.to_string()))
    }

    /// Delete an authentication token from Stronghold
    pub async fn delete_auth_token(&self, account_id: &str) -> Result<(), AuthError> {
        let mut tokens = self
            .tokens
            .lock()
            .map_err(|e| AuthError::StorageError(format!("Lock error: {}", e)))?;

        tokens.remove(account_id);
        Ok(())
    }

    /// Save an account (non-sensitive metadata)
    pub async fn save_account(&self, account: &Account) -> Result<(), AuthError> {
        let mut accounts = self
            .accounts
            .lock()
            .map_err(|e| AuthError::StorageError(format!("Lock error: {}", e)))?;

        accounts.insert(account.id.clone(), account.clone());
        Ok(())
    }

    /// Get an account by ID
    pub async fn get_account(&self, account_id: &str) -> Result<Account, AuthError> {
        let accounts = self
            .accounts
            .lock()
            .map_err(|e| AuthError::StorageError(format!("Lock error: {}", e)))?;

        accounts
            .get(account_id)
            .cloned()
            .ok_or_else(|| AuthError::AccountNotFound(account_id.to_string()))
    }

    /// List all accounts
    pub async fn list_accounts(&self) -> Result<Vec<Account>, AuthError> {
        let accounts = self
            .accounts
            .lock()
            .map_err(|e| AuthError::StorageError(format!("Lock error: {}", e)))?;

        Ok(accounts.values().cloned().collect())
    }

    /// Delete an account
    pub async fn delete_account(&self, account_id: &str) -> Result<(), AuthError> {
        let mut accounts = self
            .accounts
            .lock()
            .map_err(|e| AuthError::StorageError(format!("Lock error: {}", e)))?;

        accounts.remove(account_id);
        Ok(())
    }

    /// Clear all stored data (for logout all or reset)
    #[allow(dead_code)]
    pub async fn clear_all(&self) -> Result<(), AuthError> {
        let mut accounts = self
            .accounts
            .lock()
            .map_err(|e| AuthError::StorageError(format!("Lock error: {}", e)))?;

        let mut tokens = self
            .tokens
            .lock()
            .map_err(|e| AuthError::StorageError(format!("Lock error: {}", e)))?;

        accounts.clear();
        tokens.clear();
        Ok(())
    }
}

impl Default for StorageManager {
    fn default() -> Self {
        Self::new()
    }
}
