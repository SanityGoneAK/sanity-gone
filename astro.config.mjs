import path from "path";

import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";
import tailwindcssNesting from "tailwindcss/nesting";

import { defaultLang } from "./src/i18n/languages";

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
		],
		routing: {
			prefixDefaultLocale: true,
			redirectToDefaultLocale: false,
		},
	},
	integrations: [
		react(),
		tailwind({
			applyBaseStyles: false,
			nesting: true,
		}),
	],
	adapter: vercel(),
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
		// vite warns if this option isn't present for some reason
		css: {
			postcss: {
				plugins: [tailwindcssNesting],
			},
		},
	},
});
