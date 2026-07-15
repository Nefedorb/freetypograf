# Architecture

## Общая схема

Desktop MVP состоит из двух слоев:

- `src-tauri/` - нативный runtime: окна, tray, глобальный shortcut и отправка copy/paste.
- Next.js static UI - окно настроек, floating-кнопка, clipboard-flow и локальная логика правил.

Обработка текста выполняется локально в UI-слое через `typograf` и безопасный ёфикатор. Runtime не получает и не логирует содержимое текста сверх операции clipboard-flow.

## Поток типографирования

1. Пользователь выделяет текст в стороннем приложении.
2. Пользователь нажимает floating-кнопку или глобальный hotkey.
3. UI через `@tauri-apps/plugin-clipboard-manager` сохраняет прежний текстовый clipboard.
4. Runtime отправляет `Ctrl+C` активному приложению.
5. UI получает текст из clipboard, применяет локальные правила и пишет результат в clipboard.
6. Runtime отправляет `Ctrl+V`.
7. UI восстанавливает прежний clipboard, если это возможно и безопасно.

## Desktop Runtime

Runtime содержит только системные интеграции:

- два окна Tauri: `main` для настроек и `floating` для кнопки;
- tray-меню: открыть настройки, показать/скрыть кнопку, пауза, выход;
- глобальный shortcut через `tauri-plugin-global-shortcut`;
- copy/paste через Windows `SendInput` в Windows-ветке и macOS `System Events` в macOS-ветке;
- Windows `WS_EX_NOACTIVATE` или macOS non-focusable window для floating-окна, чтобы клик по кнопке не забирал фокус у приложения с выделенным текстом.
- Floating-позиция хранится в logical coordinates, ограничивается рабочей областью текущего экрана и синхронизируется с tray visibility event.
- Floating-окно имеет запас вокруг 64px круга: отдельный `X` находится снаружи и скрывает кнопку только по явному клику.

Runtime-команды не принимают пользовательский текст как аргумент.

## Настройки

Настройки хранятся локально и версионируются. В MVP сохраняются:

- профиль правил;
- включенные категории;
- режим неразрывных пробелов;
- режим ёфикации;
- hotkey;
- позиция floating-кнопки;
- тема;
- звуки;
- режим паузы.

## Границы MVP

- Репозиторий является единым cross-platform продуктом для Windows и macOS.
- Платформенные отличия desktop runtime находятся в `src-tauri/src/lib.rs` под `#[cfg(windows)]` и `#[cfg(target_os = "macos")]`.
- Windows и macOS распространяются через общие GitHub Releases.
- Только plain text. RTF/HTML preservation остается за пределами MVP.
- Нет PostgreSQL/backend: приложение локальное. Если появится cloud sync, правило PostgreSQL из `agents.md` станет обязательным для серверного контура.
