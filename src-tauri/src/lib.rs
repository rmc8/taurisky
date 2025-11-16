// Module declarations
mod types;
mod auth;
mod storage;
mod commands;

use storage::StorageManager;

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
        .manage(StorageManager::new())
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::login,
            commands::logout,
            commands::refresh_session,
            commands::restore_sessions,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
