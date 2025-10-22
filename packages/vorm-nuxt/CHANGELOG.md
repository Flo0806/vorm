# vorm-nuxt

## 2.0.0

### Patch Changes

- [`80d911d`](https://github.com/Flo0806/vorm/commit/80d911ddbdf8843d1021a94b446b300b1caeb610) Thanks [@Flo0806](https://github.com/Flo0806)! - Update vorm-vue peer dependency range

- Updated dependencies [[`290877c`](https://github.com/Flo0806/vorm/commit/290877c8d99728c8d9f06932690834ad4a33fbb8)]:
  - vorm-vue@1.1.0

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
