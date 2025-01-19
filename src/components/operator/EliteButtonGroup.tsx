import React, { createElement, useMemo } from "react";

import { EliteZeroIcon, EliteOneIcon, EliteTwoIcon } from "~/components/icons";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { cx } from "~/utils/styles.ts";

interface Props {
	eliteLevelsToShow: number[];
	currentElite: number;
	onChange: (newElite: number) => void;
}

const EliteButtonGroup: React.FC<Props> = ({
	eliteLevelsToShow,
	currentElite,
	onChange,
}) => {
	const eliteLevels = useMemo(
		() => [...eliteLevelsToShow].sort(),
		[eliteLevelsToShow]
	);

	return (
		<ToggleGroup.Root
			type="single"
			role="group"
			value={currentElite.toString()}
			defaultValue={currentElite.toString()}
			onValueChange={(value) => onChange(Number(value))}
			className="flex items-center border rounded border-neutral-600"
		>
			{eliteLevels.map((elite) => (
				<EliteButton
					key={elite}
					elite={elite}
					currentElite={currentElite}
				/>
			))}
		</ToggleGroup.Root>
	);
};
export default EliteButtonGroup;

const EliteButton: React.FC<{
	elite: number;
	currentElite: number;
}> = ({ elite, currentElite }) => {
	return (
		<ToggleGroup.Item
			value={elite.toString()}
			className="background-none group flex size-10 p-2 cursor-pointer items-center justify-center border-none py-2 leading-[0] data-[state=on]:rounded data-[state=on]:bg-yellow"
			aria-label={`Elite ${elite}`}
		>
			{getEliteIconComponent(elite, currentElite == elite)}
		</ToggleGroup.Item>
	);
};

export function getEliteIconComponent(elite: number, activeElite: boolean) {
	switch (elite) {
		case 0:
			return <EliteZeroIcon className={cx('fill-[transparent] stroke-1', {'stroke-neutral-200': !activeElite, 'stroke-neutral-900': activeElite})} />;
		case 1:
			return <EliteOneIcon className={cx({'fill-neutral-200': !activeElite, 'fill-neutral-900': activeElite})}/>;
		case 2:
			return <EliteTwoIcon className={cx({'fill-neutral-200': !activeElite, 'fill-neutral-900': activeElite})}/>;
		default:
			throw new Error(`There's no such thing as Elite ${elite}`);
	}
}
