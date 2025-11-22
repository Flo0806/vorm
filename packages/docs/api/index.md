# API Reference

Complete reference for all Vorm types, interfaces, and methods.

## useVorm

The main composable that creates a form context.

```ts
import { useVorm } from 'vorm-vue';

const vorm = useVorm(schema, options?);
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| schema | `VormSchema` | Array of field definitions |
| options | `UseVormOptions` | Optional configuration |

### UseVormOptions

```ts
interface UseVormOptions {
  i18n?: I18nContext;           // Custom i18n adapter
  initialData?: Record<string, any>;  // Pre-fill form data
}
```

### Return Value

The `useVorm` composable returns an object with the following properties and methods:

#### Reactive State

| Property | Type | Description |
|----------|------|-------------|
| `formData` | `Record<string, any>` | Reactive form values |
| `errors` | `ComputedRef<Record<string, string \| null>>` | Validation errors per field |
| `touched` | `Record<string, boolean>` | Fields that have been blurred |
| `dirty` | `Record<string, boolean>` | Fields that have been modified |
| `isValid` | `ComputedRef<boolean>` | All validated fields pass |
| `isDirty` | `ComputedRef<boolean>` | Any field has been modified |
| `isTouched` | `ComputedRef<boolean>` | Any field has been touched |

#### Validation Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `validateAll` | `() => Promise<boolean>` | Validate all fields, returns validity |
| `validateFieldByName` | `(name: string) => Promise<void>` | Validate a single field |
| `clearErrors` | `() => void` | Clear all validation errors |
| `clearError` | `(name: string) => void` | Clear error for a specific field |

#### Field Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `updateField` | `(name: string, value: any, options?: { validate?: boolean }) => void` | Update field value |
| `getFieldOptions` | `(name: string) => Option[]` | Get resolved options for select fields |
| `bindField` | `(name: string) => ComputedRef<FieldBindings>` | Get bindings for third-party components |

#### Repeater Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `addRepeaterItem` | `(path: string, item?: any, index?: number) => void` | Add item to repeater |
| `removeRepeaterItem` | `(path: string, index: number) => void` | Remove item from repeater |
| `moveRepeaterItem` | `(path: string, from: number, to: number) => void` | Reorder repeater items |
| `clearRepeater` | `(path: string) => void` | Remove all items from repeater |

#### Other

| Property/Method | Type | Description |
|-----------------|------|-------------|
| `schema` | `VormSchema` | The original schema |
| `reset` | `() => void` | Reset form to initial values |

---

## Types

### VormSchema

Array of field definitions:

```ts
type VormSchema = VormFieldSchema[];
```

### VormFieldSchema

Complete field configuration:

```ts
interface VormFieldSchema {
  // Required
  name: string;
  type: FieldType;

  // Text (supports ReactiveString)
  label?: ReactiveString;
  placeholder?: ReactiveString;
  helpText?: ReactiveString;

  // Behavior
  disabled?: ReactiveBoolean;
  required?: boolean;
  showError?: boolean;

  // Validation
  validation?: ValidationRule[];
  validationMode?: ValidationMode;

  // Options (for select, radio, checkbox-group)
  options?: ReactiveOptions;

  // Conditional Rendering
  showIf?: ShowIfCondition;

  // Nested Fields (for repeater)
  fields?: VormFieldSchema[];

  // Styling
  classes?: FieldClasses;
  inheritWrapper?: boolean;
}
```

### FieldType

```ts
type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'hidden'
  | 'repeater';
```

### ReactiveString

Supports static strings, refs, computed refs, and functions:

```ts
type ReactiveString =
  | string
  | Ref<string>
  | ComputedRef<string>
  | (() => string)
  | ((ctx: FormContext) => string);
```

### ReactiveBoolean

Same pattern for boolean values:

```ts
type ReactiveBoolean =
  | boolean
  | Ref<boolean>
  | ComputedRef<boolean>
  | (() => boolean)
  | ((ctx: FormContext) => boolean);
```

### FormContext

Context passed to reactive functions:

```ts
interface FormContext {
  formData: Record<string, any>;
  readonly errors: Record<string, string | null>;
  readonly isValid: boolean;
  readonly isDirty: boolean;
  readonly isTouched: boolean;
  readonly touched: Record<string, boolean>;
  readonly dirty: Record<string, boolean>;
}
```

### ValidationRule

Define validation rules:

```ts
interface ValidationRule {
  rule: BuiltInRuleName | ValidatorFunction;
  message?: ReactiveString;
  params?: any[];
  affects?: string[];
}

