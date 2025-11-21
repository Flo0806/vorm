<template>
  <div style="padding: 2rem; max-width: 800px; margin: 0 auto">
    <h1>🌍 Vorm i18n Demo</h1>
    <p>Test reactive validation messages with internationalization</p>

    <div style="margin: 2rem 0; padding: 1rem; background: #f0f0f0; border-radius: 8px">
      <h3>Language Selector</h3>
      <div style="display: flex; gap: 1rem">
        <button
          @click="locale = 'en'"
          :style="{
            padding: '0.5rem 1rem',
            background: locale === 'en' ? '#4CAF50' : '#ddd',
            color: locale === 'en' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }"
        >
          English
        </button>
        <button
          @click="locale = 'de'"
          :style="{
            padding: '0.5rem 1rem',
            background: locale === 'de' ? '#4CAF50' : '#ddd',
            color: locale === 'de' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }"
        >
          Deutsch
        </button>
      </div>
      <p style="margin-top: 0.5rem; font-size: 0.9em; color: #666">
        Current locale: <strong>{{ locale }}</strong>
      </p>
    </div>

    <VormProvider>
      <AutoVorm as="form" @submit="handleSubmit" layout="stacked" />
    </VormProvider>

    <div style="margin-top: 2rem; padding: 1rem; background: #fff3cd; border-radius: 8px">
      <h3>✅ Test Checklist - NEW Features!</h3>
      <ul>
        <li><strong>🆕 Functions without computed():</strong> Labels/placeholders with <code>() => t('key')</code></li>
        <li><strong>🆕 FormContext access:</strong> Placeholder shows username, helpText uses email</li>
        <li><strong>🆕 Dynamic validation messages:</strong> Age error shows entered value</li>
        <li>Switch language → Everything updates immediately (no computed wrapper needed!)</li>
        <li>Built-in rules use i18n keys (required, email, minLength, between)</li>
        <li>Custom messages still work with computed/ref (backward compatible)</li>
        <li>No re-validation needed when switching language</li>
        <li>Untouched fields stay clean when changing language</li>
      </ul>
      <p style="margin-top: 1rem; padding: 0.5rem; background: #e3f2fd; border-radius: 4px">
        <strong>💡 Try this:</strong> Enter a username → see email placeholder change!<br>
        Enter email → see password helpText update!<br>
        Enter age → see custom error message with your value!
      </p>
    </div>

    <div style="margin-top: 2rem; padding: 1rem; background: #e3f2fd; border-radius: 8px">
      <h3>🔍 Form State</h3>
      <pre style="background: white; padding: 1rem; border-radius: 4px; overflow: auto">{{
        {
          formData: vorm.formData,
          errors: vorm.errors.value,
          touched: vorm.touched,
          isValid: vorm.isValid.value,
        }
      }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useVorm, VormProvider, AutoVorm, createVormI18n, minLength, between, type VormSchema } from 'vorm-vue';

// Reactive locale
const locale = ref<string>('en');

// Create i18n context with custom messages
const i18n = createVormI18n(locale, {
  en: {
    'custom.username.required': 'Username is mandatory!',
  },
  de: {
    'custom.username.required': 'Benutzername ist erforderlich!',
  },
});

// Reactive custom message using computed
const customUsernameMessage = computed(() => i18n.t('custom.username.required'));

// Schema with mixed message types and NEW reactive functions!
const schema: VormSchema = [
  {
    name: 'username',
    type: 'text',
    // NEW: Function without computed() wrapper!
    label: () => (locale.value === 'en' ? 'Username' : 'Benutzername'),
    placeholder: () => (locale.value === 'en' ? 'Enter your username' : 'Gib deinen Benutzernamen ein'),
    validation: [
      {
        rule: 'required',
        message: customUsernameMessage, // ← Still works with computed
      },
    ],
  },
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    // NEW: Dynamic placeholder with FormContext!
    placeholder: (ctx) => ctx.formData.username ? `${ctx.formData.username}@example.com` : 'your@email.com',
    validation: [
      {
        rule: 'required', // ← Uses built-in i18n key
      },
      {
        rule: 'email', // ← Uses built-in i18n key
      },
    ],
  },
  {
    name: 'password',
    type: 'password',
    // NEW: Function without computed()
    label: () => (locale.value === 'en' ? 'Password' : 'Passwort'),
    // NEW: Dynamic helpText based on form state!
    helpText: (ctx) => ctx.formData.email ?
      (locale.value === 'en' ? 'Secure password for ' + ctx.formData.email : 'Sicheres Passwort für ' + ctx.formData.email) :
      (locale.value === 'en' ? 'At least 8 characters' : 'Mindestens 8 Zeichen'),
    validation: [
      {
        rule: 'required', // ← Uses built-in i18n key
      },
      {
        rule: minLength(8), // ← Uses built-in i18n key with params
      },
    ],
  },
  {
    name: 'age',
    type: 'number',
    // NEW: Function without computed()
    label: () => (locale.value === 'en' ? 'Age' : 'Alter'),
    validation: [
      {
        rule: 'required',
      },
      {
        rule: between(18, 100), // ← Uses built-in i18n key with params
        // NEW: Dynamic validation message with FormContext!
        message: (ctx) => (locale.value === 'en' ?
          `Age must be between 18 and 100 (you entered: ${ctx.formData.age || 'nothing'})` :
          `Alter muss zwischen 18 und 100 liegen (du hast eingegeben: ${ctx.formData.age || 'nichts'})`)
      },
    ],
  },
];

// Initialize vorm with i18n
const vorm = useVorm(schema, {
  validationMode: 'onBlur',
  i18n,
});

async function handleSubmit(event: Event) {
  event.preventDefault();
  const isValid = await vorm.validate();
  if (isValid) {
    alert(locale.value === 'en' ? `Form is valid! Data: ${JSON.stringify(vorm.formData)}` : `Formular ist gültig! Daten: ${JSON.stringify(vorm.formData)}`);
  } else {
    alert(locale.value === 'en' ? 'Please fix the errors' : 'Bitte beheben Sie die Fehler');
  }
}
</script>
