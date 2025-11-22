---
"vorm-vue": patch
---

fix: improve input performance with many fields

- Add internal VormField component for isolated reactivity per field
- Each field now has its own component boundary, preventing re-renders of all fields when one changes
- Typing in forms with hundreds of fields is now smooth and responsive
- No API changes - this is an internal optimization