type ValidatorFunction = (
  value: any,
  formData: Record<string, any>,
  params?: any[]
) => boolean | string | Promise<boolean | string>;
```

### BuiltInRuleName

Built-in validation rules:

```ts
type BuiltInRuleName =
  | 'required'
  | 'email'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'between'
  | 'step'
  | 'pattern'
  | 'matchField';
```

### ValidationMode

When validation triggers:

```ts
type ValidationMode = 'onInput' | 'onBlur' | 'onSubmit';
```

### Option

Option format for select/radio fields:

```ts
interface Option {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
}
```

### ReactiveOptions

Supports multiple option sources:

```ts
type ReactiveOptions =
  | Option[]
  | Ref<Option[]>
  | ComputedRef<Option[]>
  | (() => Option[])
  | (() => Promise<Option[]>);
```

### ShowIfCondition

Conditional field visibility:

```ts
type ShowIfCondition =
  | Record<string, any>                                    // { fieldName: expectedValue }
  | ((formData: Record<string, any>, path: string) => boolean)
  | {
      dependsOn: string;
      condition: (value: any, formData: Record<string, any>) => boolean;
    };
```

### FieldState

State information passed to slots:

```ts
interface FieldState {
  error: string | null;
  valid: boolean;
  invalid: boolean;
  validationMode: ValidationMode;
  touched: boolean;
  dirty: boolean;
  initialValue: any;
  classes: string;
}
```

### FieldClasses

Styling classes per element:

```ts
interface FieldClasses {
  outer?: string;
  label?: string;
  input?: string;
  help?: string;
  error?: string;
}
```

### FieldBindings

Returned by `bindField()`:

```ts
interface FieldBindings {
  modelValue: any;
  'onUpdate:modelValue': (value: any) => void;
  items: Option[];           // Vuetify naming
  options: Option[];         // Generic naming
  error: string | undefined;
  errorMessages: string[];   // Vuetify naming
}
```

---

## Built-in Validators

### Factory Functions

Import and use validator factories:

```ts
import {
  required,
  email,
  minLength,
  maxLength,
  min,
  max,
  between,
  step,
  pattern,
  matchField,
} from 'vorm-vue';
```

| Validator | Parameters | Description |
|-----------|------------|-------------|
| `required()` | none | Field must have a value |
| `email()` | none | Valid email format |
| `minLength(n)` | `n: number` | Minimum string length |
| `maxLength(n)` | `n: number` | Maximum string length |
| `min(n)` | `n: number` | Minimum numeric value |
| `max(n)` | `n: number` | Maximum numeric value |
| `between(min, max)` | `min: number, max: number` | Value in range |
| `step(n)` | `n: number` | Value must be multiple of step |
| `pattern(regex)` | `regex: RegExp` | Match regular expression |
| `matchField(name)` | `name: string` | Must match another field |

### Usage

```ts
const schema: VormSchema = [
  {
    name: 'password',
    type: 'password',
    validation: [
      { rule: required() },
      { rule: minLength(8) },
    ],
  },
  {
    name: 'confirmPassword',
    type: 'password',
    validation: [
      { rule: required() },
      { rule: matchField('password') },
    ],
  },
];
```

### i18n Message Keys

Built-in validators return these message keys:

| Validator | Key | Parameters |
|-----------|-----|------------|
| required | `vorm.validation.required` | — |
| email | `vorm.validation.email` | — |
| minLength | `vorm.validation.minLength` | `[min]` |
| maxLength | `vorm.validation.maxLength` | `[max]` |
| min | `vorm.validation.min` | `[min]` |
| max | `vorm.validation.max` | `[max]` |
| between | `vorm.validation.between` | `[min, max]` |
| step | `vorm.validation.step` | `[step]` |
| pattern | `vorm.validation.pattern` | — |
| matchField | `vorm.validation.matchField` | `[fieldName]` |

---

## Components

### VormProvider

Provides form context to children:

```vue
<VormProvider :vorm="vorm">
  <!-- Children can access vorm context -->
</VormProvider>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| vorm | `ReturnType<typeof useVorm>` | Yes | Form instance from useVorm |

