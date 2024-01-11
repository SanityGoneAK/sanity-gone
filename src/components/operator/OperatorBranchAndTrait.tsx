import { useStore } from "@nanostores/react";

import Tooltip from "~/components/ui/Tooltip";
import { operatorStore } from "~/pages/operators/_store.ts";
import { subProfessionIdToBranch } from "~/utils/branches.ts";
import { operatorBranchIcon } from "~/utils/images.ts";

import TraitInfo from "./TraitInfo";

const OperatorBranchAndTrait: React.FC = () => {
	const operator = useStore(operatorStore);
	return (
		<div className="grid grid-flow-col items-center gap-x-2">
			<img
				className="h-4 w-full"
				src={operatorBranchIcon(operator.subProfessionId)}
				alt=""
			/>
			<Tooltip
				content={
					<TraitInfo subProfessionId={operator.subProfessionId} />
				}
			>
				<span
					className="relative cursor-help after:absolute after:bottom-0 after:left-0 after:right-0
							   after:border-b after:border-dashed after:opacity-[33%]"
				>
					{subProfessionIdToBranch(operator.subProfessionId)}
				</span>
			</Tooltip>
		</div>
	);
};
export default OperatorBranchAndTrait;
