# Workflow

## Основной порядок работы

1. Работать в основном проекте `D:\code\typograf-macos`.
2. Перед runtime/security/infra/deploy-правками читать `docs/SECURITY_PROTOCOL.md`.
3. Перед UI/layout/theme-правками читать `docs/DESIGN_SYSTEM.md`.
4. Делать один наблюдаемый инкремент за раз.
5. Не логировать и не сохранять пользовательский текст из clipboard-flow.
6. Не переносить в проект `NODE_TLS_REJECT_UNAUTHORIZED=0`.
7. Проверять изменения командами, подходящими типу задачи.

## Проверки

Для app/UI/runtime/логики:

```powershell
pnpm typecheck
pnpm test
pnpm build
cargo check --manifest-path src-tauri/Cargo.toml
pnpm tauri build
```

После `pnpm tauri build` локальный Windows app для ручной проверки лежит здесь:

```text
D:\code\typograf-macos\src-tauri\target\release\app.exe
```

Для docs/screenshots/service-only правок сборка приложения не обязательна.

## GitHub и релизы

- Любой push в `main` запускает `Build Windows` и `Build macOS`.
- Тег `v*` запускает workflow `Release`.
- Публичный GitHub Release должен содержать только installer assets:
  - Windows `setup.exe`;
  - Windows `.msi`;
  - macOS `.dmg`.
- Raw portable `app.exe` допустим только как локальный файл или Actions artifact, но не как публичный release asset.

## Дизайн-песочница

Для свободных UI-экспериментов использовать `D:\code\freetypograf-design-lab`.

Правила песочницы:

- не инициализировать Git;
- не добавлять remote;
- не пушить из этой папки;
- фиксировать удачные идеи в `planning/DESIGN_LAB.md` внутри песочницы;
- переносить в основной проект только выбранные изменения отдельным инкрементом.

## Staging assets

- `screens/` — локальные исходные скриншоты; финальные копии коммитятся только в `docs/assets/screenshots/`.
- `sound/` — локальные исходные звуки; рабочие assets коммитятся только в `public/sounds/`.
- `screens/`, `sound/`, `.agents/` должны оставаться ignored.
