import Tooltip from "~/components/ui/Tooltip";
import { itemImage } from "~/utils/images.ts";
import { cx } from "~/utils/styles.ts";

import itemsJson from "../../../data/items.json";
import { EliteOneIcon, EliteTwoIcon, EliteZeroIcon } from "../icons";

import type * as OutputTypes from "~/types/output-types";

interface Props {
	minElite?: number;
	minLevel?: number;
	minSkillLevel?: number;
	itemCosts: OutputTypes.ItemCost[];
}

const shortNumberFormat = Intl.NumberFormat("en-US", {
	notation: "compact",
	maximumFractionDigits: 2,
});

const MaterialRequirements: React.FC<Props> = ({
	itemCosts,
	minElite,
	minLevel = 1,
	minSkillLevel = 1,
}) => {
	return (
		<div className="grid auto-cols-min grid-flow-col items-center justify-start gap-x-4">
			{minElite != null && (
				<div className="grid grid-cols-[16px_auto] items-center gap-x-2 rounded-lg bg-neutral-500/[.33] px-2.5 py-2">
					{minElite === 0 && <EliteZeroIcon active />}
					{minElite === 1 && <EliteOneIcon active />}
					{minElite === 2 && <EliteTwoIcon active />}
					<span className="text-transparent bg-gradient-to-b from-yellow-light to-yellow bg-clip-text text-base font-semibold leading-none">
						Lv{minLevel}
					</span>
				</div>
			)}
			{minSkillLevel > 1 &&
				// TODO
				null}
			<div className="grid grid-flow-col gap-x-2">
				{itemCosts.map(({ id, count }) => {
					const { name, rarity } =
						itemsJson[id as keyof typeof itemsJson];
					return (
						<Tooltip key={id} content={name.en_US}>
							<div
								className="inline-grid h-[52px] w-[52px]"
								style={{
									gridTemplateAreas: "'stack'",
								}}
							>
								<div
									className={cx(
										"h-[52px] w-[52px] rounded-full border-2",
										{
											5: "border-yellow-light bg-yellow-light/30",
											4: "border-purple-light bg-purple-light/30",
											3: "border-blue-light bg-blue-light/30",
											2: "border-green-light bg-green-light/30",
											1: "border-neutral-50 bg-neutral-50/30",
										}[rarity]
									)}
									style={{
										gridArea: "stack",
									}}
								/>
								<img
									className="z-[1] h-[52px] w-[52px]"
									src={itemImage(id)}
									alt={name.en_US}
									style={{
										gridArea: "stack",
									}}
								/>
								<span
									className="z-[2] inline-block self-end justify-self-end rounded-lg bg-neutral-950 px-1 py-0.5 text-sm font-semibold leading-none"
									style={{
										gridArea: "stack",
									}}
								>
									<span className="visually-hidden">
										Count: {count}
									</span>
									<span aria-hidden="true">
										{shortNumberFormat.format(count)}
									</span>
								</span>
							</div>
						</Tooltip>
					);
				})}
			</div>
		</div>
	);
};
export default MaterialRequirements;
