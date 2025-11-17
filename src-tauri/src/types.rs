/**
 * Type definitions for TauriSky authentication and account management
 *
 * These types are serialized/deserialized for communication with the frontend
 */

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Bluesky account entity
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Account {
    /// Unique account identifier (UUID)
    pub id: String,
    /// AT Protocol DID (e.g., "did:plc:xyz123")
    pub did: String,
    /// User handle (e.g., "user.bsky.social")
    pub handle: String,
    /// Email address (optional)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email: Option<String>,
    /// Display name
    #[serde(skip_serializing_if = "Option::is_none")]
    pub display_name: Option<String>,
    /// Avatar URL
    #[serde(skip_serializing_if = "Option::is_none")]
    pub avatar: Option<String>,
    /// PDS server URL (default: "https://bsky.social")
    pub server_url: String,
    /// Account creation timestamp (ISO 8601)
    pub created_at: String,
    /// Last used timestamp (ISO 8601)
    pub last_used_at: String,
    /// Active status
    pub is_active: bool,
}

/// AT Protocol authentication token
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthToken {
    /// Associated account ID
    pub account_id: String,
    /// Access JWT token (~90 minutes validity)
    pub access_jwt: String,
    /// Refresh JWT token (~60 days validity)
    pub refresh_jwt: String,
    /// Token issued timestamp (ISO 8601)
    pub issued_at: String,
    /// Access token expiration timestamp (ISO 8601)
    pub access_expires_at: String,
    /// Refresh token expiration timestamp (ISO 8601)
    pub refresh_expires_at: String,
    /// AT Protocol session string (optional)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub session_string: Option<String>,
}

/// Login credentials input
#[allow(dead_code)]
#[derive(Debug, Deserialize)]
pub struct LoginCredentials {
    /// Bluesky handle or email
    pub identifier: String,
    /// Account password
    pub password: String,
    /// Custom PDS server URL (optional, defaults to https://bsky.social)
    pub server_url: Option<String>,
}

/// AT Protocol session response from createSession API
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionResponse {
    /// Access JWT token
    pub access_jwt: String,
    /// Refresh JWT token
    pub refresh_jwt: String,
    /// User DID
    pub did: String,
    /// User handle
    pub handle: String,
    /// Email (optional)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email: Option<String>,
    /// Display name (optional)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub display_name: Option<String>,
    /// Avatar URL (optional)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub avatar: Option<String>,
}

/// Authentication error types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AuthErrorType {
    /// Invalid credentials
    InvalidCredentials,
    /// Network error
    NetworkError,
    /// Server error
    ServerError,
    /// Token expired
    TokenExpired,
    /// Invalid server URL
    InvalidServerUrl,
    /// Account not found
    AccountNotFound,
    /// Storage error
    StorageError,
    /// Unknown error
    Unknown,
}

/// Authentication error
#[derive(Debug, thiserror::Error)]
pub enum AuthError {
    #[error("Invalid credentials: {0}")]
    InvalidCredentials(String),

    #[error("Network error: {0}")]
    NetworkError(String),

    #[error("Server error: {0}")]
    ServerError(String),

    #[error("Token expired")]
    TokenExpired,

    #[error("Invalid server URL: {0}")]
    InvalidServerUrl(String),

    #[error("Account not found: {0}")]
    AccountNotFound(String),

    #[error("Storage error: {0}")]
    StorageError(String),

    #[error("Unknown error: {0}")]
    Unknown(String),
}

impl AuthError {
    /// Get error type
    #[allow(dead_code)]
    pub fn error_type(&self) -> AuthErrorType {
        match self {
            AuthError::InvalidCredentials(_) => AuthErrorType::InvalidCredentials,
            AuthError::NetworkError(_) => AuthErrorType::NetworkError,
            AuthError::ServerError(_) => AuthErrorType::ServerError,
            AuthError::TokenExpired => AuthErrorType::TokenExpired,
            AuthError::InvalidServerUrl(_) => AuthErrorType::InvalidServerUrl,
            AuthError::AccountNotFound(_) => AuthErrorType::AccountNotFound,
            AuthError::StorageError(_) => AuthErrorType::StorageError,
            AuthError::Unknown(_) => AuthErrorType::Unknown,
        }
    }
}

/// Deck column configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeckColumnConfig {
    /// Column unique identifier
    pub id: String,
    /// Account ID to use for this column
    pub account_id: String,
    /// Column type
    #[serde(rename = "type")]
    pub column_type: ColumnType,
    /// Column title (user customizable)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    /// Display position (0-indexed)
    pub position: i32,
    /// Column width in pixels (default: 350)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub width: Option<i32>,
    /// Column-specific settings (filters, display options, etc.)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub settings: Option<HashMap<String, serde_json::Value>>,
    /// Column creation timestamp (ISO 8601)
    pub created_at: String,
    /// Last updated timestamp (ISO 8601)
    pub updated_at: String,
}

/// Column type enum
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ColumnType {
    Timeline,
    Search,
    Notifications,
    Profile,
    List,
    Feed,
}
