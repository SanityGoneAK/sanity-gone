import path from "path";

import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import astroI18next from "astro-i18next";

// https://astro.build/config
export default defineConfig({
	output: "server",
	integrations: [
		react(),
		astroI18next(),
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
