// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Command, Child};
use std::sync::{Arc, Mutex};

fn main() {
    let backend_process: Arc<Mutex<Option<Child>>> = Arc::new(Mutex::new(None));
    let backend_process_for_setup = Arc::clone(&backend_process);

    tauri::Builder::default()
        .setup(move |_app| {
            let backend = Command::new("cmd")
                .args(&["/C", "backend\\app.bat"])
                .current_dir(std::env::current_exe().unwrap().parent().unwrap())
                .spawn()
                .expect("Failed to start backend");
            *backend_process_for_setup.lock().unwrap() = Some(backend);
            Ok(())
        })
        .on_window_event(move |_app_handle, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                if let Some(mut backend) = backend_process.lock().unwrap().take() {
                    let _ = backend.kill();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
