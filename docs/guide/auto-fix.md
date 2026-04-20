# Auto-Fix

Automatically fix file structure issues with a single command.

## Overview

The auto-fix feature can automatically:
- Move files to correct directories
- Rename files to match naming conventions
- Create missing directories

## Basic Usage

```bash
# Auto-fix with confirmation
chous fix

# Preview changes without applying
chous fix --dry-run

# Auto-apply without confirmation
chous fix --yes

# Verbose output
chous fix -v
```

## How It Works

1. **Scan** - Identifies fixable issues
2. **Validate** - Checks if fixes are safe
3. **Preview** - Shows what will change
4. **Apply** - Executes the fixes

## Example

### Before

```
src/
  MyComponent.tsx     ❌ Should be in components/
  user_service.ts     ❌ Should be camelCase
  README.md           ✓ Correct
```

### Configuration

```chous
in src:
  allow [components, services]
  
  in components:
    use PascalCase for files **/*.tsx
  
  in services:
    use camelCase for files **/*.ts
  
  move *.tsx to components
  move *_service.ts to services
  rename *_service.ts to camelCase
```

### Run Fix

```bash
$ chous fix

📁 Chous Auto-Fix

Found 2 fixable issue(s):

  Move:
    src/MyComponent.tsx → src/components/MyComponent.tsx
  
  Rename:
    src/user_service.ts → src/services/userService.ts

Apply these fixes? (y/N): y

✓ Fixed 2 issue(s)
```

### After

```
src/
  components/
    MyComponent.tsx   ✓ Correct
  services/
    userService.ts    ✓ Correct
  README.md           ✓ Correct
```

## Safety Features

### Validation

Auto-fix validates before applying:
- ✓ Target doesn't exist
- ✓ No data loss
- ✓ Safe to move/rename

### Unsafe Operations

These are **not** auto-fixed:
- Target file already exists
- Would overwrite existing files
- Circular dependencies

## Dry Run Mode

Preview changes without applying:

```bash
chous fix --dry-run
```

Output:
```
📁 Chous Auto-Fix (Dry Run)

Would fix 2 issue(s):

  Move:
    src/MyComponent.tsx → src/components/MyComponent.tsx
  
  Rename:
    src/user_service.ts → src/services/userService.ts

[Dry-run mode] No changes applied
```

## Non-Interactive Mode

Skip confirmation prompts:

```bash
chous fix --yes
```

Useful for:
- CI/CD pipelines
- Automated scripts
- Batch operations

## Verbose Mode

See detailed file paths:

```bash
chous fix -v
```

Output includes:
- Full file paths
- Detailed error messages
- Step-by-step progress

## Common Scenarios

### Move Files to Correct Directories

```chous
in src:
  move *.component.ts to components
  move *.service.ts to services
  move *.model.ts to models
```

### Rename Files

```chous
in src:
  rename *.component.ts to kebab-case
  rename *.service.ts to camelCase
```

### Combined Operations

```chous
in src:
  # Move and rename in one go
  move *_component.tsx to components
  rename *_component.tsx to PascalCase
```

## Limitations

### Cannot Fix

- Content-based issues
- Complex refactoring
- Import path updates
- Git history preservation

### Manual Intervention Required

Some issues need manual fixing:
- Conflicting file names
- Complex directory structures
- Custom business logic

## Best Practices

1. **Always preview first** - Use `--dry-run`
2. **Commit before fixing** - Easy rollback
3. **Fix incrementally** - Small batches
4. **Review changes** - Check git diff
5. **Update imports** - Fix import paths manually

## Integration

### Git Workflow

```bash
# 1. Commit current work
git add .
git commit -m "Before auto-fix"

# 2. Preview fixes
chous fix --dry-run

# 3. Apply fixes
chous fix --yes

# 4. Review changes
git diff

# 5. Commit fixes
git add .
git commit -m "chore: auto-fix file structure"
```

### CI/CD

```yaml
- name: Auto-fix file structure
  run: |
    chous fix --yes
    git add .
    git commit -m "chore: auto-fix file structure" || true
    git push
```

## Troubleshooting

### "Target already exists"

**Problem**: File already exists at target location

**Solution**: Manually resolve conflict or rename one file

### "Permission denied"

**Problem**: No write permissions

**Solution**: Check file permissions or run with appropriate privileges

### "No fixable issues"

**Problem**: All issues require manual intervention

**Solution**: Review issues with `chous --verbose` and fix manually

## Next Steps

- [Watch mode](/guide/watch-mode)
- [Configuration](/config/syntax)
- [CI/CD integration](/guide/ci-cd)
