import { useMemo, useState } from "react";

import { useStore } from "@nanostores/react";

import { operatorStore } from "~/pages/[locale]/operators/_store";

import EliteButtonGroup from "../EliteButtonGroup";
import OperatorTalent from "../OperatorTalent";
import PotentialsDropdown from "../PotentialsDropdown";
import { riicSkillIcon } from "~/utils/images";

const OperatorRiicPanel: React.FC = () => {
	const operator = useStore(operatorStore);
	const maxElite = operator.phases.length - 1;
	const [elite, setElite] = useState(maxElite);

	const handleEliteChange = (newElite: number) => {
		setElite(newElite);
	};

	return (
		<div className="flex flex-col gap-4 p-6">
			<div className="grid grid-flow-col items-center justify-between gap-y-4 border-b border-neutral-600 pb-4">
				<EliteButtonGroup
					currentElite={elite}
					maxElite={maxElite}
					onChange={handleEliteChange}
				/>
			</div>

			<div>
				<div className="my-0 border-neutral-600 px-0 pb-6 [&:not(:first-of-type)]:border-t [&:not(:first-of-type)]:pt-6">
					<div className="mb-4 flex items-center gap-4">
						<img
							className="size-6 object-contain"
							src={riicSkillIcon("bskill_ctrl_aegir")}
							alt=""
						/>
						<h2 className="font-serif text-2xl font-semibold">
							Silence as a Sword
						</h2>
					</div>
					<p>
						When stationed at the Training Station, increase the
						skill training speed of Specialist and Vanguard
						operators by +30%
					</p>
				</div>
				<div className="my-0 border-neutral-600 px-0 pb-6 [&:not(:first-of-type)]:border-t [&:not(:first-of-type)]:pt-6">
					<div className="mb-4 flex items-center gap-4">
						<img
							className="size-6 object-contain"
							src={riicSkillIcon("bskill_ctrl_aegir")}
							alt=""
						/>
						<h2 className="font-serif text-2xl font-semibold">
							Silence as a Sword
						</h2>
					</div>
					<p>
						When stationed at the Training Station, increase the
						skill training speed of Specialist and Vanguard
						operators by +30%
					</p>
				</div>
			</div>
		</div>
	);
};

export default OperatorRiicPanel;
