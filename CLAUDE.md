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

### Overview

Vorm supports comprehensive internationalization (i18n) with reactive labels, placeholders, helpText, and validation messages. The system is designed so that **language changes update displayed text WITHOUT re-triggering validation** on untouched fields.

### ReactiveString Type

The core type that enables reactive text throughout the schema:

```typescript
type ReactiveString =
  | string                              // Static: "Username"
  | Ref<string>                         // Vue Ref: ref('Username')
  | ComputedRef<string>                 // Vue Computed: computed(() => ...)
  | (() => string)                      // Function without computed(): () => locale.value === 'en' ? 'Username' : 'Benutzername'
  | ((ctx: FormContext) => string)      // Function with FormContext: (ctx) => ctx.formData.username ? `${ctx.formData.username}@example.com` : 'email'
```

**Key Feature**: Users don't need `computed()` wrappers! Simple functions like `() => t('key')` work directly.

### Architecture: Two-Layer Error System

**Problem**: When locale changes, error messages should update, but validation should NOT re-run on untouched fields.

**Solution**: Separate storage from display:

1. **Storage Layer** (`errorData: Record<string, ErrorData | null>`):
   ```typescript
   interface ErrorData {
     messageRef: ReactiveString;        // The reactive message definition
     params?: (string | number)[];      // Interpolation params (e.g., [8] for "min {0} chars")
   }
   ```

2. **Display Layer** (`errors: ComputedRef<Record<string, string | null>>`):
   ```typescript
   errors = computed(() => {
     const result: Record<string, string | null> = {};
     const formContext = createFormContext();

     for (const fieldName in errorData) {
       const error = errorData[fieldName];
       if (!error) {
         result[fieldName] = null;
       } else {
         // Resolve message reactively with FormContext
         result[fieldName] = resolveMessage(error.messageRef, i18nContext, error.params, formContext);
       }
     }
     return result;
   });
   ```

When locale changes → `errors` computed re-runs → messages update → no validation triggered!

### FormContext Pattern

**Problem**: Schema wants to access `vorm.formData` for dynamic text, but `vorm` doesn't exist yet during schema creation (chicken-egg problem).

**Solution**: Pass `FormContext` as function parameter with lazy getters:

```typescript
interface FormContext {
  formData: Record<string, any>;
  // Lazy getters for computed properties (avoids circular dependency)
  readonly errors: Record<string, string | null>;
  readonly isValid: boolean;
  readonly isDirty: boolean;
  readonly isTouched: boolean;
  readonly touched: Record<string, boolean>;
  readonly dirty: Record<string, boolean>;
}

// In useVorm.ts:
const createFormContext = (): FormContext => ({
  formData,
  get errors() { return errors.value; },      // Evaluated only when accessed!
  get isValid() { return isValid.value; },
  get isDirty() { return isDirty.value; },
  get isTouched() { return isTouched.value; },
  get touched() { return touched; },
  get dirty() { return dirty; },
});
```

**Performance**: Getters are only evaluated on access → minimal reactivity overhead.

### Usage Examples

