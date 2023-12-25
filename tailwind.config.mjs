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
				light: '#FF9B9B',
				DEFAULT: '#F45C5C',
			},
			orange: {
				light: '#FFC397',
				DEFAULT: '#FF994F',
			},
			yellow: {
				light: '#FFEBB8',
				DEFAULT: '#FED874',
			},
			purple: {
				light: '#B1AFFF',
				DEFAULT: '#7F7DEA',
			},
			blue: {
				light: '#83CBFF',
				DEFAULT: '#49B3FF',
			},
			green: {
				light: '#D3FF9B',
				DEFAULT: '#A7E855',
			},
			neutral: {
				100: '#E8E8F2',
				200: '#87879B',
				300: '#484858',
				400: '#363643',
				500: '#24242E',
				600: '#191920',
				700: '#14141B',
				800: '#101014',
				900: '#050507',
			}
		},
		extend: {
			boxShadow: {
				'3xl': '8px 8px 16px 0px rgba(0, 0, 0, 0.25)',
			}
		},
	},
	plugins: [],
};
