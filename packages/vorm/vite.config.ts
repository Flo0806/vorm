import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import path from "path";

export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: "src", // alles ab src/**
      outDir: "dist", // zusammen mit JS-Build
      rollupTypes: true, // generiert index.d.ts & components.d.ts
    }),
  ],

  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, "src/index.ts"),
        components: path.resolve(__dirname, "src/components/index.ts"),
      },
      formats: ["es"],
      fileName: (format, entry) => `${entry}.mjs`,
    },
    rollupOptions: {
      external: ["vue"],
    },
  },
});
