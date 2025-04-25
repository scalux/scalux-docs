import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Scalux",
  description: "Scalux technical docs",
  base: "/scalux-docs/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // nav: [
    //   { text: "Home", link: "/" },
    //   { text: "Examples", link: "/markdown-examples" },
    // ],
    logo: "scalux-logo.png",

    sidebar: [
      {
        text: "Scalux",
        items: [
          {
            text: "Introduction",
            link: "/scalux/en/intro",
          },
          {
            text: "Basics",
            link: "/scalux/en/basics",
          },
          {
            text: "Modeling",
            link: "/scalux/en/modelization",
          },
          {
            text: "Connecting Data",
            link: "/scalux/en/mapData",
          },
          {
            text: "State Modifications",
            link: "/scalux/en/stateEditing",
          },
          {
            text: "Complete Example: Todo‑List",
            link: "/scalux/en/todoList",
          },
          {
            text: "Logic",
            link: "/scalux/en/logic",
          },
          {
            text: "Machines",
            link: "/scalux/en/machines",
          },
          {
            text: "Assets",
            link: "/scalux/en/assets",
          },

          {
            text: "Architecture",
            link: "/scalux/en/architecture",
          },
          {
            text: "Why Scalux ?",
            link: "/scalux/en/faq",
          },
        ],
      },
    ],

    socialLinks: [
      // { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
  },
  markdown: {
    theme: "dark-plus",
  },
});
