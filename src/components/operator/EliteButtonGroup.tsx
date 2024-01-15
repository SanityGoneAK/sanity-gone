import React, { createElement } from "react";

import { EliteZeroIcon, EliteOneIcon, EliteTwoIcon } from "~/components/icons";

interface Props {
	maxElite: number;
	currentElite: number;
	onChange: (newElite: number) => void;
}

const EliteButtonGroup: React.FC<Props> = ({
	maxElite,
	currentElite,
	onChange,
}) => {
	return (
		<div role="group" className="flex items-center gap-x-3">
			{Array(maxElite + 1)
				.fill(0)
				.map((_, i) => (
					<EliteButton
						key={i}
						elite={i}
						active={i === currentElite}
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
	let icon = null;
	switch (elite) {
		case 0:
			icon = EliteZeroIcon;
			break;
		case 1:
			icon = EliteOneIcon;
			break;
		case 2:
			icon = EliteTwoIcon;
			break;
	}
	if (!icon) {
		return null;
	}

	return (
		<button
			className="background-none group flex h-8 w-8 cursor-pointer items-center justify-center border-none py-2 leading-[0]"
			onClick={() => onClick(elite)}
			aria-pressed={active}
			aria-label={`Elite ${elite}`}
		>
			{createElement(icon, {
				active,
			})}
		</button>
	);
};
