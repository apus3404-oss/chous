# Chous Plugins

This directory contains example plugins for Chous.

## What are Plugins?

Plugins extend Chous functionality by adding:
- Custom rule validators
- Custom presets
- Pre/post-processing hooks
- Custom linting logic

## Using Plugins

### 1. Install a Plugin

```bash
npm install chous-plugin-example
```

### 2. Load in `.chous` File

```chous
# Load plugin
plugin chous-plugin-example

# Use plugin's custom rules
chous-plugin-example:require-changelog

# Import plugin's presets
import chous-plugin-example:strict
```

## Available Example Plugins

### example-plugin.ts

Demonstrates:
- Custom rule validators
- Custom presets
- Init hook
- Post-processing
- Pre-processing

## Creating Your Own Plugin

See [PLUGIN_DEVELOPMENT.md](../../PLUGIN_DEVELOPMENT.md) for a complete guide.

### Quick Start

```typescript
import type { ChousPlugin } from 'chous';

const myPlugin: ChousPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  
  rules: {
    'my-rule': {
      name: 'my-rule',
      validate(context) {
        // Your validation logic
        return [];
      }
    }
  }
};

export default myPlugin;
```

## Plugin Naming

- Use `chous-plugin-` prefix
- Example: `chous-plugin-security`
- Users can load with or without prefix

## Resources

- [Plugin Development Guide](../../PLUGIN_DEVELOPMENT.md)
- [Chous Documentation](../../README.md)
- [GitHub Repository](https://github.com/apus3404-oss/chous)
