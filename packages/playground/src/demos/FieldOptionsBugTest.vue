<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useVorm, type VormSchema } from 'vorm-vue'
import { VormProvider, AutoVorm } from 'vorm-vue/components'

const schema: VormSchema = [
  {
    name: 'position',
    label: 'Position',
    type: 'select',
    validation: [{ rule: 'required', message: 'Please select a position' }]
  },
  {
    name: 'department',
    label: 'Department',
    type: 'select',
    validation: [{ rule: 'required', message: 'Please select a department' }]
  }
]

const {
  formData,
  errors,
  validate,
  setFormData
} = useVorm(schema, {
  validationMode: 'onInput'
})

const testResult = ref<string>('')

// CRITICAL TEST: Set field options WITHOUT explicitly setting field values
onMounted(() => {
  console.log('🔍 Before setFormData:', { formData: { ...formData } })

  // ❌ OLD BUG: This would NOT work - selects would be empty/no options
  // ✅ FIXED: This should now work - selects should have options
  setFormData(
    {}, // <-- Empty object! No explicit field values set (like position: '', department: '')
    {
      fieldOptions: {
        position: [
          { label: 'Select position...', value: '' },
          { label: 'Frontend Developer', value: 'frontend' },
          { label: 'Backend Developer', value: 'backend' },
          { label: 'Full Stack Developer', value: 'fullstack' },
          { label: 'DevOps Engineer', value: 'devops' }
        ],
        department: [
          { label: 'Select department...', value: '' },
          { label: 'Engineering', value: 'engineering' },
          { label: 'Design', value: 'design' },
          { label: 'Product', value: 'product' },
          { label: 'Marketing', value: 'marketing' }
        ]
      }
    }
  )

  console.log('✅ After setFormData:', { formData: { ...formData } })

  // Check if select elements have options
  setTimeout(() => {
    const positionSelect = document.querySelector('select[name="position"]') as HTMLSelectElement
    const departmentSelect = document.querySelector('select[name="department"]') as HTMLSelectElement

    const positionOptionsCount = positionSelect?.options.length || 0
    const departmentOptionsCount = departmentSelect?.options.length || 0

    if (positionOptionsCount > 0 && departmentOptionsCount > 0) {
      testResult.value = `✅ PASS: Select fields have options!\nPosition: ${positionOptionsCount} options\nDepartment: ${departmentOptionsCount} options`
    } else {
      testResult.value = `❌ FAIL: Select fields are empty!\nPosition: ${positionOptionsCount} options\nDepartment: ${departmentOptionsCount} options`
    }
  }, 100)
})

async function handleSubmit() {
  const isValid = await validate()
  if (isValid) {
    alert('✅ Form is valid!\n' + JSON.stringify(formData, null, 2))
  } else {
    alert('❌ Please fix the errors:\n' + JSON.stringify(errors, null, 2))
  }
}
</script>

<template>
  <div class="demo-container">
    <div class="header">
      <h1>🐛 Bug Fix Test: Field Options without Explicit Values</h1>
      <p class="subtitle">Testing setFormData() with empty data object and fieldOptions</p>
    </div>

    <div class="info-box">
      <h3>🔬 Test Case:</h3>
      <div class="code-snippet">
        <code>
          setFormData(<br>
          &nbsp;&nbsp;{}, // ← Empty! No explicit values like { position: '', department: '' }<br>
          &nbsp;&nbsp;{ fieldOptions: { position: [...], department: [...] } }<br>
          )
        </code>
      </div>
      <p>
        <strong>Expected:</strong> Select fields should have options even without explicitly setting field values to ''
      </p>
    </div>

    <div v-if="testResult" :class="['test-result', testResult.includes('PASS') ? 'success' : 'error']">
      <pre>{{ testResult }}</pre>
    </div>

    <div class="form-container">
      <h2>📝 Form</h2>
      <VormProvider v-model="formData" :schema="schema">
        <AutoVorm layout="stacked" />

        <button @click="handleSubmit" class="submit-btn">
          Validate & Submit
        </button>
      </VormProvider>
    </div>

    <div class="debug-section">
      <div class="debug-panel">
        <h3>📊 Form Data (Live)</h3>
        <pre>{{ formData }}</pre>
      </div>

      <div class="debug-panel">
        <h3>⚠️ Errors</h3>
        <pre>{{ errors }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2rem;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.info-box {
  background: #e7f3ff;
  border-left: 4px solid #2196F3;
  padding: 20px;
  margin-bottom: 25px;
  border-radius: 6px;
}

.info-box h3 {
  margin-top: 0;
  color: #1976D2;
  margin-bottom: 15px;
}

.code-snippet {
  background: #263238;
  color: #aed581;
  padding: 15px;
  border-radius: 4px;
  margin: 15px 0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  overflow-x: auto;
}

.code-snippet code {
  display: block;
  line-height: 1.6;
}

.test-result {
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 25px;
  font-weight: 600;
}

.test-result.success {
  background: #d4edda;
  border: 2px solid #28a745;
  color: #155724;
}

.test-result.error {
  background: #f8d7da;
  border: 2px solid #dc3545;
  color: #721c24;
}

.test-result pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
}

.form-container {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  margin-bottom: 25px;
}

.form-container h2 {
  margin-top: 0;
  color: #2c3e50;
  margin-bottom: 20px;
}

:deep(.vorm-group) {
  margin-bottom: 20px;
}

:deep(label) {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
  font-size: 14px;
}

:deep(select) {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
  font-family: system-ui, -apple-system, sans-serif;
}

:deep(select:focus) {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

:deep(.vorm-help) {
  color: #f44336;
  font-size: 14px;
  margin-top: 6px;
  font-weight: 500;
}

.submit-btn {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

.debug-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.debug-panel {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 20px;
  border-radius: 8px;
}

.debug-panel h3 {
  color: #3498db;
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 1rem;
}

.debug-panel pre {
  background: #34495e;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 13px;
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .debug-section {
    grid-template-columns: 1fr;
  }
}
</style>
