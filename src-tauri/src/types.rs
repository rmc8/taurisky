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
    /// Account DID to use for this column (did:plc:xxx format)
    pub did: String,
    /// Column type
    #[serde(rename = "type")]
    pub column_type: ColumnType,
    /// Column title (user customizable)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    /// Display position (0-indexed)
    pub position: u32,
    /// Column width (default: medium)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub width: Option<ColumnWidth>,
    /// Column-specific settings (filters, display options, etc.)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub settings: Option<HashMap<String, serde_json::Value>>,
    /// Column creation timestamp (ISO 8601)
    pub created_at: String,
    /// Last updated timestamp (ISO 8601)
    pub updated_at: String,
}

/// Column type enum
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ColumnType {
    Timeline,
    Notifications,
}

/// Column width enum (7-stage width settings)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ColumnWidth {
    /// Extra extra small: 280px (suitable for notifications)
    Xxs,
    /// Extra small: 320px (compact display)
    Xs,
    /// Small: 350px (narrower than standard)
    Small,
    /// Medium: 400px (default width)
    Medium,
    /// Large: 450px (spacious display)
    Large,
    /// Extra large: 500px (wide display)
    Xl,
    /// Extra extra large: 550px (maximum width, media-focused columns)
    Xxl,
}

/// Repost display filter (probabilistic filtering)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum RepostFilter {
    /// Show all reposts (no filtering)
    All,
    /// Show ~75% of reposts (hide 1/4)
    Many,
    /// Show ~50% of reposts (hide 1/2)
    Soso,
    /// Show ~25% of reposts (hide 3/4)
    Less,
    /// Hide all reposts
    None,
}

/// Reply display filter
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ReplyFilter {
    /// Show all replies
    All,
    /// Show only replies to following users
    Following,
    /// Show only replies to me
    Me,
}

/// Auto-refresh interval (seconds)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AutoRefreshInterval {
    /// No auto-refresh (manual only)
    #[serde(rename = "0")]
    Off,
    /// Every 10 seconds
    #[serde(rename = "10")]
    TenSeconds,
    /// Every 30 seconds
    #[serde(rename = "30")]
    ThirtySeconds,
    /// Every 60 seconds
    #[serde(rename = "60")]
    OneMinute,
    /// Every 5 minutes
    #[serde(rename = "300")]
    FiveMinutes,
    /// Every 10 minutes
    #[serde(rename = "600")]
    TenMinutes,
    /// Every 30 minutes
    #[serde(rename = "1800")]
    ThirtyMinutes,
    /// Real-time (WebSocket connection if available)
    #[serde(rename = "-1")]
    Realtime,
}

/// Timeline filter settings
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TimelineFilters {
    /// Repost display control
    pub repost_display: RepostFilter,
    /// Reply display control
    pub reply_display: ReplyFilter,
}

/// Auto-refresh settings
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AutoRefreshSettings {
    /// Refresh interval in seconds
    pub interval: AutoRefreshInterval,
    /// Scroll to top on refresh
    pub scroll_to_top: bool,
}

/// Display customization settings
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DisplaySettings {
    /// Show icons
    #[serde(skip_serializing_if = "Option::is_none")]
    pub show_icons: Option<bool>,
    /// Display media in columns
    #[serde(skip_serializing_if = "Option::is_none")]
    pub media_columns: Option<bool>,
}

/// Structured column settings
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ColumnSettings {
    /// Timeline filter settings
    #[serde(skip_serializing_if = "Option::is_none")]
    pub filters: Option<TimelineFilters>,
    /// Auto-refresh settings
    #[serde(skip_serializing_if = "Option::is_none")]
    pub auto_refresh: Option<AutoRefreshSettings>,
    /// Display customization settings
    #[serde(skip_serializing_if = "Option::is_none")]
    pub display: Option<DisplaySettings>,
}
