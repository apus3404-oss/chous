import type { FsLintConfig } from '../types';

/**
 * Lint issue interface
 */
export interface FsLintIssue {
  type: 'error' | 'warning';
  message: any;
  path: string;
  displayPath: string;
}

/**
 * Plugin interface for extending Chous functionality
 */
export interface ChousPlugin {
  /** Plugin name (must be unique) */
  name: string;

  /** Plugin version */
  version: string;

  /** Plugin description */
  description?: string;

  /** Plugin author */
  author?: string;

  /**
   * Initialize the plugin
   * Called once when the plugin is loaded
   */
  init?: (context: PluginContext) => void | Promise<void>;

  /**
   * Custom rule validators
   * Add new rule types that can be used in .chous files
   */
  rules?: Record<string, RuleValidator>;

  /**
   * Custom presets
   * Add new presets that can be imported
   */
  presets?: Record<string, string>;

  /**
   * Post-processing hook
   * Modify or add issues after linting
   */
  postProcess?: (issues: FsLintIssue[], context: PluginContext) => FsLintIssue[] | Promise<FsLintIssue[]>;

  /**
   * Pre-processing hook
   * Modify config before linting
   */
  preProcess?: (config: FsLintConfig, context: PluginContext) => FsLintConfig | Promise<FsLintConfig>;
}

/**
 * Context provided to plugins
 */
export interface PluginContext {
  /** Current working directory */
  cwd: string;

  /** Path to config file */
  configPath: string;

  /** Workspace root being linted */
  root: string;

  /** Plugin configuration from .chous file */
  pluginConfig?: Record<string, any>;

  /** Logger for plugin output */
  logger: PluginLogger;
}

/**
 * Logger interface for plugins
 */
export interface PluginLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  debug(message: string): void;
}

/**
 * Rule validator interface
 */
export interface RuleValidator {
  /** Rule name (e.g., "custom-rule") */
  name: string;

  /** Rule description */
  description?: string;

  /**
   * Validate the rule
   * @param context - Validation context
   * @returns Array of issues found
   */
  validate(context: RuleValidationContext): FsLintIssue[] | Promise<FsLintIssue[]>;
}

/**
 * Context provided to rule validators
 */
export interface RuleValidationContext {
  /** Current directory being validated */
  dir: string;

  /** Files in the current directory */
  files: string[];

  /** Subdirectories in the current directory */
  dirs: string[];

  /** Rule parameters from .chous file */
  params: any;

  /** Workspace root */
  root: string;

  /** Full config */
  config: FsLintConfig;
}

/**
 * Plugin loader interface
 */
export interface PluginLoader {
  /**
   * Load a plugin by name
   * @param name - Plugin name (e.g., "chous-plugin-custom")
   */
  load(name: string): Promise<ChousPlugin>;

  /**
   * Load all plugins specified in config
   */
  loadAll(pluginNames: string[]): Promise<ChousPlugin[]>;
}

/**
 * Plugin registry
 */
export class PluginRegistry {
  private plugins: Map<string, ChousPlugin> = new Map();
  private rules: Map<string, RuleValidator> = new Map();
  private presets: Map<string, string> = new Map();

  /**
   * Register a plugin
   */
  register(plugin: ChousPlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }

    this.plugins.set(plugin.name, plugin);

    // Register custom rules
    if (plugin.rules) {
      for (const [ruleName, validator] of Object.entries(plugin.rules)) {
        const fullName = `${plugin.name}:${ruleName}`;
        if (this.rules.has(fullName)) {
          throw new Error(`Rule "${fullName}" is already registered`);
        }
        this.rules.set(fullName, validator);
      }
    }

    // Register custom presets
    if (plugin.presets) {
      for (const [presetName, content] of Object.entries(plugin.presets)) {
        const fullName = `${plugin.name}:${presetName}`;
        if (this.presets.has(fullName)) {
          throw new Error(`Preset "${fullName}" is already registered`);
        }
        this.presets.set(fullName, content);
      }
    }
  }

  /**
   * Get a registered plugin
   */
  getPlugin(name: string): ChousPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): ChousPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get a custom rule validator
   */
  getRule(name: string): RuleValidator | undefined {
    return this.rules.get(name);
  }

  /**
   * Get a custom preset
   */
  getPreset(name: string): string | undefined {
    return this.presets.get(name);
  }

  /**
   * Check if a plugin is registered
   */
  hasPlugin(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Clear all registered plugins
   */
  clear(): void {
    this.plugins.clear();
    this.rules.clear();
    this.presets.clear();
  }
}

// Global plugin registry
export const pluginRegistry = new PluginRegistry();
