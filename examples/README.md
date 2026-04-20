# Configuration Examples

This directory contains ready-to-use `.chous` configuration examples for common project structures. Copy and adapt these examples to your project.

## Available Examples

### 📦 [monorepo.chous](./monorepo.chous)
**Monorepo structure with multiple apps and shared packages**

Perfect for:
- Turborepo / Nx workspaces
- Multiple apps (web, mobile, API, docs)
- Shared component libraries
- Unified tooling and configs

Key features:
- Workspace-level rules
- Per-app structure validation
- Shared package conventions
- Build tool organization

---

### 🌐 [fullstack.chous](./fullstack.chous)
**Full-stack application with separate frontend and backend**

Perfect for:
- Next.js + Node.js/Express apps
- React frontend + REST API backend
- Shared types between frontend/backend
- Docker-based deployment

Key features:
- Frontend (Next.js/React) structure
- Backend (Node.js/Express) structure
- Shared code directory
- Database schema validation

---

### 🔧 [microservices.chous](./microservices.chous)
**Microservices architecture with multiple independent services**

Perfect for:
- Service-oriented architecture
- Independent deployable services
- Shared libraries across services
- Kubernetes/Docker deployment

Key features:
- Multiple service directories
- Shared library structure
- Infrastructure as code (Terraform, K8s)
- Service-specific validation

---

### 📚 [library.chous](./library.chous)
**NPM package/library structure**

Perfect for:
- Reusable NPM packages
- UI component libraries
- Utility libraries
- Framework-agnostic tools

Key features:
- Source and distribution structure
- Test organization
- Documentation structure
- Multiple build target support

---

## How to Use

1. **Copy the example** that matches your project structure:
   ```bash
   cp examples/monorepo.chous .chous
   ```

2. **Customize** the configuration to match your specific needs:
   - Add/remove directories
   - Adjust naming conventions
   - Add project-specific rules

3. **Test** the configuration:
   ```bash
   chous
   ```

4. **Iterate** until all checks pass:
   ```bash
   chous fix  # Auto-fix move/rename issues
   ```

## Combining Examples

You can combine multiple examples by using the `import` directive:

```chous
# Import base structure
import basic

# Import framework-specific rules
import nextjs

# Add your custom rules
allow [custom-dir]
```

## Tips

- **Start simple**: Begin with a basic example and add rules incrementally
- **Use presets**: Import built-in presets (`nextjs`, `python`, `go`, etc.)
- **Test frequently**: Run `chous` after each change to catch issues early
- **Use fix command**: `chous fix` can automatically fix many issues
- **Document exceptions**: Add comments explaining why certain rules exist

## Need Help?

- 📖 [Full Documentation](../README.md)
- 🤝 [Contributing Guide](../CONTRIBUTING.md)
- 💬 [GitHub Issues](https://github.com/cheezone/chous/issues)

## Contributing Examples

Have a useful configuration example? We'd love to include it!

1. Create a new `.chous` file in this directory
2. Add comprehensive comments explaining the structure
3. Update this README with a description
4. Submit a pull request

Examples we're looking for:
- Mobile app structures (React Native, Flutter)
- Backend frameworks (NestJS, Fastify, Hono)
- Static site generators (Astro, Eleventy)
- Desktop apps (Electron, Tauri)
- Game development structures
