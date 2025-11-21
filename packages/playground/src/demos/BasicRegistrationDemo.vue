<script setup lang="ts">
import { VormProvider } from "vorm-vue";
import { matchField, useVorm, minLength, type VormSchema } from "vorm-vue";

const registrationSchema: VormSchema = [
  {
    name: "firstName",
    type: "text",
    label: "First Name",
    validation: [{ rule: "required" }],
  },
  {
    name: "lastName",
    type: "text",
    label: "Last Name",
    validation: [{ rule: "required" }],
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    validation: [{ rule: "required" }, { rule: "email" }],
  },
  {
    name: "emailConfirm",
    type: "email",
    label: "Confirm Email",
    validationMode: "onBlur",
    // 🔥 NEW: Disable until email has at least 5 characters
    disabled: (ctx) => !ctx.formData.email || ctx.formData.email.length < 5,
    validation: [
      { rule: "required", message: "Please confirm your email" },
      { rule: matchField("email"), affects: ["email"] },
    ],
  },
  {
    name: "password",
    type: "password",
    label: "Password",
    validation: [{ rule: "required" }, { rule: minLength(8) }],
  },
  {
    name: "passwordConfirm",
    type: "password",
    label: "Confirm Password",
    // 🔥 NEW: Disable until password has at least 8 characters
    disabled: (ctx) => !ctx.formData.password || ctx.formData.password.length < 8,
    validation: [
      { rule: "required" },
      { rule: matchField("password"), affects: ["password"] },
    ],
  },
  {
    name: "role",
    type: "select",
    label: "Role",
    options: [
      { label: "Select a role...", value: "", disabled: true },
      { label: "Software Developer", value: "dev" },
      { label: "DevOps Engineer", value: "devops" },
      { label: "Designer", value: "design" },
    ],
    validation: [{ rule: "required" }],
  },
  {
    name: "acceptTerms",
    type: "checkbox",
    label: "I accept the terms and conditions",
    validation: [{ rule: "required", message: "You must accept the terms" }],
  },
];

const vorm = useVorm(registrationSchema);

async function onSubmit() {
  if (await vorm.validate()) {
    console.log("✅ Valid data:", vorm.formData);
    alert("Registration successful! Check console for data.");
  } else {
    console.log("❌ Errors:", vorm.errors);
  }
}
</script>

