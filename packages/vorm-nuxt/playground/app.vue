<script setup lang="ts">
// ============================================
// TESTING VORM-NUXT AUTO-IMPORTS
// ============================================

// ALL auto-imported by default:
// - Composables: useVorm, useVormContext
// - Types: VormSchema, VormFieldSchema, Option, FieldState, ValidationMode
//          FormContext, ReactiveString, ReactiveBoolean, ReactiveOptions
// - Validators: minLength, maxLength, min, max, between, step, matchField

const { $vorm } = useNuxtApp()

// Simple i18n simulation
const locale = ref<'en' | 'de'>('en')

const t = (key: string): string => {
  const translations: Record<string, Record<string, string>> = {
    en: {
      'form.username': 'Username',
      'form.username.placeholder': 'Enter your username',
      'form.email': 'Email address',
      'form.password': 'Password',
      'form.confirmPassword': 'Confirm Password',
      'form.role': 'Role',
      'form.adminCode': 'Admin Code',
      'form.tos': 'Accept terms and conditions',
      'form.tos.help': 'You must accept to continue',
    },
    de: {
      'form.username': 'Benutzername',
      'form.username.placeholder': 'Benutzername eingeben',
      'form.email': 'E-Mail-Adresse',
      'form.password': 'Passwort',
      'form.confirmPassword': 'Passwort bestätigen',
      'form.role': 'Rolle',
      'form.adminCode': 'Admin-Code',
      'form.tos': 'AGB akzeptieren',
      'form.tos.help': 'Sie müssen akzeptieren um fortzufahren',
    }
  }
  return translations[locale.value]?.[key] ?? key
}

// ============================================
// SCHEMA WITH ALL NEW FEATURES
// ============================================

const schema: VormSchema = [
  {
    name: 'username',
    type: 'text',
    // ReactiveString: function without computed()
    label: () => t('form.username'),
    placeholder: () => t('form.username.placeholder'),
    validation: [{ rule: 'required' }]
  },
  {
    name: 'email',
    type: 'email',
    // ReactiveString: function
    label: () => t('form.email'),
    validation: [{ rule: 'required' }, { rule: 'email' }]
  },
  {
    name: 'password',
    type: 'password',
    // ReactiveString: function
    label: () => t('form.password'),
    // Using auto-imported minLength validator
    validation: [{ rule: 'required' }, { rule: minLength(4) }]
  },
  {
    name: 'confirmPassword',
    type: 'password',
    // ReactiveString: function
    label: () => t('form.confirmPassword'),
    // ReactiveBoolean: function with FormContext
    disabled: (ctx: FormContext) => !ctx.formData.password || ctx.formData.password.length < 4,
    // Using auto-imported matchField validator
    validation: [
      { rule: 'required' },
      { rule: matchField('password'), affects: ['password'] }
    ]
  },
  {
    name: 'role',
    type: 'select',
    label: () => t('form.role'),
    // ReactiveOptions: options directly in schema (Issue #36)
    options: [
      { label: 'Select role...', value: '', disabled: true },
      { label: 'User', value: 'user' },
      { label: 'Admin', value: 'admin' },
      { label: 'Moderator', value: 'moderator' }
    ] satisfies Option[],
    validation: [{ rule: 'required' }]
  },
  {
    name: 'adminCode',
    type: 'text',
    label: () => t('form.adminCode'),
    // Conditional visibility
    showIf: { role: 'admin' }
  },
  {
    name: 'tos',
    type: 'checkbox',
    label: () => t('form.tos'),
    // ReactiveString with FormContext
    helpText: (ctx: FormContext) => ctx.formData.tos ? '' : t('form.tos.help'),
    validation: [{ rule: 'required' }]
  }
]

// Type checking: VormSchema should accept this
const _typeCheck: VormSchema = schema

// Using useVorm (auto-imported)
const vorm = useVorm(schema, { validationMode: 'onInput' as ValidationMode })

