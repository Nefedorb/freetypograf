# Session Files

## Инструкции

- `agents.md` - основной workflow проекта.
- `Harness_Engineering_Recommendations.md` - инженерные рекомендации.
- `DESIGN_SYSTEM.md` - корневые правила визуальной системы.
- `docs/DESIGN_SYSTEM.md` - короткий указатель на корневые правила.
- `docs/SECURITY_PROTOCOL.md` - правила безопасности desktop runtime.
- `docs/ARCHITECTURE.md` - архитектура приложения.
- `docs/MACOS.md` - заметки по macOS runtime и Accessibility-разрешениям.
- `docs/WINDOWS_TESTING.md` - чеклист Windows-тестирования.
- `docs/MACOS_TESTING.md` - чеклист macOS-тестирования.
- `docs/RELEASE_PROCESS.md` - процесс публикации GitHub Releases.
- `docs/GITHUB_DISTRIBUTION_PLAN.md` - roadmap единого GitHub-репозитория.

## Материалы задачи

- `task/` - локальные рабочие материалы исходного MVP, папка игнорируется git.
- `screens/` - локальная staging-папка для новых скриншотов README, папка игнорируется git.
- `sound/` - локальная staging-папка исходных звуков, папка игнорируется git.

## Основные рабочие области

- `package.json`, `pnpm-lock.yaml` - зависимости и команды проекта.
- `.github/workflows/` - GitHub Actions для Windows, macOS и Release.
- `app/` - Next.js UI.
- `components/` - UI-компоненты.
- `hooks/` - React hooks для настроек.
- `lib/` - настройки, типографический движок, clipboard-flow helpers и звуки.
- `public/sounds/` - рабочие звуковые assets, которые попадают в сборку.
- `docs/assets/screenshots/` - финальные скриншоты для GitHub README.
- `src-tauri/` - Tauri runtime и desktop-интеграции.
- `tests/` - unit/smoke тесты.

## Сборочные артефакты

- `out/` - статический экспорт Next.js, не коммитится.
- `src-tauri/target/` - Rust/Tauri build output, не коммитится.
- `src-tauri/target/release/app.exe` - локальный Windows executable для ручной проверки после `pnpm tauri build`.
- GitHub Actions `Build Windows` может публиковать portable `app.exe` как test artifact.
- GitHub Release не должен публиковать `app.exe`; для Windows пользователям отдаются только `setup.exe` и `.msi`.
- macOS `.dmg` собирается через GitHub Actions на macOS runner.
