import Checkbox from "./Checkbox";

import type { Meta, StoryObj } from "@storybook/react";

export default {
	component: Checkbox,
} satisfies Meta<typeof Checkbox>;

export const Default: StoryObj<typeof Checkbox> = {
	args: {
		variant: "primary",
		checked: true,
	},
};
