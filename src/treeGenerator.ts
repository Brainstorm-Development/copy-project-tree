import * as fs from 'fs';
import * as path from 'path';

export type OutputFormat = 'plain' | 'markdown' | 'json';
export type SortOrder = 'foldersFirst' | 'alphabetical';
export type TreeNodeType = 'directory' | 'file';

export interface TreeNode {
    name: string;
    path: string;
    type: TreeNodeType;
    children?: TreeNode[];
    error?: string;
}

export interface TreeOptions {
    excludedNames?: string[];
    excludedPatterns?: string[];
    maxDepth?: number;
    includeHidden?: boolean;
    includeFiles?: boolean;
    includeRoot?: boolean;
    sortOrder?: SortOrder;
    rootName?: string;
}

interface NormalizedTreeOptions {
    excludedNames: Set<string>;
    excludedPatterns: string[];
    maxDepth: number;
    includeHidden: boolean;
    includeFiles: boolean;
    includeRoot: boolean;
    sortOrder: SortOrder;
    rootName?: string;
}

interface ReadResult {
    nodes: TreeNode[];
    error?: string;
}

export const defaultExcludeFolders = [
    'node_modules',
    '.git',
    'dist',
    'build',
    'out',
    'logs',
    'log',
    'tmp',
    'temp',
    '.vscode',
    '.idea',
    '__pycache__',
    '.pytest_cache',
    '.venv',
    'env',
    '.mypy_cache',
    '.parcel-cache',
    '.next',
    '.nuxt',
    'coverage',
    'storybook-static',
    'target',
    'bin',
    'obj',
    '.settings',
    '.classpath',
    '.project',
    '.vs',
    '.bundle',
    'vendor',
    'cache',
    'pkg',
    '.DS_Store',
    'Thumbs.db',
    '.sass-cache'
];

const DEFAULT_OPTIONS: NormalizedTreeOptions = {
    excludedNames: new Set(),
    excludedPatterns: [],
    maxDepth: -1,
    includeHidden: false,
    includeFiles: true,
    includeRoot: false,
    sortOrder: 'foldersFirst'
};

export function generateTreeStructure(
    rootPath: string,
    options: TreeOptions = {},
    outputFormat: OutputFormat = 'plain'
): string {
    const normalizedOptions = normalizeOptions(options);
    const rootName = normalizedOptions.rootName ?? path.basename(rootPath);
    const readResult = readTreeNodes(rootPath, normalizedOptions);

    if (readResult.error) {
        throw new Error(`Unable to read "${rootPath}": ${readResult.error}`);
    }

    const rootNode: TreeNode = {
        name: rootName,
        path: '',
        type: 'directory',
        children: readResult.nodes
    };

    return formatTree(rootNode, outputFormat, normalizedOptions.includeRoot);
}

export function getTreeStructure(
    dirPath: string,
    prefix: string = '',
    exclude: string[] = [],
    depth: number = -1,
    includeHidden: boolean = false
): string {
    const normalizedOptions = normalizeOptions({
        excludedNames: exclude,
        maxDepth: depth,
        includeHidden
    });
    const readResult = readTreeNodes(dirPath, normalizedOptions);

    if (readResult.error) {
        throw new Error(`Unable to read "${dirPath}": ${readResult.error}`);
    }

    return formatPlainNodes(readResult.nodes, prefix);
}

export function formatTreeStructure(tree: string, format: string): string {
    if (format === 'markdown') {
        return treeToMarkdown(tree);
    }

    if (format === 'json') {
        return treeToJson(tree);
    }

    return tree;
}

