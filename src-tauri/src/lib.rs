use std::sync::Mutex;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    utils::config::Color,
    App, AppHandle, Emitter, LogicalPosition, Manager, Position, UserAttentionType, WebviewUrl,
    WebviewWindow, WebviewWindowBuilder, WindowEvent,
};

#[cfg(desktop)]
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

#[derive(Default)]
struct ShortcutRegistry {
    active: Mutex<Option<String>>,
}

#[derive(serde::Serialize)]
struct CommandResult {
    ok: bool,
    message: String,
}

#[tauri::command]
fn show_settings_window(app: AppHandle) -> Result<CommandResult, String> {
    open_settings_window(&app)?;
    Ok(ok("Окно настроек открыто."))
}

#[tauri::command]
fn set_floating_window_visible(app: AppHandle, visible: bool) -> Result<CommandResult, String> {
    set_floating_visibility(&app, visible)?;

    Ok(ok("Видимость плавающей кнопки обновлена."))
}

#[tauri::command]
fn set_floating_position(app: AppHandle, x: i32, y: i32) -> Result<CommandResult, String> {
    let window = app
        .get_webview_window("floating")
        .ok_or_else(|| "Плавающая кнопка не найдена.".to_string())?;

    window
        .set_position(Position::Logical(LogicalPosition::new(x as f64, y as f64)))
        .map_err(|error| error.to_string())?;
    Ok(ok("Позиция плавающей кнопки обновлена."))
}

#[tauri::command]
fn send_copy_shortcut() -> Result<CommandResult, String> {
    send_copy_or_paste('C')?;
    Ok(ok("Команда copy отправлена."))
}

#[tauri::command]
fn send_paste_shortcut() -> Result<CommandResult, String> {
    send_copy_or_paste('V')?;
    Ok(ok("Команда paste отправлена."))
}

