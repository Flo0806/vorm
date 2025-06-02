<script setup lang="ts">
import { VormProvider } from "vorm/components";
import { matchField, useVorm, type VormSchema } from "vorm";

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
    name: "gender",
    type: "radio",
    label: "Gender",
    options: ["Male", "Female", "Other"],
    validation: [{ rule: "required" }],
  },
  {
    name: "address",
    type: "text",
    label: "Address",
    validation: [{ rule: "required" }],
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    validation: [{ rule: "required", message: "Email is required" }],
  },
  {
    name: "emailConfirm",
    type: "email",
    label: "Confirm Email",
    validationMode: "onBlur",
    validation: [
      { rule: "required", message: "Please confirm your email" },
      { rule: matchField("email"), affects: ["email"] },
    ],
  },
  {
    name: "role",
    type: "select",
    label: "Role",
    options: ["Softwareentwickler", "Devops"],
    validation: [{ rule: "required" }],
  },
  {
    name: "specialization",
    type: "select",
    label: "Specialization",
    options: (formData) => {
      if (formData.role === "Softwareentwickler")
        return ["React", "Vue", "Angular"];
      if (formData.role === "Devops") return ["Python", "Azure"];
      return [];
    },
    visibility: (formData) => !!formData.role,
    validation: [{ rule: "required" }],
  },
  { name: "bio", type: "textarea", label: "About You" },
  {
    name: "acceptTerms",
    type: "checkbox",
    label: "I accept the terms and conditions",
    validation: [{ rule: "required", message: "You must accept the terms" }],
  },
];

const { formData, errors, validate } = useVorm(registrationSchema);

async function onSubmit() {
  if (await validate()) {
    console.log("Valid data:", formData);
  } else {
    console.log("Errors:", errors);
  }
}
</script>

<template>
  <h1>📝 Registration Demo</h1>
  <VormProvider v-model="formData">
    <div class="grid grid-cols-2 gap-4">
      <!-- Left Column -->
      <div>
        <!-- First Name -->
        <div>
          <input
            v-model="formData.firstName"
            placeholder="First Name"
            :class="{ 'error-border': errors.firstName }"
          />
          <span v-if="errors.firstName" class="error-message">{{
            errors.firstName
          }}</span>
        </div>

        <!-- Last Name -->
        <div>
          <input
            v-model="formData.lastName"
            placeholder="Last Name"
            :class="{ 'error-border': errors.lastName }"
          />
          <span v-if="errors.lastName" class="error-message">{{
            errors.lastName
          }}</span>
        </div>

        <!-- Gender -->
        <div>
          <label>Gender:</label>
          <div>
            <label v-for="option in ['Male', 'Female', 'Other']" :key="option">
              <input type="radio" :value="option" v-model="formData.gender" />
              {{ option }}
            </label>
          </div>
          <span v-if="errors.gender" class="error-message">{{
            errors.gender
          }}</span>
        </div>

        <!-- Address -->
        <div>
          <input
            v-model="formData.address"
            placeholder="Address"
            :class="{ 'error-border': errors.address }"
          />
          <span v-if="errors.address" class="error-message">{{
            errors.address
          }}</span>
        </div>
      </div>

      <!-- Right Column -->
      <div>
        <!-- Email -->
        <div>
          <input
            v-model="formData.email"
            placeholder="Email"
            :class="{ 'error-border': errors.email }"
          />
          <span v-if="errors.email" class="error-message">{{
            errors.email
          }}</span>
        </div>

        <!-- Confirm Email -->
        <div>
          <input
            v-model="formData.emailConfirm"
            placeholder="Confirm Email"
            :class="{ 'error-border': errors.emailConfirm }"
          />
          <span v-if="errors.emailConfirm" class="error-message">{{
            errors.emailConfirm
          }}</span>
        </div>

        <!-- Role -->
        <div>
          <select
            v-model="formData.role"
            :class="{ 'error-border': errors.role }"
          >
            <option disabled value="">Select Role</option>
            <option>Softwareentwickler</option>
            <option>Devops</option>
          </select>
          <span v-if="errors.role" class="error-message">{{
            errors.role
          }}</span>
        </div>

        <!-- Specialization (Dynamic) -->
        <div v-if="formData.role">
          <select
            v-model="formData.specialization"
            :class="{ 'error-border': errors.specialization }"
          >
            <option disabled value="">Select Specialization</option>
            <option
              v-for="option in formData.role === 'Softwareentwickler'
                ? ['React', 'Vue', 'Angular']
                : ['Python', 'Azure']"
              :key="option"
            >
              {{ option }}
            </option>
          </select>
          <span v-if="errors.specialization" class="error-message">{{
            errors.specialization
          }}</span>
        </div>
      </div>

      <!-- Full Width Section -->
      <div class="col-span-2">
        <!-- Bio -->
        <div>
          <textarea
            v-model="formData.bio"
            placeholder="Tell us about yourself"
          ></textarea>
        </div>

        <!-- Terms -->
        <div>
          <label>
            <input type="checkbox" v-model="formData.acceptTerms" />
            I accept the terms and conditions
          </label>
          <span v-if="errors.acceptTerms" class="error-message">{{
            errors.acceptTerms
          }}</span>
        </div>

        <!-- Submit -->
        <button @click="onSubmit">Register</button>
      </div>
    </div>
  </VormProvider>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
textarea {
  width: 100%;
  min-height: 80px;
  margin-top: 0.5rem;
}
.error-border {
  border: 1px solid red;
  outline: none;
}

.error-message {
  color: red;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}
</style>
