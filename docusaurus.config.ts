import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Afribox API',
  tagline: 'Documentation de l\'API du backend Afribox',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://smartparcelng.github.io',
  baseUrl: '/Afribox-API-Docs/',
  organizationName: 'SmartParcelNG',
  projectName: 'Afribox-API-Docs',

  onBrokenLinks: 'warn',
  markdown: {
    mermaid: false,
  },

  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    localeConfigs: {
      fr: { label: 'Français', direction: 'ltr', htmlLang: 'fr' },
      en: { label: 'English', direction: 'ltr', htmlLang: 'en' },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          docItemComponent: '@theme/ApiItem',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'afribox-read',
        docsPluginId: 'classic',
        config: {
          afriboxread: {
            specPath: 'openapi/openapi.read.json',
            outputDir: 'docs/api/read',
            hideSendButton: false,
            showSchemas: false,
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
            },
          },
        },
      },
    ],
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'afribox-write',
        docsPluginId: 'classic',
        config: {
          afriboxwrite: {
            specPath: 'openapi/openapi.write.json',
            outputDir: 'docs/api/write',
            hideSendButton: true,
            showSchemas: false,
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
            },
          },
        },
      },
    ],
  ],

  themes: ['docusaurus-theme-openapi-docs'],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Afribox API',
      logo: {
        alt: 'Afribox',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'guidesSidebar',
          position: 'left',
          label: 'Guides',
        },
        {
          type: 'docSidebar',
          sidebarId: 'readSidebar',
          position: 'left',
          label: 'API (interactive)',
        },
        {
          type: 'docSidebar',
          sidebarId: 'writeSidebar',
          position: 'left',
          label: 'API (write)',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Introduction', to: '/docs/intro' },
            { label: 'Authentication', to: '/docs/authentication' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} SmartParcel / Afribox.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
