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

	const statChanges = [
		atk,
		max_hp,
		def,
		attack_speed,
		magic_resistance,
		cost,
		respawn_time,
		block_cnt,
	];

	const statChangeCount = statChanges.filter((change) => change !== 0).length;

	/**
	 * This component is used to display one of the stat changes for a module.
	 *
	 * Yes, this is a bit of a mess. Modules is like a messy King Midas.
	 * Everything it touches turns into a mess.
	 *
	 * @param props.changeNum The number of the stat change to display (1-indexed).
	 * @returns The JSX for the stat change.
	 */
	const StatChange = (props: { changeNum: number }) => {
		const { changeNum } = props;

		// get the nth stat change
		let changes = 0;
		let changeIndex = -1;
		for (let i = 0; i < statChanges.length; i++) {
			if (statChanges[i] !== 0) {
				changes++;
				if (changes === changeNum) {
					changeIndex = i;
					break;
				}
			}
		}

		if (changeIndex === -1) {
			return null;
		}

		const icon = (() => {
			switch (changeIndex) {
				case 0:
					return <AttackPowerIcon />;
				case 1:
					return <HealthIcon />;
				case 2:
					return <DefenseIcon />;
				case 3:
					return <AttackSpeedIcon />;
				case 4:
					return <ArtsResistanceIcon />;
				case 5:
					return <DPCostIcon />;
				case 6:
					return <HourglassIcon />;
				case 7:
					return <BlockIcon />;
				default:
					return <></>;
			}
		})();

		const statName = (() => {
			switch (changeIndex) {
				case 0:
					return "Attack";
				case 1:
					return "Health";
				case 2:
					return "Defense";
				case 3:
					return "ASPD";
				case 4:
					return "RES";
				case 5:
					return "DP";
				case 6:
					return "Redep. Time";
				case 7:
					return "Block";
				default:
					return "";
			}
		})();

		// don't use the plus if it's a negative stat change (DP and redeployment time)
		const usePlus = [
			"Attack",
			"Health",
			"Defense",
			"ASPD",
			"RES",
			"Block",
		].includes(statName);

		return (
			<div className="flex h-6 w-full items-center justify-start gap-x-2 rounded">
				{icon}
				<dt className="text-neutral-200">{statName}</dt>
				<dd className="ml-auto text-lg font-semibold leading-none">
					{usePlus ? "+" : ""}
					{statChanges[changeIndex]}
				</dd>
			</div>
		);
	};

	// beware: flexbox gore lies ahead
	// i should probably use grid. oh well!
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-2">
				<img
					className="h-6 grid-in-icon"
					src={moduleTypeImage(module.moduleIcon.toLowerCase())}
					alt=""
				/>
				<h2 className="font-serif text-lg font-semibold leading-none grid-in-name">
					{module.moduleName}
				</h2>
				<p className="font-semibold text-neutral-200">
					{module.moduleIcon}
				</p>
			</div>
			<dl className="flex">
				{/* absolute nightmare fuel handling here. i had no idea how to do it otherwise*/}
				{statChangeCount === 2 && (
					<>
						<StatChange changeNum={1} />
						<div className="mx-6 h-full border-l border-neutral-500" />
						<StatChange changeNum={2} />
					</>
				)}
				{statChangeCount === 3 && (
					<>
						<StatChange changeNum={1} />
						<div className="mx-6 h-full border-l border-neutral-500" />
						<StatChange changeNum={2} />
						<div className="mx-6 h-full border-l border-neutral-500" />
						<StatChange changeNum={3} />
					</>
				)}
				{/* Why do operators with 4 stat changes exist? *dies of Nian* */}
				{statChangeCount === 4 && (
					<div className="flex w-full flex-col">
						<div className="flex items-center">
							<StatChange changeNum={1} />
							<div className="mx-6 h-8 border-l border-neutral-500" />
							<StatChange changeNum={2} />
						</div>
						<div className="flex items-center">
							<StatChange changeNum={3} />
							<div className="mx-6 h-8 border-l border-neutral-500" />
							<StatChange changeNum={4} />
						</div>
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
			<div className="flex h-full flex-col overflow-hidden rounded-lg bg-neutral-800">
				<img
					className="h-[182px] flex-grow"
					src={moduleImage(moduleId)}
					alt=""
				/>
			</div>
		</div>
	);
};

export default ModuleInfo;
