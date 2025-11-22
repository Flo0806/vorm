# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Vorm is an intuitive form engine for Vue 3 — dynamic, schema-driven, and fully validated. **Current version: 1.2.1**

This is a **pnpm workspace** monorepo containing:

- `vorm-vue` (packages/vorm): Core form engine library for Vue 3
- `vorm-nuxt` (packages/vorm-nuxt): Nuxt module integration (ready for npm publish)
- `playground` (packages/playground): Demo application showcasing all features
- `docs` (packages/docs): VitePress documentation site

## Current Status (November 2025)

### ✅ Completed Features
- **Performance optimization** - VormField component for isolated reactivity per field
- **i18n support** - ReactiveString for labels, placeholders, helpText, validation messages
- **Options system** - Static, reactive, async options for select fields
- **bindField()** - Easy third-party component integration (Vuetify, PrimeVue, etc.)
- **Documentation** - Complete overhaul with API reference, guides, examples
- **Playground** - Redesigned demo app showing all Vorm features

### 📦 Ready for Next Steps
- **vorm-nuxt** - Module is ready, needs npm publish
- Consider adding more demos/recipes to docs

## Development Commands

### Installation & Setup
```bash
pnpm install
```

### Development
```bash
# Run playground (default dev command)
pnpm dev

# Run documentation site locally
pnpm docs:dev
```

### Building
```bash
# Build vorm-vue library
pnpm --filter vorm-vue build

# Build all packages
pnpm -r build
```

### Testing
```bash
# Run tests for vorm-vue
pnpm --filter vorm-vue test

# Run tests with coverage
pnpm --filter vorm-vue test:cov

# Run tests for vorm-nuxt
pnpm --filter vorm-nuxt test

# Run type checking for vorm-nuxt
pnpm --filter vorm-nuxt test:types
```

### Versioning & Release (Changesets)
```bash
# Create a new changeset (when making changes)
pnpm changeset

# Apply version updates locally
pnpm version:apply

# Build and publish locally (for testing)
pnpm release:local
```

**Important**: The packages use **Changesets** for version management. `vorm-nuxt` is in the ignore list (`.changeset/config.json`), meaning it doesn't auto-bump via changesets.

## Deployment Setup

### Git Remotes
- **origin** (GitHub): `https://github.com/Flo0806/vorm.git` - Main repo, npm releases
- **gitlab**: `https://gitlab.fh-softdev.de/fh-softdev/vue/composables/vorm.git` - Docs deployment

### Release Workflow
1. **GitHub** handles npm releases via GitHub Actions (changesets)
2. **GitLab** handles docs deployment via `.gitlab-ci.yml`:
   - Push `deploy-to-latest` tag to trigger docs build
   - Docker image built from `packages/docs/`
   - Deployed to homeserver

### Push to Both Remotes
```bash
git push origin main
git push gitlab main

# Trigger docs rebuild:
git tag -d deploy-to-latest
git push gitlab :refs/tags/deploy-to-latest
git tag deploy-to-latest
git push gitlab deploy-to-latest
```

## Architecture

### Core Library (vorm-vue)

The library is structured around three key concepts:

1. **Schema System** (`types/schemaTypes.ts`)
   - `VormSchema`: Array of field definitions
   - `VormFieldSchema`: Individual field configuration
   - Supports nested fields, repeaters, conditional fields via `showIf`

2. **Validation Engine** (`core/validatorEngine.ts` + `core/validatorCompiler.ts`)
   - Two-phase validation: compilation + async execution
   - Built-in validators: `required`, `minLength`, `maxLength`, `min`, `max`, `pattern`, `between`, `step`, `matchField`
   - Validation modes: `onInput`, `onBlur`, `onSubmit`

3. **Context System** (`composables/useVorm.ts`)
   - `useVorm()`: Creates form context with reactive state
   - Tracks: formData, errors, touched, dirty, isValid, isDirty, isTouched

### Components

- **VormProvider**: Provides form context to children (required wrapper)
- **AutoVorm**: Auto-generates form UI from schema
- **VormField**: Internal component for isolated field reactivity (performance)
- **VormSection**: Groups related fields
- **VormRepeater**: Dynamic array fields