### AutoVorm

Auto-generates form UI from schema:

```vue
<AutoVorm
  :only="['email', 'password']"
  :exclude-repeaters="false"
  layout="stacked"
  :columns="1"
  as="div"
  @submit="handleSubmit"
  @input="handleInput"
  @blur="handleBlur"
  @validate="handleValidate"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| only | `string[]` | — | Only render specified fields |
| excludeRepeaters | `boolean` | `false` | Skip repeater fields |
| layout | `'stacked' \| 'grid'` | `'stacked'` | Layout mode |
| columns | `number` | `1` | Grid columns (when layout='grid') |
| as | `string` | `'div'` | Root element tag |

| Event | Payload | Description |
|-------|---------|-------------|
| submit | `Event` | Form submission |
| input | `{ name, value }` | Field value changed |
| blur | `{ name }` | Field blurred |
| validate | `{ name, valid }` | Validation triggered |

### VormRepeater

Iterate over repeater fields:

```vue
<VormRepeater name="contacts">
  <template #default="{ fullName, index, data, indexes }">
    <!-- Render repeater item -->
  </template>
</VormRepeater>
```

| Prop | Type | Description |
|------|------|-------------|
| name | `string` | Path to repeater field |

| Slot Prop | Type | Description |
|-----------|------|-------------|
| fullName | `string` | Full path (e.g., `contacts[0]`) |
| index | `number` | Current index |
| data | `any` | Reactive reference to item data |
| indexes | `number[]` | Array of nesting indexes |

### VormSection

Groups related fields:

```vue
<VormSection title="Account Info" :show-if="condition">
  <AutoVorm :only="['email', 'password']" />
</VormSection>
```

| Prop | Type | Description |
|------|------|-------------|
| title | `string` | Section heading |
| showIf | `boolean \| (() => boolean)` | Conditional visibility |

---

## Utility Functions

### Path Helpers

```ts
import { getValueByPath, setValueByPath } from 'vorm-vue';

// Get nested value
const email = getValueByPath(formData, 'contacts[0].email');

// Set nested value
setValueByPath(formData, 'contacts[0].email', 'new@email.com');
```

### useVormContext

Access vorm context in child components:

```ts
import { useVormContext } from 'vorm-vue';

const vorm = useVormContext();
// Now you can access vorm.formData, vorm.errors, etc.
```

---

## Slot API

### Field Slots

Replace entire field rendering:

```vue
<AutoVorm>
  <template #fieldName="{ field, state, path, indexes }">
    <!-- Custom field rendering -->
  </template>
</AutoVorm>
```

### Wrapper Slots

Wrap default input:

```vue
<AutoVorm>
  <!-- Specific field -->
  <template #wrapper:fieldName="slotProps">...</template>

  <!-- Multiple fields -->
  <template #wrapper:[fieldA,fieldB]="slotProps">...</template>

  <!-- Global fallback -->
  <template #wrapper="slotProps">...</template>
</AutoVorm>
```

### Wrapper Slot Props

```ts
{
  // Field info
  field: ResolvedVormFieldSchema;
  state: FieldState;
  path: string;
  indexes: number[];
  content: () => VNode;

  // Bindings for third-party components
  modelValue: any;
  'onUpdate:modelValue': (value: any) => void;
  items: Option[];
  options: Option[];
  error: string | undefined;
  errorMessages: string[];
}
```

### Before/After Slots

```vue
<AutoVorm>
  <template #before-fieldName>Content before</template>
  <template #after-fieldName>Content after</template>
</AutoVorm>
```

---

## Nuxt Module

### Installation

```bash
pnpm add vorm-nuxt
```

### Configuration

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['vorm-nuxt'],
  vorm: {
    autoImports: true,   // Auto-import composables
    components: true,    // Auto-register components
  },
});
```

### Auto-Imports

When `autoImports: true`:
- `useVorm`
- `useVormContext`
- `VormSchema` (type)
- `VormFieldSchema` (type)

### Auto-Components

When `components: true`:
- `VormProvider`
- `AutoVorm`
- `VormRepeater`
- `VormSection`

---

- [Getting Started](/getting-started/installation)
- [Schema Definition](/core/schema)
- [Validation](/core/validation)
- [i18n Guide](/advanced/i18n)
