# Basic Concepts

Vorm is built around **schema-driven** form generation with maximum flexibility. This page covers the key concepts that unlock Vorm's power.

## Schema-Driven Design

Each form is defined by a single `VormSchema` array:

```ts
import { type VormSchema } from 'vorm-vue';

const schema: VormSchema = [
  { name: 'email', label: 'E-Mail', type: 'email' },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    validation: [{ rule: 'required' }],
  },
];
```

Each field supports:

- `type` — e.g. `text`, `email`, `checkbox`, `select`, `textarea`, `repeater`
- `validation` — built-in or custom rules
- `showIf` — conditionally show based on form values
- `classes` — styling per input/label/wrapper
- `options` — for select fields (static or reactive)

## The Form Context

Create a form instance with `useVorm()`:

```ts
import { useVorm } from 'vorm-vue';

const vorm = useVorm(schema);
```

This gives you:

- `vorm.formData` — reactive form values
- `vorm.errors` — validation errors per field
- `vorm.isValid` — computed validity state (`ComputedRef`, use `.value` in templates)
- `vorm.validate()` — validate all fields
- And many more methods...

## Components

### VormProvider

Connects the form context to child components:

```vue
<VormProvider :vorm="vorm">
  <!-- Children can access vorm context -->
</VormProvider>
```

### AutoVorm

Automatically renders all fields from schema:

```vue
<VormProvider :vorm="vorm">
  <AutoVorm as="form" @submit="handleSubmit" />
</VormProvider>
```

## Styling Forms

Vorm gives you full control over appearance via `classes`, slots, or global layout props.

### Per-Field Classes

```ts
{
  name: 'email',
  label: 'E-Mail',
  type: 'email',
  classes: {
    input: 'border px-2 py-1',
    outer: 'mb-4',
    label: 'text-sm font-medium',
    help: 'text-red-500 text-xs'
  }
}
```

### Layout Props

```vue
<AutoVorm layout="grid" :columns="2" />
```

## Wrapper Slots

Use wrapper slots to customize field containers:

### Global Wrapper

```vue
<AutoVorm>
  <template #wrapper="{ field, content, state }">
    <div class="mb-4">
      <label>{{ field.label }}</label>
      <component :is="content" />
      <span v-if="state.error">{{ state.error }}</span>
    </div>
  </template>
</AutoVorm>
```

### Field-Specific Wrapper

```vue
<AutoVorm>
  <template #wrapper:email="{ field, content, state }">
    <div class="email-field">
      <component :is="content" />
    </div>
  </template>
</AutoVorm>
```

### Multi-Field Wrapper

```vue
<AutoVorm>
  <template #wrapper:[email,username]="{ field, content }">
    <div class="auth-field">
      <component :is="content" />
    </div>
  </template>
</AutoVorm>
```

## Field Slots

Override the entire field rendering:

```vue
<AutoVorm>
  <template #email="{ field, state }">
    <MyCustomInput :field="field" :error="state.error" />
  </template>
</AutoVorm>
```

## Sections & Layout

`VormSection` provides visual grouping:

```vue
<VormSection title="Account Information">
  <AutoVorm :only="['username', 'email', 'password']" />
</VormSection>
```

## Context Props

AutoVorm accepts props to control rendering:

- `only` — only render specified fields
- `excludeRepeaters` — skip repeater fields
- `layout` — `grid` or `stacked`
- `columns` — for grid layout

```vue
<AutoVorm :only="['email', 'password']" layout="grid" :columns="2" />
```

## Events

AutoVorm emits interaction events:

- `@submit` — form submission
- `@input` — field value changed
- `@blur` — field blurred
- `@validate` — validation triggered

```vue
<AutoVorm
  as="form"
  @submit="handleSubmit"
  @input="handleInput"
  @blur="handleBlur"
/>
```

## Form State

Track form state reactively:

```ts
const vorm = useVorm(schema);

// Computed states
vorm.isValid     // all validated fields pass
vorm.isDirty     // any field changed
vorm.isTouched   // any field touched

// Per-field state
vorm.touched.email   // boolean
vorm.dirty.email     // boolean
vorm.errors.email    // string | null
```

## Validation

Trigger validation programmatically:

```ts
// Validate single field
await vorm.validateFieldByName('email');

// Validate all fields
const isValid = await vorm.validate();
```

---

## What's Next?

- [Schema Definition](/core/schema) — All field options
- [Validation](/core/validation) — Rules and async validation
- [Slots & Wrappers](/advanced/slots) — Full layout control
- [Custom Inputs](/advanced/custom-inputs) — Build your own components

---

> Vorm gives you full control while staying declarative and elegant. Customize deeply — or go fast with defaults. Your form, your rules.
