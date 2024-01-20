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
		<dl className="relative grid grid-flow-col grid-cols-2 grid-rows-4 gap-[calc(theme(space.12)+1px)] gap-y-4 after:absolute after:bottom-0 after:left-0 after:right-1/2 after:top-0  after:border-r after:border-neutral-600">
			<div className="grid grid-cols-[1fr,auto]">
				<dt className="inline-flex items-center gap-x-2 text-neutral-200">
					<HealthIcon className="text-neutral-50" />
					<span>Health</span>
				</dt>
				<dd className="font-semibold">{health}</dd>
			</div>
			<div className="grid grid-cols-[1fr,auto]">
				<dt className="inline-flex items-center gap-x-2 text-neutral-200">
					<DefenseIcon className="text-neutral-50" />
					<span>Defense</span>
				</dt>
				<dd className="font-semibold">{defense}</dd>
			</div>
			<div className="grid grid-cols-[1fr,auto]">
				<dt className="inline-flex items-center gap-x-2 text-neutral-200">
					<ArtsResistanceIcon className="text-neutral-50" />
					<span>Arts Resistance</span>
				</dt>
				<dd className="font-semibold">{artsResistance}</dd>
			</div>
			<div className="grid grid-cols-[1fr,auto]">
				<dt className="inline-flex items-center gap-x-2 text-neutral-200">
					<HourglassIcon className="text-neutral-50" />
					<span>Redeploy Time</span>
				</dt>
				<dd className="font-semibold">{redeployTimeInSeconds} sec</dd>
			</div>
			<div className="grid grid-cols-[1fr,auto]">
				<dt className="inline-flex items-center gap-x-2 text-neutral-200">
					<AttackPowerIcon className="text-neutral-50" />
					<span>Attack Power</span>
				</dt>
				<dd className="font-semibold">{attackPower}</dd>
			</div>
			<div className="grid grid-cols-[1fr,auto]">
				<dt className="inline-flex items-center gap-x-2 text-neutral-200">
					<AttackSpeedIcon className="text-neutral-50" />
					<span>Attack Interval</span>
				</dt>
				<dd className="font-semibold">
					{secondsPerAttack.toFixed(2)} sec
				</dd>
			</div>
			<div className="grid grid-cols-[1fr,auto]">
				<dt className="inline-flex items-center gap-x-2 text-neutral-200">
					<BlockIcon className="text-neutral-50" />
					<span>Block</span>
				</dt>
				<dd className="font-semibold">{blockCount}</dd>
			</div>
			<div className="grid grid-cols-[1fr,auto]">
				<dt className="inline-flex items-center gap-x-2 text-neutral-200">
					<DPCostIcon className="text-neutral-50" />
					<span>DP Cost</span>
				</dt>
				<dd className="font-semibold">{dpCost}</dd>
			</div>
		</dl>
	);
};

export default CharacterStats;
