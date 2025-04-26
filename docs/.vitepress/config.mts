import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Scalux",
  description: "Scalux technical docs",
  base: "/scalux-docs/",
  head: [
    [
      "link",
      { rel: "icon", type: "image/x-icon", href: "/scalux-docs/favicon.ico" },
    ],
  ],
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
            link: "/en/intro",
          },
          {
            text: "Basics",
            link: "/en/basics",
          },
          {
            text: "Modeling",
            link: "/en/modelization",
          },
          {
            text: "Connecting Data",
            link: "/en/mapData",
          },
          {
            text: "State Modifications",
            link: "/en/stateEditing",
          },
          {
            text: "Complete Example: Todo‑List",
            link: "/en/todoList",
          },
          {
            text: "Logic",
            link: "/en/logic",
          },
          {
            text: "Machines",
            link: "/en/machines",
          },
          {
            text: "Assets",
            link: "/en/assets",
          },

          {
            text: "Architecture",
            link: "/en/architecture",
          },
          {
            text: "Why Scalux ?",
            link: "/en/faq",
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
