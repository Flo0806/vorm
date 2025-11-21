<template>
  <div style="padding: 2rem; max-width: 1200px; margin: 0 auto">
    <h1>🎯 Vorm Options & AutoVorm Demo</h1>
    <p>Testing schema options and AutoVorm slot bindings</p>

    <div style="margin: 2rem 0; padding: 1rem; background: #f0f0f0; border-radius: 8px">
      <h3>Feature Status</h3>
      <ul>
        <li>✅ Option type with custom data ([key: string]: any)</li>
        <li>✅ ReactiveOptions type (Ref, Computed, Function, Async)</li>
        <li>✅ VormFieldSchema.options added</li>
        <li>✅ getFieldOptions() helper</li>
        <li>✅ Backward compatibility with fieldOptionsMap</li>
        <li>✅ AutoVorm with automatic options rendering</li>
        <li>✅ AutoVorm slot bindings (modelValue, items, error, etc.)</li>
        <li>✅ vorm.bindField() for edge cases</li>
      </ul>
    </div>

    <VormProvider>
      <div style="display: grid; gap: 2rem;">

        <!-- Section 1: Static Options in Schema -->
        <section style="padding: 1.5rem; border: 2px solid #4CAF50; border-radius: 8px">
          <h2>1. Static Options in Schema</h2>
          <p>Options defined directly in the schema</p>

          <div style="margin-top: 1rem">
            <label>Country:</label>
            <select
              v-model="vorm.formData.country"
              style="width: 100%; padding: 0.5rem; margin-top: 0.5rem"
            >
              <option value="">Select country...</option>
              <option
                v-for="opt in countryOptions"
                :key="typeof opt === 'string' ? opt : opt.value"
                :value="typeof opt === 'string' ? opt : opt.value"
                :disabled="typeof opt === 'object' && opt.disabled"
              >
                {{ typeof opt === 'string' ? opt : opt.label }}
                <span v-if="typeof opt === 'object' && opt.icon"> {{ opt.icon }}</span>
              </option>
            </select>
            <p style="margin-top: 0.5rem; color: #666">
              Selected: {{ vorm.formData.country || 'none' }}
            </p>
          </div>
        </section>

        <!-- Section 2: Options with Custom Data -->
        <section style="padding: 1.5rem; border: 2px solid #2196F3; border-radius: 8px">
          <h2>2. Options with Custom Data (icon, metadata)</h2>
          <p>Testing custom properties in options</p>

          <div style="margin-top: 1rem">
            <label>Language:</label>
            <select
              v-model="vorm.formData.language"
              style="width: 100%; padding: 0.5rem; margin-top: 0.5rem"
            >
              <option value="">Select language...</option>
              <option
                v-for="opt in languageOptions"
                :key="typeof opt === 'string' ? opt : opt.value"
                :value="typeof opt === 'string' ? opt : opt.value"
              >
                <template v-if="typeof opt === 'string'">{{ opt }}</template>
                <template v-else>{{ opt.icon }} {{ opt.label }} ({{ opt.metadata?.code }})</template>
              </option>
            </select>
            <p style="margin-top: 0.5rem; color: #666">
              Selected: {{ vorm.formData.language || 'none' }}
            </p>
          </div>
        </section>

        <!-- Section 3: Reactive Options (Computed) -->
        <section style="padding: 1.5rem; border: 2px solid #FF9800; border-radius: 8px">
          <h2>3. Reactive Options (Computed)</h2>
          <p>Options change based on another field</p>

          <div style="margin-top: 1rem">
            <label>
              <input type="checkbox" v-model="showAdvancedCities">
              Show advanced cities
            </label>

            <div style="margin-top: 1rem">
              <label>City:</label>
              <select
                v-model="vorm.formData.city"
                style="width: 100%; padding: 0.5rem; margin-top: 0.5rem"
              >
                <option value="">Select city...</option>
                <option
                  v-for="city in cityOptions"
                  :key="typeof city === 'string' ? city : city.value"
                  :value="typeof city === 'string' ? city : city.value"
                >
                  {{ typeof city === 'string' ? city : city.label }}
                </option>
              </select>
              <p style="margin-top: 0.5rem; color: #666">
                Available cities: {{ cityOptions.length }}
              </p>
            </div>
          </div>
        </section>

        <!-- Section 4: fieldOptionsMap (Backward Compatibility) -->
        <section style="padding: 1.5rem; border: 2px solid #9C27B0; border-radius: 8px">
          <h2>4. fieldOptionsMap (Backward Compatible)</h2>
          <p>Old method with setFormData should still work</p>

          <button
            @click="setDynamicOptions"
            style="padding: 0.5rem 1rem; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer"
          >
            Set Dynamic Options via fieldOptionsMap
          </button>

          <div style="margin-top: 1rem" v-if="vorm.fieldOptionsMap.dynamicField">
            <label>Dynamic Field:</label>
            <select
              v-model="vorm.formData.dynamicField"
              style="width: 100%; padding: 0.5rem; margin-top: 0.5rem"
            >
              <option value="">Select...</option>
              <option
                v-for="opt in vorm.fieldOptionsMap.dynamicField"
                :key="typeof opt === 'string' ? opt : opt.value"
                :value="typeof opt === 'string' ? opt : opt.value"
              >
                {{ typeof opt === 'string' ? opt : opt.label }}
              </option>
            </select>
          </div>
        </section>

        <!-- Section 5: AutoVorm (automatic rendering) -->
        <section style="padding: 1.5rem; border: 2px solid #00BCD4; border-radius: 8px">
          <h2>5. AutoVorm (Automatic Rendering)</h2>
          <p>AutoVorm automatically renders a select with options from schema</p>

          <AutoVorm :only="['country', 'language']" />
        </section>

        <!-- Section 6: AutoVorm with Custom Slot Template -->
        <section style="padding: 1.5rem; border: 2px solid #E91E63; border-radius: 8px">
          <h2>6. AutoVorm with Custom Slot Template</h2>
          <p>Custom template receives options from the slot</p>

          <AutoVorm :only="['city']">
            <template #wrapper-city="{ field, state, options }">
              <div style="margin-top: 1rem; padding: 1rem; background: #fce4ec; border-radius: 4px">
                <label style="font-weight: bold; display: block; margin-bottom: 0.5rem">
                  {{ field.label }} ({{ options?.length || 0 }} options)
                </label>

                <select
                  v-model="vorm.formData.city"
                  style="width: 100%; padding: 0.5rem; margin-top: 0.5rem; border: 2px solid #e91e63"
                >
                  <option value="">Select city...</option>
                  <option
                    v-for="opt in options"
                    :key="typeof opt === 'string' ? opt : opt.value"
                    :value="typeof opt === 'string' ? opt : opt.value"
                  >
                    {{ typeof opt === 'string' ? opt : opt.label }}
                  </option>
                </select>

                <p style="margin-top: 0.5rem; color: #c2185b; font-size: 0.9rem">
                  ✨ Custom styled select with {{ options?.length || 0 }} options from slot!
                </p>

                <p v-if="state.error" style="color: red; margin-top: 0.5rem">
                  {{ state.error }}
                </p>
              </div>
            </template>
          </AutoVorm>
        </section>

        <!-- Section 7: ⚠️ Fallback WITHOUT AutoVorm -->
        <section style="padding: 1.5rem; border: 2px dashed #999; border-radius: 8px; background: #fafafa">
          <h2 style="color: #666">7. ⚠️ Fallback: vorm.bindField() WITHOUT AutoVorm</h2>
          <p style="color: #999">Only for edge cases where AutoVorm doesn't fit. Use AutoVorm instead!</p>

          <div style="margin-top: 1rem">
            <label style="display: block; font-weight: bold; margin-bottom: 0.5rem; color: #666">
              Country (without AutoVorm):
            </label>

            <CustomSelect v-bind="vorm.bindField('country').value" />

            <p style="margin-top: 0.5rem; color: #999; font-size: 0.85rem">
              ⚠️ This works, but AutoVorm is better!
            </p>
          </div>
        </section>

        <!-- Section 8: ❤️ AutoVorm = The Heart of Vorm -->
        <section style="padding: 1.5rem; border: 3px solid #9C27B0; border-radius: 8px; background: linear-gradient(135deg, #f3e5f5 0%, #e8eaf6 100%)">
          <h2>8. ❤️ AutoVorm = The Heart of Vorm</h2>
          <p><strong>THIS is the right solution!</strong> AutoVorm + wrapper-slots + slot bindings</p>

          <AutoVorm :only="['country', 'language', 'city']">
            <!-- SIMPLEST variant: v-bind with slotProps! -->
            <template #wrapper-country="slotProps">
              <div style="margin-top: 1rem; padding: 1rem; background: white; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1)">
                <label style="font-weight: bold; display: block; margin-bottom: 0.5rem">
                  {{ slotProps.field.label }} (Vuetify-Style)
                </label>

                <!-- 🔥 ONE LINE! v-bind handles everything -->
                <CustomSelect v-bind="slotProps" />

                <p style="margin-top: 0.5rem; color: #9c27b0; font-size: 0.85rem">
                  🔥 <code>v-bind="slotProps"</code> - One line, done!
                </p>
              </div>
            </template>

            <!-- Alternative: Destructuring if you only want specific props -->
            <template #wrapper-language="{ field, modelValue, items, 'onUpdate:modelValue': updateValue }">
              <div style="margin-top: 1rem; padding: 1rem; background: white; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1)">
                <label style="font-weight: bold; display: block; margin-bottom: 0.5rem">
                  {{ field.label }} (Explicit)
                </label>

                <CustomSelect
                  :modelValue="modelValue"
                  :items="items"
                  @update:modelValue="updateValue"
                />

                <p style="margin-top: 0.5rem; color: #3f51b5; font-size: 0.85rem">
                  ✨ Or explicitly destructure if needed
                </p>
              </div>
            </template>

            <!-- city: Standard AutoVorm rendering (shows that both work) -->
          </AutoVorm>

          <div style="margin-top: 1.5rem; padding: 1rem; background: white; border-radius: 4px; border-left: 4px solid #9c27b0">
            <h4 style="margin-top: 0; color: #9c27b0">🎯 Vorm is that simple:</h4>
            <ol style="color: #666; font-size: 0.9rem; margin-bottom: 0">
              <li>Define schema with <code>options</code></li>
              <li>Use <code>&lt;AutoVorm&gt;</code></li>
              <li>If needed: <code>#wrapper-fieldName="slotProps"</code></li>
              <li><code>&lt;VSelect v-bind="slotProps" /&gt;</code> - <strong>ONE LINE!</strong></li>
              <li>🔥 <strong>Done!</strong> Everything automatic, fully reactive</li>
            </ol>
          </div>
        </section>

      </div>

      <!-- Debug Section -->
      <section style="margin-top: 2rem; padding: 1.5rem; background: #263238; color: #fff; border-radius: 8px">
        <h3>🔍 Debug Output</h3>
        <pre style="background: #1a1a1a; padding: 1rem; border-radius: 4px; overflow: auto">{{ debugOutput }}</pre>
      </section>
    </VormProvider>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, h } from 'vue';
