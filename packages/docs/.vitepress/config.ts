import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Vorm",
  description: "Flexible Vue 3 Form Builder",
  themeConfig: {
    nav: [
      { text: "Start", link: "/" },
      { text: "Komponenten", link: "/components" },
      { text: "GitHub", link: "https://github.com/Flo0806/vorm" },
    ],
    sidebar: [
      {
        text: "Einführung",
        items: [
          { text: "Start", link: "/" },
          { text: "Schnellstart", link: "/getting-started" },
        ],
      },
      {
        text: "Komponenten",
        items: [
          { text: "AutoVorm", link: "/components#autovorm" },
          { text: "VormProvider", link: "/components#vormprovider" },
        ],
      },
    ],
    footer: {
      message: "MIT Licensed",
      copyright: "Built with ❤️ by FH SoftDev",
    },
  },
});
