import { range } from "lodash-es";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "~/components/ui/Dropdown";

import {
	PotentialOneIcon,
	PotentialTwoIcon,
	PotentialThreeIcon,
	PotentialFourIcon,
	PotentialFiveIcon,
	PotentialSixIcon,
} from "../icons";

const potentialLabel = (potential: number) => {
	let icon = null;
	switch (potential) {
		case 0:
			icon = (
				<PotentialOneIcon
					className="h-[18px] w-[19px]"
					noPotentialPathClassName="fill-neutral-200"
				/>
			);
			break;
		case 1:
			icon = (
				<PotentialTwoIcon
					className="h-[18px] w-[19px]"
					noPotentialPathClassName="fill-neutral-200"
				/>
			);
			break;
		case 2:
			icon = (
				<PotentialThreeIcon
					className="h-[18px] w-[19px]"
					noPotentialPathClassName="fill-neutral-200"
				/>
			);
			break;
		case 3:
			icon = (
				<PotentialFourIcon
					className="h-[18px] w-[19px]"
					noPotentialPathClassName="fill-neutral-200"
				/>
			);
			break;
		case 4:
			icon = <PotentialFiveIcon className="h-[18px] w-[19px]" />;
			break;
		case 5:
			icon = <PotentialSixIcon className="h-[18px] w-[19px]" />;
			break;
	}
	return (
		<>
			{icon}
			<span>Potential {potential + 1}</span>
		</>
	);
};

export interface PotentialsDropdownProps {
	potentialsToShow?: number[];
	currentPotential: number;
	onChange: (potential: number) => void;
}

const PotentialsDropdown: React.FC<PotentialsDropdownProps> = (props) => {
	const { potentialsToShow, currentPotential, onChange } = props;

	const potList = potentialsToShow ?? range(6); // default to all pots

	return (
		// TODO style this correctly and fix it
		// This is basically a placeholder that kind of works
		// Styles are ass right now because I have no idea how to style this properly
		// Have fun, Blede
		<DropdownMenu
		// TODO maybe we should disable the dropdown if there's only one option?
		// disabled={potList.length === 1 && potList[0] === currentPotential}
		>
			<DropdownMenuTrigger className="grid h-10 cursor-pointer grid-flow-col grid-cols-[max-content] items-center gap-x-2 whitespace-nowrap rounded-[18px] bg-neutral-500 px-3 py-2">
				{potentialLabel(currentPotential)}
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				{potList.map((pot, index) => (
					<DropdownMenuItem
						key={index}
						onSelect={() => onChange(pot)}
					>
						<DropdownMenuLabel className="grid cursor-pointer grid-flow-col grid-cols-[max-content] items-center gap-x-2 whitespace-nowrap bg-neutral-500 px-3 py-2">
							{potentialLabel(pot)}
						</DropdownMenuLabel>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
export default PotentialsDropdown;
