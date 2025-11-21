# vorm-nuxt

## 1.2.1

### Patch Changes

- [#43](https://github.com/Flo0806/vorm/pull/43) [`08035b1`](https://github.com/Flo0806/vorm/commit/08035b1cc81c84dbdd6f496454b531a5ef48cd0a) Thanks [@Flo0806](https://github.com/Flo0806)! - Fix version display: read version dynamically from package.json instead of hardcoded value

## 1.2.0

### Minor Changes

- [#42](https://github.com/Flo0806/vorm/pull/42) [`26c5b3c`](https://github.com/Flo0806/vorm/commit/26c5b3cef0db934583740bbc2bd1b029ab4685c0) Thanks [@Flo0806](https://github.com/Flo0806)! - Enhanced auto-imports and improved defaults
  - Changed `autoImportValidators` default to `true`
  - Added type auto-imports: `VormFieldSchema`, `Option`, `FieldState`, `ValidationMode`
  - Added reactive type auto-imports: `FormContext`, `ReactiveString`, `ReactiveBoolean`, `ReactiveOptions`
  - Removed console.log from module setup
  - Updated plugin version to 1.1.0

### Patch Changes

- Updated dependencies [[`58bf497`](https://github.com/Flo0806/vorm/commit/58bf497f6738a3713a76d0e1f62328a6aa1eca99), [`cf4eb54`](https://github.com/Flo0806/vorm/commit/cf4eb544129ec402e471485ce0a7bd0a254a02e8), [`d7ba028`](https://github.com/Flo0806/vorm/commit/d7ba028ecc69b511585c42158d71bb4d1e0319d8), [`9f7c002`](https://github.com/Flo0806/vorm/commit/9f7c002d799adc4323f4ebf579cfd09e9191b786)]:
  - vorm-vue@1.2.0

## 1.1.0

### Minor Changes

- [`156bb58`](https://github.com/Flo0806/vorm/commit/156bb58880c24fcd4f17b934d94844d47d411e87) Thanks [@Flo0806](https://github.com/Flo0806)! - Add validator auto-imports and peer dependency support
  - Add `vorm-vue` as peerDependency to enable direct imports with npm/yarn
  - Add `autoImportValidators` option (default: false) for optional validator auto-imports
  - Auto-import all 7 validators when enabled: minLength, maxLength, min, max, between, step, matchField
  - Add experimental changeset option to prevent unnecessary version bumps on peer dependency updates

## 1.0.2

### Patch Changes

- [#25](https://github.com/Flo0806/vorm/pull/25) [`053367b`](https://github.com/Flo0806/vorm/commit/053367b1212f97f3ec36f830b4426147bb0d8d14) Thanks [@Flo0806](https://github.com/Flo0806)! - Move vorm-vue from peerDependency to normal dependency to fix automatic major version bumps

  This change resolves an issue where vorm-nuxt would incorrectly receive a major version bump whenever vorm-vue was patched or received a minor update. By moving vorm-vue to a regular dependency instead of a peerDependency, we avoid the changesets bug (changesets/changesets#1011) that causes unnecessary major version bumps.

  Users can now install vorm-nuxt alone (`pnpm add vorm-nuxt`) without explicitly installing vorm-vue separately.

- Updated dependencies [[`053367b`](https://github.com/Flo0806/vorm/commit/053367b1212f97f3ec36f830b4426147bb0d8d14)]:
  - vorm-vue@1.1.1

## 1.0.1

### Patch Changes

- [`003c2f0`](https://github.com/Flo0806/vorm/commit/003c2f0b4d0a83c5216c346f502b1e2535610011) Thanks [@Flo0806](https://github.com/Flo0806)! - Move vorm-vue to peerDependencies for better dependency management
  - vorm-vue is now a peerDependency instead of a direct dependency
  - Users must install both packages explicitly: `pnpm add vorm-nuxt vorm-vue`
  - Follows Nuxt module best practices
  - Allows users to control vorm-vue version independently
  - Updated README with clearer installation instructions

## 1.0.0

### Major Changes

- [`a17e15d`](https://github.com/Flo0806/vorm/commit/a17e15d530ab360f88d68c7361500973133a23d6) Thanks [@Flo0806](https://github.com/Flo0806)! - Initial release of vorm-nuxt - Nuxt module for vorm
  - Auto-imports for useVorm and useVormContext composables
  - Auto-registration of all vorm-vue components (VormProvider, AutoVorm, VormSection, VormRepeater)
  - TypeScript support with auto-imported types
  - Configurable module options for auto-imports and components
  - Full SSR support
  - Zero configuration setup
