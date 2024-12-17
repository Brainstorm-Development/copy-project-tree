import * as vscode from 'vscode';
import { copyProjectTree, copyFolderTree } from './commands';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "Copy Project Tree" is activated!');

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.copyProjectTree', copyProjectTree),
        vscode.commands.registerCommand('extension.copyFolderTree', copyFolderTree)
    );
}

export function deactivate() {}
