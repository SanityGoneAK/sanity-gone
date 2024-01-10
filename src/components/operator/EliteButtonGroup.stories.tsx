import { useState } from "react";

import EliteButtonGroup from "./EliteButtonGroup";

import type { StoryObj } from "@storybook/react";

export default { component: EliteButtonGroup };

export const Default: StoryObj<typeof EliteButtonGroup> = {
	args: {
		maxElite: 2,
		currentElite: 0,
	},
	render: (args) => {
		const [elite, setElite] = useState(args.currentElite);
		return (
			<EliteButtonGroup
				{...args}
				currentElite={elite}
				onChange={setElite}
			/>
		);
	},
};
