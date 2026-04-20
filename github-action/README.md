# Chous GitHub Action

Automatically lint your project's file structure in CI/CD with Chous.

## Features

- 🔍 **Automatic Linting** - Runs on every push and PR
- 💬 **PR Comments** - Posts linting results directly on pull requests
- 🔧 **Auto-Fix** - Optionally fix issues automatically
- 📊 **Job Summary** - Beautiful summary in GitHub Actions UI
- ⚙️ **Configurable** - Customize behavior with inputs

## Usage

### Basic Setup

Create `.github/workflows/chous.yml`:

```yaml
name: Lint File Structure

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Lint file structure
        uses: apus3404-oss/chous/github-action@v1
```

### With Auto-Fix

```yaml
name: Lint File Structure

on:
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      
      - name: Lint and fix file structure
        uses: apus3404-oss/chous/github-action@v1
        with:
          auto-fix: true
          comment-on-pr: true
          github-token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Commit fixes
        if: github.event_name == 'pull_request'
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add -A
          git diff --quiet && git diff --staged --quiet || git commit -m "chore: auto-fix file structure"
          git push
```

### Advanced Configuration

```yaml
name: Lint File Structure

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  lint:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      
      - name: Lint file structure
        uses: apus3404-oss/chous/github-action@v1
        with:
          config-path: '.chous'
          verbose: true
          strict: true
          auto-fix: false
          fail-on-error: true
          comment-on-pr: true
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `config-path` | Path to .chous configuration file | No | `.chous` |
| `verbose` | Enable verbose output | No | `false` |
| `strict` | Enable strict mode (fail on warnings) | No | `false` |
| `auto-fix` | Automatically fix issues | No | `false` |
| `fail-on-error` | Fail the action if issues are found | No | `true` |
| `comment-on-pr` | Comment on PR with results | No | `true` |
| `github-token` | GitHub token for PR comments | No | `${{ github.token }}` |

## Outputs

| Output | Description |
|--------|-------------|
| `issues-found` | Number of issues found |
| `has-errors` | Whether errors were found (true/false) |
| `summary` | Summary of linting results |

## Examples

### Only Lint on PRs

```yaml
on:
  pull_request:
    branches: [main]
```

### Lint Specific Paths

```yaml
on:
  push:
    paths:
      - 'src/**'
      - '.chous'
```

### Use Custom Config

```yaml
- uses: apus3404-oss/chous/github-action@v1
  with:
    config-path: 'config/file-structure.chous'
```

### Don't Fail on Errors

```yaml
- uses: apus3404-oss/chous/github-action@v1
  with:
    fail-on-error: false
```

### Disable PR Comments

```yaml
- uses: apus3404-oss/chous/github-action@v1
  with:
    comment-on-pr: false
```

## Permissions

For PR comments, the action needs:

```yaml
permissions:
  contents: read
  pull-requests: write
```

For auto-fix with commits:

```yaml
permissions:
  contents: write
  pull-requests: write
```

## Troubleshooting

### Action fails with "chous not found"

The action automatically installs chous. If it fails, check your workflow logs.

### PR comments not appearing

Ensure you have the correct permissions:

```yaml
permissions:
  pull-requests: write
```

### Auto-fix not committing changes

Make sure you have:
1. `contents: write` permission
2. Git configuration in your workflow
3. A step to commit and push changes

## Development

```bash
# Install dependencies
npm install

# Build action
npm run build

# Test locally
npm test
```

## Links

- [Chous GitHub](https://github.com/apus3404-oss/chous)
- [Documentation](https://github.com/apus3404-oss/chous#readme)
- [Report Issues](https://github.com/apus3404-oss/chous/issues)

## License

MIT