// Type checking: FieldState (uses correct interface shape)
const _fieldStateCheck: FieldState = {
  error: null,
  valid: true,
  invalid: false,
  validationMode: 'onInput',
  classes: '',
  touched: false,
  dirty: false,
  initialValue: ''
}

async function submit() {
  const ok = await vorm.validate()
  console.log('Valid:', ok)
  console.log('Data:', JSON.stringify(vorm.formData))
}
</script>

<template>
  <div class="container">
    <h1>Vorm Nuxt Playground</h1>
    <p class="version">Module Version: <strong>{{ $vorm.version }}</strong></p>

    <!-- Language Switcher -->
    <div class="lang-switch">
      <button
        @click="locale = 'en'"
        :class="{ active: locale === 'en' }"
      >EN</button>
      <button
        @click="locale = 'de'"
        :class="{ active: locale === 'de' }"
      >DE</button>
    </div>

    <div class="feature-box">
      <h3>All Auto-Imported:</h3>
      <ul>
        <li>Types: <code>VormSchema</code>, <code>FormContext</code>, <code>Option</code>, ...</li>
        <li>Composables: <code>useVorm</code>, <code>useVormContext</code></li>
        <li>Validators: <code>minLength</code>, <code>matchField</code>, <code>between</code>, ...</li>
      </ul>
      <h3>Testing Features:</h3>
      <ul>
        <li><code>options</code> in schema (Role) - Issue #36</li>
        <li><code>disabled: (ctx) => ...</code> reactive (Confirm Password) - Issue #34</li>
        <li><code>matchField</code> + <code>affects</code> - cascading validation</li>
        <li>i18n: EN/DE switch - labels update reactively!</li>
      </ul>
    </div>

    <VormSection title="Registration Form" titleClasses="section-title">
      <AutoVorm layout="stacked" />
    </VormSection>

    <div class="hint" v-if="vorm.bindField('confirmPassword').value.disabled">
      Confirm Password is disabled - enter at least 4 characters in Password first
    </div>

    <div class="actions">
      <button @click="submit" class="btn-primary" :disabled="!vorm.formData.tos">
        {{ vorm.formData.tos ? 'Submit' : 'Accept terms first' }}
      </button>
      <button @click="vorm.resetForm()" class="btn-secondary">Reset</button>
    </div>

    <details class="debug">
      <summary>Debug</summary>
      <pre>{{ JSON.stringify({
        locale: locale,
        formData: vorm.formData,
        errors: vorm.errors,
        confirmPasswordDisabled: vorm.bindField('confirmPassword').value.disabled,
        roleOptions: vorm.getFieldOptions('role').value
      }, null, 2) }}</pre>
    </details>
  </div>
</template>

<style>
.container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: system-ui, sans-serif;
}

h1 {
  margin-bottom: 0.5rem;
}

.version {
  color: #666;
  margin-bottom: 1rem;
}

.lang-switch {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.lang-switch button {
  padding: 0.5rem 1rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-weight: 600;
}

.lang-switch button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.feature-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.feature-box h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.feature-box ul {
  margin: 0 0 1rem 0;
  padding-left: 1.5rem;
}

.feature-box code {
  background: rgba(255,255,255,0.2);
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.hint {
  background: #fff3cd;
  border: 1px solid #ffc107;
  padding: 0.75rem;
  border-radius: 6px;
  margin: 1rem 0;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #eee;
  color: #333;
  padding: 0.75rem 1.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
}

.debug {
  margin-top: 2rem;
  background: #1a1a2e;
  color: #fff;
  padding: 1rem;
  border-radius: 8px;
}

.debug summary {
  cursor: pointer;
  font-weight: 600;
}

.debug pre {
  margin-top: 1rem;
  font-size: 0.85rem;
  overflow: auto;
}

/* Form styling */
input, select, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  margin-top: 0.25rem;
}

input:focus, select:focus, textarea:focus {
  border-color: #667eea;
  outline: none;
}

input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
}

.vorm-help {
  color: #e53e3e;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.vorm-group {
  margin-bottom: 1rem;
}

.vorm-group label {
  font-weight: 600;
  color: #333;
}
</style>
