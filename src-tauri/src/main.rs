// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
struct AppState {
    agents: HashMap<String, String>,
    tasks: HashMap<String, String>,
}

type AppStateType = Mutex<AppState>;

#[tauri::command]
fn get_app_info() -> Result<HashMap<String, String>, String> {
    let mut info = HashMap::new();
    info.insert("name".to_string(), "ESAF Framework".to_string());
    info.insert("version".to_string(), "0.1.0".to_string());
    info.insert(
        "description".to_string(),
        "Evolved Synergistic Agentic Framework".to_string(),
    );
    Ok(info)
}

#[tauri::command]
fn get_agent_status(state: State<AppStateType>) -> Result<HashMap<String, String>, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    Ok(app_state.agents.clone())
}

#[tauri::command]
fn update_agent_status(
    agent_id: String,
    status: String,
    state: State<AppStateType>,
) -> Result<(), String> {
    let mut app_state = state.lock().map_err(|e| e.to_string())?;
    app_state.agents.insert(agent_id, status);
    Ok(())
}

#[tauri::command]
fn get_task_list(state: State<AppStateType>) -> Result<HashMap<String, String>, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    Ok(app_state.tasks.clone())
}

#[tauri::command]
fn add_task(task_id: String, task_data: String, state: State<AppStateType>) -> Result<(), String> {
    let mut app_state = state.lock().map_err(|e| e.to_string())?;
    app_state.tasks.insert(task_id, task_data);
    Ok(())
}

#[tauri::command]
fn remove_task(task_id: String, state: State<AppStateType>) -> Result<(), String> {
    let mut app_state = state.lock().map_err(|e| e.to_string())?;
    app_state.tasks.remove(&task_id);
    Ok(())
}

fn main() {
    let initial_state = AppState {
        agents: HashMap::new(),
        tasks: HashMap::new(),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .manage(AppStateType::new(initial_state))
        .invoke_handler(tauri::generate_handler![
            get_app_info,
            get_agent_status,
            update_agent_status,
            get_task_list,
            add_task,
            remove_task
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
