import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Chous',
  description: 'The World\'s First Dedicated File Structure Linter',

  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: 'Chous' }],
  ],

  themeConfig: {
    logo: '/logo.png',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Configuration', link: '/config/syntax' },
      { text: 'Presets', link: '/presets/' },
      { text: 'Plugins', link: '/plugins/' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'v0.1.4',
        items: [
          { text: 'Changelog', link: 'https://github.com/apus3404-oss/chous/releases' },
          { text: 'Contributing', link: '/contributing' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Chous?', link: '/guide/what-is-chous' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Why Chous?', link: '/guide/why-chous' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'File Structure Linting', link: '/guide/file-structure-linting' },
            { text: 'Rules', link: '/guide/rules' },
            { text: 'Presets', link: '/guide/presets' },
            { text: 'Watch Mode', link: '/guide/watch-mode' },
          ],
        },
        {
          text: 'Features',
          items: [
            { text: 'Auto-Fix', link: '/guide/auto-fix' },
            { text: 'Editor Integration', link: '/guide/editor-integration' },
            { text: 'CI/CD Integration', link: '/guide/ci-cd' },
          ],
        },
      ],
      '/config/': [
        {
          text: 'Configuration',
          items: [
            { text: 'Syntax', link: '/config/syntax' },
            { text: 'Rules Reference', link: '/config/rules' },
            { text: 'Naming Conventions', link: '/config/naming' },
            { text: 'Advanced', link: '/config/advanced' },
          ],
        },
      ],
      '/presets/': [
        {
          text: 'Presets',
          items: [
            { text: 'Overview', link: '/presets/' },
            { text: 'Frontend', link: '/presets/frontend' },
            { text: 'Backend', link: '/presets/backend' },
            { text: 'Mobile', link: '/presets/mobile' },
            { text: 'Desktop', link: '/presets/desktop' },
          ],
        },
      ],
      '/plugins/': [
        {
          text: 'Plugins',
          items: [
            { text: 'Overview', link: '/plugins/' },
            { text: 'Using Plugins', link: '/plugins/using' },
            { text: 'Creating Plugins', link: '/plugins/creating' },
            { text: 'API Reference', link: '/plugins/api' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Monorepo', link: '/examples/monorepo' },
            { text: 'Full-Stack', link: '/examples/fullstack' },
            { text: 'Microservices', link: '/examples/microservices' },
            { text: 'Library', link: '/examples/library' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/apus3404-oss/chous' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Chous Contributors',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/apus3404-oss/chous/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
});
