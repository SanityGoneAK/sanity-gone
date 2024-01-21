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
import { getModuleStatIncrease } from "~/utils/character-stats";
import { moduleImage, moduleTypeImage } from "~/utils/images.ts";

import type * as OutputTypes from "~/types/output-types";

// TODO: Do we want to handle modules such as Pozy Y?
// a.k.a. show exact token stat changes for modules that
// affect tokens

// If we do, props might need to include the token data and we might
// want to add a characterstats to the panel page. I don't know though

interface Props {
	operator: OutputTypes.Operator;
	module: OutputTypes.Module;
	stage: number; // 1, 2, 3
	potential: number; // zero-indexed (0, 1, 2, 3, 4, 5)
}

const ModuleInfo: React.FC<Props> = ({
	operator,
	module,
	stage,
	potential,
}) => {
	const moduleId = module.moduleId;
	const {
		atk,
		max_hp,
		def,
		attack_speed,
		magic_resistance,
		cost,
		respawn_time,
		block_cnt,
	} = useMemo(() => {
		return getModuleStatIncrease(operator, moduleId, stage);
	}, [operator, moduleId, stage]);

	const activeCandidate = module.phases[stage - 1].candidates.find(
		(phase) => phase.requiredPotentialRank === potential
	)!;

	return (
		<div className="grid grid-cols-[192px_1fr] grid-rows-[auto_auto_1fr] items-center gap-x-4 gap-y-4 grid-areas-module">
			<div className="flex h-full flex-col overflow-hidden rounded-lg bg-neutral-900 grid-in-image">
				<img
					className="h-[182px] flex-grow"
					src={moduleImage(moduleId)}
					alt=""
				/>
				<button
					className="w-full border-t border-neutral-600 py-2 hover:bg-neutral-600"
					type="button"
				>
					View Story
				</button>
			</div>
			<div className="grid grid-cols-[48px_1fr] items-center gap-x-2 grid-areas-module-title grid-in-title">
				<img
					className="h-12 grid-in-icon"
					src={moduleTypeImage(module.moduleIcon.toLowerCase())}
					alt=""
				/>
				<h2 className="font-serif text-2xl grid-in-name">
					{module.moduleName}
				</h2>
				<p className="font-semibold text-purple grid-in-code">EXE-Y</p>
			</div>
			<dl className="flex gap-2 grid-in-stats">
				{atk !== 0 && (
					<div className="flex w-full items-center justify-start gap-x-2 rounded bg-neutral-600 px-2 py-1">
						<AttackPowerIcon />
						<dt className="text-neutral-200">Attack</dt>
						<dd className="ml-auto">+{atk}</dd>
					</div>
				)}
				{max_hp !== 0 && (
					<div className="flex w-full items-center justify-start gap-x-2 rounded bg-neutral-600 px-2 py-1">
						<HealthIcon />
						<dt className="text-neutral-200">Health</dt>
						<dd className="ml-auto">+{max_hp}</dd>
					</div>
				)}
				{def !== 0 && (
					<div className="flex w-full items-center justify-start gap-x-2 rounded bg-neutral-600 px-2 py-1">
						<DefenseIcon />
						<dt className="text-neutral-200">Defense</dt>
						<dd className="ml-auto">+{def}</dd>
					</div>
				)}
				{attack_speed !== 0 && (
					<div className="flex w-full items-center justify-start gap-x-2 rounded bg-neutral-600 px-2 py-1">
						<AttackSpeedIcon />
						<dt className="text-neutral-200">ASPD</dt>
						<dd className="ml-auto">+{attack_speed}</dd>
					</div>
				)}
				{magic_resistance !== 0 && (
					<div className="flex w-full items-center justify-start gap-x-2 rounded bg-neutral-600 px-2 py-1">
						<ArtsResistanceIcon />
						<dt className="text-neutral-200">MR</dt>
						<dd className="ml-auto">+{magic_resistance}</dd>
					</div>
				)}
				{cost !== 0 && (
					<div className="flex w-full items-center justify-start gap-x-2 rounded bg-neutral-600 px-2 py-1">
						<DPCostIcon />
						<dt className="text-neutral-200">DP</dt>
						<dd className="ml-auto">{cost}</dd>
					</div>
				)}
				{respawn_time !== 0 && (
					<div className="flex w-full items-center justify-start gap-x-2 rounded bg-neutral-600 px-2 py-1">
						<HourglassIcon />
						<dt className="text-neutral-200">Redep. Time</dt>
						<dd className="ml-auto">{respawn_time}</dd>
					</div>
				)}
				{block_cnt !== 0 && (
					<div className="flex w-full items-center justify-start gap-x-2 rounded bg-neutral-600 px-2 py-1">
						<BlockIcon />
						<dt className="text-neutral-200">Block</dt>
						<dd className="ml-auto">+{block_cnt}</dd>
					</div>
				)}
			</dl>
			<div className="flex flex-col gap-2 self-start grid-in-trait">
				<div>
					<h3 className="mb-1 text-sm text-neutral-200">
						Trait
						{activeCandidate.traitEffectType === "update" && (
							<span> (Added)</span>
						)}
						{activeCandidate.traitEffectType === "override" && (
							<span> (Updated)</span>
						)}
					</h3>
					<p
						dangerouslySetInnerHTML={{
							__html: activeCandidate.traitEffect ?? "No effect",
						}}
					></p>
				</div>
				{activeCandidate.talentEffect && (
					<div>
						<h3 className="mb-1 text-sm text-neutral-200">
							{
								activeCandidate.talentEffect
									? activeCandidate.talentIndex === -1
										? "New Talent" // there is a new talent
										: `Talent ${
												activeCandidate.talentIndex + 1
											}` // this is the talent modified
									: "Talent" /* no talent modifications */
							}
							{activeCandidate.talentEffect &&
								(activeCandidate.talentIndex === -1 ? ( // new talent added
									<span> (Added)</span>
								) : (
									// current talent updated
									<span> (Updated)</span>
								))}
						</h3>
						<p
							dangerouslySetInnerHTML={{
								__html:
									activeCandidate.talentEffect ?? "No effect",
							}}
						></p>
					</div>
				)}
			</div>
		</div>
	);
};

export default ModuleInfo;
