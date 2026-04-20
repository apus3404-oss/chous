# Chous Plugin Development Guide

This guide explains how to create custom plugins for Chous to extend its functionality.

## What are Plugins?

Plugins allow you to:
- Add custom rule validators
- Create custom presets
- Modify linting behavior
- Add post-processing logic

## Creating a Plugin

### Basic Structure

```typescript
import type { ChousPlugin } from 'chous';

const myPlugin: ChousPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'My custom Chous plugin',
  author: 'Your Name',

  // Optional: Initialize plugin
  init(context) {
    context.logger.info('Plugin initialized');
  },

  // Optional: Custom rules
  rules: {
    'my-rule': {
      name: 'my-rule',
      description: 'My custom rule',
      validate(context) {
        const issues = [];
        // Your validation logic here
        return issues;
      }
    }
  },

  // Optional: Custom presets
  presets: {
    'my-preset': `
      import basic
      # Your preset rules here
    `
  },

  // Optional: Post-process issues
  postProcess(issues, context) {
    // Modify or filter issues
    return issues;
  },

  // Optional: Pre-process config
  preProcess(config, context) {
    // Modify config before linting
    return config;
  }
};

export default myPlugin;
```

### Plugin Interface

```typescript
interface ChousPlugin {
  name: string;              // Unique plugin name
  version: string;           // Plugin version
  description?: string;      // Plugin description
  author?: string;           // Plugin author
  
  init?: (context: PluginContext) => void | Promise<void>;
  rules?: Record<string, RuleValidator>;
  presets?: Record<string, string>;
  postProcess?: (issues: FsLintIssue[], context: PluginContext) => FsLintIssue[];
  preProcess?: (config: FsLintConfig, context: PluginContext) => FsLintConfig;
}
```

## Example: Custom Rule Plugin

```typescript
// chous-plugin-no-temp-files.ts
import type { ChousPlugin, RuleValidator } from 'chous';

const noTempFilesRule: RuleValidator = {
  name: 'no-temp-files',
  description: 'Disallow temporary files',
  
  validate(context) {
    const issues = [];
    
    for (const file of context.files) {
      if (file.endsWith('.tmp') || file.endsWith('.temp')) {
        issues.push({
          type: 'error',
          message: {
            type: 'custom',
            text: `Temporary file not allowed: ${file}`
          },
          path: file,
          displayPath: file
        });
      }
    }
    
    return issues;
  }
};

const plugin: ChousPlugin = {
  name: 'no-temp-files',
  version: '1.0.0',
  description: 'Prevents temporary files in the repository',
  
  rules: {
    'no-temp': noTempFilesRule
  }
};

export default plugin;
```

### Using the Plugin

1. **Install the plugin:**
   ```bash
   npm install chous-plugin-no-temp-files
   ```

2. **Configure in `.chous`:**
   ```chous
   # Load plugin
   plugin no-temp-files
   
   # Use custom rule
   no-temp-files:no-temp
   ```

## Example: Custom Preset Plugin

