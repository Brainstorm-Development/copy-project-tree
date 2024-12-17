import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getTreeStructure, formatTreeStructure, defaultExcludeFolders } from './treeGenerator';

function getExclusionList(): string[] {
    const userExcludedFolders =
        vscode.workspace.getConfiguration('copyProjectTree').get<string[]>('excludedFolders') || [];
    return [...new Set([...defaultExcludeFolders, ...userExcludedFolders])];
}

async function copyTreeStructure(treeStructure: string, fileName: string) {
    const copyToFile = vscode.workspace
        .getConfiguration('copyProjectTree')
        .get<boolean>('copyToFile') || false;

    if (copyToFile) {
        const uri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file(path.join(process.cwd(), fileName)),
            filters: { 'Text Files': ['txt'], 'Markdown Files': ['md'], 'JSON Files': ['json'] }
        });

        if (uri) {
            fs.writeFileSync(uri.fsPath, treeStructure);
            vscode.window.showInformationMessage(`Tree structure saved to ${uri.fsPath}`);
        }
    } else {
        vscode.env.clipboard.writeText(treeStructure);
        vscode.window.showInformationMessage('Tree structure copied to clipboard!');
    }
}

export async function copyProjectTree() {
    const rootPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!rootPath) {
        vscode.window.showErrorMessage('No project is open.');
        return;
    }

    const exclude = getExclusionList();
    const maxDepth = vscode.workspace.getConfiguration('copyProjectTree').get<number>('maxDepth') || -1;
    const includeHidden = vscode.workspace.getConfiguration('copyProjectTree').get<boolean>('includeHidden') || false;
    const outputFormat = vscode.workspace.getConfiguration('copyProjectTree').get<string>('outputFormat') || 'plain';

    const treeStructure = getTreeStructure(rootPath, '', exclude, maxDepth, includeHidden);
    const formattedTree = formatTreeStructure(treeStructure, outputFormat);

    await copyTreeStructure(formattedTree, 'project_tree.txt');
}

export async function copyFolderTree(resourceUri: vscode.Uri) {
    const folderPath = resourceUri.fsPath;

    const exclude = getExclusionList();
    const maxDepth = vscode.workspace.getConfiguration('copyProjectTree').get<number>('maxDepth') || -1;
    const includeHidden = vscode.workspace.getConfiguration('copyProjectTree').get<boolean>('includeHidden') || false;
    const outputFormat = vscode.workspace.getConfiguration('copyProjectTree').get<string>('outputFormat') || 'plain';

    const treeStructure = getTreeStructure(folderPath, '', exclude, maxDepth, includeHidden);
    const formattedTree = formatTreeStructure(treeStructure, outputFormat);

    await copyTreeStructure(formattedTree, `${path.basename(folderPath)}_tree.txt`);
}
