# Типограф для macOS

Это отдельная macOS-папка приложения. Windows-версия остается в соседнем проекте ``.

## Быстрый старт на Mac

```bash
pnpm install
pnpm tauri dev
```

Release-сборка:

```bash
pnpm tauri build
```

## Важно для macOS

- Для clipboard-flow нужно выдать Accessibility-разрешение приложению в System Settings -> Privacy & Security -> Accessibility.
- Приложение не отправляет текст наружу и не пишет содержимое clipboard в логи.
- Copy/paste вызываются через `System Events` только по явному действию пользователя.

Подробнее: `docs/MACOS.md`.

Инструкция для обычного тестировщика: `docs/MACOS_TESTING.md`.
