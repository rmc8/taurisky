// Module declarations
mod types;
mod auth;
mod storage;
mod commands;

use storage::StorageManager;
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_stronghold::Builder::new(|password: &str| {
                // Simple password hash function for Stronghold
                // In production, this should use a more secure method
                use std::hash::{Hash, Hasher};
                let mut hasher = std::collections::hash_map::DefaultHasher::new();
                password.hash(&mut hasher);
                hasher.finish().to_le_bytes().to_vec()
            })
            .build(),
        )
        .setup(|app| {
            // Get app data directory
            let data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data directory");

            // Create storage manager with data directory
            let storage = StorageManager::new(data_dir)
                .expect("Failed to initialize storage manager");

            app.manage(storage);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::login,
            commands::logout,
            commands::refresh_session,
            commands::restore_sessions,
            commands::add_account,
            commands::remove_account,
            commands::list_accounts,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
