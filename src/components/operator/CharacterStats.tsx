import { useMemo } from "react";

import {
	ArtsResistanceIcon,
	AttackPowerIcon,
	AttackSpeedIcon,
	BlockIcon,
	DefenseIcon,
	DPCostIcon,
	HealthIcon,
	HourglassIcon,
} from "~/components/icons";
import { getStatsAtLevel } from "~/utils/character-stats";

import type * as OutputTypes from "~/types/output-types";
import { useStore } from "@nanostores/react";
import { localeStore } from "~/pages/[locale]/_store.ts";
import { useTranslations } from "~/i18n/utils.ts";
import type { ui } from "~/i18n/ui.ts";

interface Props {
	character: OutputTypes.Character;
	elite: number;
	level: number;
	trust: number;
	potential: number;
	moduleId: string | null;
	moduleLevel: number;
	parentCharacter?: OutputTypes.Character;
}

const CharacterStats: React.FC<Props> = ({
	elite,
	level,
	trust,
	potential,
	moduleId,
	moduleLevel,
	character,
	parentCharacter,
}) => {
	const locale = useStore(localeStore);
	const t = useTranslations(locale);

	const {
		health,
		defense,
		artsResistance,
		redeployTimeInSeconds,
		attackPower,
		secondsPerAttack,
		blockCount,
		dpCost,
	} = useMemo(
		() =>
			parentCharacter
				? getStatsAtLevel(
						character,
						{
							eliteLevel: elite,
							level,
							potential,
							trust,
							moduleId,
							moduleLevel,
						},
						character.charId,
						parentCharacter
					)
				: getStatsAtLevel(character, {
						eliteLevel: elite,
						level,
						potential,
						trust,
						moduleId,
						moduleLevel,
					}),
		[
			parentCharacter,
			character,
			elite,
			level,
			potential,
			trust,
			moduleId,
			moduleLevel,
		]
	);

	return (
		// 500px is the breakpoint at which this specific UI element breaks.
		<dl className="relative grid grid-flow-col grid-cols-1 grid-rows-8 gap-[calc(theme(space.12)+1px)] gap-y-4 after:absolute after:bottom-0 after:right-1/2 after:top-0 after:border-neutral-600 sm:grid-cols-2 sm:grid-rows-4 sm:after:border-r">
			<div className="grid grid-cols-[1fr_auto]">
				<dt className="inline-flex items-center gap-x-2 text-neutral-200">
					<HealthIcon className="text-neutral-50" />
					<span>{t("operators.details.attributes.health")}</span>
				</dt>
				<dd className="font-semibold">{health}</dd>
			</div>
			<div className="grid grid-cols-[1fr_auto]">
				<dt className="inline-flex items-center gap-x-2 text-neutral-200">
					<DefenseIcon className="text-neutral-50" />
					<span>{t("operators.details.attributes.defense")}</span>
				</dt>
				<dd className="font-semibold">{defense}</dd>
			</div>
			<div className="grid grid-cols-[1fr_auto]">
				<dt className="inline-flex items-center gap-x-2 text-neutral-200">
					<ArtsResistanceIcon className="text-neutral-50" />
					<span>
						{t("operators.details.attributes.arts_resistance")}
					</span>
				</dt>
				<dd className="font-semibold">{artsResistance}</dd>
			</div>
			<div className="grid grid-cols-[1fr_auto]">
				<dt className="inline-flex items-center gap-x-2 text-neutral-200">
					<HourglassIcon className="text-neutral-50" />
					<span>
						{t("operators.details.attributes.redeploy_time")}
					</span>
				</dt>
				<dd className="font-semibold">{redeployTimeInSeconds} sec</dd>
			</div>
			<div className="grid grid-cols-[1fr_auto]">
				<dt className="inline-flex items-center gap-x-2 text-neutral-200">
					<AttackPowerIcon className="text-neutral-50" />
					<span>
						{t("operators.details.attributes.attack_power")}
					</span>
				</dt>
				<dd className="font-semibold">{attackPower}</dd>
			</div>
			<div className="grid grid-cols-[1fr_auto]">
				<dt className="inline-flex items-center gap-x-2 text-neutral-200">
					<AttackSpeedIcon className="text-neutral-50" />
					<span>
						{t("operators.details.attributes.attack_interval")}
					</span>
				</dt>
				<dd className="font-semibold">
					{secondsPerAttack.toFixed(2)} sec
				</dd>
			</div>
			<div className="grid grid-cols-[1fr_auto]">
				<dt className="inline-flex items-center gap-x-2 text-neutral-200">
					<BlockIcon className="text-neutral-50" />
					<span>{t("operators.details.attributes.block")}</span>
				</dt>
				<dd className="font-semibold">{blockCount}</dd>
			</div>
			<div className="grid grid-cols-[1fr_auto]">
				<dt className="inline-flex items-center gap-x-2 text-neutral-200">
					<DPCostIcon className="text-neutral-50" />
					<span>{t("operators.details.attributes.dp_cost")}</span>
				</dt>
				<dd className="font-semibold">{dpCost}</dd>
			</div>
		</dl>
	);
};

export default CharacterStats;
