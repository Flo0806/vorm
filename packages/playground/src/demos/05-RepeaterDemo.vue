<script setup lang="ts">
/**
 * Repeater Demo - Dynamic arrays with nested structures
 * Shows: Basic repeaters, nested repeaters, template inheritance, custom slots
 */
import { ref } from "vue";
import { useVorm, type VormSchema } from "vorm-vue";
import { AutoVorm, VormProvider } from "vorm-vue/components";
import "./demo-styles.css";

const activeTab = ref<"basic" | "nested" | "inheritance">("basic");

// Unique keys for each form
const basicKey = Symbol("basic");
const nestedKey = Symbol("nested");
const inheritanceKey = Symbol("inheritance");

// Basic Repeater - Team Members
const basicSchema: VormSchema = [
  {
    name: "teamName",
    type: "text",
    label: "Team Name",
    placeholder: "e.g., Frontend Team",
    validation: [{ rule: "required" }]
  },
  {
    name: "members",
    type: "repeater",
    label: "Team Members",
    fields: [
      {
        name: "name",
        type: "text",
        label: "Name",
        placeholder: "Full name",
        validation: [{ rule: "required" }]
      },
      {
        name: "role",
        type: "select",
        label: "Role",
        placeholder: "Select role...",
        options: [
          { label: "Developer", value: "dev" },
          { label: "Designer", value: "design" },
          { label: "Manager", value: "manager" },
          { label: "QA", value: "qa" }
        ],
        validation: [{ rule: "required" }]
      },
      {
        name: "email",
        type: "email",
        label: "Email",
        placeholder: "work@email.com",
        validation: [{ rule: "required" }, { rule: "email" }]
      }
    ]
  }
];

// Nested Repeater - Projects with Tasks and Subtasks (3 levels!)
const nestedSchema: VormSchema = [
  {
    name: "company",
    type: "text",
    label: "Company Name",
    placeholder: "e.g., Acme Corp",
    validation: [{ rule: "required" }]
  },
  {
    name: "projects",
    type: "repeater",
    label: "Projects",
    fields: [
      {
        name: "name",
        type: "text",
        label: "Project Name",
        placeholder: "e.g., Website Redesign",
        validation: [{ rule: "required" }]
      },
      {
        name: "status",
        type: "select",
        label: "Status",
        options: [
          { label: "Planning", value: "planning" },
          { label: "In Progress", value: "progress" },
          { label: "Review", value: "review" },
          { label: "Done", value: "done" }
        ]
      },
      {
        name: "tasks",
        type: "repeater",
        label: "Tasks",
        fields: [
          {
            name: "title",
            type: "text",
            label: "Task",
            placeholder: "What needs to be done?",
            validation: [{ rule: "required" }]
          },
          {
            name: "priority",
            type: "select",
            label: "Priority",
            options: [
              { label: "Low", value: "low" },
              { label: "Medium", value: "medium" },
              { label: "High", value: "high" },
              { label: "Critical", value: "critical" }
            ]
          },
          {
            name: "subtasks",
            type: "repeater",
            label: "Subtasks",
            fields: [
              {
                name: "description",
                type: "text",
                label: "Subtask",
                placeholder: "Subtask description"
              },
              {
                name: "done",
                type: "checkbox",
                label: "Completed"
              }
            ]
          }
        ]
      }
    ]
  }
];

// Template Inheritance Demo - wrapper:email applies to ALL email fields
const inheritanceSchema: VormSchema = [
  {
    name: "adminEmail",
    type: "email",
    label: "Admin Email",
    placeholder: "admin@company.com",
    validation: [{ rule: "required" }, { rule: "email" }]
  },
  {
    name: "departments",
    type: "repeater",
    label: "Departments",
    fields: [
      {
        name: "name",
        type: "text",
        label: "Department Name",
        validation: [{ rule: "required" }]
      },
      {
        name: "email",
        type: "email",
        label: "Department Email",
        placeholder: "dept@company.com",
        inheritWrapper: true,
        // inheritWrapper: true is default - inherits #wrapper:email
        validation: [{ rule: "email" }]
      },
      {
        name: "employees",
        type: "repeater",
        label: "Employees",
        fields: [
          {
            name: "name",
            type: "text",
            label: "Employee Name",
            validation: [{ rule: "required" }]
          },
          {
            name: "email",
            type: "email",
            label: "Employee Email",
            placeholder: "employee@company.com",
            inheritWrapper: true,
            // This also inherits #wrapper:email!
            validation: [{ rule: "email" }]
          },
          {
            name: "phone",
            type: "text",
            label: "Phone",
            placeholder: "+1 234 567 890"
          }
        ]
      }
    ]
  }
];

const basicForm = useVorm(basicSchema, { key: basicKey });
const nestedForm = useVorm(nestedSchema, { key: nestedKey });
const inheritanceForm = useVorm(inheritanceSchema, { key: inheritanceKey });

