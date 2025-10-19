---
"vorm-vue": patch
---

Fix fieldOptions reactivity and setFormData handling. This patch addresses two critical issues:

1. **Reactivity Fix**: Changed `fieldOptionsMap` from a non-reactive `Map` to a reactive `Record<string, Option[]>`. This ensures that select fields properly re-render when options are set via `setFormData()` or `updateField()`.

2. **setFormData Cleanup**: Added proper clearing of old field options before setting new ones, allowing `setFormData({}, { fieldOptions: {...} })` to work correctly without explicitly setting field values.

**Breaking Fix**: Select fields with dynamic options will now properly update when `setFormData()` is called, even without explicit field values.
