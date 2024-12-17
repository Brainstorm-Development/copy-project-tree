"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyProjectTree = copyProjectTree;
exports.copyFolderTree = copyFolderTree;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const treeGenerator_1 = require("./treeGenerator");
function getExclusionList() {
    const userExcludedFolders = vscode.workspace.getConfiguration('copyProjectTree').get('excludedFolders') || [];
    return [...new Set([...treeGenerator_1.defaultExcludeFolders, ...userExcludedFolders])];
}
async function copyTreeStructure(treeStructure, fileName) {
    const copyToFile = vscode.workspace
        .getConfiguration('copyProjectTree')
        .get('copyToFile') || false;
    if (copyToFile) {
        const uri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file(path.join(process.cwd(), fileName)),
            filters: { 'Text Files': ['txt'], 'Markdown Files': ['md'], 'JSON Files': ['json'] }
        });
        if (uri) {
            fs.writeFileSync(uri.fsPath, treeStructure);
            vscode.window.showInformationMessage(`Tree structure saved to ${uri.fsPath}`);
        }
    }
    else {
        vscode.env.clipboard.writeText(treeStructure);
        vscode.window.showInformationMessage('Tree structure copied to clipboard!');
    }
}
async function copyProjectTree() {
    const rootPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!rootPath) {
        vscode.window.showErrorMessage('No project is open.');
        return;
    }
    const exclude = getExclusionList();
    const maxDepth = vscode.workspace.getConfiguration('copyProjectTree').get('maxDepth') || -1;
    const includeHidden = vscode.workspace.getConfiguration('copyProjectTree').get('includeHidden') || false;
    const outputFormat = vscode.workspace.getConfiguration('copyProjectTree').get('outputFormat') || 'plain';
    const treeStructure = (0, treeGenerator_1.getTreeStructure)(rootPath, '', exclude, maxDepth, includeHidden);
    const formattedTree = (0, treeGenerator_1.formatTreeStructure)(treeStructure, outputFormat);
    await copyTreeStructure(formattedTree, 'project_tree.txt');
}
async function copyFolderTree(resourceUri) {
    const folderPath = resourceUri.fsPath;
    const exclude = getExclusionList();
    const maxDepth = vscode.workspace.getConfiguration('copyProjectTree').get('maxDepth') || -1;
    const includeHidden = vscode.workspace.getConfiguration('copyProjectTree').get('includeHidden') || false;
    const outputFormat = vscode.workspace.getConfiguration('copyProjectTree').get('outputFormat') || 'plain';
    const treeStructure = (0, treeGenerator_1.getTreeStructure)(folderPath, '', exclude, maxDepth, includeHidden);
    const formattedTree = (0, treeGenerator_1.formatTreeStructure)(treeStructure, outputFormat);
    await copyTreeStructure(formattedTree, `${path.basename(folderPath)}_tree.txt`);
}
//# sourceMappingURL=commands.js.map