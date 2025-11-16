/**
 * Authentication types for TauriSky Bluesky client
 *
 * These types match the Rust backend types defined in src-tauri/src/types.rs
 */

/**
 * Bluesky account entity
 */
export interface Account {
  /** Unique account identifier (UUID) */
  id: string;
  /** AT Protocol DID (e.g., "did:plc:xyz123") */
  did: string;
  /** User handle (e.g., "user.bsky.social") */
  handle: string;
  /** Email address (optional) */
  email?: string;
  /** Display name */
  displayName?: string;
  /** Avatar URL */
  avatar?: string;
  /** PDS server URL (default: "https://bsky.social") */
  serverUrl: string;
  /** Account creation timestamp */
  createdAt: string;
  /** Last used timestamp */
  lastUsedAt: string;
  /** Active status */
  isActive: boolean;
}

/**
 * AT Protocol authentication token
 */
export interface AuthToken {
  /** Associated account ID */
  accountId: string;
  /** Access JWT token (~90 minutes validity) */
  accessJwt: string;
  /** Refresh JWT token (~60 days validity) */
  refreshJwt: string;
  /** Token issued timestamp */
  issuedAt: string;
  /** Access token expiration timestamp */
  accessExpiresAt: string;
  /** Refresh token expiration timestamp */
  refreshExpiresAt: string;
  /** AT Protocol session string (optional) */
  sessionString?: string;
}

/**
 * Login credentials input
 */
export interface LoginCredentials {
  /** Bluesky handle or email */
  identifier: string;
  /** Account password */
  password: string;
  /** Custom PDS server URL (optional, defaults to https://bsky.social) */
  serverUrl?: string;
}

/**
 * AT Protocol session response from createSession
 */
export interface SessionResponse {
  /** Access JWT token */
  accessJwt: string;
  /** Refresh JWT token */
  refreshJwt: string;
  /** User DID */
  did: string;
  /** User handle */
  handle: string;
  /** Email (optional) */
  email?: string;
  /** Display name (optional) */
  displayName?: string;
  /** Avatar URL (optional) */
  avatar?: string;
}

/**
 * Authentication error types
 */
export enum AuthErrorType {
  /** Invalid credentials */
  InvalidCredentials = "invalid_credentials",
  /** Network error */
  NetworkError = "network_error",
  /** Server error */
  ServerError = "server_error",
  /** Token expired */
  TokenExpired = "token_expired",
  /** Invalid server URL */
  InvalidServerUrl = "invalid_server_url",
  /** Account not found */
  AccountNotFound = "account_not_found",
  /** Storage error */
  StorageError = "storage_error",
  /** Unknown error */
  Unknown = "unknown",
}

/**
 * Authentication error
 */
export interface AuthError {
  /** Error type */
  type: AuthErrorType;
  /** Error message */
  message: string;
  /** Original error (optional) */
  cause?: string;
}

/**
 * Deck column configuration
 */
export interface DeckColumnConfig {
  /** Column unique identifier */
  id: string;
  /** Account ID to use for this column */
  accountId: string;
  /** Column type */
  type: ColumnType;
  /** Column title (user customizable) */
  title?: string;
  /** Display position (0-indexed) */
  position: number;
  /** Column width in pixels (default: 350) */
  width?: number;
  /** Column-specific settings (filters, display options, etc.) */
  settings?: Record<string, unknown>;
  /** Column creation timestamp */
  createdAt: string;
  /** Last updated timestamp */
  updatedAt: string;
}

/**
 * Column type enum
 */
export enum ColumnType {
  Timeline = "timeline",
  Search = "search",
  Notifications = "notifications",
  Profile = "profile",
  List = "list",
  Feed = "feed",
}
