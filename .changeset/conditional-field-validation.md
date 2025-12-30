---
"vorm-vue": patch
---

fix: skip validation for hidden fields (showIf condition false)

- Hidden fields are no longer validated and don't block form submission
- Errors are automatically cleared when a field becomes hidden
- isValid computed only considers visible fields
- Added resolveRelativePath to pathHelpers for shared use

