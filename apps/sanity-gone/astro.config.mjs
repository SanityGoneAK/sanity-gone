import path from "path";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";

import remarkToc from 'remark-toc';

import { defaultLang } from "./src/i18n/languages";

import mdx from "@astrojs/mdx";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
    output: "static",
    i18n: {
        defaultLocale: defaultLang,
        locales: [
            {
                path: "en",
                codes: ["en-US", "en_US", "en"],
            },
            {
                path: "ja",
                codes: ["ja-JP", "ja_JP", "jp", "ja"],
            },
            {
                path: "ko",
                codes: ["ko-KR", "ko_KR", "kr", "ko"],
            },
            {
                path: "zh-cn",
                codes: ["zh-CN", "zh-cn", "zh_CN", "cn", "zh-Hans-CN"],
            },
            // TODO: Support TW
            // {
            // 	path: "zh-tw",
            // 	codes: ["zh-tw_TW", "zh-tw", 'zh_TW', 'tw', 'zh-Hant-TW'],
            // }
        ],
        routing: {
            prefixDefaultLocale: true,
            redirectToDefaultLocale: false,
        },
    },
    integrations: [react(), mdx()],
    adapter: cloudflare(),
    markdown: {
        remarkPlugins: [],
    },
    vite: {
        build: {
            rollupOptions: {
                output: {
                    manualChunks: (id) => {
                        // force .json imports into their own chunks
                        // so that they aren't inadvertently redownloaded
                        if (id.endsWith(".json")) {
                            const { base } = path.parse(id);
                            return base;
                        }
                        return;
                    },
                },
            },
        },
        resolve: {
            // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
            // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
            alias: import.meta.env.PROD && {
              "react-dom/server": "react-dom/server.edge",
            },
          },
        // vite warns if this option isn't present for some reason
        // css: {
        // 	postcss: {
        // 		plugins: [tailwindcssNesting],
        // 	},
        // },
        plugins: [tailwindcss()]
    },
});