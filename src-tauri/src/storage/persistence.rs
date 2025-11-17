/**
 * Persistent file storage with encryption
 *
 * Manages secure storage of accounts and tokens to disk
 */

use crate::storage::crypto::{decrypt, derive_key_from_password, encrypt, generate_salt};
use crate::types::{Account, AuthError, AuthToken};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

/// Container for all persistent data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorageData {
    /// All registered accounts
    pub accounts: HashMap<String, Account>,
    /// Authentication tokens (sensitive)
    pub tokens: HashMap<String, AuthToken>,
}

impl StorageData {
    pub fn new() -> Self {
        Self {
            accounts: HashMap::new(),
            tokens: HashMap::new(),
        }
    }
}

/// File-based persistent storage with encryption
pub struct PersistentStorage {
    /// Path to encrypted storage file
    data_file: PathBuf,
    /// Path to salt file
    salt_file: PathBuf,
    /// Encryption key derived from password
    encryption_key: Vec<u8>,
}

impl PersistentStorage {
    /// Create a new persistent storage instance
    ///
    /// # Arguments
    /// * `data_dir` - Directory to store encrypted files
    /// * `password` - Master password for encryption (in production, use app-specific password)
    pub fn new(data_dir: PathBuf, password: &str) -> Result<Self, AuthError> {
        // Ensure data directory exists
        fs::create_dir_all(&data_dir).map_err(|e| {
            AuthError::StorageError(format!("Failed to create data directory: {}", e))
        })?;

        let data_file = data_dir.join("storage.enc");
        let salt_file = data_dir.join("salt.bin");

        // Load or generate salt
        let salt = if salt_file.exists() {
            fs::read(&salt_file).map_err(|e| {
                AuthError::StorageError(format!("Failed to read salt file: {}", e))
            })?
        } else {
            let salt = generate_salt();
            fs::write(&salt_file, &salt).map_err(|e| {
                AuthError::StorageError(format!("Failed to write salt file: {}", e))
            })?;
            salt
        };

        // Derive encryption key from password
        let encryption_key = derive_key_from_password(password, &salt)
            .map_err(|e| AuthError::StorageError(format!("Key derivation failed: {}", e)))?;

        Ok(Self {
            data_file,
            salt_file,
            encryption_key,
        })
    }

    /// Load storage data from disk
    pub fn load(&self) -> Result<StorageData, AuthError> {
        if !self.data_file.exists() {
            // No data file yet - return empty storage
            return Ok(StorageData::new());
        }

        // Read encrypted data
        let encrypted_data = fs::read_to_string(&self.data_file).map_err(|e| {
            AuthError::StorageError(format!("Failed to read storage file: {}", e))
        })?;

        // Decrypt data
        let decrypted_bytes = decrypt(&encrypted_data, &self.encryption_key)
            .map_err(|e| AuthError::StorageError(format!("Decryption failed: {}", e)))?;

        // Deserialize JSON
        serde_json::from_slice(&decrypted_bytes).map_err(|e| {
            AuthError::StorageError(format!("Failed to parse storage data: {}", e))
        })
    }

    /// Save storage data to disk
    pub fn save(&self, data: &StorageData) -> Result<(), AuthError> {
        // Serialize to JSON
        let json_bytes = serde_json::to_vec(data).map_err(|e| {
            AuthError::StorageError(format!("Failed to serialize storage data: {}", e))
        })?;

        // Encrypt data
        let encrypted_data = encrypt(&json_bytes, &self.encryption_key)
            .map_err(|e| AuthError::StorageError(format!("Encryption failed: {}", e)))?;

        // Write to file
        fs::write(&self.data_file, encrypted_data).map_err(|e| {
            AuthError::StorageError(format!("Failed to write storage file: {}", e))
        })?;

        Ok(())
    }

    /// Clear all stored data (delete files)
    pub fn clear(&self) -> Result<(), AuthError> {
        if self.data_file.exists() {
            fs::remove_file(&self.data_file).map_err(|e| {
                AuthError::StorageError(format!("Failed to delete storage file: {}", e))
            })?;
        }
        if self.salt_file.exists() {
            fs::remove_file(&self.salt_file).map_err(|e| {
                AuthError::StorageError(format!("Failed to delete salt file: {}", e))
            })?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;
    use uuid::Uuid;

    #[test]
    fn test_storage_save_and_load() {
        let temp_dir = tempdir().unwrap();
        let storage = PersistentStorage::new(temp_dir.path().to_path_buf(), "test_password")
            .expect("Storage creation should succeed");

        // Create test data
        let mut data = StorageData::new();
        let account_id = Uuid::new_v4().to_string();

        let account = Account {
            id: account_id.clone(),
            did: "did:plc:test123".to_string(),
            handle: "test.bsky.social".to_string(),
            email: Some("test@example.com".to_string()),
            display_name: Some("Test User".to_string()),
            avatar: None,
            server_url: "https://bsky.social".to_string(),
            created_at: chrono::Utc::now().to_rfc3339(),
            last_used_at: chrono::Utc::now().to_rfc3339(),
            is_active: true,
        };

        data.accounts.insert(account_id.clone(), account.clone());

        // Save data
        storage.save(&data).expect("Save should succeed");

        // Load data
        let loaded_data = storage.load().expect("Load should succeed");

        assert_eq!(loaded_data.accounts.len(), 1);
        assert_eq!(
            loaded_data.accounts.get(&account_id).unwrap().handle,
            "test.bsky.social"
        );
    }
}
