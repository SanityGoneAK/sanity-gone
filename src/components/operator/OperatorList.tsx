import {
	operatorAvatar,
	operatorBranchIcon,
	operatorPortrait,
} from "../../utils/images";
import { slugify } from "../../utils/strings";
import operatorsJson from "../../../data/operators.json";
import type * as OutputTypes from "../../types/output-types";
import { useStore } from "@nanostores/react";
import { $operators, $viewConfig } from "../../pages/operators/_store";
import SvgRarityGradientDefs from "./SvgRarityGradientDefs";

const OperatorLargeItem: React.FC<{ operator: OutputTypes.Operator }> = ({
	operator,
}) => {
	const [charName, alterName] = operator.name?.en_US.split(/\sthe\s/i);
	return (
		<li className="w-full h-[280px] rounded relative">
			<div className="h-full">
				<img
					className="h-full w-full object-cover object-center"
					alt=""
					src={operatorPortrait(operator.charId)}
				/>
			</div>
			<div className="absolute w-full h-full top-0 flex flex-col">
				<div className="flex">
					<div className="h-11 w-11 p-1.5 hover:bg-neutral-700 bg-neutral-800/[.66] rounded-br flex items-center justify-center transition-colors ease-in-out	duration-150 will-change-['background-color']">
						<img
							className="w-full h-ful"
							src={operatorBranchIcon(operator.subProfessionId)}
							alt=""
						/>
					</div>
					<a
						className="block flex-grow h-11"
						href={`/operators/${slugify(
							operator.name.en_US ?? ""
						)}`}
					></a>
				</div>

				<div className="bg-gradient-to-b from-[transparent] from-40% via-neutral-950/[0.67] via-[67%] to-[#1c1c1c] to-100% h-full">
					<p>
						{charName} {alterName && ` the ${alterName}`}
					</p>
				</div>
			</div>
		</li>
	);
};

const OperatorCompactItem: React.FC<{ operator: OutputTypes.Operator }> = ({
	operator,
}) => {
	return (
		<li className="h-40">
			<img
				className="h-full w-full object-cover object-center"
				alt=""
				src={operatorAvatar(operator.charId)}
			/>
		</li>
	);
};

const OperatorList = () => {
	const operators = useStore($operators);
	const viewConfig = useStore($viewConfig);

	return (
		<ul className="grid p-0 grid-cols-[repeat(auto-fill,_minmax(150px,_1fr))] list-none gap-x-6 gap-y-4">
			{operators.map((op) =>
				viewConfig === "compact" ? (
					<OperatorCompactItem key={op.charId} operator={op} />
				) : (
					<OperatorLargeItem key={op.charId} operator={op} />
				)
			)}
			<SvgRarityGradientDefs />
		</ul>
	);
};

export default OperatorList;