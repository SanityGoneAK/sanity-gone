import { useMemo, useState } from "react";

import { useStore } from "@nanostores/react";

import { operatorStore } from "~/pages/[locale]/operators/_store";

import EliteButtonGroup from "../EliteButtonGroup";
import OperatorTalent from "../OperatorTalent";
import PotentialsDropdown from "../PotentialsDropdown";

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

	const handleEliteChange = (newElite: number) => {
		setElite(newElite);
		setPotential(potentialsMap[`PHASE_${maxElite}`][0]);
	};

	return (
		<div className="flex flex-col gap-4 p-6">
			<div className="grid grid-flow-col items-center justify-between gap-y-4 border-b border-neutral-600 pb-4">
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
				{operator.talents.map((talent, index) => (
					<OperatorTalent
						key={index}
						talentNumber={index + 1}
						talent={talent}
						eliteLevel={elite}
						potential={potential}
					/>
				))}
			</div>
		</div>
	);
};

export default OperatorTalentsPanel;
