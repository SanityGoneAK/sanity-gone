import { useState } from "react";

import { range } from "lodash-es";

import OldEliteButtonGroup from "./OldEliteButtonGroup.tsx";

import type { StoryObj } from "@storybook/react";

export default { component: OldEliteButtonGroup };

export const Default: StoryObj<typeof OldEliteButtonGroup> = {
	args: {
		eliteLevelsToShow: range(3),
		currentElite: 0,
	},
	render: (args) => {
		const [elite, setElite] = useState(args.currentElite);
		return (
			<OldEliteButtonGroup
				{...args}
				currentElite={elite}
				onChange={setElite}
			/>
		);
	},
};
