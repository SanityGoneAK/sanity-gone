import operatorsJson from "data/operators.json";

import CharacterStats from "./CharacterStats";

import type { Meta, StoryObj } from "@storybook/react";

export default {
	component: CharacterStats,
} as Meta<typeof CharacterStats>;

const ops = Object.values(operatorsJson);

const Template: StoryObj<typeof CharacterStats> = {
	args: {
		character: ops[0],
		elite: 2,
		level: 90,
	},
};

export const Default = {
	...Template,
};
