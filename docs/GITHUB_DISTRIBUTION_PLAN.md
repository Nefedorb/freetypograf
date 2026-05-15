# GitHub Distribution Plan

## Цель

`Nefedorb/freetypograf` становится единым главным репозиторием FreeTypograf для Windows и macOS.

Один репозиторий содержит:

- общий Next.js UI;
- общий typograf engine и тесты;
- один `src-tauri`;
- платформенные runtime-ветки через `#[cfg(windows)]` и `#[cfg(target_os = "macos")]`;
- общие GitHub Releases.

## Структура

- `app/`, `components/`, `lib/`, `tests/` - общий frontend и локальная логика.
- `src-tauri/` - desktop runtime.
- `.github/workflows/build-windows.yml` - тестовые Windows artifacts.
- `.github/workflows/build-macos.yml` - тестовые macOS artifacts.
- `.github/workflows/release.yml` - релиз по тегу `v*`.
- `docs/WINDOWS_TESTING.md` - ручная проверка Windows.
- `docs/MACOS_TESTING.md` - ручная проверка macOS.
- `docs/RELEASE_PROCESS.md` - порядок публикации версий.

## Рабочий процесс

1. Внести законченную правку.
2. Запустить локальные проверки.
3. Закоммитить изменения.
4. Запушить в `main`.
5. Дождаться зелёных GitHub Actions.
6. Для публичной версии создать tag и дождаться GitHub Release.

## Правило безопасности

- Не пушить незавершённые или заведомо сломанные изменения.
- Не добавлять secrets, tokens, сертификаты и приватные ключи в репозиторий.
- Не логировать пользовательский текст и clipboard.
- Runtime-команды не должны принимать пользовательский текст как аргумент.

## Ближайшие этапы

1. Проверить Windows workflow на GitHub.
2. Проверить macOS workflow на GitHub.
3. Создать первый тестовый tag `v0.1.0-test`.
4. Отдать ссылку на Release тестировщикам.
5. После обратной связи добавить signing/notarization.

