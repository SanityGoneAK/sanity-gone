import { useMemo, useState } from "react";

import { useStore } from "@nanostores/react";
import { range } from "lodash-es";

import CharacterRange from "~/components/operator/CharacterRange";
import CharacterStats from "~/components/operator/CharacterStats";
import EliteButtonGroup from "~/components/operator/EliteButtonGroup";
import MaterialRequirements from "~/components/operator/MaterialRequirements";
import PotentialsDropdown from "~/components/operator/PotentialsDropdown";
import Checkbox from "~/components/ui/Checkbox";
import Input from "~/components/ui/Input";
import PillButtonGroup from "~/components/ui/OldPillButtonGroup";
import SliderWithInput from "~/components/ui/SliderWithInput";
import { useTranslations } from "~/i18n/utils.ts";
import { localeStore } from "~/pages/[locale]/_store.ts";
import { operatorStore } from "~/pages/[locale]/operators/_slugstore";
import {
	getPotentialsWithStatChanges,
	getStatsAtLevel,
} from "~/utils/character-stats";
import { tokenImage } from "~/utils/images";
import { cx } from "~/utils/styles.ts";

import type { CheckedState } from "@radix-ui/react-checkbox";
import type { ui } from "~/i18n/ui.ts";
import type * as OutputTypes from "~/types/output-types";

const LMD_ITEM_ID = "4001";

