import { defineConfig } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "vorm-vue": path.resolve(__dirname, "../vorm/src"),
      "vorm-vue/components": path.resolve(__dirname, "../vorm/src/components"),
      // Legacy aliases (if needed)
      vorm: path.resolve(__dirname, "../vorm/src"),
      "vorm/components": path.resolve(__dirname, "../vorm/src/components"),
    },
  },
});