```typescript
// chous-plugin-company-standards.ts
import type { ChousPlugin } from 'chous';

const plugin: ChousPlugin = {
  name: 'company-standards',
  version: '1.0.0',
  description: 'Company-specific file structure standards',
  
  presets: {
    'api': `
      import basic
      import js
      
      in src:
        allow [controllers, services, models, routes]
        
        in controllers:
          use kebab-case for files **/*.controller.ts
        
        in services:
          use kebab-case for files **/*.service.ts
    `,
    
    'frontend': `
      import basic
      import js
      
      in src:
        allow [components, pages, hooks, utils]
        
        in components:
          use PascalCase for files **/*.tsx
    `
  }
};

export default plugin;
```

### Using Custom Presets

```chous
# Load plugin
plugin company-standards

# Import custom preset
import company-standards:api
```

## Plugin Context

Plugins receive a context object with useful information:

```typescript
interface PluginContext {
  cwd: string;              // Current working directory
  configPath: string;       // Path to .chous file
  root: string;             // Workspace root
  pluginConfig?: any;       // Plugin-specific config
  logger: PluginLogger;     // Logger for output
}
```

### Using the Logger

```typescript
init(context) {
  context.logger.info('Informational message');
  context.logger.warn('Warning message');
  context.logger.error('Error message');
  context.logger.debug('Debug message (only in verbose mode)');
}
```

## Rule Validation Context

Custom rules receive a validation context:

```typescript
interface RuleValidationContext {
  dir: string;              // Current directory
  files: string[];          // Files in directory
  dirs: string[];           // Subdirectories
  params: any;              // Rule parameters
  root: string;             // Workspace root
  config: FsLintConfig;     // Full config
}
```

## Publishing Your Plugin

### Package Structure

```
chous-plugin-my-plugin/
├── src/
│   └── index.ts
├── dist/
│   └── index.js
├── package.json
├── README.md
└── LICENSE
```

### package.json

```json
{
  "name": "chous-plugin-my-plugin",
  "version": "1.0.0",
  "description": "My Chous plugin",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "keywords": ["chous", "chous-plugin", "linter"],
  "peerDependencies": {
    "chous": ">=0.1.0"
  }
}
```

### Naming Convention

- Use `chous-plugin-` prefix
- Example: `chous-plugin-no-temp-files`
- Users can load with or without prefix

## Best Practices

1. **Keep it focused**: One plugin should do one thing well
2. **Document thoroughly**: Provide clear README and examples
3. **Handle errors gracefully**: Don't crash the linting process
4. **Test extensively**: Test with various project structures
5. **Version properly**: Follow semantic versioning
6. **Minimize dependencies**: Keep the plugin lightweight

## Testing Your Plugin

```typescript
// test/plugin.test.ts
import { describe, test, expect } from 'bun:test';
import myPlugin from '../src/index';

describe('My Plugin', () => {
  test('should have correct metadata', () => {
    expect(myPlugin.name).toBe('my-plugin');
    expect(myPlugin.version).toBeDefined();
  });

  test('should validate correctly', async () => {
    const context = {
      dir: '/test',
      files: ['test.tmp'],
      dirs: [],
      params: {},
      root: '/test',
      config: {}
    };

    const issues = await myPlugin.rules!['my-rule'].validate(context);
    expect(issues.length).toBeGreaterThan(0);
  });
});
```

## Example Plugins

### 1. Security Scanner

```typescript
const securityPlugin: ChousPlugin = {
  name: 'security-scanner',
  version: '1.0.0',
  
  rules: {
    'no-secrets': {
      name: 'no-secrets',
      validate(context) {
        const issues = [];
        const secretPatterns = [
          /api[_-]?key/i,
          /password/i,
          /secret/i,
          /token/i
        ];
        
        for (const file of context.files) {
          for (const pattern of secretPatterns) {
            if (pattern.test(file)) {
              issues.push({
                type: 'error',
                message: {
                  type: 'custom',
                  text: `Potential secret in filename: ${file}`
                },
                path: file,
                displayPath: file
              });
            }
          }
        }
        
        return issues;
      }
    }
  }
};
```

### 2. Documentation Enforcer

```typescript
const docsPlugin: ChousPlugin = {
  name: 'docs-enforcer',
  version: '1.0.0',
  
  rules: {
    'require-readme': {
      name: 'require-readme',
      validate(context) {
        const hasReadme = context.files.some(f => 
          f.toLowerCase() === 'readme.md'
        );
        
        if (!hasReadme) {
          return [{
            type: 'error',
            message: {
              type: 'custom',
              text: 'README.md is required in this directory'
            },
            path: context.dir,
            displayPath: context.dir
          }];
        }
        
        return [];
      }
    }
  }
};
```

## Resources

- [Chous GitHub](https://github.com/apus3404-oss/chous)
- [Plugin Examples](https://github.com/apus3404-oss/chous/tree/main/examples/plugins)
- [API Documentation](https://github.com/apus3404-oss/chous#api)

## Support

- [GitHub Issues](https://github.com/apus3404-oss/chous/issues)
- [Discussions](https://github.com/apus3404-oss/chous/discussions)
