---
"vorm-nuxt": patch
---

Move vorm-vue from peerDependency to normal dependency to fix automatic major version bumps

This change resolves an issue where vorm-nuxt would incorrectly receive a major version bump whenever vorm-vue was patched or received a minor update. By moving vorm-vue to a regular dependency instead of a peerDependency, we avoid the changesets bug (changesets/changesets#1011) that causes unnecessary major version bumps.

Users can now install vorm-nuxt alone (`pnpm add vorm-nuxt`) without explicitly installing vorm-vue separately.
