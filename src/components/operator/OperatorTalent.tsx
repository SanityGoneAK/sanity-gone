import { descriptionToHtml } from "~/utils/description-parser";

import type * as OutputTypes from "~/types/output-types";

interface Props {
	talent: OutputTypes.Talent;
	eliteLevel: number;
	potential: number;
	talentNumber: number;
}
const OperatorTalent: React.FC<Props> = ({
	talent,
	eliteLevel,
	potential,
	talentNumber,
}) => {
	const talentPhase =
		talent.candidates
			.sort((a, b) => b.requiredPotentialRank - a.requiredPotentialRank)
			.find(
				(phase) =>
					phase.requiredPotentialRank <= potential &&
					phase.unlockCondition.phase === `PHASE_${eliteLevel}`
			) ?? null;

	return (
		talentPhase && (
			<div className="my-0 border-neutral-600 px-0 pb-6 [&:not(:first-of-type)]:border-t [&:not(:first-of-type)]:pt-6">
				<div className="mb-4 flex gap-4">
					<span className="bg-neutral-950 px-2 py-1 font-semibold text-neutral-200">
						T{talentNumber}
					</span>
					<h2 className="font-serif text-2xl font-semibold leading-[31px]">
						{talentPhase.name}
					</h2>
				</div>
				<p
					className="text-base font-normal leading-normal text-neutral-50"
					dangerouslySetInnerHTML={{
						__html: descriptionToHtml(
							talentPhase.description,
							talentPhase.blackboard
						),
					}}
				></p>
			</div>
		)
	);
};

export default OperatorTalent;
