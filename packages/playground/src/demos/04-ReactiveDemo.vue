<script setup lang="ts">
/**
 * Reactive Features - Everything in schema, AutoVorm does the rest!
 */
import { ref, watch, type InjectionKey } from "vue";
import { useVorm, type VormSchema, type FormContext, type VormContext, minLength, matchField } from "vorm-vue";
import { AutoVorm, VormProvider } from "vorm-vue/components";
import "./demo-styles.css";

// Unique keys for each form context
const i18nKey: InjectionKey<VormContext> = Symbol("i18n");
const disabledKey: InjectionKey<VormContext> = Symbol("disabled");
const showIfKey: InjectionKey<VormContext> = Symbol("showIf");
const optionsKey: InjectionKey<VormContext> = Symbol("options");

const activeTab = ref<"i18n" | "disabled" | "showif" | "options">("i18n");

// i18n setup
const locale = ref<"en" | "de">("en");
const t = (key: string): string => {
  const translations: Record<string, Record<string, string>> = {
    en: {
      "form.username": "Username",
      "form.username.placeholder": "Enter your username",
      "form.email": "Email Address",
      "form.password": "Password",
      "form.password.help": "At least 8 characters",
      "form.submit": "Submit",
      "form.reset": "Reset"
    },
    de: {
      "form.username": "Benutzername",
      "form.username.placeholder": "Benutzername eingeben",
      "form.email": "E-Mail-Adresse",
      "form.password": "Passwort",
      "form.password.help": "Mindestens 8 Zeichen",
      "form.submit": "Absenden",
      "form.reset": "Zurücksetzen"
    }
  };
  return translations[locale.value]?.[key] ?? key;
};

// i18n Schema - reactive labels via functions
const i18nSchema: VormSchema = [
  {
    name: "username",
    type: "text",
    label: () => t("form.username"),
    placeholder: () => t("form.username.placeholder"),
    validation: [{ rule: "required" }]
  },
  {
    name: "email",
    type: "email",
    label: () => t("form.email"),
    validation: [{ rule: "email" }]
  },
  {
    name: "password",
    type: "password",
    label: () => t("form.password"),
    helpText: () => t("form.password.help"),
    validation: [{ rule: minLength(8) }]
  }
];

// Reactive disabled - all in schema!
const disabledSchema: VormSchema = [
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "Enter email (5+ chars enables confirm)",
    helpText: (ctx: FormContext) => `${ctx.formData.email?.length || 0}/5 characters`,
    validation: [{ rule: "required" }, { rule: "email" }]
  },
  {
    name: "confirmEmail",
    type: "email",
    label: "Confirm Email",
    placeholder: "Disabled until email has 5+ chars",
    disabled: (ctx: FormContext) => !ctx.formData.email || ctx.formData.email.length < 5,
    validation: [{ rule: "required" }, { rule: matchField("email") }]
  },
  {
    name: "password",
    type: "password",
    label: "Password",
    placeholder: "Enter password (8+ chars enables confirm)",
    helpText: (ctx: FormContext) => `${ctx.formData.password?.length || 0}/8 characters`,
    validation: [{ rule: "required" }, { rule: minLength(8) }]
  },
  {
    name: "confirmPassword",
    type: "password",
    label: "Confirm Password",
    placeholder: "Disabled until password has 8+ chars",
    disabled: (ctx: FormContext) => !ctx.formData.password || ctx.formData.password.length < 8,
    validation: [{ rule: "required" }, { rule: matchField("password") }]
  },
  {
    name: "terms",
    type: "checkbox",
    label: "I accept the terms",
    validation: [{ rule: "required" }]
  }
];

// ShowIf - conditional visibility in schema
const showIfSchema: VormSchema = [
  {
    name: "hasAccount",
    type: "checkbox",
    label: "I already have an account"
  },
  {
    name: "loginEmail",
    type: "email",
    label: "Login Email",
    placeholder: "Your existing account email",
    showIf: { hasAccount: true },
    validation: [{ rule: "required" }, { rule: "email" }]
  },
  {
    name: "userType",
    type: "select",
    label: "User Type",
    options: [
      { label: "Select...", value: "", disabled: true },
      { label: "Individual", value: "individual" },
      { label: "Business", value: "business" },
      { label: "Enterprise", value: "enterprise" }
    ]
  },
  {
    name: "companyName",
    type: "text",
    label: "Company Name",
    placeholder: "Required for business/enterprise",
    showIf: (formData) => formData.userType === "business" || formData.userType === "enterprise",
    validation: [{ rule: "required" }]
  },
  {
    name: "vatNumber",
    type: "text",
    label: "VAT Number",
    placeholder: "Only for enterprise",
    showIf: { dependsOn: "userType", condition: (value) => value === "enterprise" }
  }
];

// Dynamic city options lookup
const cityOptionsMap: Record<string, Array<{ label: string; value: string }>> = {
  DE: [{ label: "Select city...", value: "" }, { label: "Berlin", value: "berlin" }, { label: "Munich", value: "munich" }],
  AT: [{ label: "Select city...", value: "" }, { label: "Vienna", value: "vienna" }, { label: "Salzburg", value: "salzburg" }],
  CH: [{ label: "Select city...", value: "" }, { label: "Zurich", value: "zurich" }, { label: "Geneva", value: "geneva" }]
};

// Reactive city options based on selected country
const currentCityOptions = ref<Array<{ label: string; value: string; disabled?: boolean }>>([{ label: "Select country first...", value: "", disabled: true }]);

