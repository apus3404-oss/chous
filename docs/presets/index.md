# Presets

Chous includes 19 built-in presets for popular frameworks and languages.

## What are Presets?

Presets are pre-configured rule sets for specific frameworks or project types. They save you time by providing sensible defaults.

## Using Presets

```chous
# Import a preset
import nextjs

# Import multiple presets
import basic
import js
import nextjs
```

## Available Presets

### Core Presets

#### basic
Essential ignores and root files for any project.

```chous
import basic
```

#### js / ts
Common JavaScript/TypeScript patterns.

```chous
import js
```

### Frontend Frameworks

#### nextjs
Next.js App Router and Pages Router conventions.

```chous
import nextjs
```

#### nuxt4
Nuxt 4 directory structures and dynamic routes.

```chous
import nuxt4
```

#### t3-stack
T3 Stack (Next.js + tRPC + Prisma + NextAuth + Tailwind).

```chous
import t3-stack
```

#### astro
Astro static site builder structure.

```chous
import astro
```

#### remix
Remix full-stack framework structure.

```chous
import remix
```

#### sveltekit
SvelteKit file-based routing and conventions.

```chous
import sveltekit
```

### Backend Frameworks

#### laravel
Laravel PHP framework with MVC structure.

```chous
import laravel
```

#### django
Django Python web framework structure.

```chous
import django
```

#### nestjs
NestJS progressive Node.js framework.

```chous
import nestjs
```

#### fastify
Fastify fast web framework for Node.js.

```chous
import fastify
```

#### hono
Hono ultrafast web framework.

```chous
import hono
```

### Mobile Frameworks

#### react-native
React Native mobile app structure.

```chous
import react-native
```

#### flutter
Flutter cross-platform mobile framework.

```chous
import flutter
```

### Desktop Frameworks

#### electron
Electron cross-platform desktop apps.

```chous
import electron
```

#### tauri
Tauri lightweight desktop framework.

```chous
import tauri
```

### Languages

#### go
Standard Go workspace layouts.

```chous
import go
```

#### python
PEP 8 and common Python project structures.

```chous
import python
```

## Preset Combinations

### Full-Stack App

```chous
import basic
import js
import nextjs
```

### Monorepo

```chous
import basic
import js

# Add workspace-specific rules
in packages:
  allow [app, web, api, shared]
```

### Microservices

```chous
import basic
import js
import nestjs

in services:
  allow [auth, users, orders, payments]
```

## Custom Presets

Create your own preset file:

```chous
# my-preset.chous
import basic
import js

# Your custom rules
in src:
  allow [features, shared, core]
```

Use it:

```chous
import ./my-preset
```

## Next Steps

- [Frontend presets](/presets/frontend)
- [Backend presets](/presets/backend)
- [Mobile presets](/presets/mobile)
- [Desktop presets](/presets/desktop)
