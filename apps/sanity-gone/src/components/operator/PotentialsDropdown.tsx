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
import { useStore } from "@nanostores/react";
import { localeStore } from "~/pages/[locale]/_store.ts";
import { useTranslations } from "~/i18n/utils.ts";
import type { ui } from "~/i18n/ui.ts";

const potentialLabel = (potential: number, potentialString: string) => {
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
			<span className="leading-none">
				{potentialString} {potential + 1}
			</span>
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

	const locale = useStore(localeStore);
	const t = useTranslations(locale);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				disabled={
					!potentialsToShow ||
					(potentialsToShow.length === 1 &&
						potentialsToShow[0] === currentPotential)
				}
			>
				{potentialLabel(
					currentPotential,
					t("operators.details.general.potential")
				)}
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
								{potentialLabel(
									pot,
									t("operators.details.general.potential")
								)}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			)}
		</DropdownMenu>
	);
};
export default PotentialsDropdown;
