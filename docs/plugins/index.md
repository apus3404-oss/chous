# Plugins

Extend Chous functionality with custom plugins.

## What are Plugins?

Plugins allow you to:
- Add custom rule validators
- Create custom presets
- Modify linting behavior
- Add post-processing logic

## Using Plugins

### 1. Install Plugin

```bash
npm install chous-plugin-example
```

### 2. Load in `.chous`

```chous
# Load plugin
plugin chous-plugin-example

# Use plugin's custom rules
chous-plugin-example:my-rule

# Import plugin's presets
import chous-plugin-example:my-preset
```

## Available Plugins

### Official Plugins

Coming soon! We're working on official plugins for:
- Security scanning
- Documentation enforcement
- Performance checks
- Accessibility validation

### Community Plugins

Check [npm](https://www.npmjs.com/search?q=chous-plugin) for community plugins.

## Creating Plugins

See the [Creating Plugins](/plugins/creating) guide for detailed instructions.

### Quick Example

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

## Plugin API

### ChousPlugin Interface

```typescript
interface ChousPlugin {
  name: string;
  version: string;
  description?: string;
  author?: string;
  
  init?: (context: PluginContext) => void;
  rules?: Record<string, RuleValidator>;
  presets?: Record<string, string>;
  postProcess?: (issues, context) => issues;
  preProcess?: (config, context) => config;
}
```

### Plugin Context

```typescript
interface PluginContext {
  cwd: string;
  configPath: string;
  root: string;
  pluginConfig?: any;
  logger: PluginLogger;
}
```

## Best Practices

1. **Keep it focused** - One plugin, one purpose
2. **Document thoroughly** - Clear README and examples
3. **Handle errors gracefully** - Don't crash linting
4. **Test extensively** - Cover edge cases
5. **Version properly** - Follow semver

## Next Steps

- [Using plugins](/plugins/using)
- [Creating plugins](/plugins/creating)
- [API reference](/plugins/api)
