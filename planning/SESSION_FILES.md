# Session Files

## Основные инструкции

- `AGENTS.md` — основной workflow агента для unified-проекта.
- `Harness_Engineering_Recommendations.md` — инженерные рекомендации.
- `DESIGN_SYSTEM.md` — корневые правила визуальной системы.
- `docs/DESIGN_SYSTEM.md` — короткая ссылка на корневой дизайн-регламент.
- `docs/SECURITY_PROTOCOL.md` — правила безопасности desktop runtime.
- `docs/ARCHITECTURE.md` — архитектура приложения.

## Дистрибуция и тестирование

- `docs/RELEASE_PROCESS.md` — процесс GitHub Releases.
- `docs/GITHUB_DISTRIBUTION_PLAN.md` — модель распространения через GitHub.
- `docs/WINDOWS_TESTING.md` — ручная проверка Windows.
- `docs/MACOS_TESTING.md` — ручная проверка macOS и Accessibility.
- `.github/workflows/build-windows.yml` — тестовые Windows artifacts по push в `main`.
- `.github/workflows/build-macos.yml` — тестовые macOS artifacts по push в `main`.
- `.github/workflows/release.yml` — публичный release по тегу `v*`.

## Рабочие области проекта

- `app/` — Next.js UI.
- `components/` — UI-компоненты.
- `hooks/` — React hooks.
- `lib/` — настройки, типографический движок, clipboard-flow helpers и звуки.
- `src-tauri/` — Tauri runtime и desktop-интеграции.
- `tests/` — unit/smoke тесты.
- `public/sounds/` — tracked звуковые assets приложения.
- `docs/assets/screenshots/` — tracked финальные скриншоты для README.

## Локальные материалы

- `task/` — локальные материалы задачи, ignored.
- `screens/` — staging-папка исходных скриншотов README, ignored.
- `sound/` — staging-папка исходных звуков, ignored.
- `.agents/` — локальная папка агента, ignored.
- `D:\code\freetypograf-design-lab` — локальная дизайн-песочница без GitHub.

## Сборочные артефакты

- `out/` — статический экспорт Next.js, ignored.
- `.next/` — Next.js build cache, ignored.
- `src-tauri/target/` — Rust/Tauri build output, ignored.
- `src-tauri/target/release/app.exe` — локальный Windows executable для ручной проверки после `pnpm tauri build`.

## Текущий релиз

Текущий публичный релиз: `v1.0.1`.

Release assets:

- `FreeTypograf_1.0.1_x64-setup.exe`;
- `FreeTypograf_1.0.1_x64_en-US.msi`;
- `FreeTypograf_1.0.1_aarch64.dmg`.

Публичный release не должен содержать raw portable `app.exe`.