// Initialize with some data
basicForm.formData.members = [{ name: "", role: "", email: "" }];
nestedForm.formData.projects = [{ name: "", status: "planning", tasks: [] }];
inheritanceForm.formData.departments = [{ name: "", email: "", employees: [] }];
</script>

<template>
  <div class="demo-container">
    <div class="demo-header">
      <h1>Repeater - Dynamic Arrays</h1>
      <p>Nested structures, template inheritance, unlimited depth</p>
    </div>

    <div class="feature-box">
      <h3>Repeater Features:</h3>
      <ul>
        <li><code>type: "repeater"</code> - Dynamic array fields</li>
        <li><code>addRepeaterItem(path, item)</code> / <code>removeRepeaterItem(path, index)</code></li>
        <li>Nested repeaters - Unlimited depth (projects → tasks → subtasks)</li>
        <li><code>#wrapper:email</code> - Template inheritance to ALL email fields</li>
        <li>Min/max via UI logic (disable buttons when limit reached)</li>
      </ul>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab" :class="{ active: activeTab === 'basic' }" @click="activeTab = 'basic'">Basic</button>
      <button class="tab" :class="{ active: activeTab === 'nested' }" @click="activeTab = 'nested'">Nested (3 levels)</button>
      <button class="tab" :class="{ active: activeTab === 'inheritance' }" @click="activeTab = 'inheritance'">Template Inheritance</button>
    </div>

    <!-- Basic Repeater -->
    <div v-if="activeTab === 'basic'" class="form-container">
      <h2>Basic Repeater - Team Members</h2>
      <p style="color: #64748b; margin-bottom: 1rem;">
        Dynamic array with min 1, max 5 (enforced via UI)
      </p>
      <VormProvider :context-key="basicKey">
        <!-- Team Name (non-repeater field) -->
        <AutoVorm :only="['teamName']" />

        <!-- Repeater section with manual control -->
        <div class="repeater-section">
          <div class="repeater-header">
            <h3>Team Members ({{ basicForm.formData.members?.length || 0 }})</h3>
            <button
              type="button"
              class="btn btn-small btn-add"
              @click="basicForm.addRepeaterItem('members', { name: '', role: '', email: '' })"
              :disabled="(basicForm.formData.members?.length || 0) >= 5"
            >
              + Add Member {{ (basicForm.formData.members?.length || 0) >= 5 ? '(max 5)' : '' }}
            </button>
          </div>

          <TransitionGroup name="repeater-anim" tag="div">
            <div
              v-for="(member, index) in basicForm.formData.members"
              :key="`member-${index}-${member.name || 'new'}`"
              class="repeater-item"
            >
              <div class="repeater-item-header">
                <span class="item-number">#{{ index + 1 }}</span>
                <button
                  type="button"
                  class="btn-remove"
                  @click="basicForm.removeRepeaterItem('members', index)"
                  :disabled="basicForm.formData.members?.length <= 1"
                >
                  ✕
                </button>
              </div>
              <AutoVorm :only="[`members[${index}].name`, `members[${index}].role`, `members[${index}].email`]" />
            </div>
          </TransitionGroup>
        </div>
      </VormProvider>
      <div class="btn-group">
        <button class="btn btn-primary" @click="basicForm.validate()">Validate</button>
        <button class="btn btn-secondary" @click="basicForm.resetForm()">Reset</button>
      </div>
    </div>

    <!-- Nested Repeater (3 levels) -->
    <div v-if="activeTab === 'nested'" class="form-container">
      <h2>Triple Nested Repeater</h2>
      <p style="color: #64748b; margin-bottom: 1rem;">
        Projects → Tasks → Subtasks (3 levels deep!)
      </p>
      <VormProvider :context-key="nestedKey">
        <AutoVorm :only="['company']" />

        <!-- Projects (Level 1) -->
        <div class="repeater-section">
          <div class="repeater-header">
            <h3>Projects ({{ nestedForm.formData.projects?.length || 0 }})</h3>
            <button type="button" class="btn btn-small btn-add"
              @click="nestedForm.addRepeaterItem('projects', { name: '', status: 'planning', tasks: [] })">
              + Add Project
            </button>
          </div>

          <TransitionGroup name="repeater-anim" tag="div">
            <div v-for="(project, pi) in nestedForm.formData.projects" :key="`project-${pi}`" class="repeater-item nested-level-1">
              <div class="repeater-item-header">
                <span class="item-number">Project #{{ pi + 1 }}</span>
                <button type="button" class="btn-remove" @click="nestedForm.removeRepeaterItem('projects', pi)"
                  :disabled="nestedForm.formData.projects?.length <= 1">✕</button>
              </div>
              <AutoVorm :only="[`projects[${pi}].name`, `projects[${pi}].status`]" />

              <!-- Tasks (Level 2) -->
              <div class="repeater-section nested">
                <div class="repeater-header">
                  <h4>Tasks ({{ project.tasks?.length || 0 }})</h4>
                  <button type="button" class="btn btn-small btn-add"
                    @click="nestedForm.addRepeaterItem(`projects[${pi}].tasks`, { title: '', priority: 'medium', subtasks: [] })">
                    + Task
                  </button>
                </div>

                <TransitionGroup name="repeater-anim" tag="div">
                  <div v-for="(task, ti) in project.tasks" :key="`task-${pi}-${ti}`" class="repeater-item nested-level-2">
                    <div class="repeater-item-header">
                      <span class="item-number">Task #{{ ti + 1 }}</span>
                      <button type="button" class="btn-remove" @click="nestedForm.removeRepeaterItem(`projects[${pi}].tasks`, ti)">✕</button>
                    </div>
                    <AutoVorm :only="[`projects[${pi}].tasks[${ti}].title`, `projects[${pi}].tasks[${ti}].priority`]" />

                    <!-- Subtasks (Level 3) -->
                    <div class="repeater-section nested">
                      <div class="repeater-header">
                        <h5>Subtasks ({{ task.subtasks?.length || 0 }})</h5>
                        <button type="button" class="btn btn-small btn-add"
                          @click="nestedForm.addRepeaterItem(`projects[${pi}].tasks[${ti}].subtasks`, { description: '', done: false })">
                          + Subtask
                        </button>
                      </div>

                      <TransitionGroup name="repeater-anim" tag="div">
                        <div v-for="(_subtask, si) in task.subtasks" :key="`subtask-${pi}-${ti}-${si}`" class="repeater-item nested-level-3">
                          <div class="repeater-item-header">
                            <span class="item-number">#{{ si + 1 }}</span>
                            <button type="button" class="btn-remove" @click="nestedForm.removeRepeaterItem(`projects[${pi}].tasks[${ti}].subtasks`, si)">✕</button>
                          </div>
                          <AutoVorm :only="[`projects[${pi}].tasks[${ti}].subtasks[${si}].description`, `projects[${pi}].tasks[${ti}].subtasks[${si}].done`]" />
                        </div>
                      </TransitionGroup>
                    </div>
                  </div>
                </TransitionGroup>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </VormProvider>
      <div class="btn-group">
        <button class="btn btn-primary" @click="nestedForm.validate()">Validate</button>
        <button class="btn btn-secondary" @click="nestedForm.resetForm()">Reset</button>
      </div>
    </div>

    <!-- Template Inheritance -->
    <div v-if="activeTab === 'inheritance'" class="form-container">
      <h2>Template Inheritance</h2>
      <p style="color: #64748b; margin-bottom: 1rem;">
        <code>#wrapper:email</code> applies custom styling to ALL email fields - even deeply nested ones!
      </p>
      <VormProvider :context-key="inheritanceKey">
        <!-- Admin Email (top level - also gets the wrapper!) -->
        <AutoVorm :only="['adminEmail']">
          <template #wrapper:email="{ field, content, state }">
            <div class="email-wrapper" :class="{ 'has-error': state.error }">
              <div class="email-icon">📧</div>
              <div class="email-content">
                <label>{{ field.label }} <span class="inherited-badge">inherited</span></label>
                <component :is="content()" />
                <span v-if="state.error" class="error-text">{{ state.error }}</span>
              </div>
            </div>
          </template>
        </AutoVorm>

        <!-- Departments (Level 1) -->
        <div class="repeater-section">
          <div class="repeater-header">
            <h3>Departments ({{ inheritanceForm.formData.departments?.length || 0 }})</h3>
            <button type="button" class="btn btn-small btn-add"
              @click="inheritanceForm.addRepeaterItem('departments', { name: '', email: '', employees: [] })">
              + Add Department
            </button>
          </div>

          <TransitionGroup name="repeater-anim" tag="div">
            <div v-for="(dept, di) in inheritanceForm.formData.departments" :key="`dept-${di}`" class="repeater-item nested-level-1">
              <div class="repeater-item-header">
                <span class="item-number">Department #{{ di + 1 }}</span>
                <button type="button" class="btn-remove" @click="inheritanceForm.removeRepeaterItem('departments', di)"
                  :disabled="inheritanceForm.formData.departments?.length <= 1">✕</button>
              </div>

              <!-- Department fields with inherited email wrapper -->
              <AutoVorm :only="[`departments[${di}].name`, `departments[${di}].email`]">
                <template #wrapper:email="{ field, content, state }">
                  <div class="email-wrapper" :class="{ 'has-error': state.error }">
                    <div class="email-icon">📧</div>
                    <div class="email-content">
                      <label>{{ field.label }} <span class="inherited-badge">inherited</span></label>
                      <component :is="content()" />
                      <span v-if="state.error" class="error-text">{{ state.error }}</span>
                    </div>
                  </div>
                </template>
              </AutoVorm>

              <!-- Employees (Level 2) -->
              <div class="repeater-section nested">
                <div class="repeater-header">
                  <h4>Employees ({{ dept.employees?.length || 0 }})</h4>
                  <button type="button" class="btn btn-small btn-add"
                    @click="inheritanceForm.addRepeaterItem(`departments[${di}].employees`, { name: '', email: '', phone: '' })">
                    + Employee
                  </button>
                </div>

                <TransitionGroup name="repeater-anim" tag="div">
                  <div v-for="(_emp, ei) in dept.employees" :key="`emp-${di}-${ei}`" class="repeater-item nested-level-2">
                    <div class="repeater-item-header">
                      <span class="item-number">Employee #{{ ei + 1 }}</span>
                      <button type="button" class="btn-remove" @click="inheritanceForm.removeRepeaterItem(`departments[${di}].employees`, ei)">✕</button>
                    </div>

                    <!-- Employee fields with inherited email wrapper -->
                    <AutoVorm :only="[`departments[${di}].employees[${ei}].name`, `departments[${di}].employees[${ei}].email`, `departments[${di}].employees[${ei}].phone`]">
                      <template #wrapper:email="{ field, content, state }">
                        <div class="email-wrapper" :class="{ 'has-error': state.error }">
                          <div class="email-icon">📧</div>
                          <div class="email-content">
                            <label>{{ field.label }} <span class="inherited-badge">inherited</span></label>
                            <component :is="content()" />
                            <span v-if="state.error" class="error-text">{{ state.error }}</span>
                          </div>
                        </div>
                      </template>
                    </AutoVorm>
                  </div>
                </TransitionGroup>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </VormProvider>
      <div class="btn-group">
        <button class="btn btn-primary" @click="inheritanceForm.validate()">Validate</button>
        <button class="btn btn-secondary" @click="inheritanceForm.resetForm()">Reset</button>
      </div>
    </div>

    <!-- Debug -->
    <details class="debug-section">
      <summary>Debug: Form Data & Errors</summary>
      <pre>{{ JSON.stringify({
  formData: activeTab === 'basic' ? basicForm.formData
          : activeTab === 'nested' ? nestedForm.formData
          : inheritanceForm.formData,
  errors: activeTab === 'basic' ? basicForm.errors.value
        : activeTab === 'nested' ? nestedForm.errors.value
        : inheritanceForm.errors.value
}, null, 2) }}</pre>
    </details>
  </div>
