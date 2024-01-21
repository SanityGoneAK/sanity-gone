import {
	PotentialOneIcon,
	PotentialTwoIcon,
	PotentialThreeIcon,
	PotentialFourIcon,
	PotentialFiveIcon,
	PotentialSixIcon,
} from "~/components/icons";
import DropdownArrow from "~/components/icons/DropdownArrow";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "~/components/ui/Dropdown";

const potentialLabel = (potential: number) => {
	let icon = null;
	switch (potential) {
		case 0:
			icon = (
				<PotentialOneIcon
					className="h-[16px] w-auto"
					noPotentialPathClassName="fill-neutral-200"
				/>
			);
			break;
		case 1:
			icon = (
				<PotentialTwoIcon
					className="h-[16px] w-auto"
					noPotentialPathClassName="fill-neutral-200"
				/>
			);
			break;
		case 2:
			icon = (
				<PotentialThreeIcon
					className="h-[16px] w-auto"
					noPotentialPathClassName="fill-neutral-200"
				/>
			);
			break;
		case 3:
			icon = (
				<PotentialFourIcon
					className="h-[16px] w-auto"
					noPotentialPathClassName="fill-neutral-200"
				/>
			);
			break;
		case 4:
			icon = <PotentialFiveIcon className="h-[16px] w-auto" />;
			break;
		case 5:
			icon = <PotentialSixIcon className="h-[16px] w-auto" />;
			break;
	}
	return (
		<>
			{icon}
			<span className="leading-none">Potential {potential + 1}</span>
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
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				disabled={
					!potentialsToShow ||
					(potentialsToShow.length === 1 &&
						potentialsToShow[0] === currentPotential)
				}
			>
				{potentialLabel(currentPotential)}
				<DropdownArrow />
			</DropdownMenuTrigger>
			{potentialsToShow && potentialsToShow.length > 0 && (
				<DropdownMenuContent>
					<DropdownMenuRadioGroup
						value={`${currentPotential}`}
						onValueChange={(value) => onChange(parseInt(value, 10))}
					>
						{potentialsToShow.map((pot) => (
							<DropdownMenuRadioItem key={pot} value={`${pot}`}>
								{potentialLabel(pot)}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			)}
		</DropdownMenu>
	);
};
export default PotentialsDropdown;
