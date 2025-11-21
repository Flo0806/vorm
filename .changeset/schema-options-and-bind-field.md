---
"vorm-vue": minor
---

Add schema options and bindField for custom component support

- Added `options` field to `VormFieldSchema` for select/radio/autocomplete fields
- Extended `Option` type with custom data support (`[key: string]: any`)
- Added `ReactiveOptions` type (static array, Ref, Computed, Function, Async)
- Added `getFieldOptions()` helper for reactive option access
- Added `bindField()` method for easy custom component binding
- AutoVorm wrapper-slots now provide `modelValue`, `items`, `options`, `error`, `errorMessages`, `onUpdate:modelValue`
- Full backward compatibility with `fieldOptionsMap`
