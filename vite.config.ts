import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// this is here for Storybook-Vite, not for Astro
export default defineConfig({
	plugins: [tsconfigPaths()]
});
