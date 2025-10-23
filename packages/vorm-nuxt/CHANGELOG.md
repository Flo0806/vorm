# vorm-nuxt

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
