import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let diagnosticCollection: vscode.DiagnosticCollection;
let outputChannel: vscode.OutputChannel;
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  console.log('Chous extension is now active');

  // Create diagnostic collection
  diagnosticCollection = vscode.languages.createDiagnosticCollection('chous');
  context.subscriptions.push(diagnosticCollection);

  // Create output channel
  outputChannel = vscode.window.createOutputChannel('Chous');
  context.subscriptions.push(outputChannel);

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = 'chous.showOutput';
  context.subscriptions.push(statusBarItem);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('chous.lint', () => runLint())
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('chous.fix', () => runFix())
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('chous.init', () => runInit())
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('chous.showOutput', () => {
      outputChannel.show();
    })
  );

  // Run lint on activation if enabled
  const config = vscode.workspace.getConfiguration('chous');
  if (config.get('enable') && config.get('lintOnOpen')) {
    runLint();
  }

  // Watch for file changes
  const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');
  fileWatcher.onDidCreate(() => {
    if (config.get('enable')) {
      runLint();
    }
  });
  fileWatcher.onDidDelete(() => {
    if (config.get('enable')) {
      runLint();
    }
  });
  context.subscriptions.push(fileWatcher);

  // Watch for config file changes
  const configWatcher = vscode.workspace.createFileSystemWatcher('**/.chous');
  configWatcher.onDidChange(() => {
    if (config.get('enable')) {
      runLint();
    }
  });
  context.subscriptions.push(configWatcher);

  // Run lint on save
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(() => {
      if (config.get('enable') && config.get('lintOnSave')) {
        runLint();
      }
    })
  );
}

async function runLint() {
  const config = vscode.workspace.getConfiguration('chous');

  if (!config.get('enable')) {
    return;
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder open');
    return;
  }

  updateStatusBar('$(sync~spin) Linting...', 'Chous is linting your project');

  try {
    const executablePath = config.get<string>('executablePath') || 'npx chous';
    const verbose = config.get<boolean>('verbose') ? '--verbose' : '';
    const strict = config.get<boolean>('strict') ? '--strict' : '';
    const configPath = config.get<string>('configPath');
    const configArg = configPath ? `--config ${configPath}` : '';

    const command = `${executablePath} ${verbose} ${strict} ${configArg}`.trim();

    outputChannel.clear();
    outputChannel.appendLine(`Running: ${command}`);
    outputChannel.appendLine(`Working directory: ${workspaceFolder.uri.fsPath}`);
    outputChannel.appendLine('');

    const { stdout, stderr } = await execAsync(command, {
      cwd: workspaceFolder.uri.fsPath,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    if (stdout) {
      outputChannel.appendLine(stdout);
    }

    if (stderr) {
      outputChannel.appendLine('STDERR:');
      outputChannel.appendLine(stderr);
    }

    // Parse output and create diagnostics
    const diagnostics = parseChousOutput(stdout, workspaceFolder.uri.fsPath);

    // Clear all diagnostics first
    diagnosticCollection.clear();

    // Group diagnostics by file
    const diagnosticsByFile = new Map<string, vscode.Diagnostic[]>();
    for (const diagnostic of diagnostics) {
      const existing = diagnosticsByFile.get(diagnostic.file) || [];
      existing.push(diagnostic.diagnostic);
      diagnosticsByFile.set(diagnostic.file, existing);
    }

    // Set diagnostics for each file
    for (const [file, fileDiagnostics] of diagnosticsByFile) {
      const uri = vscode.Uri.file(file);
      diagnosticCollection.set(uri, fileDiagnostics);
    }

    const issueCount = diagnostics.length;
    if (issueCount === 0) {
      updateStatusBar('$(check) Chous: No issues', 'No file structure issues found');
      vscode.window.showInformationMessage('Chous: No file structure issues found');
    } else {
      updateStatusBar(
        `$(warning) Chous: ${issueCount} issue${issueCount > 1 ? 's' : ''}`,
        `Found ${issueCount} file structure issue${issueCount > 1 ? 's' : ''}`
      );
    }
  } catch (error: any) {
    const errorMessage = error.message || String(error);
    outputChannel.appendLine('ERROR:');
    outputChannel.appendLine(errorMessage);

    updateStatusBar('$(error) Chous: Error', 'Error running chous');

    if (errorMessage.includes('command not found') || errorMessage.includes('not recognized')) {
      vscode.window.showErrorMessage(
        'Chous is not installed. Run: npm install -g chous',
        'Install'
      ).then(selection => {
        if (selection === 'Install') {
          const terminal = vscode.window.createTerminal('Install Chous');
          terminal.sendText('npm install -g chous');
          terminal.show();
        }
      });
    } else {
      vscode.window.showErrorMessage(`Chous error: ${errorMessage}`);
    }
  }
}

async function runFix() {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder open');
    return;
  }

  const answer = await vscode.window.showWarningMessage(
    'This will automatically fix file structure issues. Continue?',
    'Yes',
    'Dry Run',
    'Cancel'
  );

  if (!answer || answer === 'Cancel') {
    return;
  }

  const dryRun = answer === 'Dry Run';
  const config = vscode.workspace.getConfiguration('chous');
  const executablePath = config.get<string>('executablePath') || 'npx chous';
  const dryRunFlag = dryRun ? '--dry-run' : '--yes';
  const command = `${executablePath} fix ${dryRunFlag}`;

  outputChannel.clear();
  outputChannel.appendLine(`Running: ${command}`);
  outputChannel.show();

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: workspaceFolder.uri.fsPath,
      maxBuffer: 10 * 1024 * 1024,
    });

    if (stdout) {
      outputChannel.appendLine(stdout);
    }

    if (stderr) {
      outputChannel.appendLine('STDERR:');
      outputChannel.appendLine(stderr);
    }

    if (dryRun) {
      vscode.window.showInformationMessage('Chous: Dry run completed. Check output for details.');
    } else {
      vscode.window.showInformationMessage('Chous: Auto-fix completed!');
      // Re-run lint to update diagnostics
      runLint();
    }
  } catch (error: any) {
    outputChannel.appendLine('ERROR:');
    outputChannel.appendLine(error.message || String(error));
    vscode.window.showErrorMessage(`Chous fix error: ${error.message}`);
  }
}

