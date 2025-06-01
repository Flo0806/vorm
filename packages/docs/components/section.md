# Component: VormSection

`<VormSection>` is a lightweight wrapper component in Vorm that provides a consistent layout and styling for grouped form content. It's designed to visually separate logical sections of a form, such as personal details, contact information, or address blocks.

## Purpose

`VormSection` is not required for the form logic, but offers a convenient way to:

- Group related fields in a visually distinct box
- Provide a titled header for each group
- Reuse consistent styling across multiple sections of a form

It integrates well into any Vorm form structure, including inside `<AutoVorm>` or manual forms.

## Usage

```vue
<VormSection title="Kontaktinformationen">
  <AutoVorm :only="['email', 'phone']" />
</VormSection>
```

## Props

| Prop           | Type     | Description                                          |
| -------------- | -------- | ---------------------------------------------------- |
| `title`        | `string` | Optional section heading displayed above the content |
| `classes`      | `string` | Custom CSS class for the outer container             |
| `titleClasses` | `string` | Custom CSS class for the heading (if shown)          |

## Default Styles

```css
.vorm-section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
}
.vorm-section-title {
  font-weight: 600;
  font-size: 1.125rem;
  margin-bottom: 0.75rem;
}
```

These styles can be overridden via `classes` and `titleClasses` props or through global styling.

## Flexibility

While `VormSection` is provided as a convenient utility, you're free to use any HTML element (`<div>`, `<section>`, etc.) or your own wrapper component to organize layout. Vorm doesn't require `VormSection` for functionality — it's purely a presentation aid.

---

> Use VormSection to give your forms structure and clarity, especially in longer or more complex forms.
