# GitHub Distribution Plan

## Цель

`Nefedorb/freetypograf` — единый главный репозиторий FreeTypograf для Windows и macOS.

Репозиторий содержит:

- общий Next.js UI;
- общий typograf engine и тесты;
- один `src-tauri`;
- платформенные runtime-ветки через `#[cfg(windows)]` и `#[cfg(target_os = "macos")]`;
- общие GitHub Releases.

## Структура распространения

- `main` — основная ветка разработки.
- `Build Windows` — тестовые Windows artifacts по push в `main`.
- `Build macOS` — тестовые macOS artifacts по push в `main`.
- `Release` — публичная сборка по тегу `v*`.

GitHub Releases являются основным каналом распространения для пользователей.

## Что отправлять пользователям

Windows:

- `FreeTypograf_<version>_x64-setup.exe` — рекомендуемый вариант;
- `FreeTypograf_<version>_x64_en-US.msi` — альтернативный установщик.

macOS:

- `FreeTypograf_<version>_aarch64.dmg` — unsigned DMG для Apple Silicon.

Не отправлять пользователям raw portable `app.exe`. Он допустим только локально и как Actions artifact для быстрой проверки.

## README и скриншоты

Публичная GitHub-страница оформляется через `README.md`.

Скриншоты:

- локальные исходники складываются в `screens/`;
- `screens/` не коммитится;
- финальные копии коммитятся в `docs/assets/screenshots/`;
- README должен ссылаться только на `docs/assets/screenshots/...`.

## Локальные staging assets

- `screens/` — локальная папка свежих скриншотов.
- `sound/` — локальная папка исходных звуков.
- `.agents/` — локальная рабочая папка агента.

Эти папки ignored и не должны попадать в GitHub.

Tracked assets:

- `docs/assets/screenshots/` — финальные скриншоты README;
- `public/sounds/` — рабочие звуки приложения.

## Дизайн-песочница

Для UI-экспериментов используется `D:\code\freetypograf-design-lab`.

Правила:

- без `.git`;
- без GitHub remote;
- без push;
- удачные идеи фиксируются в `planning/DESIGN_LAB.md` внутри песочницы;
- перенос в основной проект делается отдельным проверенным инкрементом.

## Текущий статус

Текущий публичный release: `v1.0.1`.

Актуальные release assets были перезалиты 2026-05-16 после переноса темы `Modern Minimal + Brand Green` и обновления README screenshots.

Состояние на 2026-05-18:

- всего скачиваний assets: 3;
- `.dmg`: 1;
- `setup.exe`: 2;
- `.msi`: 0.

## Будущие этапы

- Windows code signing certificate.
- Apple Developer ID signing и notarization.
- Отдельная проверка macOS Intel/x64, если понадобится.
- Более формальный changelog для публичных patch-релизов.
