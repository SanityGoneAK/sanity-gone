import { useMemo, useState } from "react";

import { useStore } from "@nanostores/react";

import { SpCostIcon, InitialSpIcon, HourglassIcon } from "~/components/icons";
import CharacterRange from "~/components/operator/CharacterRange";
import MaterialRequirements from "~/components/operator/MaterialRequirements";
import PillButtonGroup from "~/components/ui/OldPillButtonGroup";
import SliderWithInput from "~/components/ui/SliderWithInput";
import { operatorStore } from "~/pages/[locale]/operators/_store";
import * as OutputTypes from "~/types/output-types";
import { phaseToNumber } from "~/utils/character-stats.ts";
import { descriptionToHtml } from "~/utils/description-parser";
import { skillIcon } from "~/utils/images";
import { cx } from "~/utils/styles";

const OperatorSkillsPanel: React.FC = () => {
	const operator = useStore(operatorStore);
	const numSkills = operator.skillData.length;
	const [skillNumber, setSkillNumber] = useState(numSkills);
	const maxSkillLevel = operator.phases.length > 2 ? 10 : 7;
	const [skillLevel, setSkillLevel] = useState(maxSkillLevel);
	const skillLabels = useMemo(
		() => [...Array(numSkills).keys()].map((_, i) => i + 1),
		[numSkills]
	);
	const activeSkillTableSkill = operator.skillData[skillNumber - 1];
	const activeSkillLevel = activeSkillTableSkill.levels[skillLevel - 1];
	const { itemCosts, minElite, minLevel } = useMemo(() => {
		if (skillLevel === 1) {
			return {
				itemCosts: null,
				minElite: undefined,
				minLevel: undefined,
			};
		}
		if (skillLevel <= 7) {
			const upgrade = operator.allSkillLvlup[skillLevel - 1 - 1];
			return {
				itemCosts: upgrade.lvlUpCost,
				minElite:
					phaseToNumber(upgrade.unlockCond.phase) > 0
						? phaseToNumber(upgrade.unlockCond.phase)
						: undefined,
				minLevel: upgrade.unlockCond.level,
			};
		}
		// skillLevel > 7 means we're in masteries
		const upgrade =
			operator.skills[skillNumber - 1].levelUpCostCond[
				skillLevel - 7 - 1
			];
		return {
			itemCosts: upgrade.levelUpCost,
			minElite: phaseToNumber(upgrade.unlockCond.phase),
			minLevel: upgrade.unlockCond.level,
		};
	}, [skillLevel, operator.skills, operator.allSkillLvlup, skillNumber]);

	const skillDisplayDuration = useMemo(() => {
		if (activeSkillLevel.duration === -1) {
			return "Infinite";
		}
		if (activeSkillLevel.duration === 0) {
			return "Instant";
		}
		return `${activeSkillLevel.duration} sec`;
	}, [activeSkillLevel.duration]);

	return (
		<div className="flex flex-col gap-4 p-6">
			<div className="grid grid-cols-[auto_1fr] items-center gap-x-4 border-b border-neutral-600 pb-4">
				<div className="grid grid-flow-col items-center gap-x-2 text-neutral-200">
					<span>Skill</span>
					<PillButtonGroup
						labels={skillLabels}
						value={skillNumber}
						onChange={setSkillNumber}
					/>
				</div>
				<SliderWithInput
					type="skill"
					value={skillLevel}
					onChange={setSkillLevel}
					max={maxSkillLevel}
					hideMax
				/>
			</div>
			<div className="grid gap-y-4 rounded-br-lg">
				<div className="grid grid-cols-[64px_1fr] items-center gap-x-4 gap-y-1 grid-areas-skills">
					<img
						className="h-16 w-16 rounded grid-in-icon"
						src={skillIcon(
							activeSkillTableSkill.iconId,
							activeSkillTableSkill.skillId
						)}
						alt=""
					/>
					<h2 className="font-serif text-2xl font-semibold leading-[31px] grid-in-name">
						{activeSkillLevel.name}
					</h2>
					<dl className="grid grid-flow-col justify-start gap-x-2 grid-in-skilltype">
						<div className="inline-grid grid-flow-col gap-x-2 rounded bg-neutral-600 px-2 py-1">
							<dt className="text-neutral-200">Activation</dt>
							<dd className="font-semibold">
								{
									OutputTypes.SkillType[
										activeSkillLevel.skillType
									]
								}
							</dd>
						</div>
						<div className="inline-grid grid-flow-col gap-x-2 rounded bg-neutral-600 px-2 py-1">
							<dt className="text-neutral-200">Recovery</dt>
							<dd
								className={cx(
									"font-semibold",
									spRecoveryClassName[
										activeSkillLevel.spData.spType
									]
								)}
							>
								{
									OutputTypes.SkillSpType[
										activeSkillLevel.spData.spType
									]
								}
							</dd>
						</div>
					</dl>
				</div>
				<dl className="flex gap-x-6">
					<div className="relative flex w-full items-center justify-start gap-x-2 border-neutral-600">
						<SpCostIcon />
						<dt className="text-neutral-200">SP Cost</dt>
						<dd className="ml-auto font-semibold">
							{activeSkillLevel.spData.spCost}
						</dd>
					</div>
					<div className="w-1 border-r border-neutral-600"></div>
					<div className="relative flex w-full items-center justify-start gap-x-2">
						<InitialSpIcon />
						<dt className="text-neutral-200">Initial SP</dt>
						<dd className="ml-auto font-semibold">
							{activeSkillLevel.spData.initSp}
						</dd>
					</div>
					<div className="w-1 border-r border-neutral-600"></div>
					<div className="relative flex w-full items-center justify-start gap-x-2">
						<HourglassIcon />
						<dt className="text-neutral-200">Duration</dt>
						<dd className="ml-auto font-semibold">
							{skillDisplayDuration}
						</dd>
					</div>
				</dl>
				{activeSkillLevel.description && (
					<p
						className="highlight-desc"
						dangerouslySetInnerHTML={{
							__html: descriptionToHtml(
								activeSkillLevel.description,
								activeSkillLevel.blackboard
							),
						}}
					/>
				)}
				{activeSkillLevel.range && (
					<div className="grid grid-cols-[auto,1fr] items-center rounded bg-neutral-600 p-4">
						<span className="text-neutral-200">Range</span>
						<CharacterRange
							className="justify-self-center"
							rangeObject={activeSkillLevel.range}
						/>
					</div>
				)}
				{itemCosts && (
					<>
						<h2 className="text-lg font-semibold leading-[23px]">
							Upgrade Requirements
						</h2>
						<MaterialRequirements
							itemCosts={itemCosts}
							minElite={minElite}
							minLevel={minLevel}
							minSkillLevel={skillLevel - 1}
						/>
					</>
				)}
			</div>
		</div>
	);
};

export default OperatorSkillsPanel;

const spRecoveryClassName: Record<
	keyof typeof OutputTypes.SkillSpType,
	string
> = {
	INCREASE_WHEN_ATTACK: "text-orange",
	INCREASE_WHEN_TAKEN_DAMAGE: "text-yellow",
	INCREASE_WITH_TIME: "text-green",
	UNUSED: "",
};
