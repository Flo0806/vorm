# Advanced: Nested Repeaters

Vorm fully supports deeply nested repeater structures. These allow complex form hierarchies like `departments -> employees -> skills`.

## Basic Nested Structure

```ts
import { type VormSchema } from 'vorm-vue';

const schema: VormSchema = [
  {
    name: 'departments',
    type: 'repeater',
    label: 'Departments',
    fields: [
      { name: 'name', type: 'text', label: 'Department Name' },
      {
        name: 'employees',
        type: 'repeater',
        label: 'Employees',
        fields: [
          { name: 'name', type: 'text', label: 'Employee Name' },
          { name: 'email', type: 'email', label: 'Email' },
        ],
      },
    ],
  },
];
```

## Two Ways to Render

### 1. With AutoVorm (recommended)

Use `<AutoVorm>` recursively inside the `VormRepeater` slot with `:only`:

```vue
<script setup lang="ts">
import { useVorm, type VormSchema } from 'vorm-vue';
import { VormProvider, AutoVorm, VormRepeater } from 'vorm-vue';

const schema: VormSchema = [/* ... */];
const vorm = useVorm(schema);
</script>

<template>
  <VormProvider :vorm="vorm">
    <VormRepeater name="departments">
      <template #default="{ fullName, index }">
        <div class="department">
          <AutoVorm :only="[fullName]" :exclude-repeaters="true" />

          <VormRepeater :name="`${fullName}.employees`">
            <template #default="{ fullName: empPath, index: empIndex }">
              <AutoVorm :only="[empPath]" :exclude-repeaters="true" />
              <button @click="vorm.removeRepeaterItem(`${fullName}.employees`, empIndex)">
                Remove Employee
              </button>
            </template>
          </VormRepeater>

          <button @click="vorm.addRepeaterItem(`${fullName}.employees`, {})">
            Add Employee
          </button>
          <button @click="vorm.removeRepeaterItem('departments', index)">
            Remove Department
          </button>
        </div>
      </template>
    </VormRepeater>

    <button @click="vorm.addRepeaterItem('departments', {})">
      Add Department
    </button>
  </VormProvider>
</template>
```

This ensures:

- Only the fields for this repeater item are rendered
- Nested repeaters inside are ignored unless explicitly rendered
- Use `excludeRepeaters` to prevent infinite loops

### 2. Manual Rendering

For complete control, render fields manually using the `data` slot prop:

```vue
<VormRepeater name="departments">
  <template #default="{ fullName, index, data }">
    <div class="department">
      <label>Department Name</label>
      <input v-model="data.name" />

      <VormRepeater :name="`${fullName}.employees`">
        <template #default="{ fullName: empPath, index: empIndex, data: empData }">
          <div class="employee">
            <label>Employee Name</label>
            <input v-model="empData.name" />

            <label>Email</label>
            <input v-model="empData.email" type="email" />

            <span v-if="vorm.errors[`${empPath}.email`]" class="error">
              {{ vorm.errors[`${empPath}.email`] }}
            </span>

            <button @click="vorm.removeRepeaterItem(`${fullName}.employees`, empIndex)">
              Remove
            </button>
          </div>
        </template>
      </VormRepeater>

      <button @click="vorm.addRepeaterItem(`${fullName}.employees`, {})">
        Add Employee
      </button>
    </div>
  </template>
</VormRepeater>
```

---

## Slot Props Reference

Inside a `VormRepeater` slot you get:

| Prop | Type | Description |
|------|------|-------------|
| `fullName` | `string` | Full indexed path (e.g., `departments[0].employees[1]`) |
| `index` | `number` | Current index (0-based) |
| `data` | `any` | Reactive reference to item data |
| `indexes` | `number[]` | Array of all nesting indexes (e.g., `[0, 1]`) |

You can use `fullName` directly as input paths or in AutoVorm's `:only` prop.

---

## Relative showIf Support

When using `showIf` logic inside a nested repeater, Vorm supports relative paths:

```ts
const schema: VormSchema = [
  {
    name: 'departments',
    type: 'repeater',
    fields: [
      { name: 'type', type: 'select', label: 'Type', options: [
        { label: 'Engineering', value: 'engineering' },
        { label: 'Sales', value: 'sales' },
      ]},
      {
        name: 'employees',
        type: 'repeater',
        fields: [
          { name: 'name', type: 'text', label: 'Name' },
          {
            name: 'techLevel',
            type: 'select',
            label: 'Tech Level',
            // Show only if parent department is engineering
            showIf: {
              dependsOn: '../../type',
              condition: (val) => val === 'engineering',
            },
            options: [
              { label: 'Junior', value: 'junior' },
              { label: 'Senior', value: 'senior' },
            ],
          },
        ],
      },
    ],
  },
];
```

This resolves correctly: `departments[0].employees[0].techLevel` → `../../type` resolves to `departments[0].type`.

---

## Wrapper Slots in Nested Contexts

Wrapper slots work for nested fields. The field name passed is the **full path** (e.g., `departments[0].employees[0].email`), but matching works via:

1. Exact match (rare in nested cases)
2. `inheritWrapper: true` on field schema
3. Multi-field slots: `wrapper:[email,name]`
4. Global fallback: `wrapper`

```vue
<AutoVorm>
  <!-- Apply to all email fields including nested -->
  <template #wrapper:[email]="{ field, state, content }">
    <div class="email-field">
      <label>{{ field.label }}</label>
      <component :is="content" />
      <span v-if="state.error">{{ state.error }}</span>
    </div>
  </template>
</AutoVorm>
```

---

## Three Levels Deep

Vorm handles arbitrarily deep nesting:

```vue
<VormRepeater name="companies">
  <template #default="{ fullName: companyPath }">
    <AutoVorm :only="[companyPath]" :exclude-repeaters="true" />

    <VormRepeater :name="`${companyPath}.departments`">
      <template #default="{ fullName: deptPath }">
        <AutoVorm :only="[deptPath]" :exclude-repeaters="true" />

        <VormRepeater :name="`${deptPath}.employees`">
          <template #default="{ fullName: empPath }">
            <AutoVorm :only="[empPath]" :exclude-repeaters="true" />
          </template>
        </VormRepeater>
      </template>
    </VormRepeater>
  </template>
</VormRepeater>
```

---

## Tips

- Always use `:exclude-repeaters="true"` on inner AutoVorm to prevent infinite loops
- Use template string interpolation for dynamic paths: `` `${fullName}.employees` ``
- The `indexes` prop helps track position in deeply nested structures
- Access errors with full path: `vorm.errors['departments[0].employees[1].email']`

---

- [VormRepeater Component](../components/repeater.md)
- [AutoVorm](../components/autovorm.md)
- [Conditional Logic](../core/conditions.md)

---

> Vorm makes nested repeater rendering predictable, safe, and flexible — regardless of depth, layout, or custom components.
