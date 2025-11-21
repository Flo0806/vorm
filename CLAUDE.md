# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Vorm is an intuitive form engine for Vue 3 — dynamic, schema-driven, and fully validated. This is a **pnpm workspace** monorepo containing:

- `vorm-vue` (packages/vorm): Core form engine library for Vue 3
- `vorm-nuxt` (packages/vorm-nuxt): Nuxt module integration
- `playground` (packages/playground): Demo application for testing
- `docs` (packages/docs): VitePress documentation site

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

# Run tests with UI
pnpm --filter vorm-vue test:ui

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

### Linting (vorm-nuxt)
```bash
pnpm --filter vorm-nuxt lint
```

## Architecture

### Core Library (vorm-vue)

The library is structured around three key concepts:

1. **Schema System** (`types/schemaTypes.ts`)
   - `VormSchema`: Array of field definitions that describe form structure
   - `VormFieldSchema`: Individual field configuration with type, validation, conditional visibility
   - Field types are strictly typed via `FieldValueTypeMap` (text, number, email, checkbox, select, etc.)
   - Supports nested fields, repeaters, and conditional fields via `showIf`

2. **Validation Engine** (`core/validatorEngine.ts` + `core/validatorCompiler.ts`)
   - **Two-phase validation**: Compilation phase (schema → compiled validators) + execution phase (async validation)
   - Built-in validators: `required`, `minLength`, `maxLength`, `min`, `max`, `pattern`, `between`, `step`, `matchField`
   - Custom validators supported via `ValidationRule` interface
   - Validation modes: `onInput`, `onBlur`, `onSubmit`
   - Compiled validators are cached for performance

3. **Context System** (`composables/useVorm.ts` + `core/vormContext.ts`)
   - `useVorm()`: Creates form context with reactive state (formData, errors, touched, dirty)
   - `VormContext`: Centralized form state injected via Vue's provide/inject
   - `VormContextKey`: InjectionKey for type-safe dependency injection
   - Context tracks: validation state, field options, dirty/touched state, initial values

### Components

- **VormProvider**: Root component that establishes form context via `useVorm()`
- **AutoVorm**: Auto-generates form UI from schema (experimental/under development)
- **VormSection**: Groups related fields with optional conditional rendering
- **VormRepeater**: Dynamic array fields (add/remove field groups)

All components use Vue 3 Composition API and TypeScript.

### Nuxt Module (vorm-nuxt)

- Auto-imports `useVorm`, `useVormContext`, and types when `autoImports: true`
- Auto-registers all Vorm components when `components: true`
- Transpiles `vorm-vue` for SSR compatibility
- Plugin setup in `runtime/plugin`

### Build Configuration

- **vorm-vue**: Vite library mode with dual exports:
  - `./index.mjs`: Main library + built-in validators
  - `./components.mjs`: Components only
  - CSS bundled in `vorm-vue.css`
- **Test setup**: Vitest with jsdom environment, coverage via v8
- **Type generation**: `vite-plugin-dts` with rollup types enabled

## Release Workflow

### GitHub Actions Workflows

1. **version-pr.yml**: Triggered on changeset additions
   - Creates/updates version PR using `changesets/action`
   - Updates PR title with package versions

2. **release-vorm-vue.yml**: Triggered when version PR is merged
   - Checks for absence of changesets (indicating release merge)
   - Builds vorm-vue
   - Publishes to npm with provenance
   - Creates GitHub release

3. **release-vorm-nuxt.yml**: Separate release workflow for Nuxt module

### GitLab CI (.gitlab-ci.yml)

Used for documentation deployment:
- Manual version tagging (patch/minor/major)
- Docker image build for docs
- Deploy to server (pulls `:latest` image)

## Key Patterns

### Path Helpers (`utils/pathHelpers.ts`)
The library uses dot-notation paths (e.g., `user.address.city`) to access nested form data:
- `getValueByPath(obj, path)`: Retrieve nested values
- `setValueByPath(obj, path, value)`: Set nested values

### Conditional Visibility
Fields support `showIf` conditions:
- Object comparison: `{ fieldName: expectedValue }`
- Function: `(formData, path) => boolean`
- Dependent field: `{ dependsOn: 'field', condition: (value, formData) => boolean }`

### Validation Flow
1. Schema compilation: `compileField()` creates `CompiledValidator`
2. Field validation: `validateFieldByName()` uses compiled validators
3. Async execution: `validateFieldAsync()` runs validation rules sequentially
4. Error propagation: `affects` field in rules can propagate errors to other fields

## i18n and Reactivity System

**Status**: ✅ Implemented (v1.2.0)

Vorm supports comprehensive i18n with reactive labels, placeholders, helpText, and validation messages. Language changes update text WITHOUT re-triggering validation.

**Key Features**:
- Reactive labels, placeholders, helpText, validation messages
- Functions without `computed()` wrapper: `label: () => t('key')`
- Dynamic text based on form state: `placeholder: (ctx) => ctx.formData.username + '@example.com'`
- Built-in i18n keys for all validators
- `vorm.errors` is reactive object (no `.value` needed)
- AutoVorm slots receive resolved strings

**📖 Complete Documentation**: See [I18N_REACTIVITY_IMPLEMENTATION.md](./I18N_REACTIVITY_IMPLEMENTATION.md) for full implementation details, usage examples, and architecture.

**Demo**: `/packages/playground/src/demos/I18nDemo.vue`

## Workspace Structure

```
vorm/
├── packages/
│   ├── vorm/          # vorm-vue (main library)
│   │   ├── src/
│   │   │   ├── core/         # Validation engine & context
│   │   │   ├── composables/  # useVorm, useVormContext
│   │   │   ├── components/   # VormProvider, AutoVorm, etc.
│   │   │   ├── validation/   # Built-in validators
│   │   │   ├── types/        # TypeScript definitions
│   │   │   └── utils/        # Path helpers
│   │   └── __tests__/        # Vitest tests
│   ├── vorm-nuxt/     # Nuxt module
│   ├── playground/    # Demo app (Vite + Vue + TailwindCSS)
│   └── docs/          # VitePress documentation
├── .changeset/        # Changesets configuration
└── .github/workflows/ # Release automation
```
