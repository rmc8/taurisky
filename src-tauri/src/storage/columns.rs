/**
 * Column configuration storage management
 *
 * Handles reading and writing deck column configurations to/from JSON file
 */

use crate::types::{ColumnType, ColumnWidth, DeckColumnConfig};
use chrono::Utc;
use std::fs;
use std::path::PathBuf;
use uuid::Uuid;

const COLUMNS_FILE: &str = "columns.json";

/// Load column configurations from file
///
/// Returns the stored columns, or generates default configuration if file doesn't exist
pub fn load_columns(data_dir: &PathBuf) -> Result<Vec<DeckColumnConfig>, String> {
    let columns_path = data_dir.join(COLUMNS_FILE);

    if !columns_path.exists() {
        // Return default configuration (will be created on first save)
        return Ok(vec![]);
    }

    let content = fs::read_to_string(&columns_path)
        .map_err(|e| format!("Failed to read columns file: {}", e))?;

    let mut columns: Vec<DeckColumnConfig> = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse columns JSON: {}", e))?;

    // Sort by position
    columns.sort_by_key(|c| c.position);

    Ok(columns)
}

/// Save column configurations to file
///
/// Uses atomic write (temp file + rename) to prevent corruption
pub fn save_columns(
    data_dir: &PathBuf,
    mut columns: Vec<DeckColumnConfig>,
) -> Result<(), String> {
    // Validate: at least one column required
    if columns.is_empty() {
        return Err("At least one column is required".to_string());
    }

    // Ensure data directory exists
    fs::create_dir_all(data_dir).map_err(|e| format!("Failed to create data dir: {}", e))?;

    // Update timestamps
    let now = Utc::now().to_rfc3339();
    for column in &mut columns {
        column.updated_at = now.clone();
    }

    let columns_path = data_dir.join(COLUMNS_FILE);
    let temp_path = data_dir.join(format!("{}.tmp", COLUMNS_FILE));

    // Serialize to JSON
    let json = serde_json::to_string_pretty(&columns)
        .map_err(|e| format!("Failed to serialize columns: {}", e))?;

    // Write to temp file
    fs::write(&temp_path, json)
        .map_err(|e| format!("Failed to write temp file: {}", e))?;

    // Atomic rename
    fs::rename(&temp_path, &columns_path)
        .map_err(|e| format!("Failed to rename temp file: {}", e))?;

    Ok(())
}

/// Generate default column configuration
///
/// Creates a single timeline column for the given account DID with medium width (400px)
pub fn get_default_columns(did: &str) -> Vec<DeckColumnConfig> {
    let now = Utc::now().to_rfc3339();

    vec![DeckColumnConfig {
        id: Uuid::new_v4().to_string(),
        did: did.to_string(),
        column_type: ColumnType::Timeline,
        title: None,
        position: 0,
        width: Some(ColumnWidth::Medium), // 400px default
        settings: None,
        created_at: now.clone(),
        updated_at: now,
    }]
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn test_save_and_load_columns() {
        let temp_dir = TempDir::new().unwrap();
        let data_dir = temp_dir.path().to_path_buf();

        let columns = get_default_columns("did:plc:test123");

        // Save columns
        save_columns(&data_dir, columns.clone()).unwrap();

        // Load columns
        let loaded = load_columns(&data_dir).unwrap();

        assert_eq!(loaded.len(), 1);
        assert_eq!(loaded[0].did, "did:plc:test123");
        assert_eq!(loaded[0].column_type, ColumnType::Timeline);
    }

    #[test]
    fn test_empty_columns_error() {
        let temp_dir = TempDir::new().unwrap();
        let data_dir = temp_dir.path().to_path_buf();

        let result = save_columns(&data_dir, vec![]);

        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "At least one column is required");
    }

    #[test]
    fn test_load_nonexistent_file() {
        let temp_dir = TempDir::new().unwrap();
        let data_dir = temp_dir.path().to_path_buf();

        let loaded = load_columns(&data_dir).unwrap();

        assert_eq!(loaded.len(), 0);
    }

    #[test]
    fn test_load_corrupted_file() {
        let temp_dir = TempDir::new().unwrap();
        let data_dir = temp_dir.path().to_path_buf();
        fs::create_dir_all(&data_dir).unwrap();

        let columns_path = data_dir.join(COLUMNS_FILE);
        fs::write(&columns_path, "invalid json").unwrap();

        let result = load_columns(&data_dir);

        assert!(result.is_err());
    }
}
