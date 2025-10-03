import { defineConfig } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      vorm: path.resolve(__dirname, "../vorm/src"),
      "vorm/components": path.resolve(__dirname, "../vorm/src/components"),
    },
  },
});
