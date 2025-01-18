import { useMemo, useState } from "react";

import { useStore } from "@nanostores/react";

import { SpCostIcon, InitialSpIcon, HourglassIcon } from "~/components/icons";
import CharacterRange from "~/components/operator/CharacterRange";
import MaterialRequirements from "~/components/operator/MaterialRequirements";
import PillButtonGroup from "~/components/ui/OldPillButtonGroup";
import SliderWithInput from "~/components/ui/SliderWithInput";
import { operatorStore } from "~/pages/[locale]/operators/_store";
import * as OutputTypes from "~/types/output-types";
import { getStatsAtLevel, phaseToNumber } from "~/utils/character-stats.ts";
import { descriptionToHtml } from "~/utils/description-parser";
import { skillIcon, tokenImage } from "~/utils/images";
import { cx } from "~/utils/styles";
import { localeStore } from "~/pages/[locale]/_store.ts";
import { useTranslations } from "~/i18n/utils.ts";
import type { ui } from "~/i18n/ui.ts";
import CharacterStats from "~/components/operator/CharacterStats.tsx";

const OperatorSkillsPanel: React.FC = () => {
	const operator = useStore(operatorStore);

	const locale = useStore(localeStore);
	const t = useTranslations(locale as keyof typeof ui);

	const numSkills = operator.skillData.length;
	const [skillNumber, setSkillNumber] = useState(numSkills);
	const maxSkillLevel = operator.phases.length > 2 ? 10 : 7;
	const [skillLevel, setSkillLevel] = useState(maxSkillLevel);
	const skillLabels = useMemo(
		() => [...Array(numSkills).keys()].map((_, i) => i + 1),
		[numSkills]
	);
	const activeSkillTableSkill = operator.skillData[skillNumber - 1];
	const activeSkill = operator.skills[skillNumber - 1];
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
	const summon = activeSkill.overrideTokenKey ? operator.summons.filter(summon => summon.charId === activeSkill.overrideTokenKey)[0] : null;
	const summonRange = summon
		? getStatsAtLevel(
			summon,
			{
				eliteLevel: 2,
				level: 90,
				potential: 5,
				trust: 100,
			},
			summon.charId,
			operator
		).rangeObject
		: null;

	const skillDisplayDuration = useMemo(() => {
		if (activeSkillLevel.duration === -1) {
			return t('operators.details.skills.infinite');
		}
		if (activeSkillLevel.duration === 0) {
			return t('operators.details.skills.instant');
		}
		return `${activeSkillLevel.duration} sec`;
	}, [activeSkillLevel.duration]);

	const spRecoveryTitle: Record<
		keyof typeof OutputTypes.SkillSpType,
		string
	> = useMemo(() => ({
		INCREASE_WHEN_ATTACK: t("operators.details.skills.increase_when_attack"),
		INCREASE_WHEN_TAKEN_DAMAGE: t("operators.details.skills.increase_when_taken_damage"),
		INCREASE_WITH_TIME: t("operators.details.skills.increase_with_time"),
		8: t("operators.details.skills.always_active"),
		UNUSED: "",
	}), [locale]);

	const typeTitle: Record<
		keyof typeof OutputTypes.SkillType,
		string
	> = useMemo(() => ({
		PASSIVE: t("operators.details.skills.passive"),
		MANUAL: t("operators.details.skills.manual"),
		AUTO: t("operators.details.skills.auto"),
	}), [locale]);


	return (
		<div className="flex flex-col gap-4 p-6">
			<div className="grid grid-cols-[auto_1fr] items-center gap-x-4 border-b border-neutral-600 pb-4">
				<div className="grid grid-flow-col items-center gap-x-2 text-neutral-200">
					<span>{t("operators.details.skills.skill")}</span>
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
				<div className="grid grid-cols-[48px_1fr] grid-flow-col items-center gap-x-4 gap-y-2 grid-areas-skills-mobile sm:grid-areas-skills">
					<img
						className="h-12 w-12 rounded grid-in-icon"
						src={skillIcon(
							activeSkillTableSkill.iconId,
							activeSkillTableSkill.skillId
						)}
						alt=""
					/>
					<h2 className="font-serif text-lg font-semibold leading-6 grid-in-name">
						{activeSkillLevel.name}
					</h2>
					<dl className="grid h-6 grid-flow-col items-center justify-start gap-x-2 sm:gap-x-3 grid-in-skilltype sm:col-span-1">
						<span className="text-base leading-none text-neutral-50">
							{typeTitle[activeSkillLevel.skillType]}
						</span>

						{/* TODO This is an InterpunctSpacer. Maybe consider making it a .tsx component so it can be used everywhere?*/}
						<span
							className={`inline-block h-1 w-1 rounded-full bg-neutral-400`}
						></span>

						<span
							className={cx(
								"text-base leading-none",
								spRecoveryClassName[
									activeSkillLevel.spData.spType
								]
							)}
						>
							{/* space here is only needed if it's in English */}
							{spRecoveryTitle[activeSkillLevel.spData.spType] + ((locale === "en") ? " " : "")}
							{t("operators.details.skills.recovery")}
						</span>
					</dl>
				</div>
				<dl className="flex gap-x-6 gap-y-2 flex-col sm:flex-row">
					<div className="relative flex w-full items-center justify-start gap-x-2 border-neutral-600">
						<SpCostIcon />
						<dt className="text-neutral-200">
							{t("operators.details.skills.sp_cost")}
						</dt>
						<dd className="ml-auto font-semibold">
							{activeSkillLevel.spData.spCost}
						</dd>
					</div>
					<div className="w-1 sm:border-r border-neutral-600"></div>
					<div className="relative flex w-full items-center justify-start gap-x-2">
						<InitialSpIcon />
						<dt className="text-neutral-200">
							{t("operators.details.skills.initial_sp")}
						</dt>
						<dd className="ml-auto font-semibold">
							{activeSkillLevel.spData.initSp}
						</dd>
					</div>
					<div className="w-1 sm:border-r border-neutral-600"></div>
					<div className="relative flex w-full items-center justify-start gap-x-2">
						<HourglassIcon />
						<dt className="text-neutral-200">
							{t("operators.details.skills.duration")}
						</dt>
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
						<span className="text-neutral-200">
							{t("operators.details.general.range")}
						</span>
						<CharacterRange
							className="justify-self-center"
							rangeObject={activeSkillLevel.range}
						/>
					</div>
				)}
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
								elite={2}
								level={90}
								moduleId={null}
								moduleLevel={1}
								potential={5}
								trust={100}
								parentCharacter={operator}
							/>
							<div className="border-t border-neutral-600" />
							<div className="grid grid-cols-[auto,1fr] items-center justify-items-center px-4 text-neutral-200">
								<span>
									{t("operators.details.general.range")}
								</span>
								<CharacterRange rangeObject={summonRange!} />
							</div>
						</div>
					</div>
				)}
				{itemCosts && (
					<>
						<h2 className="text-lg font-semibold leading-[23px]">
							{t(
								"operators.details.general.upgrade_requirements"
							)}
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
	8: "text-blue",
	UNUSED: "",
};
