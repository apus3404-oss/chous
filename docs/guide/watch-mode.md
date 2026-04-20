# Watch Mode

Monitor file changes and automatically re-lint your project in real-time.

## Overview

Watch mode continuously monitors your project and automatically re-runs linting when:
- Files are added
- Files are deleted
- Config file (`.chous`) changes

## Basic Usage

```bash
# Start watch mode
chous --watch

# Or use short flag
chous -w

# With verbose output
chous -w --verbose
```

## How It Works

1. **Initial Lint** - Runs linting once
2. **Watch** - Monitors file system
3. **Debounce** - Waits for changes to settle
4. **Re-lint** - Automatically re-runs linting
5. **Report** - Shows updated results

## Example Session

```bash
$ chous --watch

👀 Watching for file changes... (Press Ctrl+C to stop)

📁 Chous File Structure Linter

✓ No file structure issues found

[12:34:56] File added: src/components/NewComponent.tsx
🔄 Re-running lint...

📁 Chous File Structure Linter

⚠ Found 1 issue:
  src/components/NewComponent.tsx
    Should use PascalCase

[12:35:10] Config changed: .chous
🔄 Re-running lint...

📁 Chous File Structure Linter

✓ No file structure issues found
```

## Features

### Debouncing

Watch mode debounces changes to avoid excessive re-runs:
- **300ms delay** after last change
- Batches multiple rapid changes
- Prevents performance issues

### Smart Filtering

Only triggers on relevant changes:
- ✓ File additions
- ✓ File deletions
- ✓ Config changes
- ✗ File content changes (unless config)

### Ignored Directories

Automatically ignores:
- `node_modules/`
- `.git/`
- `dist/`
- `build/`
- `.next/`
- `.nuxt/`
- `coverage/`
- `.cache/`
- `.turbo/`

## Configuration

### Custom Ignore Patterns

Create `.chousignore`:

```
# Ignore build artifacts
dist/
build/

# Ignore temporary files
*.tmp
*.temp

# Ignore specific directories
vendor/
.venv/
```

### Watch-Specific Config

No special configuration needed - watch mode uses your existing `.chous` file.

## Use Cases

### Development Workflow

```bash
# Terminal 1: Watch mode
chous --watch

# Terminal 2: Development
npm run dev
```

### Continuous Feedback

Get instant feedback as you:
- Create new files
- Move files around
- Refactor structure
- Update config

### Team Collaboration

Keep structure consistent:
- Real-time validation
- Immediate feedback
- Prevent drift

## Performance

### Optimizations

- **Debouncing** - Reduces unnecessary runs
- **Smart filtering** - Only relevant changes
- **Incremental** - Only checks changed areas
- **Efficient** - Minimal CPU usage

### Resource Usage

Typical resource usage:
- **CPU**: < 1% idle, ~5% during lint
- **Memory**: ~50MB
- **Disk I/O**: Minimal

## Integration

### With Dev Server

```bash
# Run both in parallel
npm run dev & chous --watch
```

### With Nodemon

```json
{
  "scripts": {
    "dev": "nodemon --exec 'npm start'",
    "lint:watch": "chous --watch"
  }
}
```

### With Concurrently

```json
{
  "scripts": {
    "dev": "concurrently \"npm:dev:*\"",
    "dev:server": "npm start",
    "dev:lint": "chous --watch"
  }
}
```

## Troubleshooting

### High CPU Usage

**Problem**: Watch mode using too much CPU

**Solutions**:
- Add more patterns to `.chousignore`
- Reduce project size
- Check for infinite loops

### Not Detecting Changes

**Problem**: Changes not triggering re-lint

**Solutions**:
- Check file is not ignored
- Verify file system events work
- Try restarting watch mode

### Too Many Re-runs

**Problem**: Linting runs too frequently

**Solutions**:
- Debounce delay is working (300ms)
- Check for file system loops
- Review `.chousignore` patterns

## Best Practices

1. **Use during development** - Catch issues early
2. **Ignore build artifacts** - Reduce noise
3. **Combine with auto-fix** - Fix issues automatically
4. **Monitor output** - Stay aware of structure
5. **Stop when not needed** - Save resources

## Comparison

| Mode | When to Use |
|------|-------------|
| **Normal** | One-time checks, CI/CD |
| **Watch** | Active development |
| **Auto-fix** | Batch corrections |

## Next Steps

- [Auto-fix guide](/guide/auto-fix)
- [Editor integration](/guide/editor-integration)
- [Configuration](/config/syntax)
