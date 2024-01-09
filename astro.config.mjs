import { defineConfig } from "astro/config";
import path from "path";
import react from "@astrojs/react";
import astroI18next from "astro-i18next";
import node from "@astrojs/node";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
	output: "server",
	integrations: [
		react(),
		astroI18next(),
		tailwind({
			applyBaseStyles: "false",
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
