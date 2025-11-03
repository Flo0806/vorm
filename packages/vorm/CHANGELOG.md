# vorm-vue

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
