/**
 * Tauri commands for authentication and account management
 *
 * These commands are invoked from the frontend using invoke()
 */

use crate::auth::ATProtocolClient;
use crate::storage::StorageManager;
use crate::types::{Account, AuthToken};
use chrono::Utc;
use tauri::State;
use uuid::Uuid;

/// Login to Bluesky with credentials
///
/// # Arguments
/// * `identifier` - User handle (e.g., "user.bsky.social") or email
/// * `password` - Account password
/// * `server_url` - Optional custom PDS server URL
/// * `storage` - Storage manager state
///
/// # Returns
/// Account object with user information
#[tauri::command]
pub async fn login(
    identifier: String,
    password: String,
    server_url: Option<String>,
    storage: State<'_, StorageManager>,
) -> Result<Account, String> {
    // Create AT Protocol client
    let client = ATProtocolClient::new(server_url.clone())
        .map_err(|e| format!("Failed to create client: {}", e))?;

    // Attempt to create session with retry logic
    let session = client
        .with_retry(|| client.create_session(&identifier, &password))
        .await
        .map_err(|e| format!("Login failed: {}", e))?;

    // Create account object
    let account_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    let account = Account {
        id: account_id.clone(),
        did: session.did.clone(),
        handle: session.handle.clone(),
        email: session.email.clone(),
        display_name: session.display_name.clone(),
        avatar: session.avatar.clone(),
        server_url: server_url.unwrap_or_else(|| "https://bsky.social".to_string()),
        created_at: now.clone(),
        last_used_at: now.clone(),
        is_active: true,
    };

    // Create auth token
    let auth_token = AuthToken {
        account_id: account_id.clone(),
        access_jwt: session.access_jwt,
        refresh_jwt: session.refresh_jwt,
        issued_at: now.clone(),
        // AT Protocol tokens typically expire in ~90 minutes for access, ~60 days for refresh
        access_expires_at: (Utc::now() + chrono::Duration::minutes(90)).to_rfc3339(),
        refresh_expires_at: (Utc::now() + chrono::Duration::days(60)).to_rfc3339(),
        session_string: None,
    };

    // Save account and token
    storage
        .save_account(&account)
        .await
        .map_err(|e| format!("Failed to save account: {}", e))?;

    storage
        .save_auth_token(&auth_token)
        .await
        .map_err(|e| format!("Failed to save token: {}", e))?;

    Ok(account)
}

/// Logout from a specific account
///
/// # Arguments
/// * `account_id` - Account ID to logout
/// * `storage` - Storage manager state
#[tauri::command]
pub async fn logout(account_id: String, storage: State<'_, StorageManager>) -> Result<(), String> {
    // Delete auth token (secure data)
    storage
        .delete_auth_token(&account_id)
        .await
        .map_err(|e| format!("Failed to delete token: {}", e))?;

    // Delete account metadata
    storage
        .delete_account(&account_id)
        .await
        .map_err(|e| format!("Failed to delete account: {}", e))?;

    Ok(())
}

/// Refresh an expired access token
///
/// # Arguments
/// * `account_id` - Account ID to refresh
/// * `storage` - Storage manager state
///
/// # Returns
/// Updated AuthToken with new access/refresh tokens
#[tauri::command]
pub async fn refresh_session(
    account_id: String,
    storage: State<'_, StorageManager>,
) -> Result<AuthToken, String> {
    // Get existing token
    let old_token = storage
        .get_auth_token(&account_id)
        .await
        .map_err(|e| format!("Failed to get token: {}", e))?;

    // Get account to retrieve server URL
    let account = storage
        .get_account(&account_id)
        .await
        .map_err(|e| format!("Failed to get account: {}", e))?;

    // Create AT Protocol client
    let client = ATProtocolClient::new(Some(account.server_url))
        .map_err(|e| format!("Failed to create client: {}", e))?;

    // Refresh session
    let session = client
        .refresh_session(&old_token.refresh_jwt)
        .await
        .map_err(|e| format!("Refresh failed: {}", e))?;

    // Create new auth token
    let now = Utc::now().to_rfc3339();
    let new_token = AuthToken {
        account_id: account_id.clone(),
        access_jwt: session.access_jwt,
        refresh_jwt: session.refresh_jwt,
        issued_at: now.clone(),
        access_expires_at: (Utc::now() + chrono::Duration::minutes(90)).to_rfc3339(),
        refresh_expires_at: (Utc::now() + chrono::Duration::days(60)).to_rfc3339(),
        session_string: None,
    };

    // Save updated token
    storage
        .save_auth_token(&new_token)
        .await
        .map_err(|e| format!("Failed to save token: {}", e))?;

    Ok(new_token)
}

/// Restore all saved sessions on app startup
///
/// # Arguments
/// * `storage` - Storage manager state
///
/// # Returns
/// List of all saved accounts
#[tauri::command]
pub async fn restore_sessions(storage: State<'_, StorageManager>) -> Result<Vec<Account>, String> {
    storage
        .list_accounts()
        .await
        .map_err(|e| format!("Failed to list accounts: {}", e))
}
