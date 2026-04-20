---
layout: home

hero:
  name: Chous
  text: File Structure Linter
  tagline: The world's first dedicated linter for file structures. Enforce clean architecture with an expressive rules language.
  image:
    src: /logo.png
    alt: Chous
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/apus3404-oss/chous

features:
  - icon: 👀
    title: Watch Mode
    details: Real-time linting with automatic re-runs on file changes. Monitor your project structure as you work.

  - icon: 🔧
    title: Auto-Fix
    details: Automatically fix file structure issues with a single command. No more manual file moving!

  - icon: 📚
    title: Ready-to-Use Examples
    details: 4 production-ready configurations for monorepo, full-stack, microservices, and libraries.

  - icon: 🎯
    title: 19 Framework Presets
    details: Built-in support for Next.js, Nuxt, Laravel, Django, NestJS, React Native, Flutter, and more.

  - icon: 🧪
    title: Production-Ready
    details: 85%+ test coverage with 140+ test cases. Battle-tested and reliable.

  - icon: 🔌
    title: Plugin System
    details: Extend functionality with custom rules, presets, and validators. Build your own plugins.

  - icon: 💻
    title: VS Code Extension
    details: Real-time linting in your editor with inline diagnostics and quick fixes.

  - icon: 🚀
    title: GitHub Action
    details: Integrate into CI/CD pipelines with automatic PR comments and status checks.

  - icon: 🌍
    title: i18n Support
    details: Multi-language support with automatic language detection.
---

## Quick Start

```bash
# Run without installation
npx chous

# Or install globally
npm install -g chous

# Initialize configuration
chous init

# Lint your project
chous

# Auto-fix issues
chous fix

# Watch mode
chous --watch
```

## Example Configuration

```chous
import basic
import nextjs

# Ensure essential files exist
must have [package.json, README.md]

# Source directory structure
in src:
  allow [components, pages, lib, utils]
  
  in components:
    use PascalCase for files **/*.tsx
  
  in utils:
    use camelCase for files **/*.ts

# Naming conventions
use kebab-case for files **/*.ts
use PascalCase for files **/*.tsx
```

## Why Chous?

::: tip The Problem
Most linters focus on what's **inside** your files. But what about **where** those files live and **how** they're named? Poor file structure leads to:
- Inconsistent architecture
- Hard-to-navigate codebases
- Onboarding friction
- Merge conflicts
:::

::: info The Solution
Chous is the **world's first** dedicated file structure linter. It ensures your project architecture remains consistent, whether you're working in a massive monorepo or a small agile project.
:::

## Features at a Glance

| Feature | Description |
|---------|-------------|
| **Watch Mode** | Monitor file changes and auto re-lint |
| **Auto-Fix** | Automatically fix move and rename issues |
| **19 Presets** | Built-in support for popular frameworks |
| **4 Examples** | Production-ready configuration templates |
| **Plugin System** | Extend with custom rules and validators |
| **VS Code Extension** | Real-time linting in your editor |
| **GitHub Action** | CI/CD integration with PR comments |
| **85%+ Coverage** | Battle-tested with 140+ test cases |

## Community

- [GitHub Discussions](https://github.com/apus3404-oss/chous/discussions)
- [Report Issues](https://github.com/apus3404-oss/chous/issues)
- [Contributing Guide](/contributing)

## License

MIT © 2024-present Chous Contributors
