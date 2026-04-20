import { resolve, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import type { ChousPlugin, PluginLoader, PluginContext, PluginLogger } from './types';
import { pluginRegistry } from './types';

/**
 * Default plugin loader implementation
 */
export class DefaultPluginLoader implements PluginLoader {
  private cwd: string;
  private verbose: boolean;

  constructor(cwd: string, verbose: boolean = false) {
    this.cwd = cwd;
    this.verbose = verbose;
  }

  /**
   * Load a plugin by name
   */
  async load(name: string): Promise<ChousPlugin> {
    // Try to resolve the plugin module
    const pluginPath = await this.resolvePlugin(name);

    if (!pluginPath) {
      throw new Error(`Plugin "${name}" not found. Make sure it's installed.`);
    }

    // Import the plugin module
    const pluginModule = await this.importPlugin(pluginPath);

    // Validate plugin structure
    this.validatePlugin(pluginModule, name);

    return pluginModule;
  }

  /**
   * Load all plugins specified in config
   */
  async loadAll(pluginNames: string[]): Promise<ChousPlugin[]> {
    const plugins: ChousPlugin[] = [];

    for (const name of pluginNames) {
      try {
        const plugin = await this.load(name);
        plugins.push(plugin);

        if (this.verbose) {
          console.log(`✓ Loaded plugin: ${plugin.name} v${plugin.version}`);
        }
      } catch (error) {
        console.error(`✗ Failed to load plugin "${name}":`, error);
        throw error;
      }
    }

    return plugins;
  }

  /**
   * Resolve plugin path
   */
  private async resolvePlugin(name: string): Promise<string | null> {
    // Try different resolution strategies

    // 1. Absolute path
    if (existsSync(name)) {
      return name;
    }

    // 2. Relative to cwd
    const relativePath = resolve(this.cwd, name);
    if (existsSync(relativePath)) {
      return relativePath;
    }

    // 3. In .chous/plugins directory
    const pluginsDir = resolve(this.cwd, '.chous', 'plugins', name);
    if (existsSync(pluginsDir)) {
      return pluginsDir;
    }

    // 4. As npm package in node_modules
    const nodeModulesPath = resolve(this.cwd, 'node_modules', name);
    if (existsSync(nodeModulesPath)) {
      return nodeModulesPath;
    }

    // 5. Try with chous-plugin- prefix
    if (!name.startsWith('chous-plugin-')) {
      const prefixedName = `chous-plugin-${name}`;
      const prefixedPath = resolve(this.cwd, 'node_modules', prefixedName);
      if (existsSync(prefixedPath)) {
        return prefixedPath;
      }
    }

    return null;
  }

  /**
   * Import plugin module
   */
  private async importPlugin(pluginPath: string): Promise<ChousPlugin> {
    try {
      // Convert to file URL for ESM import
      const fileUrl = pathToFileURL(pluginPath).href;

      // Try to import as ESM
      const module = await import(fileUrl);

      // Handle default export
      return module.default || module;
    } catch (error) {
      // Try to import as CommonJS
      try {
        const module = require(pluginPath);
        return module.default || module;
      } catch {
        throw new Error(`Failed to import plugin from "${pluginPath}": ${error}`);
      }
    }
  }

  /**
   * Validate plugin structure
   */
  private validatePlugin(plugin: any, name: string): asserts plugin is ChousPlugin {
    if (!plugin || typeof plugin !== 'object') {
      throw new Error(`Plugin "${name}" must export an object`);
    }

    if (!plugin.name || typeof plugin.name !== 'string') {
      throw new Error(`Plugin "${name}" must have a "name" property`);
    }

    if (!plugin.version || typeof plugin.version !== 'string') {
      throw new Error(`Plugin "${name}" must have a "version" property`);
    }

    // Optional properties validation
    if (plugin.init && typeof plugin.init !== 'function') {
      throw new Error(`Plugin "${name}": "init" must be a function`);
    }

    if (plugin.rules && typeof plugin.rules !== 'object') {
      throw new Error(`Plugin "${name}": "rules" must be an object`);
    }

    if (plugin.presets && typeof plugin.presets !== 'object') {
      throw new Error(`Plugin "${name}": "presets" must be an object`);
    }

    if (plugin.postProcess && typeof plugin.postProcess !== 'function') {
      throw new Error(`Plugin "${name}": "postProcess" must be a function`);
    }

    if (plugin.preProcess && typeof plugin.preProcess !== 'function') {
      throw new Error(`Plugin "${name}": "preProcess" must be a function`);
    }
  }
}

/**
 * Initialize plugins
 */
export async function initializePlugins(
  pluginNames: string[],
  context: PluginContext
): Promise<ChousPlugin[]> {
  const loader = new DefaultPluginLoader(context.cwd, false);
  const plugins = await loader.loadAll(pluginNames);

  // Register plugins
  for (const plugin of plugins) {
    pluginRegistry.register(plugin);

    // Call init hook
    if (plugin.init) {
      await plugin.init(context);
    }
  }

  return plugins;
}

/**
 * Create plugin logger
 */
export function createPluginLogger(pluginName: string, verbose: boolean = false): PluginLogger {
  const prefix = `[${pluginName}]`;

  return {
    info(message: string) {
      console.log(`${prefix} ${message}`);
    },
    warn(message: string) {
      console.warn(`${prefix} ⚠ ${message}`);
    },
    error(message: string) {
      console.error(`${prefix} ✗ ${message}`);
    },
    debug(message: string) {
      if (verbose) {
        console.log(`${prefix} [DEBUG] ${message}`);
      }
    },
  };
}
