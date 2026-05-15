# Release Process

## Каналы распространения

- **Actions artifacts**: быстрые тестовые сборки после каждого push в `main`.
- **GitHub Releases**: основной канал для людей, которым нужно просто скачать приложение.

Обычным пользователям лучше отправлять ссылку на Release, а не на artifact из Actions.

## Перед релизом

1. Обновить `version` в `package.json`.
2. Обновить `version` в `src-tauri/tauri.conf.json`.
3. Проверить, что `src-tauri/tauri.conf.json` использует identifier `ru.nefedorb.freetypograf`.
4. Запустить проверки:

```powershell
pnpm typecheck
pnpm test
pnpm build
cargo check --manifest-path src-tauri/Cargo.toml
```

## Тестовые сборки

Любой push в `main` запускает:

- **Build Windows**: собирает `.msi`, `setup.exe` и portable `.exe`, если Tauri их выдаёт.
- **Build macOS**: собирает `.dmg` и `.app`.

Artifacts скачиваются на странице конкретного workflow run.

## Публикация Release

Пример для тестовой версии:

```powershell
git tag v0.1.0-test
git push origin v0.1.0-test
```

Workflow **Release** соберёт Windows и macOS, создаст GitHub Release и прикрепит installer assets.

## После релиза

Проверить:

- release открылся на GitHub;
- в release есть Windows installer;
- в release есть macOS `.dmg`;
- ссылки из README ведут на Releases;
- тестировщик на Windows может установить приложение;
- тестировщик на macOS может открыть `.dmg`, запустить через right click -> Open и выдать Accessibility permission.

## Signing

Сейчас сборки unsigned:

- macOS: без Apple Developer ID и notarization;
- Windows: без code signing certificate.

Signing и notarization нужно добавить отдельным этапом, когда базовая GitHub-дистрибуция стабилизируется.

