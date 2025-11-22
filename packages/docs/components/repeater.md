# Component: VormRepeater

`<VormRepeater>` is a utility component for iterating over repeater fields in your schema. It renders a list of children and exposes useful props like `fullName`, `index`, and `data` for every item.

> `VormRepeater` must be used **within a VormProvider context** and **only for fields of type `repeater`**.

## Basic Usage

```vue
<script setup lang="ts">
import { useVorm, type VormSchema } from 'vorm-vue';
import { VormProvider, AutoVorm, VormRepeater } from 'vorm-vue';

const schema: VormSchema = [
  {
    name: 'contacts',
    type: 'repeater',
    label: 'Contacts',
    fields: [
      { name: 'name', type: 'text', label: 'Name' },
      { name: 'email', type: 'email', label: 'Email' },
    ],
  },
];

const vorm = useVorm(schema);
</script>

<template>
  <VormProvider :vorm="vorm">
    <VormRepeater name="contacts">
      <template #default="{ fullName, index }">
        <div class="contact-item">
          <AutoVorm :only="[fullName]" :exclude-repeaters="true" />
          <button @click="vorm.removeRepeaterItem('contacts', index)">
            Remove
          </button>
        </div>
      </template>
    </VormRepeater>

    <button @click="vorm.addRepeaterItem('contacts')">
      Add Contact
    </button>
  </VormProvider>
</template>
```

## Props

| Prop | Type     | Description                                  |
| ---- | -------- | -------------------------------------------- |
| name | `string` | The path to the repeater field in the schema |

## Slot Props

The default slot receives:

```ts
interface SlotProps {
  fullName: string;    // e.g. "contacts[0]"
  index: number;       // current index
  data: any;           // reference to formData entry (reactive)
  indexes: number[];   // array of nesting indexes (e.g. [0, 1])
}
```

## With AutoVorm

Combine with AutoVorm to render nested fields automatically:

```vue
<VormRepeater name="contacts">
  <template #default="{ fullName, index }">
    <div class="contact-card">
      <h3>Contact {{ index + 1 }}</h3>
      <AutoVorm :only="[fullName]" :exclude-repeaters="true" />
      <button @click="vorm.removeRepeaterItem('contacts', index)">
        Remove
      </button>
    </div>
  </template>
</VormRepeater>
```

## Before/After Slots

You can add content before or after specific fields:

```vue
<VormRepeater name="contacts">
  <template #default="{ fullName, index }">
    <AutoVorm :only="[fullName]" :exclude-repeaters="true">
      <template #[`after-${fullName}.email`]>
        <button @click="vorm.removeRepeaterItem('contacts', index)">
          Remove Contact
        </button>
      </template>
    </AutoVorm>
  </template>
</VormRepeater>
```

## Nested Repeaters

VormRepeater supports nesting for complex structures:

```vue
<VormRepeater name="departments">
  <template #default="{ fullName: deptPath, index: deptIndex }">
    <div class="department">
      <AutoVorm :only="[deptPath]" :exclude-repeaters="true" />

      <VormRepeater :name="`${deptPath}.employees`">
        <template #default="{ fullName: empPath, index: empIndex }">
          <AutoVorm :only="[empPath]" :exclude-repeaters="true" />
          <button @click="vorm.removeRepeaterItem(`${deptPath}.employees`, empIndex)">
            Remove Employee
          </button>
        </template>
      </VormRepeater>

      <button @click="vorm.addRepeaterItem(`${deptPath}.employees`)">
        Add Employee
      </button>
    </div>
  </template>
</VormRepeater>
```

## Repeater Methods

Use these methods from the vorm context:

### `addRepeaterItem(path, item?, index?)`

```ts
// Add empty item at end
vorm.addRepeaterItem('contacts');

// Add with initial data
vorm.addRepeaterItem('contacts', { name: 'John', email: 'john@example.com' });

// Add at specific index
vorm.addRepeaterItem('contacts', { name: '' }, 0);
```

### `removeRepeaterItem(path, index)`

```ts
vorm.removeRepeaterItem('contacts', 2);
```

### `moveRepeaterItem(path, from, to)`

```ts
// Move first item to third position
vorm.moveRepeaterItem('contacts', 0, 2);
```

### `clearRepeater(path)`

```ts
vorm.clearRepeater('contacts');
```

## Manual Field Rendering

For complete control, render fields manually:

```vue
<VormRepeater name="contacts">
  <template #default="{ fullName, index, data }">
    <div class="contact-form">
      <label>Name</label>
      <input v-model="data.name" />

      <label>Email</label>
      <input v-model="data.email" type="email" />

      <span v-if="vorm.errors[`${fullName}.email`]" class="error">
        {{ vorm.errors[`${fullName}.email`] }}
      </span>

      <button @click="vorm.removeRepeaterItem('contacts', index)">
        Remove
      </button>
    </div>
  </template>
</VormRepeater>
```

## Tips

- `VormRepeater` automatically watches the array and updates when items change
- The `data` object is reactive and synced to formData
- Use `fullName` to reference nested paths in AutoVorm's `only` prop
- Always use `excludeRepeaters` on inner AutoVorm to prevent infinite loops
- Use `indexes` for deeply nested structures to track position

## Complete Example

```vue
<script setup lang="ts">
import { useVorm, type VormSchema } from 'vorm-vue';
import { VormProvider, AutoVorm, VormRepeater } from 'vorm-vue';

const schema: VormSchema = [
  { name: 'teamName', type: 'text', label: 'Team Name' },
  {
    name: 'members',
    type: 'repeater',
    label: 'Team Members',
    fields: [
      { name: 'name', type: 'text', label: 'Name', validation: [{ rule: 'required' }] },
      { name: 'role', type: 'text', label: 'Role' },
      { name: 'email', type: 'email', label: 'Email', validation: [{ rule: 'email' }] },
    ],
  },
];

const vorm = useVorm(schema);

async function handleSubmit() {
  const isValid = await vorm.validateAll();
  if (isValid) {
    console.log('Team:', vorm.formData);
  }
}
</script>

<template>
  <VormProvider :vorm="vorm">
    <AutoVorm :only="['teamName']" />

    <h2>Team Members</h2>

    <VormRepeater name="members">
      <template #default="{ fullName, index }">
        <div class="member-card">
          <AutoVorm :only="[fullName]" :exclude-repeaters="true" layout="grid" :columns="3" />
          <button type="button" @click="vorm.removeRepeaterItem('members', index)">
            Remove Member
          </button>
        </div>
      </template>
    </VormRepeater>

    <button type="button" @click="vorm.addRepeaterItem('members')">
      Add Member
    </button>

    <button type="button" @click="handleSubmit">
      Submit
    </button>
  </VormProvider>
</template>
```

---

- [Nested Repeaters](../advanced/nested-repeaters.md)
- [AutoVorm](./autovorm.md)
- [Form State](../core/state.md)

---

> VormRepeater is essential for handling dynamic arrays of form data. It offers full control and works seamlessly with both AutoVorm and manual rendering.
