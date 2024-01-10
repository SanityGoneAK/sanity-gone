import type { Preview } from "@storybook/react";

import SvgRarityGradientDefs from "~/components/operator/SvgRarityGradientDefs";

import "~/styles/base.css";

const preview: Preview = {
	parameters: {
		actions: { argTypesRegex: "^on[A-Z].*" },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
};

export default preview;

export const decorators = [
	(Story) => (
		<>
			<Story />
			<SvgRarityGradientDefs />
		</>
	),
];
