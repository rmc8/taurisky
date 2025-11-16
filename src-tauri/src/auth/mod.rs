/**
 * Authentication module for AT Protocol integration
 *
 * Handles communication with Bluesky PDS servers for authentication
 */

use crate::types::{AuthError, SessionResponse};
use reqwest::Client;
use serde_json::json;
use std::time::Duration;

/// AT Protocol client for authentication operations
pub struct ATProtocolClient {
    /// HTTP client with timeout and retry configuration
    client: Client,
    /// PDS server URL (e.g., "https://bsky.social")
    server_url: String,
}

impl ATProtocolClient {
    /// Create a new AT Protocol client
    ///
    /// # Arguments
    /// * `server_url` - PDS server URL (will auto-prepend https:// if missing)
    pub fn new(server_url: Option<String>) -> Result<Self, AuthError> {
        let server_url = Self::normalize_server_url(server_url)?;

        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .map_err(|e| AuthError::NetworkError(format!("Failed to create HTTP client: {}", e)))?;

        Ok(Self { client, server_url })
    }

    /// Normalize server URL (prepend https:// if missing, validate format)
    fn normalize_server_url(server_url: Option<String>) -> Result<String, AuthError> {
        let url = server_url.unwrap_or_else(|| "https://bsky.social".to_string());

        // Auto-prepend https:// if no scheme provided
        let url = if !url.starts_with("http://") && !url.starts_with("https://") {
            format!("https://{}", url)
        } else {
            url
        };

        // Validate HTTPS requirement
        if !url.starts_with("https://") {
            return Err(AuthError::InvalidServerUrl(
                "Server URL must use HTTPS protocol".to_string(),
            ));
        }

        Ok(url)
    }

    /// Create a new session using AT Protocol com.atproto.server.createSession
    ///
    /// # Arguments
    /// * `identifier` - User handle (e.g., "user.bsky.social") or email
    /// * `password` - Account password
    ///
    /// # Returns
    /// SessionResponse containing access/refresh tokens and user info
    pub async fn create_session(
        &self,
        identifier: &str,
        password: &str,
    ) -> Result<SessionResponse, AuthError> {
        let url = format!("{}/xrpc/com.atproto.server.createSession", self.server_url);

        let response = self
            .client
            .post(&url)
            .json(&json!({
                "identifier": identifier,
                "password": password
            }))
            .send()
            .await
            .map_err(|e| {
                if e.is_timeout() {
                    AuthError::NetworkError("Request timeout".to_string())
                } else if e.is_connect() {
                    AuthError::NetworkError(format!("Cannot connect to server: {}", e))
                } else {
                    AuthError::NetworkError(format!("Request failed: {}", e))
                }
            })?;

        // Check response status
        if !response.status().is_success() {
            let status = response.status();
            let error_body = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());

            return if status.as_u16() == 401 {
                Err(AuthError::InvalidCredentials(
                    "Invalid handle or password".to_string(),
                ))
            } else if status.is_server_error() {
                Err(AuthError::ServerError(format!(
                    "Server error ({}): {}",
                    status, error_body
                )))
            } else {
                Err(AuthError::Unknown(format!(
                    "HTTP {} error: {}",
                    status, error_body
                )))
            };
        }

        // Parse successful response
        response.json::<SessionResponse>().await.map_err(|e| {
            AuthError::ServerError(format!("Failed to parse response: {}", e))
        })
    }

    /// Refresh an existing session using AT Protocol com.atproto.server.refreshSession
    ///
    /// # Arguments
    /// * `refresh_jwt` - Refresh token from previous session
    ///
    /// # Returns
    /// New SessionResponse with updated tokens
    pub async fn refresh_session(&self, refresh_jwt: &str) -> Result<SessionResponse, AuthError> {
        let url = format!(
            "{}/xrpc/com.atproto.server.refreshSession",
            self.server_url
        );

        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Bearer {}", refresh_jwt))
            .send()
            .await
            .map_err(|e| {
                if e.is_timeout() {
                    AuthError::NetworkError("Request timeout".to_string())
                } else {
                    AuthError::NetworkError(format!("Request failed: {}", e))
                }
            })?;

        if !response.status().is_success() {
            let status = response.status();
            return if status.as_u16() == 401 {
                Err(AuthError::TokenExpired)
            } else {
                Err(AuthError::ServerError(format!(
                    "Refresh failed with status {}",
                    status
                )))
            };
        }

        response.json::<SessionResponse>().await.map_err(|e| {
            AuthError::ServerError(format!("Failed to parse refresh response: {}", e))
        })
    }

    /// Retry logic with exponential backoff (max 3 retries)
    ///
    /// # Arguments
    /// * `operation` - Async operation to retry
    ///
    /// # Returns
    /// Result of the operation after retries
    pub async fn with_retry<F, Fut, T>(&self, operation: F) -> Result<T, AuthError>
    where
        F: Fn() -> Fut,
        Fut: std::future::Future<Output = Result<T, AuthError>>,
    {
        let max_retries = 3;
        let mut attempt = 0;

        loop {
            match operation().await {
                Ok(result) => return Ok(result),
                Err(e) => {
                    attempt += 1;
                    if attempt >= max_retries {
                        return Err(e);
                    }

                    // Only retry on network errors
                    if !matches!(e, AuthError::NetworkError(_)) {
                        return Err(e);
                    }

                    // Exponential backoff: 1s, 2s, 4s
                    let delay = Duration::from_secs(2u64.pow(attempt - 1));
                    tokio::time::sleep(delay).await;
                }
            }
        }
    }
}
