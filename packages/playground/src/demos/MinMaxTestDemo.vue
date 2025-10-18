<script setup lang="ts">
import { VormProvider } from "vorm/components";
import { min, max, minLength, maxLength, matchField, useVorm, type VormSchema } from "vorm";

const testSchema: VormSchema = [
  {
    name: "username",
    type: "text",
    label: "Username (minLength 3 characters)",
    validation: [
      { rule: "required" },
      { rule: minLength(3), message: "Username must be at least 3 characters" }
    ]
  },
  {
    name: "age",
    type: "number",
    label: "Age (min 18, max 100)",
    validation: [
      { rule: "required" },
      { rule: min(18), message: "You must be at least 18 years old" },
      { rule: max(100), message: "Age must be at most 100" }
    ]
  },
  {
    name: "password",
    type: "password",
    label: "Password (minLength 8 characters, maxLength 50)",
    validation: [
      { rule: "required" },
      { rule: minLength(8), message: "Password must be at least 8 characters" },
      { rule: maxLength(50), message: "Password must be at most 50 characters" }
    ]
  },
  {
    name: "passwordConfirm",
    type: "password",
    label: "Confirm Password",
    validation: [
      { rule: "required" },
      { rule: matchField("password"), message: "Passwords must match" }
    ]
  },
  {
    name: "bio",
    type: "textarea",
    label: "Bio (minLength 10, maxLength 200)",
    validation: [
      { rule: minLength(10), message: "Bio must be at least 10 characters" },
      { rule: maxLength(200), message: "Bio must be at most 200 characters" }
    ]
  }
];

const { formData, errors, validate } = useVorm(testSchema, {
  validationMode: 'onInput'
});

async function onSubmit() {
  if (await validate()) {
    console.log("✅ Valid data:", formData);
  } else {
    console.log("❌ Validation errors:", errors);
  }
}
</script>

<template>
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1>🧪 Min/Max/MatchField Test Demo</h1>

    <VormProvider v-model="formData">
      <div style="display: flex; flex-direction: column; gap: 15px;">
        <!-- Username -->
        <div>
          <label>{{ testSchema[0].label }}</label>
          <input
            v-model="formData.username"
            type="text"
            :class="{ 'error-border': errors.username }"
          />
          <span v-if="errors.username" class="error-message">
            {{ errors.username }}
          </span>
          <small style="color: gray;">Current length: {{ formData.username?.length || 0 }}</small>
        </div>

        <!-- Age -->
        <div>
          <label>{{ testSchema[1].label }}</label>
          <input
            v-model="formData.age"
            type="number"
            :class="{ 'error-border': errors.age }"
          />
          <span v-if="errors.age" class="error-message">
            {{ errors.age }}
          </span>
          <small style="color: gray;">Current value: {{ formData.age || 'none' }}</small>
        </div>

        <!-- Password -->
        <div>
          <label>{{ testSchema[2].label }}</label>
          <input
            v-model="formData.password"
            type="password"
            :class="{ 'error-border': errors.password }"
          />
          <span v-if="errors.password" class="error-message">
            {{ errors.password }}
          </span>
          <small style="color: gray;">Current length: {{ formData.password?.length || 0 }}</small>
        </div>

        <!-- Password Confirm -->
        <div>
          <label>{{ testSchema[3].label }}</label>
          <input
            v-model="formData.passwordConfirm"
            type="password"
            :class="{ 'error-border': errors.passwordConfirm }"
          />
          <span v-if="errors.passwordConfirm" class="error-message">
            {{ errors.passwordConfirm }}
          </span>
          <small style="color: gray;">Matches: {{ formData.password === formData.passwordConfirm ? 'Yes' : 'No' }}</small>
        </div>

        <!-- Bio -->
        <div>
          <label>{{ testSchema[4].label }}</label>
          <textarea
            v-model="formData.bio"
            :class="{ 'error-border': errors.bio }"
            rows="3"
          ></textarea>
          <span v-if="errors.bio" class="error-message">
            {{ errors.bio }}
          </span>
          <small style="color: gray;">Current length: {{ formData.bio?.length || 0 }}</small>
        </div>

        <!-- Submit -->
        <button @click="onSubmit" style="padding: 10px 20px;">
          Validate & Submit
        </button>
      </div>
    </VormProvider>

    <!-- Debug Info -->
    <div style="margin-top: 30px; padding: 15px; background: #f5f5f5; border-radius: 5px;">
      <h3>Debug Info</h3>
      <pre style="font-size: 12px;">{{ { formData, errors } }}</pre>
    </div>
  </div>
</template>

<style scoped>
input, textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.error-border {
  border-color: red !important;
}

.error-message {
  color: red;
  font-size: 12px;
  display: block;
  margin-top: 4px;
}

label {
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
}

button {
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background: #45a049;
}
</style>
