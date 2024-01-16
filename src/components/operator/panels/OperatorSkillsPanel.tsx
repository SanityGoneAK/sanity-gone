import { useMemo, useState } from "react";

import { useStore } from "@nanostores/react";
import cx from "clsx";

import { SpCostIcon, InitialSpIcon, HourglassIcon } from "~/components/icons";
import PillButtonGroup from "~/components/ui/PillButtonGroup";
import SliderWithInput from "~/components/ui/SliderWithInput";
import { operatorStore } from "~/pages/[locale]/operators/_store";
import * as OutputTypes from "~/types/output-types";
import { descriptionToHtml } from "~/utils/description-parser";
import { skillIcon } from "~/utils/images";
import { phaseToNumber } from "~/utils/character-stats.ts";

import CharacterRange from "../CharacterRange";
import MaterialRequirements from "../MaterialRequirements";

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
		<>
			<div className="grid grid-cols-[auto_1fr] items-center gap-x-4 border-b border-neutral-600 bg-gradient-to-b from-neutral-800 to-neutral-700 p-6">
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
			<div className="grid gap-y-6 p-6">
				<div className="grid-areas-skills grid grid-cols-[64px_1fr] items-center gap-x-4">
					<img
						className="grid-in-icon h-16 w-16 rounded"
						src={skillIcon(
							activeSkillTableSkill.iconId,
							activeSkillTableSkill.skillId
						)}
						alt=""
					/>
					<h2 className="grid-in-name font-serif text-2xl font-semibold leading-[31px]">
						{activeSkillLevel.name}
					</h2>
					<dl className="grid-in-skilltype grid grid-flow-col justify-start gap-x-2">
						<div className="inline-grid grid-flow-col gap-x-2 bg-neutral-700 px-2 py-1">
							<dt>Activation</dt>
							<dd>
								{
									OutputTypes.SkillType[
										activeSkillLevel.skillType
									]
								}
							</dd>
						</div>
						<div className="inline-grid grid-flow-col gap-x-2 bg-neutral-700 px-2 py-1">
							<dt>Recovery</dt>
							<dd>
								{
									OutputTypes.SkillSpType[
										activeSkillLevel.spData.spType
									]
								}
							</dd>
						</div>
					</dl>
				</div>
				<dl className="grid grid-flow-col gap-x-[49px]">
					<div
						className={`skill-sp-type-item relative grid grid-cols-[auto_auto_1fr]
					items-center justify-end gap-x-2`}
					>
						<SpCostIcon />
						<dt>SP Cost</dt>
						<dd>{activeSkillLevel.spData.spCost}</dd>
					</div>
					<div
						className={`skill-sp-type-item relative grid grid-cols-[auto_auto_1fr]
					items-center justify-end gap-x-2`}
					>
						<InitialSpIcon />
						<dt>Initial SP</dt>
						<dd>{activeSkillLevel.spData.initSp}</dd>
					</div>
					<div
						className={`skill-sp-type-item relative grid grid-cols-[auto_auto_1fr]
					items-center justify-end gap-x-2`}
					>
						<HourglassIcon />
						<dt>Duration</dt>
						<dd>{skillDisplayDuration}</dd>
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
					<CharacterRange
						className="" // nothing here lol
						rangeObject={activeSkillLevel.range}
					/>
				)}
				{itemCosts && (
					<MaterialRequirements
						itemCosts={itemCosts}
						minElite={minElite}
						minLevel={minLevel}
						minSkillLevel={skillLevel - 1}
					/>
				)}
			</div>
		</>
	);
};
export default OperatorSkillsPanel;
