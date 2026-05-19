export type CommandResult = {
  ok: boolean;
  message: string;
};

export function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function invokeCommand<T>(command: string, args?: Record<string, unknown>) {
  if (!isTauriRuntime()) {
    throw new Error("Tauri runtime недоступен.");
  }

  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(command, args);
}

export async function showSettingsWindow() {
  if (!isTauriRuntime()) {
    return;
  }

  await invokeCommand<CommandResult>("show_settings_window");
}

export async function setFloatingWindowVisible(visible: boolean) {
  if (!isTauriRuntime()) {
    return;
  }

  await invokeCommand<CommandResult>("set_floating_window_visible", { visible });
}

export async function sendCopyShortcut() {
  if (!isTauriRuntime()) {
    return;
  }

  await invokeCommand<CommandResult>("send_copy_shortcut");
}

export async function sendPasteShortcut() {
  if (!isTauriRuntime()) {
    return;
  }

  await invokeCommand<CommandResult>("send_paste_shortcut");
}

export async function registerShortcut(accelerator: string) {
  if (!isTauriRuntime()) {
    return;
  }

  await invokeCommand<CommandResult>("register_shortcut", { accelerator });
}

export async function setFloatingPosition(x: number, y: number) {
  if (!isTauriRuntime()) {
    return;
  }

  await invokeCommand<CommandResult>("set_floating_position", { x, y });
}

export async function onTauriEvent<T>(event: string, handler: (payload: T) => void) {
  if (!isTauriRuntime()) {
    return () => undefined;
  }

  const { listen } = await import("@tauri-apps/api/event");
  return listen<T>(event, (payload) => handler(payload.payload));
}

export async function readClipboardText() {
  if (isTauriRuntime()) {
    const { readText } = await import("@tauri-apps/plugin-clipboard-manager");
    return readText();
  }

  return navigator.clipboard?.readText?.() ?? "";
}

export async function writeClipboardText(text: string) {
  if (isTauriRuntime()) {
    const { writeText } = await import("@tauri-apps/plugin-clipboard-manager");
    await writeText(text);
    return;
  }

  await navigator.clipboard?.writeText?.(text);
}

export function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
