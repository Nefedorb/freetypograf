# Release Process

## Каналы распространения

- **Actions artifacts**: быстрые тестовые сборки после каждого push в `main`.
- **GitHub Releases**: основной канал для пользователей, которым нужно просто скачать приложение.

Обычным пользователям отправляйте ссылку на Release, а не на artifact из Actions.

## Перед релизом

1. Обновить `version` в `package.json`.
2. Обновить `version` в `src-tauri/tauri.conf.json`.
3. Обновить `version` в `src-tauri/Cargo.toml`, чтобы Rust/Tauri logs совпадали с релизной версией.
4. Проверить, что `src-tauri/tauri.conf.json` использует identifier `ru.nefedorb.freetypograf`.
5. Запустить проверки:

```powershell
pnpm typecheck
pnpm test
pnpm build
cargo check --manifest-path src-tauri/Cargo.toml
pnpm tauri build
```

Если локальный `pnpm tauri build` не может перезаписать `src-tauri\target\release\app.exe`, проверить и закрыть запущенный процесс FreeTypograf/app.exe.

## Тестовые сборки

Любой push в `main` запускает:

- **Build Windows**: собирает `.msi`, `setup.exe` и portable `.exe` как Actions artifacts.
- **Build macOS**: собирает `.dmg` и `.app` как Actions artifacts.

Artifacts скачиваются на странице конкретного workflow run. Portable `app.exe` допустим только здесь и локально для быстрой ручной проверки.

## Публикация Release

Пример публичного релиза:

```powershell
git tag v1.0.0
git push origin v1.0.0
```

Workflow **Release** собирает Windows и macOS, создаёт GitHub Release и прикрепляет installer assets.

Публичный Release не должен содержать raw portable `app.exe`, чтобы не путать обычных пользователей. Для Windows публикуются только:

- `FreeTypograf_<version>_x64-setup.exe` - основной установщик;
- `FreeTypograf_<version>_x64_en-US.msi` - альтернативный MSI-установщик.

Для macOS публикуется:

- `FreeTypograf_<version>_aarch64.dmg` - unsigned DMG для Apple Silicon.

GitHub автоматически добавляет `Source code (zip)` и `Source code (tar.gz)`; это нормально и не отключается.

## После релиза

Проверить:

- Release открылся на GitHub и не помечен как prerelease, если это публичная версия;
- tag указывает на свежий commit;
- в Release есть Windows `setup.exe` и `.msi`;
- в Release есть macOS `.dmg`;
- в Release нет `app.exe`;
- ссылки из README ведут на Releases;
- Windows installer скачивается и устанавливает приложение;
- macOS tester может открыть `.dmg`, запустить через right click -> Open и выдать Accessibility permission.

## Signing

Сейчас сборки unsigned:

- macOS: без Apple Developer ID и notarization;
- Windows: без code signing certificate.

Signing и notarization добавляются отдельным этапом, когда базовая GitHub-дистрибуция стабилизируется.
