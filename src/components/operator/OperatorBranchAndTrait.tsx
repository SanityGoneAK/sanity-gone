import { useStore } from "@nanostores/react";

import { operatorStore } from "../../pages/operators/_store";
import { subProfessionIdToBranch } from "../../utils/branches";
import { operatorBranchIcon } from "../../utils/images";
import Tooltip from "../Tooltip";
import TraitInfo from "../TraitInfo";

const OperatorBranchAndTrait: React.FC = () => {
	const operator = useStore(operatorStore);
	return (
		<div className={operatorInfoClasses.rarityClassBranchItem}>
			<img
				className={operatorInfoClasses.classBranchIcon}
				src={operatorBranchIcon(operator.subProfessionId)}
				alt=""
			/>
			<Tooltip
				content={
					<TraitInfo subProfessionId={operator.subProfessionId} />
				}
			>
				<span className={classes.hasTooltip}>
					{subProfessionIdToBranch(operator.subProfessionId)}
				</span>
			</Tooltip>
		</div>
	);
};
export default OperatorBranchAndTrait;
