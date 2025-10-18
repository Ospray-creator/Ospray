import * as cp from 'child_process';
import * as vscode from 'vscode';

export class MCPClient {
  private proc?: cp.ChildProcessWithoutNullStreams;
  constructor(private command: string, private args: string[]) {}
  start() {
    this.proc = cp.spawn(this.command, this.args, { stdio: 'pipe' });
    this.proc.on('exit', (code) => console.log('MCP exited', code));
  }
  stop() { this.proc?.kill(); }
  send(msg: any) { this.proc?.stdin.write(JSON.stringify(msg) + '\n'); }
  onMessage(cb: (msg:any)=>void) {
    this.proc?.stdout.on('data', (buf) => {
      for (const line of buf.toString('utf8').split('\n')) {
        if (!line.trim()) continue;
        try { cb(JSON.parse(line)); } catch {}
      }
    });
  }
}

export async function connectMCP(): Promise<MCPClient> {
  const cmd = vscode.workspace.getConfiguration('fineink.mcp').get<string>('stdio.command') || 'fineink-mcp.exe';
  const args = vscode.workspace.getConfiguration('fineink.mcp').get<string[]>('stdio.args') || [];
  const client = new MCPClient(cmd, args);
  client.start();
  return client;
}
