import { useState } from "react";

import { range } from "lodash-es";

import EliteButtonGroup from "./EliteButtonGroup";

import type { StoryObj } from "@storybook/react";

export default { component: EliteButtonGroup };

export const Default: StoryObj<typeof EliteButtonGroup> = {
	args: {
		eliteLevelsToShow: range(3),
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
