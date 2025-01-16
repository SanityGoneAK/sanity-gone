import { descriptionToHtml } from "~/utils/description-parser";

import type * as OutputTypes from "~/types/output-types";
import { EliteOneIcon, EliteTwoIcon, EliteZeroIcon } from "~/components/icons";

interface Props {
	talentPhase: OutputTypes.TalentPhase;
	talentNumber: number;
	className?: string;
}

const OperatorTalent: React.FC<Props> = ({
	talentPhase,
	talentNumber,
	className,
}) => {
	const phase = talentPhase.unlockCondition.phase;

	return (
		<div
			className={`my-0 border-neutral-600 px-0 [&:not(:first-of-type)]:border-t [&:not(:first-of-type)]:pt-6 ${className}`}
		>
			<div className="mb-4 flex items-center gap-2">
				{phase === "PHASE_0" && (
					<EliteZeroIcon className="h-6 w-[18px] stroke-neutral-50" />
				)}
				{phase === "PHASE_1" && (
					<EliteOneIcon className="h-6 w-[18px] fill-neutral-50" />
				)}
				{phase === "PHASE_2" && (
					<EliteTwoIcon className="h-6 w-[18px] fill-neutral-50" />
				)}
				{/*<span className="bg-neutral-950 px-2 py-1 font-semibold text-neutral-200">*/}
				{/*</span>*/}
				<h2 className="font-serif text-lg font-semibold leading-[31px] leading-none">
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
	);
};

export default OperatorTalent;
