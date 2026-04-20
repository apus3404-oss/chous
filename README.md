<p align="center">
  <img src="public/logo.png" alt="chous Logo" width="160" height="160"/>
</p>

<h1 align="center">chous</h1>

<p align="center">
  <b>The World's First Dedicated File Structure Linter</b>
  <br />
  Enforce a clean repository layout with an expressive <code>.chous</code> rules file.
  <br />
  <br />
  Created by <b><a href="https://cheez.tech">Cheez Lin</a></b>
</p>

<p align="center">
  <a href="https://github.com/cheezone/chous">GitHub</a> ·
  <a href="./README.zh.md">中文文档</a>
</p>

---

## 🚀 The World's First

`chous` is the **world's first** dedicated linter for file structures. While other linters focus on what's *inside* your files, `chous` focuses on where those files *live* and how they are *named*.

> **chous** /tʃoʊs/ - From Chinese "抽丝" (chōu sī), meaning "to draw out silk threads, to untangle". Just as this tool helps you untangle complex file structure issues. 

It ensures your project architecture remains consistent, whether you're working in a massive monorepo or a small agile project.

## ⚡ Vibe Coder's Quick Start (Prompt)

Are you a **Vibe Coder** using AI editors? Use this 5-step workflow to let the AI handle the architecture for you.

> [!NOTE]
> **Cursor users** can automate Step 5 with hooks. For **Windsurf** or other editors, simply rely on Step 4 for verification.

> "I want to use `chous` to enforce my project's file structure. Please follow these steps:
> 1. Run `npx chous init` to generate a configuration template.
> 2. Run `npx chous` to identify current file structure inconsistencies.
> 3. Based on the lint results and my project goals, **customize the `.chous` file** (or help me move files) to achieve a clean architecture.
> 4. Keep running `npx chous` and fixing issues until **all checks pass**.
> 5. (Optional - Cursor Only) Once verified, run `npx chous cursor install` to enable real-time protection."

---

## ✨ Key Features

- **Expressive DSL**: A human-readable language designed specifically for file systems.
- **Built-in Presets**: Instant support for **Next.js**, **Nuxt 4**, **Go**, **Python**, and more.
- **Nested Blocks**: Group rules naturally with `in <dir>: ...` syntax.
- **AI Editor Integration**: Native hooks for **Cursor**, providing real-time feedback as you code.
- **Elegant Reporting**: Beautiful, tree-style terminal reports that pinpoint exact inconsistencies.

## 📦 Installation

```bash
# Run without installation
npx chous

# Or install globally
npm install -g chous
```

## 🛠️ Getting Started

1. **Initialize**:
   ```bash
   chous init
   ```
   This will auto-detect your project type and create a `.chous` file with sensible defaults based on your stack.

2. **Lint**:
   ```bash
   chous
   ```

## 🎯 Editor Integration (Cursor Hooks)

If you are using **Cursor**, you can install an automated hook that runs `chous` after every AI-powered edit:

```bash
chous cursor install
```

> [!IMPORTANT]
> It is recommended to run this command **only after** you have successfully configured your `.chous` and all manual lint checks pass. This ensures the AI has a clear "source of truth" to follow.

---

## 📝 Configuration Guide

The `.chous` file uses a simple, powerful syntax. Here are some real-world examples derived from the **Nuxt 4** preset:

### 1. Basic Constraints
```chous
# Ensure specific files exist
must have [nuxt.config.ts, app]

# Global naming conventions
use kebab-case for files **/*.ts
```

### 2. The "Elegant" Nested Syntax
Logical grouping prevents path repetition and makes rules readable:

```chous
in app:
  # Allow standard Nuxt directories
  allow [assets, components, composables, pages]
  
  # Deeply nested rules
  in components:
    # All components must be PascalCase
    use PascalCase for files **/*.vue
    # Except when they are inside a PascalCase directory
    use kebab-case for files **/*.vue if-parent-matches PascalCase
    
  strict
```

### 3. Automated Move Suggestions
Clean up your assets folder automatically:

```chous
in assets:
  move *.{css,scss} to css
  move *.{png,jpg,svg} to images
```

## 📂 Available Presets

- `basic`: Standard ignores and root files.
- `js` / `ts`: Common JavaScript/TypeScript patterns.
- `nextjs`: App router and Page router conventions.
- `nuxt4`: Nuxt 4 directory structures and dynamic routes.
- `t3-stack`: T3 Stack (Next.js + tRPC + Prisma + NextAuth + Tailwind).
- `go`: Standard Go workspace layouts.
- `python`: PEP 8 and common Python project structures.
- `django`: Django project structure and app conventions.
- `laravel`: Laravel directory structure and naming conventions.

## 📚 Configuration Examples

Need inspiration? Check out our [examples directory](examples/) with ready-to-use configurations:

- **[Monorepo](examples/monorepo.chous)** - Turborepo/Nx workspace with multiple apps and shared packages
- **[Full-Stack](examples/fullstack.chous)** - Next.js frontend + Node.js backend structure
- **[Microservices](examples/microservices.chous)** - Multiple independent services with shared libraries
- **[Library](examples/library.chous)** - NPM package/library structure with tests and docs

Each example includes detailed comments and best practices. Copy, customize, and adapt to your project!

## 🔧 Development

Want to contribute? Here's how to get started:

```bash
# Clone the repository
git clone https://github.com/your-username/chous.git
cd chous

# Install dependencies (requires Bun or Node.js 18+)
bun install  # or: npm install

# Run in development mode
bun run dev

# Run tests
bun test

# Build the project
bun run build
```

For detailed contribution guidelines, architecture overview, and testing instructions, see [CONTRIBUTING.md](CONTRIBUTING.md).

## 📜 License

This project is licensed under the [MIT License](LICENSE).

