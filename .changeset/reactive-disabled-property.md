---
"vorm-vue": minor
---

Make disabled property reactive with function support

- Added `ReactiveBoolean` type for reactive boolean properties
- Extended `disabled` in `VormFieldSchema` to accept functions with `FormContext`
- `disabled` now supports: `boolean`, `Ref<boolean>`, `ComputedRef<boolean>`, `() => boolean`, `(ctx: FormContext) => boolean`
- AutoVorm resolves `disabled` reactively and passes it to slot bindings
- `bindField()` now includes `disabled` in its return value

Example:
```typescript
{
  name: 'submit',
  disabled: (ctx) => !ctx.formData.agreeToTerms || !ctx.isValid
}
```
