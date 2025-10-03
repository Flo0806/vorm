<script setup lang="ts">
const schema: VormSchema = [
  {
    name: 'username',
    label: 'Username',
    type: 'text',
    validation: [{ rule: 'required' }]
  },
  {
    name: 'email',
    label: 'Email address',
    type: 'email',
    validation: [{ rule: 'required' }, { rule: 'email' }]
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    validation: [{ rule: 'required' }]
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea'
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    validation: [{ rule: 'required' }]
  },
  {
    name: 'adminCode',
    label: 'Admin code',
    type: 'text',
    showIf: { role: 'Admin' }
  },
  {
    name: 'tos',
    label: 'Accept terms',
    type: 'checkbox',
    validation: [{ rule: 'required' }]
  }
]

const { formData, validate, resetForm, updateField } = useVorm(schema, {
  validationMode: 'onInput'
})

function submit() {
  const ok = validate()
  console.log('✅ Valid:', ok)
  console.log('📦 Data:', JSON.stringify(formData))
}

onMounted(() => {
  updateField('role', 'Admin', {
    fieldOptions: [
      { label: 'User', value: 'User' },
      { label: 'Admin', value: 'Admin' },
      { label: 'Moderator', value: 'Moderator' }
    ]
  })
})
</script>

<template>
  <VormSection title="Basic Example" titleClasses="text-xl font-bold">
    <AutoVorm layout="grid" :columns="2" />
  </VormSection>

  <div class="flex gap-4 mt-12">
    <button @click="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Absenden</button>
    <button @click="resetForm" class="bg-black-500 text-white px-4 py-2 rounded">
      Zurücksetzen
    </button>
  </div>

  <pre class="mt-6 text-xs bg-black-100 p-2 border rounded">
Data: {{ formData }}
    </pre
  >
</template>

<style>
/* Global input styling */
input,
select,
textarea {
  @apply w-full px-3 py-1.5 border border-gray-400 rounded bg-white text-black placeholder-gray-500;
}

input[type='checkbox'] {
  @apply w-4 h-4 !w-4 !h-4 text-blue-600 bg-white border-gray-300 rounded;
}

/* Basic button reset for dark bg */
button {
  @apply rounded border border-transparent px-4 py-2 text-sm font-medium transition-colors;
}
button:hover {
  @apply border-blue-400;
}
button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.vorm-help {
  color: red;
}
</style>
