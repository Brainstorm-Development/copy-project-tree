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
exports.defaultExcludeFolders = void 0;
exports.getTreeStructure = getTreeStructure;
exports.formatTreeStructure = formatTreeStructure;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
exports.defaultExcludeFolders = [
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
function getTreeStructure(dirPath, prefix = '', exclude = [], depth = -1, includeHidden = false) {
    if (depth === 0)
        return '';
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
function formatTreeStructure(tree, format) {
    if (format === 'markdown') {
        return tree.replace(/├── /g, '- ').replace(/└── /g, '- ');
    }
    else if (format === 'json') {
        const lines = tree.split('\n').filter(Boolean);
        const result = { name: 'root', children: [] };
        const stack = [result];
        lines.forEach(line => {
            const level = (line.match(/│   |    /g) || []).length;
            const name = line.replace(/.*├── |.*└── /, '').replace('/', '');
            const isDirectory = line.endsWith('/');
            const node = { name, children: isDirectory ? [] : undefined };
            while (stack.length > level + 1)
                stack.pop();
            stack[stack.length - 1].children?.push(node);
            if (isDirectory)
                stack.push(node);
        });
        return JSON.stringify(result, null, 2);
    }
    return tree;
}
//# sourceMappingURL=treeGenerator.js.map