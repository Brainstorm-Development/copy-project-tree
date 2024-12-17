import * as fs from 'fs';
import * as path from 'path';

// Define the type for a tree node
interface TreeNode {
    name: string;
    children?: TreeNode[];
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

export function getTreeStructure(
    dirPath: string,
    prefix: string = '',
    exclude: string[] = [],
    depth: number = -1,
    includeHidden: boolean = false
): string {
    if (depth === 0) return '';

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    let result = '';

    const filteredEntries = entries.filter(entry => {
        const isHidden = entry.name.startsWith('.');
        return (!isHidden || includeHidden) && !exclude.includes(entry.name);
    });

    filteredEntries.forEach((entry, index) => {
        const isLast = index === filteredEntries.length - 1;
        const fullPath = path.join(dirPath, entry.name);
        const isDirectory = entry.isDirectory();
        const branch = isLast ? '└── ' : '├── ';
        const subPrefix = isLast ? '    ' : '│   ';

        result += `${prefix}${branch}${entry.name}${isDirectory ? '/' : ''}\n`;

        if (isDirectory) {
            result += getTreeStructure(fullPath, prefix + subPrefix, exclude, depth - 1, includeHidden);
        }
    });

    return result;
}

export function formatTreeStructure(tree: string, format: string): string {
    if (format === 'markdown') {
        return tree.replace(/├── /g, '- ').replace(/└── /g, '- ');
    } else if (format === 'json') {
        const lines = tree.split('\n').filter(Boolean);
        const result: TreeNode = { name: 'root', children: [] };
        const stack: TreeNode[] = [result];
        lines.forEach(line => {
            const level = (line.match(/│   |    /g) || []).length;
            const name = line.replace(/.*├── |.*└── /, '').replace('/', '');
            const isDirectory = line.endsWith('/');
            const node: TreeNode = { name, children: isDirectory ? [] : undefined };
            while (stack.length > level + 1) stack.pop();
            stack[stack.length - 1].children?.push(node);
            if (isDirectory) stack.push(node);
        });
        return JSON.stringify(result, null, 2);
    }
    return tree;
}
