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
  /** Account DID to use for this column (did:plc:xxx format) */
  did: string;
  /** Column type */
  type: ColumnType;
  /** Column title (user customizable) */
  title?: string;
  /** Display position (0-indexed) */
  position: number;
  /** Column width (default: medium) */
  width?: ColumnWidth;
  /** Column-specific settings (filters, display options, etc.) */
  settings?: ColumnSettings;
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
  Notifications = "notifications",
}

/**
 * Column width options (7-stage width settings)
 */
export enum ColumnWidth {
  /** Extra extra small: 280px (suitable for notifications) */
  Xxs = 'xxs',
  /** Extra small: 320px (compact display) */
  Xs = 'xs',
  /** Small: 350px (narrower than standard) */
  Small = 'small',
  /** Medium: 400px (default width) */
  Medium = 'medium',
  /** Large: 450px (spacious display) */
  Large = 'large',
  /** Extra large: 500px (wide display) */
  Xl = 'xl',
  /** Extra extra large: 550px (maximum width, media-focused columns) */
  Xxl = 'xxl',
}

/**
 * Repost display filter (probabilistic filtering)
 */
export enum RepostFilter {
  /** Show all reposts (no filtering) */
  All = 'all',
  /** Show ~75% of reposts (hide 1/4) */
  Many = 'many',
  /** Show ~50% of reposts (hide 1/2) */
  Soso = 'soso',
  /** Show ~25% of reposts (hide 3/4) */
  Less = 'less',
  /** Hide all reposts */
  None = 'none',
}

/**
 * Reply display filter
 */
export enum ReplyFilter {
  /** Show all replies */
  All = 'all',
  /** Show only replies to following users */
  Following = 'following',
  /** Show only replies to me */
  Me = 'me',
}

/**
 * Auto-refresh interval (seconds)
 */
export enum AutoRefreshInterval {
  /** No auto-refresh (manual only) */
  Off = 0,
  /** Every 10 seconds */
  TenSeconds = 10,
  /** Every 30 seconds */
  ThirtySeconds = 30,
  /** Every 60 seconds */
  OneMinute = 60,
  /** Every 5 minutes */
  FiveMinutes = 300,
  /** Every 10 minutes */
  TenMinutes = 600,
  /** Every 30 minutes */
  ThirtyMinutes = 1800,
  /** Real-time (WebSocket connection if available) */
  Realtime = -1,
}

/**
 * Timeline filter settings
 */
export interface TimelineFilters {
  /** Repost display control */
  repostDisplay: RepostFilter;
  /** Reply display control */
  replyDisplay: ReplyFilter;
}

/**
 * Auto-refresh settings
 */
export interface AutoRefreshSettings {
  /** Refresh interval in seconds */
  interval: AutoRefreshInterval;
  /** Scroll to top on refresh */
  scrollToTop: boolean;
}

/**
 * Display customization settings
 */
export interface DisplaySettings {
  /** Show icons */
  showIcons?: boolean;
  /** Display media in columns */
  mediaColumns?: boolean;
}

/**
 * Structured column settings
 */
export interface ColumnSettings {
  /** Timeline filter settings */
  filters?: TimelineFilters;
  /** Auto-refresh settings */
  autoRefresh?: AutoRefreshSettings;
  /** Display customization settings */
  display?: DisplaySettings;
}
