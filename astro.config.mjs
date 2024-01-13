import path from "path";

import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	output: "server",
	i18n: {
		defaultLocale: "en",
		locales: [
			{
				path: "en",
				codes: ["en-US", "en_US", "en"],
			},
			{
				path: "jp",
				codes: ["ja-JP", "ja_JP", "jp", "ja"],
			},
			{
				path: "kr",
				codes: ["ko-KR", "ko_KR", "kr", "ko"],
			},
			{
				path: "zh-cn",
				codes: ["zh-CN", "zh-cn", "zh_CN", "cn", "zh-Hans-CN"],
			},
		],
		routing: {
			prefixDefaultLocale: true,
		},
	},
	integrations: [
		react(),
		tailwind({
			applyBaseStyles: false,
		}),
	],
	adapter: node({
		mode: "standalone",
	}),
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
	},
});