// Dynamic options schema - uses reactive options via function
const optionsSchema: VormSchema = [
  {
    name: "country",
    type: "select",
    label: "Country",
    options: [
      { label: "Select country...", value: "", disabled: true },
      { label: "Germany", value: "DE" },
      { label: "Austria", value: "AT" },
      { label: "Switzerland", value: "CH" }
    ],
    validation: [{ rule: "required" }]
  },
  {
    name: "city",
    type: "select",
    label: "City",
    helpText: (ctx: FormContext) => ctx.formData.country ? `Cities in ${ctx.formData.country}` : "Select country first",
    options: () => currentCityOptions.value
  }
];

const i18nForm = useVorm(i18nSchema, { validationMode: "onBlur", key: i18nKey });
const disabledForm = useVorm(disabledSchema, { validationMode: "onBlur", key: disabledKey });
const showIfForm = useVorm(showIfSchema, { validationMode: "onBlur", key: showIfKey });
const optionsForm = useVorm(optionsSchema, { validationMode: "onBlur", key: optionsKey });

// Watch country changes and update city options
watch(() => optionsForm.formData.country, (country) => {
  if (country && cityOptionsMap[country]) {
    currentCityOptions.value = cityOptionsMap[country];
    optionsForm.formData.city = "";
  } else {
    currentCityOptions.value = [{ label: "Select country first...", value: "", disabled: true }];
  }
});
</script>

<template>
  <div class="demo-container">
    <div class="demo-header">
      <h1>Reactive Features</h1>
      <p>i18n, reactive disabled, showIf, dynamic options - all in schema!</p>
    </div>

    <div class="feature-box">
      <h3>Everything reactive in schema:</h3>
      <ul>
        <li><code>label: () => t('key')</code> - i18n without re-validation</li>
        <li><code>disabled: (ctx) => ...</code> - Reactive disabled</li>
        <li><code>showIf: { field: value }</code> - Conditional visibility</li>
        <li><code>fieldOptionsMap</code> - Dynamic options</li>
      </ul>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab" :class="{ active: activeTab === 'i18n' }" @click="activeTab = 'i18n'">i18n</button>
      <button class="tab" :class="{ active: activeTab === 'disabled' }" @click="activeTab = 'disabled'">Disabled</button>
      <button class="tab" :class="{ active: activeTab === 'showif' }" @click="activeTab = 'showif'">ShowIf</button>
      <button class="tab" :class="{ active: activeTab === 'options' }" @click="activeTab = 'options'">Options</button>
    </div>

    <!-- i18n -->
    <div v-if="activeTab === 'i18n'" class="form-container">
      <h2>Internationalization</h2>
      <div class="lang-switch">
        <button :class="{ active: locale === 'en' }" @click="locale = 'en'">English</button>
        <button :class="{ active: locale === 'de' }" @click="locale = 'de'">Deutsch</button>
      </div>
      <p style="color: #64748b; margin-bottom: 1rem;">Labels change without re-validation!</p>
      <VormProvider :context-key="i18nKey">
        <AutoVorm />
      </VormProvider>
      <div class="btn-group">
        <button class="btn btn-primary" @click="i18nForm.validate()">{{ t("form.submit") }}</button>
        <button class="btn btn-secondary" @click="i18nForm.resetForm()">{{ t("form.reset") }}</button>
      </div>
    </div>

    <!-- Reactive Disabled -->
    <div v-if="activeTab === 'disabled'" class="form-container">
      <h2>Reactive Disabled</h2>
      <p style="color: #64748b; margin-bottom: 1rem;">
        <code>disabled: (ctx) => !ctx.formData.email || ctx.formData.email.length &lt; 5</code>
      </p>
      <VormProvider :context-key="disabledKey">
        <AutoVorm />
      </VormProvider>
      <div class="btn-group">
        <button class="btn btn-primary" :disabled="!disabledForm.formData.terms" @click="disabledForm.validate()">
          {{ disabledForm.formData.terms ? 'Submit' : 'Accept terms first' }}
        </button>
        <button class="btn btn-secondary" @click="disabledForm.resetForm()">Reset</button>
      </div>
    </div>

    <!-- ShowIf -->
    <div v-if="activeTab === 'showif'" class="form-container">
      <h2>Conditional Visibility</h2>
      <p style="color: #64748b; margin-bottom: 1rem;">Fields appear based on other field values</p>
      <VormProvider :context-key="showIfKey">
        <AutoVorm />
      </VormProvider>
      <div class="btn-group">
        <button class="btn btn-primary" @click="showIfForm.validate()">Validate</button>
        <button class="btn btn-secondary" @click="showIfForm.resetForm()">Reset</button>
      </div>
    </div>

    <!-- Dynamic Options -->
    <div v-if="activeTab === 'options'" class="form-container">
      <h2>Dynamic Options</h2>
      <p style="color: #64748b; margin-bottom: 1rem;">City options change based on country selection</p>
      <VormProvider :context-key="optionsKey">
        <AutoVorm />
      </VormProvider>
      <div class="btn-group">
        <button class="btn btn-primary" @click="optionsForm.validate()">Validate</button>
        <button class="btn btn-secondary" @click="optionsForm.resetForm()">Reset</button>
      </div>
    </div>

    <!-- Debug -->
    <details class="debug-section">
      <summary>Debug</summary>
      <pre>{{ JSON.stringify({
  formData: activeTab === 'i18n' ? i18nForm.formData : activeTab === 'disabled' ? disabledForm.formData : activeTab === 'showif' ? showIfForm.formData : optionsForm.formData
}, null, 2) }}</pre>
    </details>
  </div>
</template>
