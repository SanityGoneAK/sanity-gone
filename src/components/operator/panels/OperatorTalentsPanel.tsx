import { useMemo, useState } from "react";

import { useStore } from "@nanostores/react";
import { range } from "lodash-es";

import { operatorStore } from "~/pages/[locale]/operators/_slugstore";

import EliteButtonGroup from "../EliteButtonGroup";
import OperatorTalent from "../OperatorTalent";
import PotentialsDropdown from "../PotentialsDropdown";

import type * as OutputTypes from "~/types/output-types";
import CharacterRange from "~/components/operator/CharacterRange.tsx";

import { useTranslations } from "~/i18n/utils.ts";
import { localeStore } from "~/pages/[locale]/_store.ts";
import type { ui } from "~/i18n/ui.ts";
import { getStatsAtLevel } from "~/utils/character-stats.ts";

const OperatorTalentsPanel: React.FC = () => {
	const operator = useStore(operatorStore);
	const maxElite = operator.phases.length - 1;
	const [elite, setElite] = useState(maxElite);

	const locale = useStore(localeStore);
	const t = useTranslations(locale);

	// Compute the map of available potentials at each elite level.
	const potentialsMap = useMemo(() => {
		const potentialsMap: { [eliteLevel: string]: number[] } = {};
		operator.talents.forEach((talent) => {
			talent.candidates.forEach((talentPhase) => {
				const { phase: eliteLevel } = talentPhase.unlockCondition;
				const { requiredPotentialRank: pot } = talentPhase;
				potentialsMap[eliteLevel] = [
					...new Set([pot, ...(potentialsMap[eliteLevel] ?? [])]),
				].sort();
			});
		});
		return potentialsMap;
	}, [operator.talents]);

	const [potential, setPotential] = useState(
		potentialsMap[`PHASE_${maxElite}`][0]
	);

	const talentPhases = useMemo(() => {
		return operator.talents
			.map((talent) => getTalentPhase(talent, potential, elite))
			.filter(
				(talentPhase) => !!talentPhase
			) as OutputTypes.TalentPhase[];
	}, [elite, operator.talents, potential]);

	const handleEliteChange = (newElite: number) => {
		setElite(newElite);
		setPotential(potentialsMap[`PHASE_${maxElite}`][0]);
	};

	const operatorRange = getStatsAtLevel(operator, {
		level: 1,
		eliteLevel: elite,
		trust: 100,
		potential: potential,
	}).rangeObject;

	return (
		<div className="flex flex-col gap-4 p-6">
			<div className="flex items-center justify-between border-b border-neutral-600 pb-4">
				<EliteButtonGroup
					currentElite={elite}
					eliteLevelsToShow={range(maxElite + 1)}
					onChange={handleEliteChange}
				/>
				<PotentialsDropdown
					potentialsToShow={potentialsMap[`PHASE_${elite}`]}
					currentPotential={potential}
					onChange={setPotential}
				/>
			</div>

			<div className="flex flex-col gap-4">
				{talentPhases.length > 0
					? talentPhases.map((talentPhase, index) => (
							<>
								<OperatorTalent
									key={index}
									talentNumber={index + 1}
									talentPhase={talentPhase}
								/>
								{
									// yes some talents have ranges. Tomimi why do you exist
									talentPhase.range && (
										<div className="grid grid-cols-[auto,1fr] items-center rounded bg-neutral-600 p-4">
											<span className="text-neutral-200">
												{t(
													"operators.details.general.range"
												)}
											</span>
											<CharacterRange
												className="justify-self-center"
												rangeObject={talentPhase.range}
												originalRangeObject={
													operatorRange
												}
												// only show the difference if the talent is overriding the rangeId
												showDifference={
													talentPhase.blackboard &&
													talentPhase.blackboard.some(
														(bb) =>
															bb.key ===
																"talent_override_rangeid_flag" &&
															bb.value === 1
													)
												}
											/>
										</div>
									)
								}
							</>
						))
					: t("operators.details.talents.no_talents")}
			</div>
		</div>
	);
};

export default OperatorTalentsPanel;

function getTalentPhase(
	talent: OutputTypes.Talent,
	potential: number,
	eliteLevel: number
) {
	return talent.candidates
		.sort((a, b) => b.requiredPotentialRank - a.requiredPotentialRank)
		.find(
			(phase) =>
				phase.requiredPotentialRank <= potential &&
				phase.unlockCondition.phase === `PHASE_${eliteLevel}` &&
				phase.isHideTalent !== true // what even are "hidden talents"
		);
}
