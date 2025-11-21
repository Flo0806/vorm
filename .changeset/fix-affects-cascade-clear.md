---
"vorm-vue": patch
---

Fix affects cascade: clear errors on affected fields when source validation passes

When a field with `affects` array passes validation, the affected fields are now
re-validated to clear any errors that were propagated from the source field.