import { useVorm, AutoVorm, VormProvider } from 'vorm-vue';
import type { VormSchema, Option } from 'vorm-vue';

// Custom Select Component (simulates Vuetify VSelect)
const CustomSelect = defineComponent({
  name: 'CustomSelect',
  props: {
    modelValue: { type: [String, Number], default: '' },
    items: { type: Array as () => Option[], default: () => [] },
    options: { type: Array as () => Option[], default: () => [] },
    error: { type: String, default: null },
    errorMessages: { type: Array as () => string[], default: () => [] },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const handleChange = (event: Event) => {
      const target = event.target as HTMLSelectElement;
      emit('update:modelValue', target.value);
    };

    return () => {
      // Use items or fallback to options
      const opts = props.items.length > 0 ? props.items : props.options;

      return h('div', { style: { marginTop: '0.5rem' } }, [
        h('select', {
          value: props.modelValue,
          onChange: handleChange,
          style: {
            width: '100%',
            padding: '0.75rem',
            border: props.error ? '2px solid #f44336' : '2px solid #FF5722',
            borderRadius: '4px',
            fontSize: '1rem',
            backgroundColor: '#fff',
          },
        }, [
          h('option', { value: '' }, 'Select...'),
          ...opts.map(opt => {
            const isString = typeof opt === 'string';
            const label = isString ? opt : opt.label;
            const value = isString ? opt : opt.value;
            const disabled = isString ? false : opt.disabled;

            return h('option', { value, disabled }, label);
          }),
        ]),
        props.errorMessages.length > 0 && h('p', {
          style: { color: '#f44336', marginTop: '0.25rem', fontSize: '0.875rem' }
        }, props.errorMessages[0]),
      ]);
    };
  },
});

