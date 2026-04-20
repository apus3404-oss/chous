# Contributing to chous

Thank you for your interest in contributing to **chous** - the world's first file structure linter! 🎉

## 🌟 Ways to Contribute

- 🐛 Report bugs and issues
- 💡 Suggest new features or presets
- 📝 Improve documentation
- 🧪 Add tests
- 🎨 Create new presets for frameworks
- 🔧 Fix bugs and implement features
- 🌍 Add translations (i18n)

## 🚀 Getting Started

### Prerequisites

- **Bun** >= 1.0 (recommended) or **Node.js** >= 20
- Git

### Setup Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/chous.git
   cd chous
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Run in development mode**
   ```bash
   bun run dev
   ```
   This watches for file changes and rebuilds automatically.

4. **Build the project**
   ```bash
   bun run build
   ```

5. **Run tests**
   ```bash
   bun test
   ```

6. **Type checking**
   ```bash
   bun run typecheck
   ```

7. **Lint the code**
   ```bash
   bun run lint
   ```

### Test Your Changes Locally

After making changes, test the CLI locally:

```bash
# Build first
bun run build

# Test on a sample project
cd /path/to/test-project
node /path/to/chous/dist/cli.mjs

# Or link it globally
cd /path/to/chous
npm link
chous --help
```

## 📁 Project Structure

```
chous/
├── src/
│   ├── cli.ts              # CLI entry point
│   ├── config/
│   │   ├── parser.ts       # Config file parser
│   │   └── where.ts        # Where directive handling
│   ├── rules/
│   │   ├── lint.ts         # Main linting engine
│   │   ├── report.ts       # Report generator
│   │   ├── validators/     # Rule validators
│   │   │   ├── allow.ts
│   │   │   ├── has.ts
│   │   │   ├── move.ts
│   │   │   ├── naming.ts
│   │   │   └── ...
│   │   └── utils/
│   ├── i18n/               # Internationalization
│   ├── types.ts            # TypeScript types
│   └── index.ts            # Public API
├── presets/                # Built-in presets
│   ├── nextjs.chous
│   ├── nuxt4.chous
│   ├── python.chous
│   └── ...
├── templates/              # Init templates
├── tests/
│   ├── fixtures/           # Test fixtures
│   │   ├── pass/          # Should pass lint
│   │   └── fail/          # Should fail lint
│   └── *.test.ts          # Test files
└── dist/                   # Built files (generated)
```

## 🧪 Writing Tests

### Test Structure

Tests are located in `tests/` directory. We use **Bun's built-in test runner**.

### Adding a New Test Fixture

1. **For passing tests:**
   ```bash
   mkdir -p tests/fixtures/pass/my-feature
   cd tests/fixtures/pass/my-feature
   # Create .chous config and test files
   ```

2. **For failing tests:**
   ```bash
   mkdir -p tests/fixtures/fail/my-feature-violation
   cd tests/fixtures/fail/my-feature-violation
   # Create .chous config and files that should fail
   ```

3. **Run your test:**
   ```bash
   bun test
   ```

### Test Example

```typescript
import { describe, expect, it } from "bun:test";

describe("my feature", () => {
  it("should validate correctly", () => {
    const result = checkNamingStyle("MyComponent.ts", "PascalCase");
    expect(result.valid).toBe(true);
  });
});
```

## 🎨 Creating a New Preset

Presets are located in `presets/` directory and use the `.chous` extension.

### Example: Creating a Laravel Preset

1. **Create the preset file:**
   ```bash
   touch presets/laravel.chous
   ```

2. **Write the rules:**
   ```chous
   # Laravel project structure
   import php
   
   must have [artisan, composer.json, app, config]
   
   allow [app, bootstrap, config, database, public, resources, routes, storage, tests]
   
   in app:
     allow [Console, Exceptions, Http, Models, Providers]
     use PascalCase for files **/*.php
     
   in routes:
     use kebab-case for files *.php
   ```

3. **Add test fixtures:**
   ```bash
   mkdir -p tests/fixtures/pass/preset-laravel
   mkdir -p tests/fixtures/fail/preset-laravel
   ```

4. **Test your preset:**
   ```bash
   bun test
   ```

## 🔧 Adding a New Validator

Validators are located in `src/rules/validators/`.

### Steps:

1. **Create validator file:**
   ```bash
   touch src/rules/validators/my-validator.ts
   ```

2. **Extend BaseRuleValidator:**
   ```typescript
   import { BaseRuleValidator } from "./base";
   import type { MyRule } from "../../types";
   
   export class MyRuleValidator extends BaseRuleValidator<MyRule> {
     canHandle(rule: any): rule is MyRule {
       return rule.kind === "my-rule";
     }
     
     protected async validateInternal(
       rule: MyRule,
       context: RuleValidatorContext,
       ruleIndex: number,
       config: { rules: any[] }
     ): Promise<{ hitCount: number }> {
       // Implementation
       return { hitCount: 0 };
     }
   }
   ```

3. **Register in `src/rules/validators/index.ts`**

4. **Add tests**

5. **Update types in `src/types.ts`**

## 🌍 Adding Translations

We use **typesafe-i18n** for internationalization.

### Adding a New Language

1. **Create language directory:**
   ```bash
   mkdir src/i18n/tr  # Turkish example
   ```

2. **Copy English template:**
   ```bash
   cp src/i18n/en/index.ts src/i18n/tr/index.ts
   ```

3. **Translate strings**

4. **Run i18n generator:**
   ```bash
   bun run typesafe-i18n
   ```

5. **Test your translation:**
   ```bash
   chous --lang tr
   ```

## 📝 Code Style Guidelines

- **TypeScript**: Use strict mode, avoid `any` types
- **Naming**: 
  - Files: `kebab-case.ts`
  - Classes: `PascalCase`
  - Functions: `camelCase`
  - Constants: `SCREAMING_SNAKE_CASE`
- **Comments**: Write clear comments for complex logic
- **Error handling**: Always handle errors gracefully
- **Tests**: Write tests for new features

## 🔄 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/my-awesome-feature
   ```

2. **Make your changes**
   - Write code
   - Add tests
   - Update documentation

3. **Ensure all checks pass**
   ```bash
   bun run typecheck
   bun run lint
   bun test
   ```

4. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add Laravel preset"
   git commit -m "fix: resolve naming validation bug"
   git commit -m "docs: update README with examples"
   ```

   **Commit types:**
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation
   - `test`: Tests
   - `refactor`: Code refactoring
   - `chore`: Maintenance

5. **Push and create PR**
   ```bash
   git push origin feature/my-awesome-feature
   ```

6. **Fill out the PR template**
   - Describe your changes
   - Link related issues
   - Add screenshots if applicable

## 🐛 Reporting Bugs

When reporting bugs, please include:

- **chous version**: `chous --version`
- **Operating system**: Windows/macOS/Linux
- **Node/Bun version**: `node --version` or `bun --version`
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Minimal `.chous` config** that reproduces the issue

## 💡 Feature Requests

We love new ideas! When suggesting features:

- Check if it already exists or is planned
- Explain the use case
- Provide examples
- Consider backward compatibility

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Every contribution, no matter how small, makes **chous** better. We appreciate your time and effort!

---

**Questions?** Open an issue or start a discussion on GitHub.

**Need help?** Check out our [README](README.md) or ask in the issues section.
