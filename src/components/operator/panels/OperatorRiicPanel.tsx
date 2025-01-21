import { useMemo, useState } from "react";

import { useStore } from "@nanostores/react";

import { operatorStore } from "~/pages/[locale]/operators/_slugstore";
import { phaseToNumber } from "~/utils/character-stats";
import { descriptionToHtml } from "~/utils/description-parser";
import { riicSkillIcon } from "~/utils/images";

import { range } from "lodash-es";
import ButtonGroup from "~/components/ui/ButtonGroup.tsx";
import { EliteOneIcon, EliteTwoIcon, EliteZeroIcon } from "~/components/icons";

const OperatorRiicPanel: React.FC = () => {
	const operator = useStore(operatorStore);
	const relevantEliteLevels = useMemo(
		() =>
			[
				...new Set(
					operator.riicSkills.flatMap((riicSkill) =>
						riicSkill.stages.flatMap((stage) =>
							phaseToNumber(stage.minElite)
						)
					)
				),
			].sort(),
		[operator.riicSkills]
	);
	const maxElite = relevantEliteLevels.at(-1) ?? 0;
	const [elite, setElite] = useState(maxElite);

	const handleEliteChange = (newElite: number) => {
		setElite(newElite);
	};

	return (
		<div className="flex flex-col gap-4 p-6">
			<div className="grid grid-flow-col items-center justify-between gap-y-4 border-b border-neutral-600 pb-4">
				<ButtonGroup
					labels={range(maxElite + 1)}
					value={elite}
					onChange={handleEliteChange}
					elite={true}
				/>
			</div>

			<div>
				{operator.riicSkills.flatMap((riicSkill) => {
					const activeStage = riicSkill.stages.findLast(
						(stage) => phaseToNumber(stage.minElite) <= elite
					);

					if (!activeStage) {
						return null;
					}

					return (
						<div
							key={`${activeStage.buffId}-${activeStage.minElite}-${activeStage.minLevel}`}
							className="my-0 border-neutral-600 px-0 pb-6 [&:not(:first-of-type)]:border-t [&:not(:first-of-type)]:pt-6"
						>
							<div className="mb-4 flex items-center gap-4">
								<img
									className="size-6 object-contain"
									src={riicSkillIcon(activeStage.skillIcon)}
									alt=""
								/>
								<h2 className="font-serif text-2xl font-semibold">
									{activeStage.name}
								</h2>
								{activeStage.minLevel > 1 && (
									<div className="flex items-center gap-2 rounded-lg bg-neutral-500/[.33] px-2.5 py-2 text-yellow">
										{activeStage.minElite === "PHASE_0" && (
											<EliteZeroIcon className="fill-none stroke-neutral-200" />
										)}
										{activeStage.minElite === "PHASE_1" && (
											<EliteOneIcon className="fill-neutral-200" />
										)}
										{activeStage.minElite === "PHASE_2" && (
											<EliteTwoIcon className="fill-neutral-200" />
										)}

										<span className="leading-none">
											Lv{activeStage.minLevel}
										</span>
									</div>
								)}
							</div>
							<p
								dangerouslySetInnerHTML={{
									__html: descriptionToHtml(
										activeStage.description,
										[]
									),
								}}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default OperatorRiicPanel;
