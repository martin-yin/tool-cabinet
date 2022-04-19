import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Web Dev Tools",
  lastUpdated: true,

  themeConfig: {
    repo: "martin-yin/web-dev-tools",
    docsDir: "docs",
    docsBranch: "main",
    lastUpdated: " 最后一次更新",
    nav: [{ text: "介绍", link: "/" }],
    sidebar: {
      "/": getGuideSidebar(),
    },
  },
});

function getGuideSidebar() {
  return [
    {
      text: "介绍",
      children: [{ text: "Web Dev Tools", link: "/" }],
    },
  ];
}
