# Windows Testing

## Как получить приложение

Лучший способ для обычного тестировщика:

1. Откройте страницу [Releases](https://github.com/Nefedorb/freetypograf/releases).
2. Выберите последний release.
3. Скачайте `.msi` или `setup.exe`.
4. Установите приложение и запустите FreeTypograf.

Если release ещё не создан, можно скачать тестовый artifact:

1. Откройте [Actions](https://github.com/Nefedorb/freetypograf/actions).
2. Выберите последний успешный workflow **Build Windows**.
3. Внизу страницы скачайте `freetypograf-windows-installers`.
4. Распакуйте zip и запустите installer.

## Первый запуск

Сборка пока не подписана code signing certificate. Windows SmartScreen может показать предупреждение о неизвестном издателе. Для закрытого тестирования это ожидаемо.

## Чеклист

- Открывается окно настроек.
- Иконка приложения зелёная, как в sidebar.
- Tray-меню открывает настройки.
- Tray item показывает и скрывает floating-кнопку.
- Floating-кнопка видна поверх обычных окон.
- Клик по floating-кнопке не забирает фокус у приложения с выделенным текстом.
- Один клик типографирует выделенный plain text.
- Двойной клик открывает настройки.
- Хоткей `Ctrl+Shift+T` запускает типографирование.
- Крестик над floating-кнопкой скрывает её.
- Настройки сохраняются после перезапуска.
- Текст не появляется в логах и не отправляется наружу.

## Матрица ручной проверки

- Notepad.
- Word.
- Chrome textarea.
- Chrome contenteditable.
- Telegram Desktop.
- VS Code.
- Figma.

## Известные ограничения

- В elevated/admin-приложениях Windows может блокировать `SendInput`.
- MVP вставляет только plain text.
- Rich text/RTF/HTML preservation оставлен на следующий этап.

