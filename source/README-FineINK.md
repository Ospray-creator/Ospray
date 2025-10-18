# FineINK IDE (форк VS Code)

## Требования
- Windows 11
- Node 22.12+
- Python 3.10+
- Visual Studio Build Tools 2022 (C++, Windows SDK, Spectre)

## Быстрый старт (dev)
```powershell
cd C:\\dev\\fineink-ide\\source
npm ci
npm run watch
.\\scripts\\code.bat --extensionDevelopmentPath=C:\\dev\\fineink-ide\\source\\extensions\\ai-core
```

## Провайдеры LLM
Настройки → FineInk AI: выберите провайдера, model, baseUrl. API ключ хранится через SecretStorage (Windows: DPAPI).

## MCP
Команда: FineInk AI: Подключить MCP. Настройте команду и аргументы в настройках.

## История чатов
Activity Bar → FineInk → История чатов.
