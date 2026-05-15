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
- `docs/RELEASE_PROCESS.md` - процесс публикации GitHub Releases.
- `docs/GITHUB_DISTRIBUTION_PLAN.md` - roadmap единого GitHub-репозитория.

## Материалы задачи

- `task/task.txt` - исходное описание desktop-типографа.
- `task/Telegram_alKfjuGRv7.png` - пример окна настроек.
- `task/Telegram_jJu0V2Nezt.png` - пример floating-кнопки в редакторе.
- `task/Telegram_sGJULbmsSL.png` - пример результата типографирования.

## Основные рабочие области

- `package.json`, `pnpm-lock.yaml` - зависимости и команды проекта.
- `.agents/skills/shadcn/` - установленный shadcn/ui skill, использованный для UI.
- `next.config.ts`, `tsconfig.json`, `vitest.config.ts` - сборка, типизация и тесты.
- `app/` - Next.js UI.
- `components/` - UI-компоненты.
- `hooks/` - React hooks для настроек.
- `lib/` - настройки, типографический движок, helpers.
- `src-tauri/` - Tauri runtime и desktop-интеграции.
- `tests/` - unit/smoke тесты.

## Сборочные артефакты

- `out/` - статический экспорт Next.js.
- Windows `.msi`/`setup.exe` собираются через GitHub Actions на Windows runner.
- macOS `.app`/`.dmg` собираются через GitHub Actions на macOS runner.