function normalizeOptions(options: TreeOptions): NormalizedTreeOptions {
    return {
        ...DEFAULT_OPTIONS,
        excludedNames: new Set(options.excludedNames ?? []),
        excludedPatterns: options.excludedPatterns ?? [],
        maxDepth: normalizeDepth(options.maxDepth),
        includeHidden: options.includeHidden ?? DEFAULT_OPTIONS.includeHidden,
        includeFiles: options.includeFiles ?? DEFAULT_OPTIONS.includeFiles,
        includeRoot: options.includeRoot ?? DEFAULT_OPTIONS.includeRoot,
        sortOrder: options.sortOrder ?? DEFAULT_OPTIONS.sortOrder,
        rootName: options.rootName
    };
}

function normalizeDepth(depth: number | undefined): number {
    if (depth === undefined || !Number.isFinite(depth)) {
        return DEFAULT_OPTIONS.maxDepth;
    }

    if (depth < 0) {
        return -1;
    }

    return Math.floor(depth);
}

function readTreeNodes(
    dirPath: string,
    options: NormalizedTreeOptions,
    currentDepth: number = 1,
    relativeDirPath: string = ''
): ReadResult {
    if (options.maxDepth === 0 || (options.maxDepth > 0 && currentDepth > options.maxDepth)) {
        return { nodes: [] };
    }

    let entries: fs.Dirent[];

    try {
        entries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch (error) {
        return { nodes: [], error: getErrorMessage(error) };
    }

    const nodes = sortEntries(entries, options.sortOrder)
        .filter(entry => shouldIncludeEntry(entry, options, relativeDirPath))
        .map(entry => createTreeNode(entry, dirPath, options, currentDepth, relativeDirPath));

    return { nodes };
}

function sortEntries(entries: fs.Dirent[], sortOrder: SortOrder): fs.Dirent[] {
    return [...entries].sort((a, b) => {
        if (sortOrder === 'foldersFirst' && a.isDirectory() !== b.isDirectory()) {
            return a.isDirectory() ? -1 : 1;
        }

        return a.name.localeCompare(b.name, undefined, {
            numeric: true,
            sensitivity: 'base'
        });
    });
}

function shouldIncludeEntry(
    entry: fs.Dirent,
    options: NormalizedTreeOptions,
    relativeDirPath: string
): boolean {
    if (!entry.isDirectory() && !options.includeFiles) {
        return false;
    }

    if (!options.includeHidden && entry.name.startsWith('.')) {
        return false;
    }

    if (options.excludedNames.has(entry.name)) {
        return false;
    }

    const relativePath = joinPathSegments(relativeDirPath, entry.name);
    return !matchesAnyPattern(entry.name, relativePath, options.excludedPatterns);
}

function createTreeNode(
    entry: fs.Dirent,
    dirPath: string,
    options: NormalizedTreeOptions,
    currentDepth: number,
    relativeDirPath: string
): TreeNode {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = joinPathSegments(relativeDirPath, entry.name);
    const isDirectory = entry.isDirectory();
    const node: TreeNode = {
        name: entry.name,
        path: relativePath,
        type: isDirectory ? 'directory' : 'file'
    };

    if (isDirectory) {
        const childResult = readTreeNodes(fullPath, options, currentDepth + 1, relativePath);
        node.children = childResult.nodes;

        if (childResult.error) {
            node.error = childResult.error;
        }
    }

    return node;
}

function formatTree(rootNode: TreeNode, outputFormat: OutputFormat, includeRoot: boolean): string {
    if (outputFormat === 'markdown') {
        return includeRoot ? formatMarkdownNodes([rootNode]) : formatMarkdownNodes(rootNode.children ?? []);
    }

    if (outputFormat === 'json') {
        return `${JSON.stringify(toJsonNode(rootNode), null, 2)}\n`;
    }

    if (includeRoot) {
        return `${formatNodeLabel(rootNode)}\n${formatPlainNodes(rootNode.children ?? [])}`;
    }

    return formatPlainNodes(rootNode.children ?? []);
}

function formatPlainNodes(nodes: TreeNode[], prefix: string = ''): string {
    return nodes
        .map((node, index) => {
            const isLast = index === nodes.length - 1;
            const branch = isLast ? '└── ' : '├── ';
            const subPrefix = isLast ? '    ' : '│   ';
            const children = node.children ? formatPlainNodes(node.children, prefix + subPrefix) : '';

            return `${prefix}${branch}${formatNodeLabel(node)}\n${children}`;
        })
        .join('');
}

function formatMarkdownNodes(nodes: TreeNode[], level: number = 0): string {
    return nodes
        .map(node => {
            const indent = '  '.repeat(level);
            const children = node.children ? formatMarkdownNodes(node.children, level + 1) : '';

            return `${indent}- ${formatNodeLabel(node)}\n${children}`;
        })
        .join('');
}

function toJsonNode(node: TreeNode): TreeNode {
    const jsonNode: TreeNode = {
        name: node.name,
        path: node.path,
        type: node.type
    };

    if (node.error) {
        jsonNode.error = node.error;
    }

    if (node.type === 'directory') {
        jsonNode.children = node.children ?? [];
    }

    return jsonNode;
}

function formatNodeLabel(node: TreeNode): string {
    const suffix = node.type === 'directory' ? '/' : '';
    const error = node.error ? ` [error: ${node.error}]` : '';

    return `${node.name}${suffix}${error}`;
}

function treeToMarkdown(tree: string): string {
    return tree
        .split('\n')
        .filter(Boolean)
        .map(line => {
            const level = getPlainTreeLevel(line);
            const name = line.replace(/.*├── |.*└── /, '');

            return `${'  '.repeat(level)}- ${name}`;
        })
        .join('\n')
        .concat(tree.trim() ? '\n' : '');
}

function treeToJson(tree: string): string {
    const rootNode: TreeNode = { name: 'root', path: '', type: 'directory', children: [] };
    const stack: TreeNode[] = [rootNode];

    tree.split('\n')
        .filter(Boolean)
        .forEach(line => {
            const level = getPlainTreeLevel(line);
            const rawName = line.replace(/.*├── |.*└── /, '');
            const isDirectory = rawName.endsWith('/');
            const name = isDirectory ? rawName.slice(0, -1) : rawName;
            const node: TreeNode = {
                name,
                path: '',
                type: isDirectory ? 'directory' : 'file'
            };

            if (isDirectory) {
                node.children = [];
            }

            while (stack.length > level + 1) {
                stack.pop();
            }

            const parent = stack[stack.length - 1];
            parent.children?.push(node);

            if (isDirectory) {
                stack.push(node);
            }
        });

    return `${JSON.stringify(rootNode, null, 2)}\n`;
}

function getPlainTreeLevel(line: string): number {
    return (line.match(/│   |    /g) ?? []).length;
}

function matchesAnyPattern(entryName: string, relativePath: string, patterns: string[]): boolean {
    return patterns.some(pattern => {
        const normalizedPattern = pattern.trim().replace(/\\/g, '/').replace(/^\/+/, '');

        if (!normalizedPattern) {
            return false;
        }

        const target = normalizedPattern.includes('/') ? relativePath : entryName;
        return globToRegExp(normalizedPattern).test(target);
    });
}

function globToRegExp(globPattern: string): RegExp {
    let source = '^';

    for (let index = 0; index < globPattern.length; index += 1) {
        const char = globPattern[index];
        const nextChar = globPattern[index + 1];

        if (char === '*' && nextChar === '*') {
            source += '.*';
            index += 1;
        } else if (char === '*') {
            source += '[^/]*';
        } else if (char === '?') {
            source += '[^/]';
        } else {
            source += escapeRegExp(char);
        }
    }

    return new RegExp(`${source}$`);
}

function escapeRegExp(value: string): string {
    return value.replace(/[.+^${}()|[\]\\]/g, '\\$&');
}

function joinPathSegments(...segments: string[]): string {
    return segments.filter(Boolean).join('/');
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
