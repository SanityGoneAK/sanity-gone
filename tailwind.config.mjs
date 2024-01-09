/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		fontFamily: {
			sans: ["Source Sans Pro", "sans-serif"],
			serif: ["Crimson Text", "serif"],
		},
		colors: {
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
				100: "#B8B8C0", // grite? light light gray? grayBrighterer?
				200: "#87879B", // gray
				300: "#686879", // gridtone? idk
				400: "#484858", // midtoneBrighterer
				500: "#363643", // midtoneBrighter
				600: "#24242E", // midtone
				700: "#191920", // midtoneDarker
				800: "#14141B", // darktone
				900: "#101014", // black
				950: "#050507", // blackest
			},
			rarity: {
				1: {
					DEFAULT: "#E8E8F2",
					dark: "#D8D8E7",
				},
				2: {
					DEFAULT: "#d3ff77",
					dark: "#a7e855",
				},
				3: {
					DEFAULT: "#7cd8ff",
					dark: "#49b3ff",
				},
				4: {
					DEFAULT: "#d1d0ee",
					dark: "#9d9bf4",
				},
				5: {
					DEFAULT: "#ffe9b0",
					dark: "#e5c675",
				},
				6: {
					DEFAULT: "#ff9254",
					dark: "#ede637",
				},
			},
		},
		extend: {
			boxShadow: {
				"3xl": "8px 8px 16px 0px rgba(0, 0, 0, 0.25)",
			},
		},
	},
	plugins: [],
};
