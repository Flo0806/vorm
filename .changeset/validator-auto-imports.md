---
"vorm-nuxt": minor
---

Add validator auto-imports and peer dependency support

- Add `vorm-vue` as peerDependency to enable direct imports with npm/yarn
- Add `autoImportValidators` option (default: false) for optional validator auto-imports
- Auto-import all 7 validators when enabled: minLength, maxLength, min, max, between, step, matchField
- Add experimental changeset option to prevent unnecessary version bumps on peer dependency updates
