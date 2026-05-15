# Build Log

## 2026-05-15 MVP desktop scaffold

Собран MVP Windows-приложения "Типограф":

- Tauri 2 runtime с окнами `main` и `floating`;
- статический Next.js UI с shadcn/ui и Tailwind;
- локальный движок `typograf@7.7.0` + `eyo-kernel@4.1.2`;
- tray-меню, глобальный shortcut и clipboard-flow;
- unit/smoke тесты для правил, настроек и clipboard-flow.

Проверки:

- `pnpm typecheck` - успешно;
- `pnpm test` - успешно, 17 тестов;
- `pnpm build` - успешно;
- `cargo check` в `src-tauri` - успешно;
- `pnpm tauri build` - успешно.

Артефакты:

- `src-tauri/target/release/app.exe`;
- `src-tauri/target/release/bundle/msi/Typograf_0.1.0_x64_en-US.msi`;
- `src-tauri/target/release/bundle/nsis/Typograf_0.1.0_x64-setup.exe`.

Ограничения:

- MVP вставляет только plain text;
- ручная матрица Notepad/Word/Chrome/Telegram/VS Code/Figma должна быть пройдена отдельно на рабочем Windows-сеансе;
- в elevated/admin-приложениях Windows `SendInput` может блокироваться системой.

## 2026-05-15 Floating button transparency fix

Исправлен прямоугольный артефакт вокруг floating-кнопки:

- удален web-тултип из маленького floating-окна;
- floating layout принудительно прозрачен на уровне `html`, `body` и корневой области;
- для Tauri floating-окна отключена native shadow;
- runtime дополнительно выставляет прозрачный фон окна и webview.

Проверки:

- `pnpm typecheck` - успешно;
- `pnpm test` - успешно, 17 тестов;
- `pnpm build` - успешно;
- `cargo check` в `src-tauri` - успешно;
- `pnpm tauri build` - успешно.

## 2026-05-15 Settings window restore from tray

Исправлено восстановление окна настроек после скрытия или закрытия:

- добавлен единый runtime-helper открытия окна настроек;
- tray item и левый клик по tray теперь пересоздают `main`, если окно было уничтожено;
- команда `show_settings_window` использует тот же путь восстановления;
- крестик окна настроек теперь скрывает окно вместо уничтожения.

Проверки:

- `cargo check` в `src-tauri` - успешно;
- `pnpm typecheck` - успешно;
- `pnpm test` - успешно, 17 тестов;
- `pnpm build` - успешно;
- `pnpm tauri build` - успешно.

## 2026-05-15 Floating close button

Синий крестик на floating-кнопке сделан отдельным действием скрытия:

- `X` больше не используется как статус "без изменений";
- клик по `X` скрывает floating-окно и сохраняет `floatingButton.enabled: false`;
- статус "без изменений" заменен на нейтральную иконку.

Проверки:

- `pnpm typecheck` - успешно;
- `pnpm test` - успешно, 17 тестов;
- `pnpm build` - успешно;
- `pnpm tauri build` - успешно.

## 2026-05-15 Floating transient result badge

Нижний статус floating-кнопки заменен верхней временной плашкой результата:

- нижний синий бейдж больше не рендерится в floating UI;
- после успешной обработки или сценария "без изменений" сверху на 2.5 секунды показывается число измененных символов;
- обычное верхнее состояние остается кнопкой скрытия `X`.

Проверки:

- `pnpm typecheck` - успешно;
- `pnpm test` - успешно, 17 тестов;
- `pnpm build` - успешно;
- `pnpm tauri build` - успешно.

## 2026-05-15 Settings native sidebar redesign

Экран настроек переведен на desktop preferences layout:

- горизонтальные tabs заменены на левый sidebar с разделами настроек;
- правая область собрана из компактных preference panels;
- сохранена существующая логика настроек, clipboard-flow, preview и floating-кнопки.

Проверки:

- `pnpm typecheck` - успешно;
- `pnpm test` - успешно, 17 тестов;
- `pnpm build` - успешно;
- `pnpm tauri build` - успешно.

## 2026-05-15 Settings header and status polish

Выровнен верхний стык sidebar и правого header, а нижний статус sidebar приведен к compact-row виду:

- sidebar header и правый header получили общую высоту `h-20`;
- нижний статус теперь выровнен через `flex items-center justify-between`;
- активный режим отображается зеленым локальным индикатором, пауза - нейтральным;
- технический текст `on/off` заменен на понятные подписи `Активен` / `Пауза`.