### Key Types

```typescript
// Reactive strings for i18n
type ReactiveString = string | Ref<string> | ComputedRef<string> | (() => string) | ((ctx: FormContext) => string);

// Form context passed to reactive functions
interface FormContext {
  formData: Record<string, any>;
  readonly errors: Record<string, string | null>;
  readonly isValid: boolean;
  readonly isDirty: boolean;
  readonly isTouched: boolean;
}

// Options for select fields
type ReactiveOptions = Option[] | Ref<Option[]> | ComputedRef<Option[]> | (() => Option[]) | (() => Promise<Option[]>);
```

### Nuxt Module (vorm-nuxt)

- Auto-imports `useVorm`, `useVormContext`, and types when `autoImports: true`
- Auto-registers all Vorm components when `components: true`
- Transpiles `vorm-vue` for SSR compatibility
- Works with Nuxt i18n

## Documentation

The docs are at `packages/docs/` (VitePress) and include:

- **Getting Started**: Installation, First Form, Basic Concepts
- **Core Features**: Schema, Validation, Conditions, State
- **Components**: AutoVorm, VormProvider, VormRepeater, VormSection
- **Advanced**: i18n, Options, Custom Inputs, Slots, Nested Repeaters
- **Nuxt Integration**: Setup and usage guide
- **API Reference**: All types, methods, and interfaces

Build docs locally: `cd packages/docs && npx vitepress build`

## Workspace Structure

```
vorm/
├── packages/
│   ├── vorm/          # vorm-vue (main library)
│   │   ├── src/
│   │   │   ├── core/         # Validation engine & context
│   │   │   ├── composables/  # useVorm, useVormContext
│   │   │   ├── components/   # VormProvider, AutoVorm, VormField, etc.
│   │   │   ├── validation/   # Built-in validators
│   │   │   ├── types/        # TypeScript definitions
│   │   │   ├── i18n/         # Default translations
│   │   │   └── utils/        # Path helpers, reactive resolver
│   │   └── __tests__/        # Vitest tests
│   ├── vorm-nuxt/     # Nuxt module
│   ├── playground/    # Demo app (Vite + Vue + TailwindCSS)
│   └── docs/          # VitePress documentation
├── .changeset/        # Changesets configuration
├── .github/workflows/ # GitHub Actions (npm releases)
└── .gitlab-ci.yml     # GitLab CI (docs deployment)
```

## Future Ideas (V2 Brainstorm)

These are potential game-changing features that could differentiate Vorm from FormKit/VeeValidate:

### 1. AI-Powered Schema Generation
```ts
const schema = await vorm.generate("Registration form with email, password confirmation, and profile picture")
// → Generates complete VormSchema with validation rules
```
Natural language to form schema. No other library does this.

### 2. Headless Primitives Architecture
```ts
// Fully decoupled primitives - like TanStack Form but Vue-native
const { value, error, validate, touch } = useField('email')
const { submit, isSubmitting, isValid } = useForm(schema)
```
Not just AutoVorm, but true primitives that work anywhere.

### 3. Server-Driven Forms
```ts
// Schema comes from server - changes without frontend redeploy
const vorm = useVorm({ endpoint: '/api/forms/registration' })
```
Perfect for CMS, admin panels, dynamic forms.

### 4. Built-in Form Analytics
```ts
vorm.analytics.onDropoff((field) => console.log(`Users abandon at: ${field}`))
vorm.analytics.completionRate // 73%
vorm.analytics.errorHotspots // ['password': 45% error rate]
```
Track where users struggle, no external library needed.

### 5. Visual Schema Builder
- Drag & drop form editor
- Exports to VormSchema JSON
- Open source (FormKit's is commercial)

### 6. Zero-Config Accessibility
- WCAG 2.1 AA compliance out of the box
- Screen reader optimized
- Automatic focus management
- Live error announcements for assistive technology

### 7. Integrated Drag & Drop for VormRepeater
```vue
<VormRepeater name="items" sortable>
  <!-- Items can be reordered via drag & drop -->
</VormRepeater>
```
Built-in sortable/draggable support without external libraries. Touch-friendly, keyboard accessible.
