---
"vorm-vue": patch
---

fix(vorm-vue): isValid now correctly handles fields without validation rules. Fields without validation are now considered valid by default, allowing isValid to return true when all fields with validation rules have been validated and have no errors.