// Reactive state for testing computed options
const showAdvancedCities = ref(false);

// Schema with new options feature
const schema: VormSchema = [
  {
    name: 'country',
    type: 'select',
    label: 'Country',
    // Static options with custom data
    options: [
      { label: 'Germany', value: 'DE', icon: '🇩🇪', disabled: false },
      { label: 'USA', value: 'US', icon: '🇺🇸', disabled: false },
      { label: 'France', value: 'FR', icon: '🇫🇷', disabled: true }, // Disabled!
      'United Kingdom', // String option (backward compatible)
    ]
  },
  {
    name: 'language',
    type: 'select',
    label: 'Language',
    options: [
      { label: 'English', value: 'en', icon: '🇬🇧', metadata: { code: 'en-US', direction: 'ltr' } },
      { label: 'German', value: 'de', icon: '🇩🇪', metadata: { code: 'de-DE', direction: 'ltr' } },
      { label: 'Arabic', value: 'ar', icon: '🇸🇦', metadata: { code: 'ar-SA', direction: 'rtl' } },
    ]
  },
  {
    name: 'city',
    type: 'select',
    label: 'City',
    // Reactive computed options
    options: () => {
      const basic = ['Berlin', 'Munich', 'Hamburg'];
      const advanced = ['Frankfurt', 'Cologne', 'Stuttgart', 'Düsseldorf'];
      return showAdvancedCities.value ? [...basic, ...advanced] : basic;
    }
  },
  {
    name: 'dynamicField',
    type: 'select',
    label: 'Dynamic Field (via fieldOptionsMap)',
  }
];

const vorm = useVorm(schema);

// Get options from vorm (schema.options)
const countryOptions = vorm.getFieldOptions('country');
const languageOptions = vorm.getFieldOptions('language');
const cityOptions = vorm.getFieldOptions('city');

// Test backward compatibility: setFormData with fieldOptions
function setDynamicOptions() {
  vorm.setFormData(
    { dynamicField: 'opt1' },
    {
      fieldOptions: {
        dynamicField: [
          { label: 'Option 1', value: 'opt1', icon: '⭐' },
          { label: 'Option 2', value: 'opt2', icon: '🌟' },
          { label: 'Option 3', value: 'opt3', icon: '✨', disabled: true },
        ]
      }
    }
  );
}

// Debug output
const debugOutput = computed(() => ({
  formData: vorm.formData,
  fieldOptionsMap: vorm.fieldOptionsMap,
  errors: vorm.errors,
  isDirty: vorm.isDirty.value,
}));
</script>

<style scoped>
select {
  font-family: inherit;
}

section h2 {
  margin-top: 0;
  color: #333;
}

section p {
  color: #666;
  margin-bottom: 0.5rem;
}
</style>
