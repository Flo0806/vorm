---
"vorm-vue": minor
---

Improve developer experience with reactive errors and resolved slot props

- `vorm.errors` is now a reactive object - access errors directly with `vorm.errors.email` instead of `vorm.errors.value.email`
- AutoVorm slot props now receive resolved strings for `label`, `placeholder`, and `helpText` instead of ReactiveString types
- Full i18n reactivity maintained - dynamic placeholders and labels update reactively when form data or locale changes
