/**
 * Cryptographic utilities for secure data storage
 *
 * Provides AES-256-GCM encryption for sensitive authentication data
 */

use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Key, Nonce,
};
use argon2::{
    password_hash::{rand_core::RngCore, PasswordHasher, SaltString},
    Argon2,
};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};

/// Derive encryption key from password using Argon2
pub fn derive_key_from_password(password: &str, salt: &[u8]) -> Result<Vec<u8>, String> {
    let argon2 = Argon2::default();
    let salt_string = SaltString::encode_b64(salt).map_err(|e| format!("Salt encoding error: {}", e))?;

    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt_string)
        .map_err(|e| format!("Password hashing failed: {}", e))?;

    let hash = password_hash
        .hash
        .ok_or_else(|| "Password hash extraction failed".to_string())?;

    // Take first 32 bytes for AES-256
    Ok(hash.as_bytes()[..32].to_vec())
}

/// Generate a random salt
pub fn generate_salt() -> Vec<u8> {
    let mut salt = vec![0u8; 16];
    OsRng.fill_bytes(&mut salt);
    salt
}

/// Encrypt data using AES-256-GCM
pub fn encrypt(data: &[u8], key: &[u8]) -> Result<String, String> {
    if key.len() != 32 {
        return Err("Key must be 32 bytes for AES-256".to_string());
    }

    let key = Key::<Aes256Gcm>::from_slice(key);
    let cipher = Aes256Gcm::new(key);

    // Generate random nonce (12 bytes for GCM)
    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    // Encrypt the data
    let ciphertext = cipher
        .encrypt(nonce, data)
        .map_err(|e| format!("Encryption failed: {}", e))?;

    // Combine nonce + ciphertext and encode as base64
    let mut combined = nonce_bytes.to_vec();
    combined.extend_from_slice(&ciphertext);

    Ok(BASE64.encode(&combined))
}

/// Decrypt data using AES-256-GCM
pub fn decrypt(encrypted_data: &str, key: &[u8]) -> Result<Vec<u8>, String> {
    if key.len() != 32 {
        return Err("Key must be 32 bytes for AES-256".to_string());
    }

    let key = Key::<Aes256Gcm>::from_slice(key);
    let cipher = Aes256Gcm::new(key);

    // Decode base64
    let combined = BASE64
        .decode(encrypted_data)
        .map_err(|e| format!("Base64 decode failed: {}", e))?;

    if combined.len() < 12 {
        return Err("Invalid encrypted data: too short".to_string());
    }

    // Split nonce and ciphertext
    let (nonce_bytes, ciphertext) = combined.split_at(12);
    let nonce = Nonce::from_slice(nonce_bytes);

    // Decrypt
    cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| format!("Decryption failed: {}", e))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encryption_decryption() {
        let data = b"Hello, World!";
        let key = vec![0u8; 32]; // Test key (in production, use derive_key_from_password)

        let encrypted = encrypt(data, &key).expect("Encryption should succeed");
        let decrypted = decrypt(&encrypted, &key).expect("Decryption should succeed");

        assert_eq!(data.to_vec(), decrypted);
    }

    #[test]
    fn test_key_derivation() {
        let password = "test_password";
        let salt = generate_salt();

        let key1 = derive_key_from_password(password, &salt).expect("Key derivation should succeed");
        let key2 = derive_key_from_password(password, &salt).expect("Key derivation should succeed");

        assert_eq!(key1, key2);
        assert_eq!(key1.len(), 32);
    }
}
