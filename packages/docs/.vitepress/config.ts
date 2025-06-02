import { defineConfig } from "vitepress";

export default defineConfig({
  head: [["link", { rel: "icon", href: "/vorm-logo-small.png" }]],
  title: "Vorm",
  description: "Flexible Vue 3 Form Builder",
  themeConfig: {
    siteTitle: "Vorm - Vue 3 Form Builder",
    logo: "/vorm-logo-small.png",
    nav: [
      { text: "Start", link: "/" },
      { text: "API", link: "/getting-started/concepts" },
      { text: "GitHub", link: "https://github.com/Flo0806/vorm" },
    ],
    sidebar: [
      {
        text: "Getting Started",
        items: [
          { text: "Installation", link: "/getting-started/installation" },
          { text: "First Form", link: "/getting-started/first-form" },
          { text: "Basic Concepts", link: "/getting-started/concepts" },
        ],
      },
      {
        text: "Core Features",
        items: [
          { text: "Schema Definition", link: "/core/schema" },
          { text: "Validation", link: "/core/validation" },
          { text: "Conditional Logic", link: "/core/conditions" },
          { text: "Form State", link: "/core/state" },
        ],
      },
      {
        text: "Components",
        items: [
          { text: "AutoVorm", link: "/components/autovorm" },
          { text: "VormProvider", link: "/components/provider" },
          { text: "VormRepeater", link: "/components/repeater" },
          { text: "VormSection", link: "/components/section" },
        ],
      },
      {
        text: "Advanced Topics",
        items: [
          { text: "Custom Inputs", link: "/advanced/custom-inputs" },
          { text: "Slots & Wrappers", link: "/advanced/slots" },
          { text: "Events", link: "/advanced/events" },
          { text: "Nested Repeaters", link: "/advanced/nested-repeaters" },
        ],
      },
      {
        text: "Examples",
        items: [
          { text: "Registration Form", link: "/examples/registration" },
          { text: "Dynamic Layouts", link: "/examples/layouts" },
          { text: "Real-World Form", link: "/examples/extended" },
        ],
      },
      {
        text: "API Reference",
        link: "/api/",
      },
    ],
    footer: {
      message: "MIT Licensed",
      copyright: "Built with ❤️ by FH SoftDev",
    },
    search: {
      provider: "local",
    },
  },
});
