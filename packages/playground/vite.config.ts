import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      vorm: path.resolve(__dirname, "../vorm/src"),
      "vorm/components": path.resolve(__dirname, "../vorm/src/components"),
    },
  },
});
