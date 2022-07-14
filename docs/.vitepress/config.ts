import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'tool-cabinet',
  lastUpdated: true,
  base: '/tool-cabinet/',
  themeConfig: {
    repo: 'martin-yin/tool-cabinet',
    docsDir: 'docs',
    docsBranch: 'main',
    lastUpdated: ' 最后一次更新',
    nav: [{ text: '介绍', link: '/' }],
    sidebar: {
      '/': getGuideSidebar()
    }
  }
})

function getGuideSidebar() {
  return [
    {
      text: '',
      children: [
        { text: '介绍', link: '/' },
        { text: 'rollup-elvin-upload', link: '/rollup-elvin-upload' },
        { text: 'tool-cabinet-cli', link: '/tool-cabinet-cli' }
      ]
    }
  ]
}
