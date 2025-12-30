# vorm-vue

## 1.2.4

### Patch Changes

- [#52](https://github.com/Flo0806/vorm/pull/52) [`13d340d`](https://github.com/Flo0806/vorm/commit/13d340d3d00f731d3ea2541e55fd0285f71258aa) Thanks [@Flo0806](https://github.com/Flo0806)! - fix: skip validation for hidden fields (showIf condition false)
  - Hidden fields are no longer validated and don't block form submission
  - Errors are automatically cleared when a field becomes hidden
  - isValid computed only considers visible fields
  - Added resolveRelativePath to pathHelpers for shared use

## 1.2.3

### Patch Changes

- [#50](https://github.com/Flo0806/vorm/pull/50) [`f73fdd4`](https://github.com/Flo0806/vorm/commit/f73fdd4236494023a020fc978275961e237211d3) Thanks [@Flo0806](https://github.com/Flo0806)! - Fix validation for fields inside repeaters. `validateFieldByName` now correctly validates nested fields like `projects[0].url` by using the expanded schema. Added tests for repeater and nested repeater validation.

## 1.2.2

### Patch Changes

- [#48](https://github.com/Flo0806/vorm/pull/48) [`aeb8750`](https://github.com/Flo0806/vorm/commit/aeb87507b70c983604c15397c5daaded48f9d666) Thanks [@Flo0806](https://github.com/Flo0806)! - Fix schema `classes` property not being applied to label, help, and outer elements in VormField component. Previously only `classes.input` was working, now all class properties (`outer`, `label`, `input`, `help`) are properly applied alongside the default vorm-\* classes.

## 1.2.1

### Patch Changes

- [#46](https://github.com/Flo0806/vorm/pull/46) [`6845275`](https://github.com/Flo0806/vorm/commit/6845275b4311af6e5c2a917c22e0d4549a1fcf20) Thanks [@Flo0806](https://github.com/Flo0806)! - fix: improve input performance with many fields
  - Add internal VormField component for isolated reactivity per field
  - Each field now has its own component boundary, preventing re-renders of all fields when one changes
  - Typing in forms with hundreds of fields is now smooth and responsive
  - No API changes - this is an internal optimization

## 1.2.0

### Minor Changes

- [#40](https://github.com/Flo0806/vorm/pull/40) [`cf4eb54`](https://github.com/Flo0806/vorm/commit/cf4eb544129ec402e471485ce0a7bd0a254a02e8) Thanks [@Flo0806](https://github.com/Flo0806)! - Make disabled property reactive with function support
  - Added `ReactiveBoolean` type for reactive boolean properties
  - Extended `disabled` in `VormFieldSchema` to accept functions with `FormContext`
  - `disabled` now supports: `boolean`, `Ref<boolean>`, `ComputedRef<boolean>`, `() => boolean`, `(ctx: FormContext) => boolean`
  - AutoVorm resolves `disabled` reactively and passes it to slot bindings
  - `bindField()` now includes `disabled` in its return value

  Example:

  ```typescript
  {
    name: 'submit',
    disabled: (ctx) => !ctx.formData.agreeToTerms || !ctx.isValid
  }
  ```

- [#37](https://github.com/Flo0806/vorm/pull/37) [`d7ba028`](https://github.com/Flo0806/vorm/commit/d7ba028ecc69b511585c42158d71bb4d1e0319d8) Thanks [@Flo0806](https://github.com/Flo0806)! - Improve developer experience with reactive errors and resolved slot props
  - `vorm.errors` is now a reactive object - access errors directly with `vorm.errors.email` instead of `vorm.errors.value.email`
  - AutoVorm slot props now receive resolved strings for `label`, `placeholder`, and `helpText` instead of ReactiveString types
  - Full i18n reactivity maintained - dynamic placeholders and labels update reactively when form data or locale changes

- [#39](https://github.com/Flo0806/vorm/pull/39) [`9f7c002`](https://github.com/Flo0806/vorm/commit/9f7c002d799adc4323f4ebf579cfd09e9191b786) Thanks [@Flo0806](https://github.com/Flo0806)! - Add schema options and bindField for custom component support
  - Added `options` field to `VormFieldSchema` for select/radio/autocomplete fields
  - Extended `Option` type with custom data support (`[key: string]: any`)
  - Added `ReactiveOptions` type (static array, Ref, Computed, Function, Async)
  - Added `getFieldOptions()` helper for reactive option access
  - Added `bindField()` method for easy custom component binding
  - AutoVorm wrapper-slots now provide `modelValue`, `items`, `options`, `error`, `errorMessages`, `onUpdate:modelValue`
  - Full backward compatibility with `fieldOptionsMap`

### Patch Changes

- [#41](https://github.com/Flo0806/vorm/pull/41) [`58bf497`](https://github.com/Flo0806/vorm/commit/58bf497f6738a3713a76d0e1f62328a6aa1eca99) Thanks [@Flo0806](https://github.com/Flo0806)! - Fix affects cascade: clear errors on affected fields when source validation passes

  When a field with `affects` array passes validation, the affected fields are now
  re-validated to clear any errors that were propagated from the source field.

## 1.1.3

### Patch Changes

- [#32](https://github.com/Flo0806/vorm/pull/32) [`c3ddec1`](https://github.com/Flo0806/vorm/commit/c3ddec16eb910825d866394da14c2f9da33ae49e) Thanks [@Flo0806](https://github.com/Flo0806)! - fix(vorm-vue): isValid now correctly handles fields without validation rules. Fields without validation are now considered valid by default, allowing isValid to return true when all fields with validation rules have been validated and have no errors.

## 1.1.2

### Patch Changes

- [#30](https://github.com/Flo0806/vorm/pull/30) [`99c68d7`](https://github.com/Flo0806/vorm/commit/99c68d7940383e09683b971d5e2be187e63de119) Thanks [@Flo0806](https://github.com/Flo0806)! - Fix isValid computed property to require all fields to be validated

  The isValid property now correctly returns false until ALL fields have been validated, not just at least one field. This fixes the issue where touching a single field would incorrectly mark the entire form as valid.

## 1.1.1

### Patch Changes

- [#25](https://github.com/Flo0806/vorm/pull/25) [`053367b`](https://github.com/Flo0806/vorm/commit/053367b1212f97f3ec36f830b4426147bb0d8d14) Thanks [@Flo0806](https://github.com/Flo0806)! - Internal dependency update to align with vorm-nuxt changes

## 1.1.0

### Minor Changes

- [#15](https://github.com/Flo0806/vorm/pull/15) [`290877c`](https://github.com/Flo0806/vorm/commit/290877c8d99728c8d9f06932690834ad4a33fbb8) Thanks [@Flo0806](https://github.com/Flo0806)! - Add form-level state flags (isValid, isDirty, isTouched)

  Added reactive computed properties to VormContext for better form state management:
  - isValid: Returns true when form has been validated and has no errors
  - isDirty: Returns true when at least one field has been modified
  - isTouched: Returns true when at least one field has been touched

## 1.0.2

### Patch Changes

- [#12](https://github.com/Flo0806/vorm/pull/12) [`f736430`](https://github.com/Flo0806/vorm/commit/f7364302490b56ab9cf834fb51056da5d8cdf22b) Thanks [@Flo0806](https://github.com/Flo0806)! - Fix fieldOptions reactivity and setFormData handling. This patch addresses two critical issues:
  1. **Reactivity Fix**: Changed `fieldOptionsMap` from a non-reactive `Map` to a reactive `Record<string, Option[]>`. This ensures that select fields properly re-render when options are set via `setFormData()` or `updateField()`.
  2. **setFormData Cleanup**: Added proper clearing of old field options before setting new ones, allowing `setFormData({}, { fieldOptions: {...} })` to work correctly without explicitly setting field values.

  **Breaking Fix**: Select fields with dynamic options will now properly update when `setFormData()` is called, even without explicit field values.

## 1.0.1

### Patch Changes

- [#6](https://github.com/Flo0806/vorm/pull/6) [`3163598`](https://github.com/Flo0806/vorm/commit/31635984bdb61c74686c840f288c0c075a65afe0) Thanks [@Flo0806](https://github.com/Flo0806)! - updated readme

## 1.0.0

### Major Changes

- first major version
