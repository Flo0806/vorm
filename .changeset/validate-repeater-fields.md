---
"vorm-vue": patch
---

fix: validate() now validates repeater subfields correctly

- validate() uses expandSchema to include repeater fields (e.g., projects[0].name)
- isValid computed now considers repeater subfields
- Added tests for validate() with repeater fields

