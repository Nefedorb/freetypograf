# macOS Build Notes

Эта папка содержит macOS-вариант desktop-приложения "Типограф".

## Что отличается от Windows-версии

- Bundle identifier: `ru.typograf.desktop.macos`.
- Clipboard-flow остается локальным и plain text.
- Copy/paste отправляются через macOS `osascript` и `System Events`.
- Floating-окно не использует Windows `WS_EX_NOACTIVATE`; на macOS оно переводится в non-focusable режим через Tauri API.

## Разрешения macOS

Для отправки `Command+C` и `Command+V` macOS потребует Accessibility-доступ:

1. Откройте System Settings.
2. Перейдите в Privacy & Security -> Accessibility.
3. Разрешите доступ приложению "Typograf".

Без этого clipboard-flow не сможет отправлять системные сочетания клавиш в активное приложение.

## Команды

```bash
pnpm install
pnpm tauri dev
pnpm tauri build
```

Собирать `.app`/`.dmg` нужно на macOS. Windows-среда может проверить только Next.js, тесты и Windows-target Rust-код.
