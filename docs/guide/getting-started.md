# Getting Started

Get up and running with Chous in minutes.

## Installation

### Global Installation (Recommended)

```bash
npm install -g chous
```

### Use with npx (No Installation)

```bash
npx chous
```

### Project-Specific Installation

```bash
npm install --save-dev chous
```

## Quick Start

### 1. Initialize Configuration

```bash
chous init
```

This creates a `.chous` file with auto-detected presets based on your project type.

### 2. Run Linting

```bash
chous
```

### 3. Fix Issues Automatically

```bash
chous fix
```

## Your First Configuration

After running `chous init`, you'll have a `.chous` file like this:

```chous
import basic
import js

# Add your custom rules here
```

### Add Custom Rules

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
```

## Common Commands

```bash
# Lint your project
chous

# Verbose output
chous --verbose

# Strict mode (fail on warnings)
chous --strict

# Watch mode (auto re-lint on changes)
chous --watch

# Auto-fix issues
chous fix

# Preview fixes without applying
chous fix --dry-run

# Auto-apply fixes without confirmation
chous fix --yes
```

## Editor Integration

### VS Code

Install the [Chous extension](https://marketplace.visualstudio.com/items?itemName=chous.chous-vscode) for real-time linting.

### Cursor

```bash
chous cursor install
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Lint File Structure

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: apus3404-oss/chous/github-action@v1
```

## Next Steps

- [Learn about rules](/config/rules)
- [Explore presets](/presets/)
- [See examples](/examples/)
- [Create plugins](/plugins/creating)
