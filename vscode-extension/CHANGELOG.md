# Changelog

All notable changes to the Chous VS Code extension will be documented in this file.

## [0.1.0] - 2026-04-20

### Added
- Initial release
- Real-time file structure linting
- Inline diagnostics in Problems panel
- Auto-fix command
- Initialize configuration command
- Status bar integration
- Configurable linting behavior
- Support for custom executable paths
- Lint on save
- Lint on open
- Watch for file changes
- Watch for config changes

### Features
- **Commands**:
  - `Chous: Lint File Structure` - Run linting manually
  - `Chous: Auto-Fix Issues` - Automatically fix issues
  - `Chous: Initialize Configuration` - Create `.chous` config
  - `Chous: Show Output` - Show output panel

- **Configuration**:
  - `chous.enable` - Enable/disable linting
  - `chous.lintOnSave` - Lint when files are saved
  - `chous.lintOnOpen` - Lint when workspace opens
  - `chous.configPath` - Custom config file path
  - `chous.verbose` - Verbose output
  - `chous.strict` - Strict mode
  - `chous.executablePath` - Custom executable path

- **Status Bar**:
  - Shows current linting status
  - Click to show output panel
  - Visual indicators for issues

### Requirements
- VS Code 1.80.0 or higher
- Chous CLI installed globally or via npx
