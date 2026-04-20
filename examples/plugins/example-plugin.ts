import type { ChousPlugin, RuleValidator } from '../../src/plugins/types';

/**
 * Example plugin: No TODO comments in production code
 */
const noTodoRule: RuleValidator = {
  name: 'no-todo',
  description: 'Disallow TODO comments in production code',

  validate(context) {
    const issues = [];

    // This is a simple example - in a real plugin, you'd read file contents
    for (const file of context.files) {
      if (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.tsx') || file.endsWith('.jsx')) {
        // In a real implementation, you'd read the file and check for TODO comments
        // For this example, we'll just demonstrate the structure
      }
    }

    return issues;
  }
};

/**
 * Example plugin: Enforce changelog
 */
const requireChangelogRule: RuleValidator = {
  name: 'require-changelog',
  description: 'Require CHANGELOG.md in the root directory',

  validate(context) {
    // Only check root directory
    if (context.dir !== context.root) {
      return [];
    }

    const hasChangelog = context.files.some(
      (f) => f.toLowerCase() === 'changelog.md'
    );

    if (!hasChangelog) {
      return [
        {
          type: 'error',
          message: {
            type: 'custom',
            text: 'CHANGELOG.md is required in the root directory',
          },
          path: context.dir,
          displayPath: '.',
        },
      ];
    }

    return [];
  }
};

/**
 * Example Chous Plugin
 */
const examplePlugin: ChousPlugin = {
  name: 'chous-plugin-example',
  version: '1.0.0',
  description: 'Example plugin demonstrating Chous plugin capabilities',
  author: 'Chous Team',

  init(context) {
    context.logger.info('Example plugin initialized');
    context.logger.debug(`Working directory: ${context.cwd}`);
  },

  rules: {
    'no-todo': noTodoRule,
    'require-changelog': requireChangelogRule,
  },

  presets: {
    strict: `
      import basic

      # Strict project standards
      must have [README.md, LICENSE, CHANGELOG.md]

      # No build artifacts
      no [dist, build, .cache]

      # Use the custom rules from this plugin
      chous-plugin-example:require-changelog
    `,
  },

  postProcess(issues, context) {
    // Example: Add a summary comment
    context.logger.info(`Found ${issues.length} issue(s)`);
    return issues;
  },

  preProcess(config, context) {
    // Example: Log config processing
    context.logger.debug('Pre-processing config');
    return config;
  },
};

export default examplePlugin;
