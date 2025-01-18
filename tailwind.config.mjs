import tailwindCssGridAreas from "@savvywombat/tailwindcss-grid-areas";

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		fontFamily: {
			sans: ["Source Sans Pro", "sans-serif"],
			serif: ["Crimson Text", "serif"],
		},
		colors: {
			transparent: {
				DEFAULT: "transparent",
			},
			red: {
				light: "#FF9B9B",
				DEFAULT: "#F45C5C",
			},
			orange: {
				light: "#FFC397",
				DEFAULT: "#FF994F",
			},
			yellow: {
				light: "#FFEBB8",
				DEFAULT: "#FED874",
			},
			purple: {
				light: "#B1AFFF",
				DEFAULT: "#7F7DEA",
			},
			blue: {
				light: "#83CBFF",
				DEFAULT: "#49B3FF",
			},
			green: {
				light: "#D3FF9B",
				DEFAULT: "#A7E855",
			},
			neutral: {
				50: "#E8E8F2", // white
				100: "#B8B8C0", // offwhite (it's grite in my heart)
				200: "#87879B", // gray
				300: "#686879", // graytone (gridtone in my heart)
				400: "#484858", // midtoneBrighterer
				500: "#363643", // midtoneBrighter
				600: "#24242E", // midtone
				700: "#191920", // midtoneDarker
				800: "#14141B", // darktone
				900: "#101014", // black
				950: "#050507", // blackest
			},
		},
		extend: {
			boxShadow: {
				"3xl": "8px 8px 16px 0px rgba(0, 0, 0, 0.25)",
			},
			gridTemplateRows: {
				"desktop-layout": "64px 1fr",
				"mobile-layout": "64px 64px 1fr",
			},
			gridTemplateColumns: {
				"desktop-layout": "228px 1fr",
				"mobile-layout": "1fr",
			},
			// prettier-ignore
			gridTemplateAreas: {
				"desktop-layout": [
					"logo topright",
					"sidebar main"
				],
				"mobile-layout": [
					"logo",
					"search",
					"main"
				],
				"skills": [
					"icon name",
					"icon skilltype"
				],
				"skills-mobile": [
					"icon name",
					"skilltype skilltype"
				],
				"module-title": [
					"icon name",
					"icon code"
				],
				"module": [
					"image title", 
					"image stats", 
					"image trait", 
				],
				"op-info": [
					"icon name",
					"icon classes"
				],
				"op-info-mobile": [
					"icon name",
					"classes classes"
				],
			},
			screens: {
				"xl": "1360px", // biggest layout - operator screen is full size
			},
		},
	},
	/** @type {any} tailwindcss-grid-areas seems to have a different plugin API from tailwind typings */
	plugins: [tailwindCssGridAreas],
};
