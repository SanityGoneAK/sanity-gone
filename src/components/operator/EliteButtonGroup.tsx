import React, { createElement, useMemo } from "react";

import { EliteZeroIcon, EliteOneIcon, EliteTwoIcon } from "~/components/icons";

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
		<div role="group" className="flex items-center gap-x-3">
			{eliteLevels.map((elite) => (
				<EliteButton
					key={elite}
					elite={elite}
					active={elite === currentElite}
					onClick={onChange}
				/>
			))}
		</div>
	);
};
export default EliteButtonGroup;

const EliteButton: React.FC<{
	elite: number;
	active?: boolean;
	onClick: (newElite: number) => void;
}> = ({ elite, active, onClick }) => {
	return (
		<button
			className="background-none group flex h-8 w-8 cursor-pointer items-center justify-center border-none py-2 leading-[0]"
			onClick={() => onClick(elite)}
			aria-pressed={active}
			aria-label={`Elite ${elite}`}
		>
			{createElement(getEliteIconComponent(elite), { active })}
		</button>
	);
};

export function getEliteIconComponent(elite: number) {
	switch (elite) {
		case 0:
			return EliteZeroIcon;
		case 1:
			return EliteOneIcon;
		case 2:
			return EliteTwoIcon;
		default:
			throw new Error(`There's no such thing as Elite ${elite}`);
	}
}
