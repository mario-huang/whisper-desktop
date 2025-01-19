use std::process::Command;
use tauri::{path::BaseDirectory, Manager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let install_script = app
                .path()
                .resolve("Whisper-WebUI/Install.sh", BaseDirectory::Resource);
            Command::new("sh")
                .arg(install_script.unwrap())
                .status()
                .expect("failed to run Install.sh");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
