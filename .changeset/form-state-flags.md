---
"vorm-vue": minor
---

Add form-level state flags (isValid, isDirty, isTouched)

Added reactive computed properties to VormContext for better form state management:
- isValid: Returns true when form has been validated and has no errors
- isDirty: Returns true when at least one field has been modified
- isTouched: Returns true when at least one field has been touched
