# Copy Project Tree

A Visual Studio Code extension that allows you to copy or save the folder structure of your project or any selected folder in various formats.

## Features

- **Copy project or folder structure to clipboard.**
- **Save tree structure to a file (e.g., `.txt`, `.md`, `.json`).**
- **Customizable settings:**
  - Exclude specific folders (e.g., `node_modules`, `.git`).
  - Set maximum depth of the tree structure.
  - Include hidden files and folders.
  - Choose output format: Plain text, Markdown, or JSON.

## Settings

You can customize the extension via the following settings:

| Setting                     | Type      | Default      | Description                                   |
|-----------------------------|-----------|--------------|-----------------------------------------------|
| `excludedFolders`           | `Array`   | `[]`         | Folders to exclude from the tree structure.  |
| `maxDepth`                  | `Number`  | `-1`         | Maximum depth of the tree structure.         |
| `includeHidden`             | `Boolean` | `false`      | Include hidden files and folders.            |
| `outputFormat`              | `String`  | `plain`      | Output format: `plain`, `markdown`, `json`.  |
| `copyToFile`                | `Boolean` | `false`      | Save the tree structure to a file.           |

## Usage

1. **Copy Project Tree**: Right-click on the blank area in the Explorer and choose `Copy Project Tree Structure`.
2. **Copy Folder Tree**: Right-click on a specific folder and choose `Copy Folder Tree Structure`.

## Installation

1. Clone or download this repository.
2. Open the project in Visual Studio Code.
3. Run the extension in the debug mode (`F5`).

---

Enjoy exploring your project's structure effortlessly!