<template>
  <div class="demo-container">
    <h1>📝 Registration Demo</h1>
    <p class="subtitle">Showcasing <strong>reactive disabled</strong> feature (Issue #34)</p>

    <div class="feature-box">
      <h3>🔥 New: Reactive Disabled</h3>
      <ul>
        <li><code>disabled: (ctx) => !ctx.formData.email || ctx.formData.email.length &lt; 5</code></li>
        <li>Confirm fields are disabled until their source field has enough characters</li>
        <li>Submit button disabled until terms accepted AND form is dirty</li>
      </ul>
    </div>

    <VormProvider>
      <form @submit.prevent="onSubmit" class="form-grid">
        <!-- Row 1: Name -->
        <div class="form-group">
          <label for="firstName">First Name</label>
          <input
            id="firstName"
            v-model="vorm.formData.firstName"
            placeholder="Enter first name"
            :class="{ 'error-input': vorm.errors.firstName }"
          />
          <span v-if="vorm.errors.firstName" class="error-text">{{ vorm.errors.firstName }}</span>
        </div>

        <div class="form-group">
          <label for="lastName">Last Name</label>
          <input
            id="lastName"
            v-model="vorm.formData.lastName"
            placeholder="Enter last name"
            :class="{ 'error-input': vorm.errors.lastName }"
          />
          <span v-if="vorm.errors.lastName" class="error-text">{{ vorm.errors.lastName }}</span>
        </div>

        <!-- Row 2: Email -->
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            v-model="vorm.formData.email"
            placeholder="Enter email"
            :class="{ 'error-input': vorm.errors.email }"
          />
          <span v-if="vorm.errors.email" class="error-text">{{ vorm.errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="emailConfirm">
            Confirm Email
            <span v-if="vorm.bindField('emailConfirm').value.disabled" class="disabled-hint">
              (enter email first)
            </span>
          </label>
          <input
            id="emailConfirm"
            type="email"
            v-model="vorm.formData.emailConfirm"
            placeholder="Confirm email"
            :disabled="vorm.bindField('emailConfirm').value.disabled"
            :class="{
              'error-input': vorm.errors.emailConfirm,
              'disabled-input': vorm.bindField('emailConfirm').value.disabled
            }"
          />
          <span v-if="vorm.errors.emailConfirm" class="error-text">{{ vorm.errors.emailConfirm }}</span>
        </div>

        <!-- Row 3: Password -->
        <div class="form-group">
          <label for="password">Password (min 8 chars)</label>
          <input
            id="password"
            type="password"
            v-model="vorm.formData.password"
            placeholder="Enter password"
            :class="{ 'error-input': vorm.errors.password }"
          />
          <span v-if="vorm.errors.password" class="error-text">{{ vorm.errors.password }}</span>
          <span v-else class="hint-text">{{ vorm.formData.password?.length || 0 }}/8 characters</span>
        </div>

        <div class="form-group">
          <label for="passwordConfirm">
            Confirm Password
            <span v-if="vorm.bindField('passwordConfirm').value.disabled" class="disabled-hint">
              (enter 8+ char password first)
            </span>
          </label>
          <input
            id="passwordConfirm"
            type="password"
            v-model="vorm.formData.passwordConfirm"
            placeholder="Confirm password"
            :disabled="vorm.bindField('passwordConfirm').value.disabled"
            :class="{
              'error-input': vorm.errors.passwordConfirm,
              'disabled-input': vorm.bindField('passwordConfirm').value.disabled
            }"
          />
          <span v-if="vorm.errors.passwordConfirm" class="error-text">{{ vorm.errors.passwordConfirm }}</span>
        </div>

        <!-- Row 4: Role (full width) -->
        <div class="form-group full-width">
          <label for="role">Role</label>
          <select
            id="role"
            v-model="vorm.formData.role"
            :class="{ 'error-input': vorm.errors.role }"
          >
            <option value="" disabled>Select a role...</option>
            <option value="dev">Software Developer</option>
            <option value="devops">DevOps Engineer</option>
            <option value="design">Designer</option>
          </select>
          <span v-if="vorm.errors.role" class="error-text">{{ vorm.errors.role }}</span>
        </div>

        <!-- Row 5: Terms -->
        <div class="form-group full-width checkbox-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="vorm.formData.acceptTerms"
            />
            I accept the terms and conditions
          </label>
          <span v-if="vorm.errors.acceptTerms" class="error-text">{{ vorm.errors.acceptTerms }}</span>
        </div>

        <!-- Row 6: Submit -->
        <div class="form-group full-width">
          <button
            type="submit"
            class="submit-btn"
            :disabled="!vorm.formData.acceptTerms"
            :class="{ 'disabled-btn': !vorm.formData.acceptTerms }"
          >
            {{ vorm.formData.acceptTerms ? '🚀 Register' : '⏳ Accept terms to register' }}
          </button>
        </div>
      </form>
    </VormProvider>

    <!-- Debug -->
    <details class="debug-section">
      <summary>🔍 Debug: Form State</summary>
      <pre>{{ JSON.stringify({
        formData: vorm.formData,
        errors: vorm.errors,
        isDirty: vorm.isDirty.value,
        isValid: vorm.isValid.value,
      }, null, 2) }}</pre>
    </details>
  </div>
</template>

<style scoped>
.demo-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.subtitle {
  color: #666;
  margin-bottom: 1.5rem;
}

.feature-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.feature-box h3 {
  margin-top: 0;
}

.feature-box ul {
  margin-bottom: 0;
}

.feature-box code {
  background: rgba(255,255,255,0.2);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.85rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.disabled-hint {
  font-weight: normal;
  color: #999;
  font-size: 0.85rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s, background-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #667eea;
  outline: none;
}

.error-input {
  border-color: #e53e3e !important;
}

.disabled-input {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.error-text {
  color: #e53e3e;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.hint-text {
  color: #999;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input {
  width: 1.2rem;
  height: 1.2rem;
}

.submit-btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.disabled-btn {
  background: #ccc;
  cursor: not-allowed;
}

.debug-section {
  margin-top: 2rem;
  padding: 1rem;
  background: #1a1a2e;
  border-radius: 8px;
  color: #fff;
}

.debug-section summary {
  cursor: pointer;
  font-weight: 600;
}

.debug-section pre {
  margin: 1rem 0 0;
  font-size: 0.85rem;
  overflow: auto;
}
</style>
