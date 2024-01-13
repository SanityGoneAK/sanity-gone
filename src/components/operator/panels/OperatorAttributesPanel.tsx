import { useMemo, useState } from "react";

import { useStore } from "@nanostores/react";

import { Checkbox } from "~/components/ui/Checkbox";
import PillButtonGroup from "~/components/ui/PillButtonGroup";
import SliderWithInput from "~/components/ui/SliderWithInput";
import { operatorStore } from "~/pages/[locale]/operators/_store";

import CharacterStats from "../CharacterStats";
import EliteButtonGroup from "../EliteButtonGroup";
import MaterialRequirements from "../MaterialRequirements";

import type * as OutputTypes from "~/types/output-types";

const LMD_ITEM_ID = "4001";

const OperatorAttributesPanel: React.FC = () => {
	const operator = useStore(operatorStore);
	const maxElite = operator.phases.length - 1;
	const [elite, setElite] = useState(maxElite);
	const [level, setLevel] = useState(operator.phases.at(-1)!.maxLevel);
	const moduleTypes = useMemo(() => {
		return [
			"None",
			...operator.modules
				.map((module) => module.moduleIcon.at(-1)!.toUpperCase())
				.sort((a, b) => a.localeCompare(b)),
		];
	}, [operator.modules]);
	const [moduleType, setModuleType] = useState(moduleTypes.at(-1)!);
	const [moduleLevel, setModuleLevel] = useState(3);
	const [isTrustBonusChecked, setTrustBonusChecked] = useState(false);
	const [isPotentialBonusChecked, setPotentialBonusChecked] = useState(false);

	const moduleId =
		moduleType === "None"
			? null
			: operator.modules.find((module) =>
					module.moduleIcon.endsWith(moduleType)
				)!.moduleId;

	const itemCosts = useMemo(() => {
		const itemCosts: OutputTypes.ItemCost[] = [];
		const lmdCost = upgradeLmdCost(operator.rarity, elite);
		if (lmdCost > 0) {
			itemCosts.push({
				id: LMD_ITEM_ID,
				count: lmdCost,
			});
		}
		itemCosts.push(...(operator.phases[elite].evolveCost ?? []));
		return itemCosts;
	}, [elite, operator.phases, operator.rarity]);
	const minElite = elite > 0 ? elite - 1 : 0;
	const minLevel = maxLevelAtElite(operator.rarity, minElite);

	const handleEliteChange = (newElite: number) => {
		setElite(newElite);
		setLevel(Math.min(operator.phases[newElite].maxLevel, level));
	};

	return (
		<>
			<div className="grid items-center gap-y-4 border-b border-neutral-600 bg-gradient-to-b from-neutral-800 to-neutral-700 p-6">
				<div className="grid grid-cols-[auto_1fr] items-center gap-x-4">
					<EliteButtonGroup
						currentElite={elite}
						maxElite={maxElite}
						onChange={handleEliteChange}
					/>
					<SliderWithInput
						type="level"
						max={operator.phases[elite].maxLevel}
						value={level}
						onChange={setLevel}
					/>
				</div>
				<div className="grid grid-cols-[auto_auto_1fr] items-center gap-x-6">
					<div>
						<Checkbox
							className="text-neutral-200"
							label="Trust Bonus"
							checked={isTrustBonusChecked}
							onChange={setTrustBonusChecked}
						/>
					</div>
					<div>
						<Checkbox
							className="text-neutral-200"
							label="Potential Bonus"
							checked={isPotentialBonusChecked}
							onChange={setPotentialBonusChecked}
						/>
					</div>
					{moduleTypes.length > 1 && (
						<div className="flex items-center gap-x-2 justify-self-end">
							<span className="text-neutral-200">Module</span>
							<PillButtonGroup
								labels={moduleTypes}
								value={moduleType}
								onChange={setModuleType}
							/>
							<PillButtonGroup
								labels={[1, 2, 3]}
								value={moduleLevel}
								onChange={setModuleLevel}
								disabled={moduleType === "None"}
							/>
						</div>
					)}
				</div>
			</div>
			<div className="grid gap-y-4 bg-neutral-800 p-6">
				<CharacterStats
					character={operator}
					elite={elite}
					level={level}
					moduleId={moduleId}
					moduleLevel={moduleLevel}
					usePotentialBonus={isPotentialBonusChecked}
					useTrustBonus={isTrustBonusChecked}
				/>
				{itemCosts.length > 0 && (
					<>
						<h2 className="text-lg font-semibold leading-[23px]">
							Promotion Requirements
						</h2>
						<MaterialRequirements
							itemCosts={itemCosts}
							minElite={minElite}
							minLevel={minLevel}
						/>
					</>
				)}
			</div>
		</>
	);
};

export default OperatorAttributesPanel;

function maxLevelAtElite(rarity: number, elite: number) {
	switch (rarity) {
		case 1:
		case 2:
			return 30;
		case 3:
			if (elite === 1) return 55;
			return 40;
		case 4:
			if (elite === 2) return 70;
			if (elite === 1) return 60;
			return 45;
		case 5:
			if (elite === 2) return 80;
			if (elite === 1) return 70;
			return 50;
		case 6:
			if (elite === 2) return 90;
			if (elite === 1) return 80;
			return 50;
	}
}

function upgradeLmdCost(rarity: number, elite: number) {
	switch (rarity) {
		case 3:
			if (elite === 1) {
				return 10000;
			}
			return 0;
		case 4:
			if (elite === 2) {
				return 60000;
			}
			if (elite === 1) {
				return 15000;
			}
			return 0;
		case 5:
			if (elite === 2) {
				return 120000;
			}
			if (elite === 1) {
				return 20000;
			}
			return 0;
		case 6:
			if (elite === 2) {
				return 180000;
			}
			if (elite === 1) {
				return 30000;
			}
			return 0;
		default:
			return 0;
	}
}
