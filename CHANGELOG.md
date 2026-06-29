# Changelog

## [2.0.0] - 2026-06-29
### Added
- Added deterministic tree sorting with folders-first and alphabetical modes.
- Added `includeFiles`, `includeRoot`, `sortOrder`, and `excludedPatterns` settings.
- Added structured JSON output with the selected folder as the root node.
- Added unit tests for tree generation behavior.
- Added release scripts and documentation for Marketplace and GitHub publishing.

### Changed
- Markdown output now renders as proper nested Markdown lists.
- Clipboard and file writes now report failures instead of failing silently.
- Multi-root workspaces now prompt for the workspace folder to copy.
- Folder copy can now be launched without an Explorer folder argument and will prompt for a folder.
- Development tests now use Node's built-in test runner.

### Fixed
- Fixed `maxDepth: 0` being ignored by fallback logic.
- Fixed unstable filesystem ordering in generated trees.
- Fixed command failures when run from the Command Palette without a selected folder.
- Fixed package metadata and lockfile version drift.

## [1.0.2] - 2024-12-17
### Added
- Fixed Git repository link.

## [1.0.1] - 2024-12-17
### Added
- Added Git repository.

## [1.0.0] - 2024-12-13
### Added
- Initial release with following features:
  - Copy project/folder tree structure.
  - Customizable exclusion list.
  - Output formats (plain, markdown, JSON).
  - Copy to clipboard or save to file.


