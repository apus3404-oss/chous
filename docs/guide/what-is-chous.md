# What is Chous?

Chous is the **world's first** dedicated linter for file structures.

## The Problem

Most linters focus on what's **inside** your files:
- ESLint checks JavaScript code
- Prettier formats your code
- TypeScript checks types

But what about **where** those files live and **how** they're named?

### Common Issues

Without file structure linting, projects suffer from:

- **Inconsistent architecture** - Files scattered randomly
- **Hard-to-navigate codebases** - No clear organization
- **Onboarding friction** - New developers get lost
- **Merge conflicts** - Everyone has their own structure
- **Technical debt** - Structure degrades over time

## The Solution

Chous ensures your project architecture remains **consistent** and **maintainable**.

### How It Works

1. **Define rules** in a `.chous` file
2. **Run linting** to check your structure
3. **Auto-fix** issues automatically
4. **Enforce** in CI/CD pipelines

### Example

```chous
import basic
import nextjs

# Ensure essential files exist
must have [package.json, README.md]

# Source directory structure
in src:
  allow [components, pages, lib]
  
  in components:
    use PascalCase for files **/*.tsx
```

## Key Features

### 👀 Watch Mode
Monitor file changes and automatically re-lint your project.

### 🔧 Auto-Fix
Automatically fix move and rename issues with a single command.

### 📚 19 Framework Presets
Built-in support for Next.js, Nuxt, Laravel, Django, NestJS, and more.

### 🔌 Plugin System
Extend functionality with custom rules and validators.

### 💻 Editor Integration
Real-time linting in VS Code and Cursor.

### 🚀 CI/CD Integration
GitHub Actions for automated checks on PRs.

## Why "Chous"?

> **chous** /tʃoʊs/ - From Chinese "抽丝" (chōu sī), meaning "to draw out silk threads, to untangle"

Just as this tool helps you untangle complex file structure issues.

## Use Cases

### Monorepos
Enforce consistent structure across multiple packages.

### Team Projects
Ensure everyone follows the same conventions.

### Open Source
Make your project easy to navigate for contributors.

### Enterprise
Maintain architecture standards at scale.

## Comparison

| Tool | Purpose | Scope |
|------|---------|-------|
| **ESLint** | Code quality | Inside files |
| **Prettier** | Code formatting | Inside files |
| **TypeScript** | Type checking | Inside files |
| **Chous** | File structure | Project architecture |

## Next Steps

- [Get started](/guide/getting-started)
- [Learn the syntax](/config/syntax)
- [Explore presets](/presets/)