</template>

<style scoped>
/* Custom email wrapper styling for inheritance demo */
.email-wrapper {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border: 2px solid #c7d2fe;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: all 0.2s;
}

.email-wrapper:hover {
  border-color: #a5b4fc;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
}

.email-wrapper.has-error {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fca5a5;
}

.email-icon {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
}

.email-content {
  flex: 1;
}

.email-content label {
  display: block;
  font-weight: 600;
  color: #4338ca;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
}

.email-content input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #c7d2fe;
  border-radius: 4px;
  font-size: 0.9rem;
}

.email-content input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.inherited-badge {
  font-size: 0.65rem;
  background: #6366f1;
  color: white;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  margin-left: 0.5rem;
  vertical-align: middle;
}

.error-text {
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}

/* Repeater styling */
.repeater-section {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.repeater-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.repeater-header h3,
.repeater-header h4,
.repeater-header h5 {
  margin: 0;
  font-size: 1rem;
  color: #475569;
}

.repeater-header h4 {
  font-size: 0.9rem;
}

.repeater-header h5 {
  font-size: 0.85rem;
}

.btn-small {
  padding: 0.375rem 0.75rem;
  font-size: 0.85rem;
}

.btn-add {
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-add:hover {
  background: #059669;
}

.repeater-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 0.75rem;
}

.repeater-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.item-number {
  font-weight: 600;
  color: #6366f1;
  font-size: 0.9rem;
}

.btn-remove {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove:hover:not(:disabled) {
  background: #fca5a5;
}

.btn-remove:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* TransitionGroup animations */
.repeater-anim-enter-active,
.repeater-anim-leave-active {
  transition: all 0.3s ease;
}

.repeater-anim-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.repeater-anim-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.repeater-anim-move {
  transition: transform 0.3s ease;
}

/* Nested level styling */
.repeater-section.nested {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  background: #f1f5f9;
}

.nested-level-1 {
  border-left: 3px solid #6366f1;
}

.nested-level-2 {
  border-left: 3px solid #10b981;
}

.nested-level-3 {
  border-left: 3px solid #f59e0b;
}

.btn-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
