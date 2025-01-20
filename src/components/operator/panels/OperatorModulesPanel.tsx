import React, { useMemo, useState } from "react";

import { useStore } from "@nanostores/react";

import ModuleInfo from "~/components/operator/ModuleInfo.tsx";
import PillButtonGroup from "~/components/ui/OldPillButtonGroup";
import { operatorStore } from "~/pages/[locale]/operators/_slugstore";

import MaterialRequirements from "../MaterialRequirements";
import PotentialsDropdown from "../PotentialsDropdown";

import type * as OutputTypes from "~/types/output-types";
import { moduleImage, moduleTypeImage } from "~/utils/images.ts";
import Accordion from "~/components/ui/Accordion.tsx";
import { localeStore } from "~/pages/[locale]/_store.ts";
import { useTranslations } from "~/i18n/utils.ts";
import type { ui } from "~/i18n/ui.ts";
import ArchiveIcon from "~/components/icons/ArchiveIcon.tsx";

const OperatorModulesPanel: React.FC = () => {
	const operator: OutputTypes.Operator = useStore(operatorStore);

	const locale = useStore(localeStore);
	const t = useTranslations(locale as keyof typeof ui);

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

	return (
		<div className="flex flex-col gap-4 p-6">
			<div className="grid grid-flow-col grid-cols-[auto_1fr] grid-rows-2 items-center gap-y-4 sm:gap-x-4 border-b border-neutral-500 pb-4 sm:grid-flow-row sm:grid-cols-[auto_auto_1fr] sm:grid-rows-1">
				<div className="grid w-fit grid-flow-col items-center gap-x-2 text-neutral-200">
					<span>{t('operators.details.modules.module')}</span>
					<PillButtonGroup
						labels={moduleTypes}
						value={moduleType}
						onChange={setModuleType}
					/>
				</div>

				<div className="grid grid-flow-col items-center gap-x-2 text-neutral-200">
					{t("operators.details.modules.stage")}
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
						<span>{t("operators.details.modules.module")}</span>
						<span>{t("operators.details.attributes.module_none")}</span>
					</div>
				)}
				<hr className="border border-neutral-500" />
				<div className="flex flex-col gap-4">
					<h2 className="text-lg font-semibold leading-[23px]">
						{t("operators.details.general.upgrade_requirements")}
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
							{t("operators.details.modules.unlock_missions")}
						</h2>
						<div>
							<h3 className="mb-1 text-sm leading-[14px] text-neutral-200">
								{t('operators.details.modules.mission')} 1
							</h3>

							<p>{module.missionList[0].description}</p>
						</div>
						<div>
							<h3 className="mb-1 text-sm leading-[14px] text-neutral-200">
								{t('operators.details.modules.mission')} 2
							</h3>
							<p>{module.missionList[1].description}</p>
						</div>
					</div>
				)}
				<hr className="border border-neutral-600" />
				<div>
					<Accordion title={`${t('operators.details.modules.description')} (${t('operators.details.modules.story_spoiler')})`} icon={
						<ArchiveIcon/>
					}>
						<p
							className="text-neutral-50 mt-0 whitespace-pre-line rounded-b text-base font-normal"
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
