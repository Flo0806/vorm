# Events

AutoVorm emits interaction-based events so parent components can listen or hook into them.

| Event      | Payload                                                 |
| ---------- | ------------------------------------------------------- |
| `submit`   | Native `SubmitEvent` of the form                        |
| `input`    | `{ name, value, field, originalEvent, preventDefault }` |
| `blur`     | `{ name, value, field, originalEvent, preventDefault }` |
| `validate` | `{ name, value, field, originalEvent, preventDefault }` |

Each event includes:

- `name`: full path of the field
- `value`: current value
- `field`: field config from schema
- `originalEvent`: native DOM event (if any)
- `preventDefault()`: prevent internal handling (e.g., validation)

This allows full control over external sync, tracking, logging, or analytics.

## How to Use

You can listen to these events in the parent component using Vue's event syntax:

```vue
<AutoVorm
  as="form"
  @submit="onSubmit"
  @input="onFieldInput"
  @blur="onFieldBlur"
  @validate="onFieldValidate"
/>
```

Then define the corresponding handlers:

```ts
function onSubmit(evt: SubmitEvent) {
  console.log("Form submitted", evt);
}

function onFieldInput(payload) {
  console.log("Input", payload.name, payload.value);
  if (payload.name === "email") {
    payload.preventDefault(); // prevents auto-validation
  }
}

function onFieldBlur(payload) {
  console.log("Blurred field:", payload.name);
}

function onFieldValidate(payload) {
  console.log("Validating:", payload.name);
}
```

This allows full control over external sync, tracking, logging, or analytics.
