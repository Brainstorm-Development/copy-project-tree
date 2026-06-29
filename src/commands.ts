import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {
    defaultExcludeFolders,
    generateTreeStructure,
    OutputFormat,
    SortOrder,
    TreeOptions
} from './treeGenerator';

interface ExtensionSettings {
    copyToFile: boolean;
    outputFormat: OutputFormat;
    treeOptions: TreeOptions;
}

const OUTPUT_FORMATS: OutputFormat[] = ['plain', 'markdown', 'json'];
const SORT_ORDERS: SortOrder[] = ['foldersFirst', 'alphabetical'];

export async function copyProjectTree() {
    const workspaceFolder = await pickWorkspaceFolder();

    if (!workspaceFolder) {
        return;
    }

    await copyTreeForPath(workspaceFolder.uri.fsPath, 'project_tree', workspaceFolder.uri.fsPath);
}

export async function copyFolderTree(resourceUri?: vscode.Uri) {
    const folderUri = resourceUri ?? (await pickFolderUri());

    if (!folderUri) {
        return;
    }

    const folderPath = folderUri.fsPath;

    try {
        const stat = await fs.promises.stat(folderPath);

        if (!stat.isDirectory()) {
            void vscode.window.showErrorMessage('Select a folder to copy its tree structure.');
            return;
        }
    } catch (error) {
        void vscode.window.showErrorMessage(`Unable to read selected folder: ${getErrorMessage(error)}`);
        return;
    }

    await copyTreeForPath(folderPath, `${path.basename(folderPath)}_tree`, folderPath);
}

async function copyTreeForPath(rootPath: string, fileBaseName: string, defaultSaveFolder: string) {
    try {
        const settings = getExtensionSettings();
        const treeStructure = generateTreeStructure(rootPath, settings.treeOptions, settings.outputFormat);

        await writeTreeStructure(treeStructure, fileBaseName, defaultSaveFolder, settings);
    } catch (error) {
        void vscode.window.showErrorMessage(`Unable to copy tree structure: ${getErrorMessage(error)}`);
    }
}

function getExtensionSettings(): ExtensionSettings {
    const configuration = vscode.workspace.getConfiguration('copyProjectTree');
    const outputFormat = getAllowedValue(
        configuration.get<string>('outputFormat'),
        OUTPUT_FORMATS,
        'plain'
    );

    return {
        copyToFile: configuration.get<boolean>('copyToFile') ?? false,
        outputFormat,
        treeOptions: {
            excludedNames: getExclusionList(configuration),
            excludedPatterns: configuration.get<string[]>('excludedPatterns') ?? [],
            maxDepth: configuration.get<number>('maxDepth') ?? -1,
            includeHidden: configuration.get<boolean>('includeHidden') ?? false,
            includeFiles: configuration.get<boolean>('includeFiles') ?? true,
            includeRoot: configuration.get<boolean>('includeRoot') ?? false,
            sortOrder: getAllowedValue(
                configuration.get<string>('sortOrder'),
                SORT_ORDERS,
                'foldersFirst'
            )
        }
    };
}

function getExclusionList(configuration: vscode.WorkspaceConfiguration): string[] {
    const userExcludedFolders = configuration.get<string[]>('excludedFolders') ?? [];

    return [...new Set([...defaultExcludeFolders, ...userExcludedFolders])];
}

async function writeTreeStructure(
    treeStructure: string,
    fileBaseName: string,
    defaultSaveFolder: string,
    settings: ExtensionSettings
) {
    if (settings.copyToFile) {
        const uri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file(path.join(
                defaultSaveFolder,
                `${fileBaseName}.${getFileExtension(settings.outputFormat)}`
            )),
            filters: getFileFilters(settings.outputFormat)
        });

        if (!uri) {
            return;
        }

        await fs.promises.writeFile(uri.fsPath, treeStructure, 'utf8');
        void vscode.window.showInformationMessage(`Tree structure saved to ${uri.fsPath}`);
        return;
    }

    await vscode.env.clipboard.writeText(treeStructure);
    void vscode.window.showInformationMessage('Tree structure copied to clipboard.');
}

async function pickWorkspaceFolder(): Promise<vscode.WorkspaceFolder | undefined> {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders?.length) {
        void vscode.window.showErrorMessage('No project is open.');
        return undefined;
    }

    if (workspaceFolders.length === 1) {
        return workspaceFolders[0];
    }

    const selection = await vscode.window.showQuickPick(
        workspaceFolders.map(workspaceFolder => ({
            label: workspaceFolder.name,
            description: workspaceFolder.uri.fsPath,
            workspaceFolder
        })),
        { placeHolder: 'Select workspace folder to copy' }
    );

    return selection?.workspaceFolder;
}

async function pickFolderUri(): Promise<vscode.Uri | undefined> {
    const defaultUri = vscode.workspace.workspaceFolders?.[0]?.uri;
    const folderUris = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        defaultUri,
        openLabel: 'Copy Folder Tree'
    });

    return folderUris?.[0];
}

function getFileExtension(outputFormat: OutputFormat): string {
    if (outputFormat === 'markdown') {
        return 'md';
    }

    if (outputFormat === 'json') {
        return 'json';
    }

    return 'txt';
}

function getFileFilters(outputFormat: OutputFormat): Record<string, string[]> {
    if (outputFormat === 'markdown') {
        return { 'Markdown Files': ['md'], 'All Files': ['*'] };
    }

    if (outputFormat === 'json') {
        return { 'JSON Files': ['json'], 'All Files': ['*'] };
    }

    return { 'Text Files': ['txt'], 'All Files': ['*'] };
}

function getAllowedValue<T extends string>(value: string | undefined, allowedValues: T[], fallback: T): T {
    if (value && allowedValues.includes(value as T)) {
        return value as T;
    }

    return fallback;
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
