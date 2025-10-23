---
"vorm-vue": patch
---

Fix isValid computed property to require all fields to be validated

The isValid property now correctly returns false until ALL fields have been validated, not just at least one field. This fixes the issue where touching a single field would incorrectly mark the entire form as valid.
