import React, { useMemo, useState } from "react";

import { useStore } from "@nanostores/react";

import ModuleInfo from "~/components/operator/ModuleInfo.tsx";
import PillButtonGroup from "~/components/ui/OldPillButtonGroup";
import { operatorStore } from "~/pages/[locale]/operators/_store";

import MaterialRequirements from "../MaterialRequirements";
import PotentialsDropdown from "../PotentialsDropdown";

import type * as OutputTypes from "~/types/output-types";
import { moduleImage, moduleTypeImage } from "~/utils/images.ts";
import Accordion from "~/components/ui/Accordion.tsx";

const OperatorModulesPanel: React.FC = () => {
	const operator: OutputTypes.Operator = useStore(operatorStore);

	// This is the module types and IDs for the operator.
	// Only needs to be computed once, so a useMemo is used.
	const { moduleTypes, moduleIds, moduleIdLookup } = useMemo(() => {
		const moduleTypesAndIds = operator.modules
			.map((module) => {
				return {
					id: module.moduleId,
					type: module.moduleIcon.at(-1)!.toUpperCase(),
				};
			})
			.sort((a, b) => a.type.localeCompare(b.type));

		// yes i need all of these...
		const moduleTypes = moduleTypesAndIds.map((module) => module.type);
		const moduleIds = moduleTypesAndIds.map((module) => module.id);
		const moduleIdLookup = Object.fromEntries(
			moduleTypesAndIds.map((module) => [module.type, module.id])
		);

		if (moduleTypes.length === 0) {
			moduleTypes.push("None");
		}

		return {
			moduleTypes,
			moduleIds,
			moduleIdLookup,
		};
	}, [operator.modules]);

	// This is the potentials in use for each stage of each module.
	// Only needs to be computed once, so a useMemo is used.
	const potentialsInUseForEachModule: {
		[moduleId: string]: number[][];
	} = useMemo(() => {
		// stands for potentials in use for each module
		// i hate it here
		const piufem: { [moduleId: string]: number[][] } = {};
		for (let modNum = 0; modNum < moduleIds.length; modNum++) {
			const potentialsInUse: number[][] = [];
			const module = operator.modules.filter(
				(mod) => mod.moduleId === moduleIds[modNum]
			)[0];
			const phases = module.phases;
			for (let i = 0; i < phases.length; i++) {
				const curPotentialList: number[] = [];
				for (let curPot = 0; curPot <= 5; curPot++) {
					if (
						phases[i].candidates.find(
							(obj) => obj.requiredPotentialRank === curPot
						)
					) {
						curPotentialList.push(curPot);
					}
				}
				potentialsInUse.push(curPotentialList);
			}
			piufem[moduleIds[modNum]] = potentialsInUse;
		}
		return piufem;
	}, [operator.modules]);

	const [moduleType, setModuleType] = useState(moduleTypes[0]);
	const [stage, setStage] = useState(3);
	const [potential, setPotential] = useState(0);

	// const [viewStory, setViewStory] = useState(false);

	// current active module ID
	const moduleId = moduleType === "None" ? null : moduleIdLookup[moduleType];
	const module: OutputTypes.Module = operator.modules.filter(
		(mod) => mod.moduleId === moduleId
	)[0];

	const setStageSafely = (stage: number) => {
		// undefined error will occur if we try to switch to a stage which a
		// potential doesn't affect
		if (
			moduleId &&
			!potentialsInUseForEachModule[moduleId][stage - 1].includes(
				potential
			)
		) {
			setPotential(potentialsInUseForEachModule[moduleId][stage - 1][0]);
		}
		setStage(stage);
	};

	// if (viewStory) {
	// 	return (
	// 		<div className="flex flex-col gap-4 p-6">
	// 			<button
	// 				className="flex items-center gap-2"
	// 				onClick={() => setViewStory(false)}
	// 			>
	// 				<svg
	// 					width="8"
	// 					height="14"
	// 					viewBox="0 0 8 14"
	// 					fill="none"
	// 					xmlns="http://www.w3.org/2000/svg"
	// 				>
	// 					<path
	// 						d="M7 13L1 7L7 1"
	// 						stroke="#B8B8C0"
	// 						strokeWidth="2"
	// 						strokeLinecap="round"
	// 						strokeLinejoin="round"
	// 					/>
	// 				</svg>
	// 				<p>Module Details</p>
	// 			</button>
	//
	// 			<div className="grid grid-cols-[48px_1fr] items-center gap-x-2 grid-areas-module-title grid-in-title">
	// 				<img
	// 					className="h-12 grid-in-icon"
	// 					src={moduleTypeImage(module.moduleIcon.toLowerCase())}
	// 					alt=""
	// 				/>
	// 				<h2 className="font-serif text-2xl grid-in-name">
	// 					{module.moduleName}
	// 				</h2>
	// 				<p className="font-semibold text-purple grid-in-code">
	// 					EXE-Y
	// 				</p>
	// 			</div>
	// 			<hr className="border border-neutral-600" />
	// 			<p
	// 				className="whitespace-pre-line text-base font-normal leading-normal"
	// 				dangerouslySetInnerHTML={{
	// 					__html: module.moduleDescription,
	// 				}}
	// 			/>
	// 		</div>
	// 	);
	// }

	return (
		<div className="flex flex-col gap-4 p-6">
			<div className="grid grid-flow-col grid-cols-[auto_1fr] grid-rows-2 items-center gap-4 border-b border-neutral-500 pb-4 sm:grid-flow-row sm:grid-cols-[auto_auto_1fr] sm:grid-rows-1">
				<div className="grid w-fit grid-flow-col items-center gap-x-2 text-neutral-200">
					<span>Model</span>
					<PillButtonGroup
						labels={moduleTypes}
						value={moduleType}
						onChange={setModuleType}
					/>
				</div>

				<div className="grid grid-flow-col items-center gap-x-2 text-neutral-200">
					Stage
					<PillButtonGroup
						labels={[1, 2, 3]}
						value={stage}
						onChange={setStageSafely}
					/>
				</div>
				<div className="ml-auto">
					<PotentialsDropdown
						potentialsToShow={
							moduleId
								? potentialsInUseForEachModule[moduleId][
										stage - 1
									]
								: [0]
						}
						currentPotential={potential}
						onChange={setPotential}
					/>
				</div>
			</div>
			<div className="flex flex-col gap-4">
				{moduleId ? (
					<ModuleInfo
						operator={operator}
						module={module}
						stage={stage}
						potential={potential}
					/>
				) : (
					<div className="grid grid-cols-[auto,1fr] items-center justify-items-center gap-x-2 rounded-lg bg-neutral-600 p-4 text-neutral-200">
						<span>Module</span>
						<span>None</span>
					</div>
				)}
				<hr className="border border-neutral-500" />
				<div className="flex flex-col gap-4">
					<h2 className="text-lg font-semibold leading-[23px]">
						Requirements
					</h2>
					<MaterialRequirements
						// @ts-expect-error what is typescript waffling about
						itemCosts={module.itemCost[stage - 1]}
						minElite={2} // it's just always 2 bro
						minLevel={getMinLevel(operator.rarity)}
					/>
				</div>
				{/* I did not know this was a possibility. See Kal'tsit's module A (uniequip_004_kalts), it has no
						missions listed. I don't know how / why.*/}
				{module.missionList && module.missionList.length > 0 && (
					<div className="flex flex-col gap-4">
						<h2 className="text-lg font-semibold leading-[23px]">
							Unlock Missions
						</h2>
						<div>
							<h3 className="mb-1 text-sm leading-[14px] text-neutral-200">
								Mission 1
							</h3>

							<p>{module.missionList[0].description}</p>
						</div>
						<div>
							<h3 className="mb-1 text-sm leading-[14px] text-neutral-200">
								Mission 2
							</h3>
							<p>{module.missionList[1].description}</p>
						</div>
					</div>
				)}
				<hr className="border border-neutral-600" />
				<div>
					<Accordion title={"DESCRIPTION (possible story spoilers)"}>
						<p
							className="text-white mt-0 whitespace-pre-line rounded-b text-base font-normal"
							dangerouslySetInnerHTML={{
								__html: module.moduleDescription,
							}}
						/>
					</Accordion>
				</div>
			</div>
		</div>
	);
};

export default OperatorModulesPanel;

function getMinLevel(rarity: number) {
	switch (rarity) {
		case 4:
			return 40;
		case 5:
			return 50;
		case 6:
			return 60;
		default:
			throw new Error("what are you doin mate");
	}
}
