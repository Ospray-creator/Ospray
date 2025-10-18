import * as vscode from 'vscode';
import { streamChat } from './providers/stream';

export function registerChatParticipant(context: vscode.ExtensionContext) {
  const participant = vscode.chat.createChatParticipant(
    'fineink.ai.core',
    async (request, chatContext, token) => {
      const cfg = vscode.workspace.getConfiguration('fineink.ai');
      const baseUrl = cfg.get<string>('baseUrl') || '';
      const model = cfg.get<string>('model') || '';
      const provider = cfg.get<string>('provider') || 'openai';
      const temperature = cfg.get<number>('temperature') ?? 0.2;

      const apiKeyStored = await context.secrets.get('fineink.ai.apiKey');
      const apiKeyCfg = cfg.get<string>('apiKey') || '';
      const apiKey = apiKeyStored || apiKeyCfg || undefined;

      const response = request.response;
      if (!response) return;
      if (!baseUrl || !model) {
        response.append('❌ Настройки неполные. Откройте «FineInk AI: Настроить модель».');
        response.end();
        return;
      }

      const userText = request.prompt ?? '';
      const systemPrompt = 'Ты — агент FineInk IDE. Отвечай кратко, с примерами кода где уместно.';
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userText }
      ];

      try {
        for await (const chunk of streamChat({ provider, baseUrl, apiKey, model, messages, temperature })) {
          if (token.isCancellationRequested) break;
          response.append(chunk);
        }
      } catch (e: any) {
        response.append(`❌ Ошибка LLM: ${e?.message ?? String(e)}`);
      } finally {
        try { await vscode.commands.executeCommand('fineink.history.add', userText); } catch {}
        response.end();
      }
    }
  );
  context.subscriptions.push({ dispose: () => participant.dispose() });
}
