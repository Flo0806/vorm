---
"vorm-vue": patch
---

Fix validation for fields inside repeaters. `validateFieldByName` now correctly validates nested fields like `projects[0].url` by using the expanded schema. Added tests for repeater and nested repeater validation.
