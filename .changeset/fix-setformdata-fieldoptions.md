---
"vorm-vue": patch
---

Fix setFormData to properly handle fieldOptions when newData is empty. Previously, calling `setFormData({}, { fieldOptions: {...} })` would not set the field options because the options loop was nested inside the newData loop. Now fieldOptions are processed separately, allowing you to set options without providing form data.
