import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
    title: '雨落辰潇',
    tagline: '',
    favicon: 'img/favicon.ico',

    // Set the production url of your site here
    url: 'https://your-docusaurus-site.example.com',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'facebook', // Usually your GitHub org/user name.
    projectName: 'docusaurus', // Usually your repo name.

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },

    // 配置插件
    plugins: [
        [
            '@easyops-cn/docusaurus-search-local',
            {
                hashed: true,   // 可选配置
                language: ["en", "zh"],  // 设置语言
                indexDocs: true,
                indexPages: true,
            },
        ],
    ],

    presets: [
        [
            'classic',
            {
                docs: {
                    sidebarPath: './sidebars.ts',
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    // editUrl:'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
                },
                blog: {
                    showReadingTime: true,
                    blogSidebarCount: 'ALL',
                    feedOptions: {
                        type: ['rss', 'atom'],
                        xslt: true,
                    },
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    // editUrl:'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
                    // Useful options to enforce blogging best practices
                    onInlineTags: 'warn',
                    onInlineAuthors: 'warn',
                    onUntruncatedBlogPosts: 'warn',
                },
                theme: {
                    customCss: './src/css/custom.css',
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        // Replace with your project's social card
        image: 'img/docusaurus-social-card.jpg',
        navbar: {
            title: '雨落辰潇',
            logo: {
                alt: 'My Site Logo',
                src: 'img/logo.svg',
            },
            items: [
                {
                    type: 'docSidebar',
                    sidebarId: 'frontEndSidebar',
                    position: 'left',
                    label: '前端',
                },
                {
                    type: 'docSidebar',
                    sidebarId: 'backEndSidebar',
                    position: 'left',
                    label: '后端',
                },
                {
                    type: 'docSidebar',
                    sidebarId: 'interViewSidebar',
                    position: 'left',
                    label: '面试',
                },
                {
                    type: 'search',
                    position: 'right', // 确保搜索框位于右侧
                },
                { to: '/blog', label: '博客', position: 'left' },
                {
                    href: 'https://github.com/sakuramuxia',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
            links: [
                
                {
                    title: 'Community',
                    items: [
                        {
                            label: 'bilibili',
                            href: 'https://space.bilibili.com/69727471',
                        },
                        {
                            label: 'github',
                            href: 'https://github.com/SakuraMuxia',
                        },
                        
                    ],
                },
                {
                    title: 'More',
                    items: [
                        {
                            label: 'Another doc',
                            href: 'https://sakuramuxia.github.io/vitepress/',
                        },
                        {
                            label: 'weibo',
                            href: 'https://weibo.com/u/3167925153',
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} By 雨落辰潇`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
