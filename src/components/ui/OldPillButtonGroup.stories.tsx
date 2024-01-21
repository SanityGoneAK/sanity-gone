import { useState } from "react";

import PillButtonGroup from "./OldPillButtonGroup";

import type { StoryObj } from "@storybook/react";

export default {
	component: PillButtonGroup,
};

const Template: StoryObj<typeof PillButtonGroup> = {
	render: (args) => {
		const [value, setValue] = useState(args.value);
		return <PillButtonGroup {...args} value={value} onChange={setValue} />;
	},
};

export const ModuleLevels = {
	...Template,
	args: {
		labels: ["1", "2", "3"],
		value: "3",
	},
};

export const ModuleTypes = {
	...Template,
	args: {
		labels: ["None", "X", "Y"],
		value: "None",
	},
};
