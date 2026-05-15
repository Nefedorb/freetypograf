# Workflow

## Порядок работы

1. Проверить инструкции в `agents.md`, `Harness_Engineering_Recommendations.md`, `planning/*` и `docs/*`.
2. Для runtime/security-изменений сначала прочитать `docs/SECURITY_PROTOCOL.md`.
3. Для UI-изменений прочитать `docs/DESIGN_SYSTEM.md`.
4. Делать один наблюдаемый инкремент за раз.
5. Не логировать и не сохранять содержимое пользовательского текста.
6. Перед установкой зависимостей сбрасывать небезопасную переменную `NODE_TLS_REJECT_UNAUTHORIZED`.
7. Проверять изменения командами `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm tauri build`, если окружение позволяет.

## Инкременты MVP

1. Документы и архитектурные ограничения.
2. Next/Tauri scaffold и базовая тема.
3. Типографический движок и настройки.
4. Desktop runtime: floating window, tray, shortcut, clipboard-flow.
5. UI настроек и result feedback.
6. Тесты и сборка.