async function runInit() {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder open');
    return;
  }

  const config = vscode.workspace.getConfiguration('chous');
  const executablePath = config.get<string>('executablePath') || 'npx chous';
  const command = `${executablePath} init`;

  outputChannel.clear();
  outputChannel.appendLine(`Running: ${command}`);
  outputChannel.show();

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: workspaceFolder.uri.fsPath,
    });

    if (stdout) {
      outputChannel.appendLine(stdout);
    }

    if (stderr) {
      outputChannel.appendLine('STDERR:');
      outputChannel.appendLine(stderr);
    }

    vscode.window.showInformationMessage('Chous: Configuration initialized!');

    // Open the config file
    const configPath = path.join(workspaceFolder.uri.fsPath, '.chous');
    const doc = await vscode.workspace.openTextDocument(configPath);
    await vscode.window.showTextDocument(doc);
  } catch (error: any) {
    outputChannel.appendLine('ERROR:');
    outputChannel.appendLine(error.message || String(error));
    vscode.window.showErrorMessage(`Chous init error: ${error.message}`);
  }
}

function parseChousOutput(output: string, workspaceRoot: string): Array<{ file: string; diagnostic: vscode.Diagnostic }> {
  const diagnostics: Array<{ file: string; diagnostic: vscode.Diagnostic }> = [];
  const lines = output.split('\n');

  for (const line of lines) {
    // Parse lines like: "src/test.ts: should be in kebab-case"
    // or "src/: missing required file package.json"
    const match = line.match(/^\s*([^:]+):\s*(.+)$/);
    if (match) {
      const [, filePath, message] = match;
      if (!filePath || !message) continue;

      const fullPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(workspaceRoot, filePath.trim());

      // Determine severity based on message content
      let severity = vscode.DiagnosticSeverity.Warning;
      if (message.includes('error') || message.includes('must') || message.includes('required')) {
        severity = vscode.DiagnosticSeverity.Error;
      }

      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 0), // Line 0 for file-level issues
        message.trim(),
        severity
      );
      diagnostic.source = 'chous';

      diagnostics.push({ file: fullPath, diagnostic });
    }
  }

  return diagnostics;
}

function updateStatusBar(text: string, tooltip: string) {
  statusBarItem.text = text;
  statusBarItem.tooltip = tooltip;
  statusBarItem.show();
}

export function deactivate() {
  if (diagnosticCollection) {
    diagnosticCollection.dispose();
  }
  if (outputChannel) {
    outputChannel.dispose();
  }
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}
