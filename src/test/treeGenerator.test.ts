import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { generateTreeStructure, getTreeStructure } from '../treeGenerator';

describe('treeGenerator', () => {
    let rootPath: string;

    beforeEach(() => {
        rootPath = fs.mkdtempSync(path.join(os.tmpdir(), 'copy-project-tree-'));
    });

    afterEach(() => {
        fs.rmSync(rootPath, { recursive: true, force: true });
    });

    it('generates deterministic plain text with folders first', () => {
        mkdir('b-folder');
        mkdir('a-folder');
        writeFile('z-file.txt');
        writeFile('a-file.txt');
        writeFile('a-folder/nested.txt');

        const tree = generateTreeStructure(rootPath);

        assert.strictEqual(tree, [
            '├── a-folder/',
            '│   └── nested.txt',
            '├── b-folder/',
            '├── a-file.txt',
            '└── z-file.txt',
            ''
        ].join('\n'));
    });

    it('honors maxDepth values including zero', () => {
        mkdir('src/components');
        writeFile('src/components/Button.ts');

        assert.strictEqual(generateTreeStructure(rootPath, { maxDepth: 1 }), '└── src/\n');
        assert.strictEqual(getTreeStructure(rootPath, '', [], 0), '');
    });

    it('can include the root folder in markdown output', () => {
        mkdir('src');
        writeFile('src/index.ts');

        const tree = generateTreeStructure(
            rootPath,
            { includeRoot: true, rootName: 'sample-project' },
            'markdown'
        );

        assert.strictEqual(tree, [
            '- sample-project/',
            '  - src/',
            '    - index.ts',
            ''
        ].join('\n'));
    });

    it('returns structured JSON with the selected folder as the root node', () => {
        mkdir('src');
        writeFile('src/index.ts');

        const tree = JSON.parse(generateTreeStructure(
            rootPath,
            { rootName: 'sample-project' },
            'json'
        ));

        assert.deepStrictEqual(tree, {
            name: 'sample-project',
            path: '',
            type: 'directory',
            children: [
                {
                    name: 'src',
                    path: 'src',
                    type: 'directory',
                    children: [
                        {
                            name: 'index.ts',
                            path: 'src/index.ts',
                            type: 'file'
                        }
                    ]
                }
            ]
        });
    });

    it('can exclude hidden entries, files, and glob-like patterns', () => {
        mkdir('.git');
        mkdir('src');
        writeFile('src/index.ts');
        writeFile('debug.log');
        writeFile('.env');

        const tree = generateTreeStructure(rootPath, {
            excludedNames: ['.git'],
            excludedPatterns: ['*.log'],
            includeFiles: false,
            includeHidden: false
        });

        assert.strictEqual(tree, '└── src/\n');
    });

    function mkdir(relativePath: string) {
        fs.mkdirSync(path.join(rootPath, relativePath), { recursive: true });
    }

    function writeFile(relativePath: string, content: string = '') {
        const filePath = path.join(rootPath, relativePath);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content);
    }
});
