# Copy Project Tree

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/BrainstormDevelopment.copy-project-tree?label=VS%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=BrainstormDevelopment.copy-project-tree)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/BrainstormDevelopment.copy-project-tree?label=installs)](https://marketplace.visualstudio.com/items?itemName=BrainstormDevelopment.copy-project-tree)
[![CI](https://github.com/Brainstorm-Development/copy-project-tree/actions/workflows/ci.yml/badge.svg)](https://github.com/Brainstorm-Development/copy-project-tree/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/Brainstorm-Development/copy-project-tree)](LICENSE.md)

Copy clean project and folder tree structures from VS Code to your clipboard or to a file.

[Install from Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=BrainstormDevelopment.copy-project-tree)

## Features

- Copy a workspace tree or any selected folder from the Explorer.
- Save output as `.txt`, `.md`, or `.json`.
- Generate stable output with predictable sorting.
- Exclude common dependency, build, cache, and IDE folders by default.
- Add custom exact-name exclusions or glob-like patterns.
- Choose whether to include hidden entries, files, and the selected root folder.

## Usage

1. Open a project in VS Code.
2. Right-click empty space in the Explorer and choose **Copy Project Tree Structure**.
3. Right-click a folder in the Explorer and choose **Copy Folder Tree Structure**.
4. Adjust output behavior in VS Code Settings under **Copy Project Tree**.

## Output

Plain text:

```txt
├── src/
│   ├── commands.ts
│   └── treeGenerator.ts
├── package.json
└── README.md
```

Markdown:

```md
- src/
  - commands.ts
  - treeGenerator.ts
- package.json
- README.md
```

JSON:

```json
{
  "name": "copy-project-tree",
  "path": "",
  "type": "directory",
  "children": []
}
```

## Settings

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `copyProjectTree.excludedFolders` | `string[]` | `[]` | Additional file or folder names to exclude. Built-in exclusions already cover common dependency, build, cache, and IDE folders. |
| `copyProjectTree.excludedPatterns` | `string[]` | `[]` | Glob-like patterns to exclude. Use `*` for one path segment and `**` for nested paths, for example `docs/**` or `*.log`. |
| `copyProjectTree.maxDepth` | `number` | `-1` | Maximum depth. Use `-1` for no limit. |
| `copyProjectTree.includeHidden` | `boolean` | `false` | Include hidden files and folders. |
| `copyProjectTree.includeFiles` | `boolean` | `true` | Include files. Disable this for a folders-only tree. |
| `copyProjectTree.includeRoot` | `boolean` | `false` | Include the selected project or folder name as the first line in plain text and Markdown output. |
| `copyProjectTree.sortOrder` | `string` | `foldersFirst` | Use `foldersFirst` or `alphabetical`. |
| `copyProjectTree.outputFormat` | `string` | `plain` | Use `plain`, `markdown`, or `json`. |
| `copyProjectTree.copyToFile` | `boolean` | `false` | Save the tree to a file instead of copying it to the clipboard. |

## Development

```sh
npm install
npm test
npm run package
```

Release notes and publishing steps live in [RELEASE.md](RELEASE.md).
