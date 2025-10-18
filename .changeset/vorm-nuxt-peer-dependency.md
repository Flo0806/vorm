---
"vorm-nuxt": patch
---

Move vorm-vue to peerDependencies for better dependency management

- vorm-vue is now a peerDependency instead of a direct dependency
- Users must install both packages explicitly: `pnpm add vorm-nuxt vorm-vue`
- Follows Nuxt module best practices
- Allows users to control vorm-vue version independently
- Updated README with clearer installation instructions
