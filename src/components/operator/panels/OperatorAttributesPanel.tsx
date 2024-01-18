import { useMemo, useState } from "react";

import { useStore } from "@nanostores/react";

import CharacterRange from "~/components/operator/CharacterRange";
import CharacterStats from "~/components/operator/CharacterStats";
import EliteButtonGroup from "~/components/operator/EliteButtonGroup";
import MaterialRequirements from "~/components/operator/MaterialRequirements";
import Checkbox from "~/components/ui/Checkbox";
import PillButtonGroup from "~/components/ui/PillButtonGroup";
import SliderWithInput from "~/components/ui/SliderWithInput";
import { operatorStore } from "~/pages/[locale]/operators/_store";
import { getStatsAtLevel } from "~/utils/character-stats";
import { tokenImage } from "~/utils/images";

import type { CheckedState } from "@radix-ui/react-checkbox";
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
	const { rangeObject: range } = getStatsAtLevel(operator, {
		eliteLevel: elite,
		level,
		pots: isPotentialBonusChecked,
		trust: isTrustBonusChecked,
		moduleId,
		moduleLevel,
	});
	const summon = operator.summons.length === 1 ? operator.summons[0] : null;
	const summonRange = summon
		? getStatsAtLevel(
				summon,
				{
					eliteLevel: elite,
					level,
					pots: isPotentialBonusChecked,
					trust: isTrustBonusChecked,
					moduleId,
					moduleLevel,
				},
				summon.charId,
				operator
			).rangeObject
		: null;

	const handleEliteChange = (newElite: number) => {
		setElite(newElite);
		setLevel(Math.min(operator.phases[newElite].maxLevel, level));
	};

	const handleTrustBonusCheckedChange = (checked: CheckedState) => {
		setTrustBonusChecked(checked === true); // we're assuming "indeterminate" is impossible here
	};

	return (
		<>
			<div className="grid items-center gap-y-4 border-b border-neutral-600 p-6">
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
						<label className="flex cursor-pointer items-center gap-2 text-neutral-200">
							<Checkbox
								checked={isTrustBonusChecked}
								onCheckedChange={handleTrustBonusCheckedChange}
							/>
							Trust
						</label>
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
			<div className="grid gap-y-4 rounded-br-lg bg-neutral-800 p-6">
				<div className="flex flex-col gap-4">
					<CharacterStats
						character={operator}
						elite={elite}
						level={level}
						moduleId={moduleId}
						moduleLevel={moduleLevel}
						usePotentialBonus={isPotentialBonusChecked}
						useTrustBonus={isTrustBonusChecked}
					/>
					<div
						className="grid grid-cols-[auto,1fr] items-center justify-items-center gap-x-2 rounded-lg bg-neutral-600
	p-4 text-neutral-200
	"
					>
						<span>Range</span>
						<CharacterRange rangeObject={range} />
					</div>

					{summon && (
						<div className="flex rounded bg-neutral-900">
							<img
								className="border-r border-neutral-600"
								width="100"
								src={tokenImage(summon.charId)}
								alt={summon.name}
							/>
							<div className="flex flex-grow flex-col gap-4 p-4">
								<CharacterStats
									character={summon}
									elite={elite}
									level={level}
									moduleId={moduleId}
									moduleLevel={moduleLevel}
									usePotentialBonus={isPotentialBonusChecked}
									useTrustBonus={isTrustBonusChecked}
									parentCharacter={operator}
								/>
								<div className="border-t border-neutral-600" />
								<div className="grid grid-cols-[auto,1fr] items-center justify-items-center px-4 text-neutral-200">
									<span>Range</span>
									<CharacterRange
										rangeObject={summonRange!}
									/>
								</div>
							</div>
						</div>
					)}
				</div>
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