const OperatorAttributesPanel: React.FC = () => {
	const locale = useStore(localeStore);
	const t = useTranslations(locale);

	const operator = useStore(operatorStore);
	const maxElite = operator.phases.length - 1;
	const [elite, setElite] = useState(maxElite);
	const [level, setLevel] = useState(operator.phases.at(-1)!.maxLevel);
	const moduleTypes = useMemo(() => {
		return [
			...operator.modules
				.map((module) => module.moduleIcon.at(-1)!.toUpperCase())
				.sort((a, b) => a.localeCompare(b)),
		];
	}, [operator.modules]);
	const [moduleType, setModuleType] = useState(moduleTypes.at(-1)!);
	const [moduleLevel, setModuleLevel] = useState(3);
	const [isTrustChecked, setTrustChecked] = useState(true);
	const [isModuleTypeChecked, setModuleTypeChecked] = useState(true);
	const [trust, setTrust] = useState(100);
	const [potential, setPotential] = useState(0);

	const trustToUse = isTrustChecked ? trust : 0;

	const moduleId =
		isModuleTypeChecked === false || moduleTypes.length === 0
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
	const { rangeObject } = getStatsAtLevel(operator, {
		eliteLevel: elite,
		level,
		potential,
		trust: trustToUse,
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
					potential,
					trust: trustToUse,
					moduleId,
					moduleLevel,
				},
				summon.charId,
				operator
			).rangeObject
		: null;

	const potsWithStatChanges = getPotentialsWithStatChanges(operator);

	const handleEliteChange = (newElite: number) => {
		setElite(newElite);
		setLevel(Math.min(operator.phases[newElite].maxLevel, level));
	};

	const handleTrustBonusCheckedChange = (checked: CheckedState) => {
		setTrustChecked(checked === true); // we're assuming "indeterminate" is impossible here
	};

	const handleModuleCheckedChange = (checked: CheckedState) => {
		setModuleTypeChecked(checked === true); // we're assuming "indeterminate" is impossible here
	};

	const handleTrustChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.validity.valid && e.target.value.length > 0) {
			setTrust(parseInt(e.target.value, 10));
		}
	};

	return (
		<div className="flex flex-col gap-4 p-6">
			<div className="grid items-center gap-y-4 border-b border-neutral-600 pb-4">
				<div className="grid grid-cols-1 items-center gap-x-4 gap-y-4 sm:grid-cols-[auto_1fr]">
					<div className="flex items-center justify-end gap-2">
						<span className="text-neutral-200 sm:hidden">
							{t("operators.details.general.elite")}
						</span>
						<EliteButtonGroup
							currentElite={elite}
							eliteLevelsToShow={range(maxElite + 1)}
							onChange={handleEliteChange}
						/>
					</div>
					<SliderWithInput
						type="level"
						max={operator.phases[elite].maxLevel}
						value={level}
						onChange={setLevel}
					/>
				</div>
				{/* 600px is the breakpoint at which this specific UI element breaks. */}
				<div
					className={cx(
						"grid grid-cols-[auto_auto] items-center gap-x-4 gap-y-4",
						moduleTypes.length &&
							moduleTypes.length < 3 &&
							"sm:grid-cols-[auto_auto_1fr]"
					)}
				>
					<div className="flex items-center gap-2">
						<label className="flex cursor-pointer items-center gap-2 text-neutral-200">
							<Checkbox
								variant={"info"}
								checked={isTrustChecked}
								onCheckedChange={handleTrustBonusCheckedChange}
							/>
							{t("operators.details.attributes.trust")}
						</label>
						<Input
							aria-label="Trust level"
							type="number"
							min={0}
							max={200}
							value={trust}
							onFocus={(e) => e.target.select()}
							onChange={handleTrustChange}
							className="w-11"
						/>
					</div>
					<div className={"flex justify-self-end"}>
						<PotentialsDropdown
							currentPotential={potential}
							onChange={setPotential}
							potentialsToShow={potsWithStatChanges}
						/>
					</div>
					{moduleTypes.length > 0 && (
						<div
							className={cx(
								`col-span-2 flex w-full items-center gap-x-2 justify-self-end`,
								moduleTypes.length < 3 &&
									"sm:col-span-1 sm:w-auto"
							)}
						>
							<label className="flex cursor-pointer items-center gap-2 text-neutral-200">
								<Checkbox
									variant={"info"}
									checked={isModuleTypeChecked}
									onCheckedChange={handleModuleCheckedChange}
								/>
								{t("operators.details.attributes.module")}
							</label>
							<div
								className={`flex-grow ${locale === "ja" ? "sm:hidden" : "hidden"}`}
							></div>
							<PillButtonGroup
								labels={moduleTypes}
								value={moduleType}
								onChange={setModuleType}
								disabled={!isModuleTypeChecked}
							/>
							<div
								className={`flex-grow ${moduleTypes.length < 3 && "sm:hidden"} ${locale === "ja" && "hidden"}`}
							></div>
							<span
								className={`text-neutral-200 sm:hidden ${(moduleTypes.length === 3 || locale === "ja") && "hidden"}`}
							>
								{t("operators.details.modules.stage")}
							</span>
							<PillButtonGroup
								labels={[1, 2, 3]}
								value={moduleLevel}
								onChange={setModuleLevel}
								disabled={
									!isModuleTypeChecked ||
									moduleType ===
										t(
											"operators.details.attributes.module_none"
										)
								}
							/>
						</div>
					)}
				</div>
			</div>
			<div className="grid gap-y-4 rounded-br-lg">
				<div className="flex flex-col gap-4">
					<CharacterStats
						character={operator}
						elite={elite}
						level={level}
						moduleId={moduleId}
						moduleLevel={moduleLevel}
						potential={potential}
						trust={trustToUse}
					/>
					<div className="grid grid-cols-[auto,1fr] items-center justify-items-center gap-x-2 rounded-lg bg-neutral-600 p-4 text-neutral-200">
						<span>{t("operators.details.general.range")}</span>
						<CharacterRange rangeObject={rangeObject} />
					</div>

					{summon && (
						<div className="flex flex-col items-center rounded bg-neutral-900 sm:flex-row">
							<img
								className="mx-2 my-2 border-neutral-600"
								width="80"
								src={tokenImage(summon.charId)}
								alt={summon.name}
							/>
							<div className="flex w-full flex-grow flex-col gap-4 border-l-0 border-t border-neutral-600 p-4 sm:border-l sm:border-t-0">
								<CharacterStats
									character={summon}
									elite={elite}
									level={level}
									moduleId={moduleId}
									moduleLevel={moduleLevel}
									potential={potential}
									trust={trustToUse}
									parentCharacter={operator}
								/>
								<div className="border-t border-neutral-600" />
								<div className="grid grid-cols-[auto,1fr] items-center justify-items-center px-4 text-neutral-200">
									<span>
										{t("operators.details.general.range")}
									</span>
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
							{t(
								"operators.details.general.promotion_requirements"
							)}
						</h2>
						<MaterialRequirements
							itemCosts={itemCosts}
							minElite={minElite}
							minLevel={minLevel}
						/>
					</>
				)}
			</div>
		</div>
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