Проверки:

- `pnpm typecheck` - успешно;
- `pnpm test` - успешно, 17 тестов;
- `pnpm build` - успешно.

## 2026-05-15 Settings profiles copy

Раздел профиля типографики уточнен под фактическую логику приложения:

- sidebar item `Языки` переименован в `Профили`;
- языковая иконка заменена на иконку режимов;
- варианты профиля локализованы как `Стандартный`, `Строгий`, `Минимальный`;
- под селектом показывается описание выбранного профиля.

Проверки:

- `pnpm typecheck` - успешно;
- `pnpm test` - успешно, 17 тестов;
- `pnpm build` - успешно;
- `pnpm tauri build` - успешно.

## 2026-05-15 Green brand accent and icons

Приложение переведено с синего акцента на фирменный зеленый `#129D5C`:

- обновлены `primary`, `ring` и `accent` theme tokens;
- локальный статус `Активен` переведен с `emerald-*` на `primary`-based стили;
- floating-кнопка, верхний `X`, кнопки, switch, checkbox и slider получают зеленый цвет через общий token;
- сгенерирован новый набор иконок приложения: белая `T` на зеленом фоне.

Проверки:

- `pnpm typecheck` - успешно;
- `pnpm test` - успешно, 17 тестов;
- `pnpm build` - успешно;
- `pnpm tauri build` - успешно.

## 2026-05-15 Sidebar-matched app icon

Иконка приложения приведена к виду sidebar-логотипа:

- native source icon заменен на зеленый rounded-square с белой lucide `Type`;
- пересобраны desktop/bundle icons через `pnpm tauri icon`;
- в sidebar header убрана подпись `Desktop runtime` / `Web preview`.

Проверки:

- `pnpm typecheck` - успешно;
- `pnpm test` - успешно, 17 тестов;
- `pnpm build` - успешно;
- `pnpm tauri build` - успешно.

## 2026-05-15 macOS project split

Создана отдельная папка `D:\code\typograf-macos` для macOS-варианта приложения:

- скопирован текущий UI и Tauri runtime без build-артефактов;
- bundle identifier заменен на `ru.typograf.desktop.macos`;
- добавлена macOS-ветка copy/paste через `osascript` и `System Events`;
- добавлены заметки по macOS Accessibility-разрешению.

Проверки:

- `pnpm typecheck` - успешно;
- `pnpm test` - успешно, 17 тестов;
- `pnpm build` - успешно;
- `cargo check` в `src-tauri` на Windows-host - успешно для доступного target.

## 2026-05-15 GitHub macOS artifacts

Подготовлена публикация macOS-варианта в отдельный GitHub-репозиторий `Nefedorb/freetypograf`:

- добавлен workflow `Build macOS` для сборки unsigned `.dmg` на `macos-latest`;
- workflow загружает `.dmg` и `.app` как GitHub Actions artifacts;
- добавлена инструкция `docs/MACOS_TESTING.md` для обычного MacBook-тестировщика.

Проверки перед push:

- `pnpm typecheck` - успешно;
- `pnpm test` - успешно, 17 тестов;
- `pnpm build` - успешно;
- `cargo check` в `src-tauri` - успешно.

## 2026-05-15 Unified GitHub distribution

Репозиторий `Nefedorb/freetypograf` переведен из macOS-only в единый продуктовый репозиторий FreeTypograf:

- обновлен bundle identifier на `ru.nefedorb.freetypograf`;
- добавлены GitHub Actions workflows для Windows, macOS и release по тегу `v*`;
- actions обновлены до Node 24-compatible версий;
- README оформлен как продуктовая страница со ссылками на Releases и скриншоты;
- добавлены `docs/WINDOWS_TESTING.md`, `docs/MACOS_TESTING.md`, `docs/RELEASE_PROCESS.md`, `docs/GITHUB_DISTRIBUTION_PLAN.md`;
- добавлен локальный `scripts/sync.ps1` для проверки, commit и push готовых изменений.

Проверки:

- `pnpm typecheck` - успешно;
- `pnpm test` - успешно, 17 тестов;
- `pnpm build` - успешно;
- `cargo check` в `src-tauri` - успешно;
- `pnpm tauri build` на Windows - успешно, собраны `FreeTypograf_0.1.0_x64_en-US.msi` и `FreeTypograf_0.1.0_x64-setup.exe`.
