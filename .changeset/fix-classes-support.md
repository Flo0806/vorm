---
"vorm-vue": patch
---

Fix schema `classes` property not being applied to label, help, and outer elements in VormField component. Previously only `classes.input` was working, now all class properties (`outer`, `label`, `input`, `help`) are properly applied alongside the default vorm-* classes.
