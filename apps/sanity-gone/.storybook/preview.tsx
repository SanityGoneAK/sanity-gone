import type { Preview } from '@storybook/react-vite'
import SvgRarityGradientDefs from '~/components/operator/SvgRarityGradientDefs';

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

export const decorators = [
	(Story: any) => (
		<>
			<Story />
			<SvgRarityGradientDefs />
		</>
	),
];

export default preview;