import * as vscode from 'vscode';

export class ChatHistoryProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  constructor(private ctx: vscode.ExtensionContext) {}
  refresh() { this._onDidChangeTreeData.fire(); }
  getTreeItem(el: vscode.TreeItem) { return el; }
  getChildren(): vscode.ProviderResult<vscode.TreeItem[]> {
    const items = this.ctx.globalState.get<string[]>('fineink.history') || [];
    return items.map((t, i) => {
      const item = new vscode.TreeItem(`${i+1}. ${t.slice(0,60)}`);
      item.tooltip = t;
      item.iconPath = new vscode.ThemeIcon('comment');
      return item;
    });
  }
}

export function registerHistory(ctx: vscode.ExtensionContext) {
  const provider = new ChatHistoryProvider(ctx);
  vscode.window.registerTreeDataProvider('fineink.chatHistory', provider);
  ctx.subscriptions.push(vscode.commands.registerCommand('fineink.history.add', async (text: string) => {
    const arr = ctx.globalState.get<string[]>('fineink.history') || [];
    arr.unshift(text);
    await ctx.globalState.update('fineink.history', arr.slice(0,200));
    provider.refresh();
  }));
}