```typescript
const schema: VormSchema = [
  {
    name: 'username',
    // Simple function (no computed needed!)
    label: () => locale.value === 'en' ? 'Username' : 'Benutzername',
    placeholder: () => locale.value === 'en' ? 'Enter username' : 'Benutzername eingeben',
  },
  {
    name: 'email',
    // Dynamic placeholder with FormContext
    placeholder: (ctx) => ctx.formData.username
      ? `${ctx.formData.username}@example.com`
      : 'your@email.com',
  },
  {
    name: 'password',
    // Dynamic helpText based on form state
    helpText: (ctx) => ctx.formData.email
      ? (locale.value === 'en' ? 'Secure password for ' + ctx.formData.email : 'Sicheres Passwort für ' + ctx.formData.email)
      : (locale.value === 'en' ? 'At least 8 characters' : 'Mindestens 8 Zeichen'),
    validation: [
      {
        rule: minLength(8),  // Uses built-in i18n key
      },
    ],
  },
  {
    name: 'age',
    validation: [{
      rule: between(18, 100),
      // Dynamic validation message with FormContext
      message: (ctx) => (locale.value === 'en'
        ? `Age must be 18-100 (you entered: ${ctx.formData.age || 'nothing'})`
        : `Alter muss 18-100 sein (eingegeben: ${ctx.formData.age || 'nichts'})`),
    }],
  },
];

// With Nuxt i18n (no computed wrapper needed!)
{
  name: 'username',
  label: () => t('form.username'),
  placeholder: () => t('form.username.placeholder'),
}

// Still works: computed (backward compatible)
{
  name: 'username',
  label: computed(() => t('form.username')),
}

// Still works: static strings
{
  name: 'username',
  label: "Username",
}
```

### Built-in i18n Message Keys

All built-in validators return message keys (not hardcoded strings):

- `vorm.validation.required`
- `vorm.validation.email`
- `vorm.validation.minLength` (params: [min])
- `vorm.validation.maxLength` (params: [max])
- `vorm.validation.min` (params: [min])
- `vorm.validation.max` (params: [max])
- `vorm.validation.between` (params: [min, max])
- `vorm.validation.step` (params: [step])
- `vorm.validation.pattern`
- `vorm.validation.matchField` (params: [fieldName])

Default translations (EN + DE) are in `/packages/vorm/src/i18n/messages.ts`.

### Key Files

**New Files**:
- `types/contextTypes.ts`: FormContext interface, ReactiveString type
- `i18n/messages.ts`: Default translations for built-in validators
- `utils/reactiveResolver.ts`: `resolveReactive()` function for resolving ReactiveString to ComputedRef

**Modified Files**:
- `types/validatorTypes.ts`: ValidationRule.message is now ReactiveString; added ErrorData interface
- `types/schemaTypes.ts`: label, placeholder, helpText are now ReactiveString
- `composables/useVorm.ts`: errors is now ComputedRef (⚠️ BREAKING CHANGE); added FormContext creation; errorData storage layer
- `i18n/messageResolver.ts`: resolveMessage() accepts FormContext parameter; handles functions
- `core/ruleUtils.ts`: All built-in rules return message keys
- `validation/*.ts`: All validators return message keys with params
- `components/AutoVorm.vue`: resolvedFields computed for reactive label/placeholder/helpText; template uses resolvedFields

### Breaking Changes

#### 1. `vorm.errors` is now ComputedRef

**Before**: `vorm.errors.email`
**After**: `vorm.errors.value.email`

**Reason**: Required for reactivity without re-validation on language change.

**Migration**: Add `.value` when accessing errors:
```typescript
// Before
if (vorm.errors.email) { ... }

// After
if (vorm.errors.value.email) { ... }
```

#### 2. Built-in validation messages are now keys

**Before**: Returns `"This field is required."`
**After**: Returns `"vorm.validation.required"` → auto-resolved to "This field is required."

**Impact**: Only affects tests that check exact error strings. User-facing code should not be affected.

### Testing Notes

When fixing tests after this feature:

1. **Update error access**: `vorm.errors.email` → `vorm.errors.value.email`
2. **Update error expectations**: Check for resolved messages or keys (depending on test)
3. **Update errorData types**: Test mocks using errors need `Record<string, ErrorData | null>` not `Record<string, string | null>`

**Affected test files**:
- `__tests__/composables/useVorm.test.ts`: Error access patterns
- `__tests__/core/validatorEngine.test.ts`: ErrorData type in function signatures

### Demo

See `/packages/playground/src/demos/I18nDemo.vue` for a comprehensive example showcasing:
- Functions without computed()
- FormContext access in placeholders
- Dynamic helpText based on form state
- Dynamic validation messages with entered values
- Language switching without re-validation

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