#[tauri::command]
fn register_shortcut(
    app: AppHandle,
    state: tauri::State<'_, ShortcutRegistry>,
    accelerator: String,
) -> Result<CommandResult, String> {
    register_global_shortcut(&app, &state, &accelerator)?;
    Ok(ok("Глобальный хоткей обновлен."))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .manage(ShortcutRegistry::default())
        .invoke_handler(tauri::generate_handler![
            show_settings_window,
            set_floating_window_visible,
            set_floating_position,
            send_copy_shortcut,
            send_paste_shortcut,
            register_shortcut
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            #[cfg(desktop)]
            {
                install_global_shortcut_plugin(app)?;
                install_tray(app)?;
                let registry = app.state::<ShortcutRegistry>();
                register_global_shortcut(app.handle(), &registry, "CommandOrControl+Shift+T")?;
            }

            if let Some(window) = app.get_webview_window("floating") {
                configure_floating_window(&window)?;
            }
            if let Some(window) = app.get_webview_window("main") {
                attach_settings_close_handler(&window);
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn ok(message: &str) -> CommandResult {
    CommandResult {
        ok: true,
        message: message.to_string(),
    }
}

fn set_floating_visibility(app: &AppHandle, visible: bool) -> Result<(), String> {
    let window = app
        .get_webview_window("floating")
        .ok_or_else(|| "Плавающая кнопка не найдена.".to_string())?;

    if visible {
        window.show().map_err(|error| error.to_string())?;
        window
            .set_always_on_top(true)
            .map_err(|error| error.to_string())?;
        configure_floating_window(&window)?;
    } else {
        window.hide().map_err(|error| error.to_string())?;
    }

    let _ = app.emit("typograf-floating-visibility", visible);
    Ok(())
}

fn open_settings_window(app: &AppHandle) -> Result<(), String> {
    let window = match app.get_webview_window("main") {
        Some(window) => window,
        None => create_settings_window(app)?,
    };

    window.show().map_err(|error| error.to_string())?;
    window.unminimize().map_err(|error| error.to_string())?;
    window.set_focus().map_err(|error| error.to_string())?;
    let _ = window.request_user_attention(Some(UserAttentionType::Informational));
    Ok(())
}

fn create_settings_window(app: &AppHandle) -> Result<WebviewWindow, String> {
    let window = WebviewWindowBuilder::new(app, "main", WebviewUrl::App("/".into()))
        .title("Типограф")
        .inner_size(1100.0, 760.0)
        .min_inner_size(860.0, 620.0)
        .resizable(true)
        .build()
        .map_err(|error| error.to_string())?;

    attach_settings_close_handler(&window);
    Ok(window)
}

fn attach_settings_close_handler<R: tauri::Runtime>(window: &WebviewWindow<R>) {
    let settings_window = window.clone();
    window.on_window_event(move |event| {
        if let WindowEvent::CloseRequested { api, .. } = event {
            api.prevent_close();
            let _ = settings_window.hide();
        }
    });
}

#[cfg(desktop)]
fn install_global_shortcut_plugin(app: &mut App) -> tauri::Result<()> {
    app.handle().plugin(
        tauri_plugin_global_shortcut::Builder::new()
            .with_handler(|app, _shortcut, event| {
                if event.state() == ShortcutState::Pressed {
                    let _ = app.emit("typograf-shortcut", ());
                }
            })
            .build(),
    )?;
    Ok(())
}

#[cfg(desktop)]
fn register_global_shortcut(
    app: &AppHandle,
    state: &ShortcutRegistry,
    accelerator: &str,
) -> Result<(), String> {
    let shortcut = accelerator
        .parse::<Shortcut>()
        .map_err(|error| format!("Некорректный хоткей: {error}"))?;

    app.global_shortcut()
        .unregister_all()
        .map_err(|error| error.to_string())?;
    app.global_shortcut()
        .register(shortcut)
        .map_err(|error| error.to_string())?;

    let mut active = state
        .active
        .lock()
        .map_err(|_| "Не удалось обновить состояние хоткея.".to_string())?;
    *active = Some(accelerator.to_string());
    Ok(())
}

#[cfg(not(desktop))]
fn register_global_shortcut(
    _app: &AppHandle,
    _state: &ShortcutRegistry,
    _accelerator: &str,
) -> Result<(), String> {
    Ok(())
}

#[cfg(desktop)]
fn install_tray(app: &mut App) -> tauri::Result<()> {
    let show_settings = MenuItem::with_id(
        app,
        "show_settings",
        "Открыть настройки",
        true,
        None::<&str>,
    )?;
    let toggle_button = MenuItem::with_id(
        app,
        "toggle_button",
        "Показать/скрыть кнопку",
        true,
        None::<&str>,
    )?;
    let pause = MenuItem::with_id(app, "toggle_pause", "Пауза", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Выход", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show_settings, &toggle_button, &pause, &quit])?;

    TrayIconBuilder::new()
        .icon(app.default_window_icon().expect("application icon").clone())
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show_settings" => {
                let _ = open_settings_window(app);
            }
            "toggle_button" => {
                if let Some(window) = app.get_webview_window("floating") {
                    let visible = window.is_visible().unwrap_or(false);
                    let _ = set_floating_visibility(app, !visible);
                }
            }
            "toggle_pause" => {
                let _ = app.emit("typograf-toggle-pause", ());
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                let _ = open_settings_window(app);
            }
        })
        .build(app)?;

    Ok(())
}

#[cfg(all(not(windows), not(target_os = "macos")))]
fn send_copy_or_paste(_key: char) -> Result<(), String> {
    Err("Системная отправка клавиш пока реализована только для Windows и macOS.".to_string())
}

#[cfg(target_os = "macos")]
fn send_copy_or_paste(key: char) -> Result<(), String> {
    use std::process::Command;

    let key = match key {
        'C' => "c",
        'V' => "v",
        _ => return Err("Неподдерживаемая клавиша.".to_string()),
    };

    let script = format!(
        "tell application \"System Events\" to keystroke \"{}\" using command down",
        key
    );

    let status = Command::new("osascript")
        .args(["-e", &script])
        .status()
        .map_err(|error| format!("Не удалось отправить macOS shortcut: {error}"))?;

    if status.success() {
        Ok(())
    } else {
        Err(
            "macOS не отправила shortcut. Проверьте Accessibility-разрешение для приложения."
                .to_string(),
        )
    }
}

#[cfg(windows)]
fn send_copy_or_paste(key: char) -> Result<(), String> {
    use windows::Win32::UI::Input::KeyboardAndMouse::{
        SendInput, INPUT, INPUT_0, INPUT_KEYBOARD, KEYBDINPUT, KEYBD_EVENT_FLAGS, KEYEVENTF_KEYUP,
        VIRTUAL_KEY, VK_CONTROL,
    };

    let key_code = match key {
        'C' => VIRTUAL_KEY(0x43),
        'V' => VIRTUAL_KEY(0x56),
        _ => return Err("Неподдерживаемая клавиша.".to_string()),
    };

    fn input(vk: VIRTUAL_KEY, flags: KEYBD_EVENT_FLAGS) -> INPUT {
        INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: INPUT_0 {
                ki: KEYBDINPUT {
                    wVk: vk,
                    wScan: 0,
                    dwFlags: flags,
                    time: 0,
                    dwExtraInfo: 0,
                },
            },
        }
    }

    let inputs = [
        input(VK_CONTROL, KEYBD_EVENT_FLAGS(0)),
        input(key_code, KEYBD_EVENT_FLAGS(0)),
        input(key_code, KEYEVENTF_KEYUP),
        input(VK_CONTROL, KEYEVENTF_KEYUP),
    ];

    let sent = unsafe { SendInput(&inputs, std::mem::size_of::<INPUT>() as i32) };
    if sent == inputs.len() as u32 {
        Ok(())
    } else {
        Err("Windows SendInput не отправил все события.".to_string())
    }
}

fn configure_floating_window<R: tauri::Runtime>(
    window: &tauri::WebviewWindow<R>,
) -> Result<(), String> {
    window
        .set_always_on_top(true)
        .map_err(|error| error.to_string())?;
    window
        .set_shadow(false)
        .map_err(|error| error.to_string())?;
    window
        .set_background_color(Some(Color(0, 0, 0, 0)))
        .map_err(|error| error.to_string())?;
    configure_floating_no_activate(window)
}

#[cfg(all(not(windows), not(target_os = "macos")))]
fn configure_floating_no_activate<R: tauri::Runtime>(
    _window: &tauri::WebviewWindow<R>,
) -> Result<(), String> {
    Ok(())
}

#[cfg(target_os = "macos")]
fn configure_floating_no_activate<R: tauri::Runtime>(
    window: &tauri::WebviewWindow<R>,
) -> Result<(), String> {
    window
        .set_focusable(false)
        .map_err(|error| error.to_string())
}

#[cfg(windows)]
fn configure_floating_no_activate<R: tauri::Runtime>(
    window: &tauri::WebviewWindow<R>,
) -> Result<(), String> {
    use windows::Win32::UI::WindowsAndMessaging::{
        GetWindowLongPtrW, SetWindowLongPtrW, GWL_EXSTYLE, WS_EX_NOACTIVATE, WS_EX_TOOLWINDOW,
    };

    let hwnd = window.hwnd().map_err(|error| error.to_string())?;
    unsafe {
        let style = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
        let next_style = style | WS_EX_NOACTIVATE.0 as isize | WS_EX_TOOLWINDOW.0 as isize;
        SetWindowLongPtrW(hwnd, GWL_EXSTYLE, next_style);
    }

    Ok(())
}
