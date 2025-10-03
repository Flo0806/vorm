import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import path from "path";

export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: "src", // everything from src/**
      outDir: "dist", // together with JS build
      rollupTypes: true, // generates index.d.ts & components.d.ts
    }),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./test/setup.ts",
  },
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
    cssCodeSplit: false,
  },
});
