import { useMemo, useState } from "react";

import { useStore } from "@nanostores/react";

import { operatorStore } from "~/pages/[locale]/operators/_store";

import EliteButtonGroup from "../EliteButtonGroup";
import OperatorTalent from "../OperatorTalent";
import PotentialsDropdown from "../PotentialsDropdown";

import type * as OutputTypes from "~/types/output-types";

const OperatorTalentsPanel: React.FC = () => {
	const operator = useStore(operatorStore);
	const maxElite = operator.phases.length - 1;
	const [elite, setElite] = useState(maxElite);

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

	return (
		<div className="flex flex-col gap-4 p-6">
			<div className="flex items-center justify-between border-b border-neutral-600 pb-4">
				<EliteButtonGroup
					currentElite={elite}
					maxElite={maxElite}
					onChange={handleEliteChange}
				/>
				<PotentialsDropdown
					potentialsToShow={potentialsMap[`PHASE_${elite}`]}
					currentPotential={potential}
					onChange={setPotential}
				/>
			</div>

			<div>
				{talentPhases.length > 0
					? talentPhases.map((talentPhase, index) => (
							<OperatorTalent
								key={index}
								talentNumber={index + 1}
								talentPhase={talentPhase}
							/>
						))
					: "No talents at this elite level."}
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
				phase.unlockCondition.phase === `PHASE_${eliteLevel}`
		);
}
