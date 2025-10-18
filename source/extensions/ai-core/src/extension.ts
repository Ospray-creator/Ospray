import * as vscode from 'vscode';
import { registerChatParticipant } from './chatParticipant';
import { registerHistory } from './historyView';
import { connectMCP } from './mcp/client';

export function activate(ctx: vscode.ExtensionContext) {
  const sb = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000);
  const upd = () => {
    const model = vscode.workspace.getConfiguration('fineink.ai').get('model');
    sb.text = `$(sparkle) FineInk • ${model ?? '—'}`;
    sb.tooltip = 'FineInk AI: Открыть чат';
  };
  upd();
  sb.command = 'fineink.ai.chat.open';
  sb.show();
  ctx.subscriptions.push(sb);

  vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration('fineink.ai.model')) upd();
  }, null, ctx.subscriptions);

  ctx.subscriptions.push(
    vscode.commands.registerCommand('fineink.ai.chat.open', async () => {
      await vscode.commands.executeCommand('workbench.action.chat.open');
    }),
    vscode.commands.registerCommand('fineink.ai.configure', async () => {
      await vscode.commands.executeCommand('workbench.action.openSettings', 'FineInk AI');
    }),
    vscode.commands.registerCommand('fineink.ai.configureApiKey', async () => {
      const key = await vscode.window.showInputBox({ prompt: 'Введите API ключ', password: true });
      if (key !== undefined) {
        await ctx.secrets.store('fineink.ai.apiKey', key);
        vscode.window.showInformationMessage('API ключ сохранён (Windows: DPAPI через SecretStorage).');
      }
    }),
    vscode.commands.registerCommand('fineink.mcp.connect', async () => {
      await connectMCP();
      vscode.window.showInformationMessage('MCP подключён.');
    })
  );

  registerHistory(ctx);
  registerChatParticipant(ctx);
}

export function deactivate() {}
