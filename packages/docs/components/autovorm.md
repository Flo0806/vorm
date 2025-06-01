# Component: AutoVorm

`<AutoVorm>` is the central dynamic rendering component in Vorm. It automatically renders all visible fields based on the schema and current form state. It integrates layouting, validation, conditional visibility (`showIf`), slot resolution, and wrapper support — all declaratively.

## Responsibilities

AutoVorm handles:

- Field visibility (`showIf`, `only`, `excludeRepeaters`)
- Layout and structure (`grid`, `stacked`, `horizontal`)
- Validation state per field (`error`, `touched`, `dirty`, `valid`)
- Automatic rendering of `<label>`, `<input>`, error message
- Wrapper resolution and scoped slot injection (per field, grouped, or fallback)

## Props

| Prop                | Type         | Description                                         |
| ------------------- | ------------ | --------------------------------------------------- |
| `layout`            | `grid`       | Enable grid layout                                  |
| `columns`           | `number`     | Only for `grid`: defines the number of columns      |
| `fieldWrapperClass` | `string`     | CSS class for field wrapper (when no slot is used)  |
| `only`              | `string[]`   | Restrict rendering to specific fields (or prefixes) |
| `excludeRepeaters`  | `boolean`    | Hides all repeater fields and their children        |
| `errorClass`        | `any`        | CSS class for fields in error state                 |
| `classes`           | `any`        | Global class definitions (optional)                 |
| `as`                | `string`     | HTML wrapper tag, e.g. `form`, `section`, `div`     |
| `containerClass`    | `string`     | CSS class for the outermost element                 |
| `containerStyle`    | `StyleValue` | Inline style for the outermost element              |

## Events

| Event      | Payload                                                 |
| ---------- | ------------------------------------------------------- |
| `submit`   | The native `SubmitEvent` (only if `as` is `form`        |
| `input`    | `{ name, value, field, originalEvent, preventDefault }` |
| `blur`     | `{ name, value, field, originalEvent, preventDefault }` |
| `validate` | `{ name, value, field, originalEvent, preventDefault }` |

## Slot Support

AutoVorm supports a flexible slot system:

### Wrapper Slots

- `wrapper:fieldName`
- `wrapper:[fieldA,fieldB]`
- `wrapper` (global fallback)

### Inline Field Slots

- `before-fieldName`
- `after-fieldName`

### Slot Props

Each wrapper receives:

```ts
{
  field: VormFieldSchema,
  state: FieldState,
  content: () => VNode, // rendered input
  path: string,
  indexes: number[]     // e.g. [0, 1] for nested repeaters
}
```

## Validation State

Each field gets a reactive `FieldState`:

- `error` (`string | null`)
- `valid` (`boolean`)
- `invalid` (`boolean`)
- `validationMode` (`"onBlur"`, etc.)
- `touched` (`boolean`)
- `dirty` (`boolean`)
- `initialValue` (`any`)
- `classes` (combined CSS classes string)

## Field Visibility

AutoVorm automatically determines which fields to render based on:

- `only` → restricts to specific field names or path prefixes
- `excludeRepeaters` → skips repeaters and all nested fields
- `showIf` → per-field conditional logic (function or relative path)

## Rendering Strategy

- If a matching **slot** exists: use it
- If a matching **wrapper slot** exists: use it with `content()`
- If no slot: render `<label>`, `<input|select|textarea>`, and `<p>` (error)

## Recommendations

- Use `<AutoVorm>` when you want a fully dynamic, schema-driven form
- Combine with `wrapper` slots for layout customization
- For advanced control, you can render manually using `VormProvider`

---

> AutoVorm is the fastest way to get a fully reactive, validated, and maintainable form rendered — with flexibility and performance built-in.
