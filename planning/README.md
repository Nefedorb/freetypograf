# Planning

Эта папка хранит рабочие планы, session-файлы и короткие workflow-заметки проекта FreeTypograf.

## Текущий источник истины

- Основной unified-проект: `D:\code\typograf-macos`.
- GitHub-репозиторий: `Nefedorb/freetypograf`.
- Дизайн-песочница без GitHub: `D:\code\freetypograf-design-lab`.
- Старая папка `D:\code\typograf` больше не используется как источник истины.

## Текущий продукт

FreeTypograf — локальное desktop-приложение для Windows и macOS:

- Tauri 2 + статический Next.js UI.
- Локальная обработка текста через `typograf` и безопасную ёфикацию.
- Floating-кнопка поверх окон, tray-меню и hotkey.
- Clipboard-flow для выделенного текста в сторонних приложениях.
- GitHub Releases как основной канал распространения.

## Готовность релиза

Текущий публичный релиз: `v1.0.0`.

Релизные assets:

- Windows: `FreeTypograf_1.0.0_x64-setup.exe`, `FreeTypograf_1.0.0_x64_en-US.msi`.
- macOS: `FreeTypograf_1.0.0_aarch64.dmg`.
- Raw portable `app.exe` в публичный release не прикладывается.

## Локальные staging-папки

- `screens/` — локальные исходные скриншоты для README, не коммитится.
- `sound/` — локальные исходные звуки, не коммитится.
- `.agents/` — локальная рабочая папка агента, не коммитится.

Финальные assets, которые должны попадать в Git:

- `docs/assets/screenshots/` — скриншоты README.
- `public/sounds/` — звуки приложения.
