# Release Process

## Каналы распространения

- **GitHub Actions artifacts** — быстрые тестовые сборки после каждого push в `main`.
- **GitHub Releases** — основной канал для обычных пользователей.

Пользователям отправляем ссылку на GitHub Release, а не на Actions artifact.

## Перед релизом

1. Обновить `version` в `package.json`.
2. Обновить `version` в `src-tauri/tauri.conf.json`.
3. Обновить `version` в `src-tauri/Cargo.toml`.
4. Проверить identifier `ru.nefedorb.freetypograf`.
5. Прогнать проверки:

```powershell
pnpm typecheck
pnpm test
pnpm build
cargo check --manifest-path src-tauri/Cargo.toml
pnpm tauri build
```

Если `pnpm tauri build` не может перезаписать `src-tauri\target\release\app.exe`, нужно закрыть запущенный FreeTypograf/app.exe и повторить сборку.

## Тестовые сборки

Любой push в `main` запускает:

- **Build Windows** — собирает `.msi`, `setup.exe` и portable `.exe` как Actions artifacts.
- **Build macOS** — собирает `.dmg` и `.app` как Actions artifacts.

Portable `app.exe` допустим только локально и в Actions artifacts для быстрой проверки. В публичный GitHub Release его не прикладывать.

## Публикация нового Release

Обычный публичный релиз создаётся тегом:

```powershell
git tag v1.0.1
git push origin v1.0.1
```

Workflow **Release** собирает Windows и macOS, создаёт GitHub Release и прикрепляет installer assets.

Публичные Windows assets:

- `FreeTypograf_<version>_x64-setup.exe` — основной установщик;
- `FreeTypograf_<version>_x64_en-US.msi` — MSI-установщик.

Публичный macOS asset:

- `FreeTypograf_<version>_aarch64.dmg` — unsigned DMG для Apple Silicon.

GitHub автоматически добавляет `Source code (zip)` и `Source code (tar.gz)`. Это нормально.

## Перезаливка существующего Release

Перезаливать существующий релиз допустимо только пока он не распространялся пользователям.

Порядок:

1. Убедиться, что изменения уже в `main`.
2. Переставить tag на актуальный commit:

```powershell
git tag -f v1.0.0 HEAD
git push origin +v1.0.0
```

3. Дождаться workflow **Release** по тегу.
4. Проверить, что release assets перезалиты через `--clobber`.
5. Проверить, что в release нет `app.exe`.

После публичного распространения приложения существующие релизы не переписывать. Вместо этого выпускать новую patch-версию.

## После релиза

Проверить:

- Release открыт на GitHub и не помечен как prerelease, если это публичная версия;
- tag указывает на актуальный commit;
- release содержит Windows `setup.exe` и `.msi`;
- release содержит macOS `.dmg`;
- release не содержит raw `app.exe`;
- ссылки из README ведут на Releases;
- README показывает актуальные скриншоты из `docs/assets/screenshots/`;
- Windows installer скачивается и устанавливает приложение;
- macOS tester может открыть `.dmg` через right click -> Open и выдать Accessibility permission.

## Текущий релиз

Текущий публичный релиз: `v1.0.0`.

Особенности текущего релиза:

- tag `v1.0.0` был перенесён на commit `aab6e6b`;
- assets перезалиты 2026-05-16 после обновления темы и README screenshots;
- release не содержит raw `app.exe`;
- сборки unsigned: без Apple Developer ID, notarization и Windows code signing certificate.

## Signing

Сейчас сборки unsigned:

- macOS: без Apple Developer ID и notarization;
- Windows: без code signing certificate.

Signing и notarization добавляются отдельным этапом, когда базовая GitHub-дистрибуция стабилизируется.
