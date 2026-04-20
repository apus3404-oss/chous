# Chous - VS Code Extension

Real-time file structure linting for Visual Studio Code.

## Features

- **Real-time Linting**: Automatically lint your project structure as you work
- **Inline Diagnostics**: See file structure issues directly in the Problems panel
- **Quick Fixes**: Auto-fix issues with a single command
- **Status Bar Integration**: See linting status at a glance
- **Configurable**: Customize linting behavior to match your workflow

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Chous"
4. Click Install

### From VSIX

1. Download the `.vsix` file from releases
2. Open VS Code
3. Go to Extensions
4. Click "..." menu → "Install from VSIX"
5. Select the downloaded file

## Requirements

Chous must be installed globally or in your project:

```bash
# Global installation (recommended)
npm install -g chous

# Or use npx (no installation needed)
# The extension will use npx by default
```

## Usage

### Commands

- **Chous: Lint File Structure** - Run linting manually
- **Chous: Auto-Fix Issues** - Automatically fix file structure issues
- **Chous: Initialize Configuration** - Create a `.chous` config file
- **Chous: Show Output** - Show the Chous output panel

### Automatic Linting

The extension automatically lints your project:
- When you open a workspace
- When you save a file
- When files are added or deleted
- When the `.chous` config changes

### Status Bar

The status bar shows the current linting status:
- ✓ **Chous: No issues** - All good!
- ⚠ **Chous: X issues** - Click to see details
- ⚠ **Chous: Error** - Click to see error

## Configuration

Configure the extension in VS Code settings:

```json
{
  // Enable/disable Chous linting
  "chous.enable": true,

  // Run linting when files are saved
  "chous.lintOnSave": true,

  // Run linting when workspace is opened
  "chous.lintOnOpen": true,

  // Path to chous configuration file
  "chous.configPath": ".chous",

  // Show verbose output
  "chous.verbose": false,

  // Enable strict mode (fail on warnings)
  "chous.strict": false,

  // Custom path to chous executable
  // Leave empty to use global installation or npx
  "chous.executablePath": ""
}
```

## Getting Started

1. Install the extension
2. Open a project in VS Code
3. Run **Chous: Initialize Configuration** to create a `.chous` file
4. The extension will automatically start linting

## Example `.chous` Configuration

```chous
import basic
import js

# Ensure essential files exist
must have [package.json, README.md]

# Source directory structure
in src:
  allow [components, utils, types]
  
  in components:
    use PascalCase for files **/*.tsx
  
  in utils:
    use camelCase for files **/*.ts

# Naming conventions
use kebab-case for files **/*.ts
use PascalCase for files **/*.tsx
```

## Troubleshooting

### "Chous is not installed"

Install chous globally:
```bash
npm install -g chous
```

Or configure the extension to use npx (default behavior).

### Extension not working

1. Check the Output panel (View → Output → Chous)
2. Verify `.chous` config exists in your workspace
3. Try running `chous` manually in the terminal
4. Reload VS Code window

### Custom executable path

If you have chous installed in a custom location:

```json
{
  "chous.executablePath": "/path/to/chous"
}
```

## Links

- [Chous GitHub](https://github.com/apus3404-oss/chous)
- [Documentation](https://github.com/apus3404-oss/chous#readme)
- [Report Issues](https://github.com/apus3404-oss/chous/issues)

## License

MIT
