import * as vscode from 'vscode';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

let mcpClient: Client | null = null;
let statusBar: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;
const toolDisposables: vscode.Disposable[] = [];

export async function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('Jekyll MCP');
  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.command = 'jekyll-mcp.showLogs';
  context.subscriptions.push(statusBar, outputChannel);

  context.subscriptions.push(
    vscode.commands.registerCommand('jekyll-mcp.restart', () => restartServer(context)),
    vscode.commands.registerCommand('jekyll-mcp.showLogs', () => outputChannel.show())
  );

  await startServer(context);
}

async function startServer(context: vscode.ExtensionContext) {
  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!root) {
    statusBar.text = '$(error) Jekyll MCP: No workspace';
    statusBar.show();
    return;
  }

  try {
    stopServer();

    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', 'jekyll-component-mcp', '--root', root],
      stderr: 'pipe'
    });

    mcpClient = new Client({ name: 'jekyll-mcp-ext', version: '0.1.0' });
    await mcpClient.connect(transport);

    const { tools } = await mcpClient.listTools();
    for (const t of tools) {
      const name = `jekyll_${t.name}`;
      const d = vscode.lm.registerTool(name, {
        async invoke(options, _token) {
          const result = await mcpClient!.callTool({
            name: t.name,
            arguments: (options.input as Record<string, unknown>) || {}
          });
          const text = Array.isArray(result.content)
            ? result.content.map((c: any) => c.text ?? JSON.stringify(c)).join('\n')
            : String(result.content ?? '');
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(text)
          ]);
        }
      });
      toolDisposables.push(d);
    }

    statusBar.text = '$(symbol-structure) Jekyll MCP: Active';
    statusBar.show();
    outputChannel.appendLine(`MCP started for ${root}. Tools: ${tools.length}`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    statusBar.text = '$(error) Jekyll MCP: Failed';
    statusBar.show();
    outputChannel.appendLine(`Error: ${msg}`);
  }
}

function stopServer() {
  toolDisposables.forEach((d) => d.dispose());
  toolDisposables.length = 0;
  if (mcpClient) {
    mcpClient.close().catch(() => {});
    mcpClient = null;
  }
}

async function restartServer(context: vscode.ExtensionContext) {
  stopServer();
  await startServer(context);
}

export function deactivate() {
  stopServer();
}
