import { useStore } from "@nanostores/react";

import SvgRarityGradientDefs from "./SvgRarityGradientDefs";
import operatorsJson from "../../../data/operators.json";
import { $operators, $viewConfig } from "../../pages/operators/_store";
import {
	operatorAvatar,
	operatorBranchIcon,
	operatorPortrait,
} from "../../utils/images";
import { slugify } from "../../utils/strings";

import type * as OutputTypes from "../../types/output-types";
import useMediaQuery from "~/utils/media-query";

const OperatorLargeItem: React.FC<{ operator: OutputTypes.Operator }> = ({
	operator,
}) => {
	const [charName, alterName] = operator.name?.en_US.split(/\sthe\s/i);
	return (
		<li className="relative h-[280px] w-full rounded">
			<div className="h-full">
				<img
					className="h-full w-full object-cover object-center"
					alt=""
					src={operatorPortrait(operator.charId)}
				/>
			</div>
			<div className="absolute top-0 flex h-full w-full flex-col">
				<div className="flex">
					<div className="flex h-11 w-11 items-center justify-center rounded-br bg-neutral-800/[.66] p-1.5 transition-colors duration-150 ease-in-out	will-change-['background-color'] hover:bg-neutral-700">
						<img
							className="h-ful w-full"
							src={operatorBranchIcon(operator.subProfessionId)}
							alt=""
						/>
					</div>
					<a
						className="block h-11 flex-grow"
						href={`/operators/${slugify(
							operator.name.en_US ?? ""
						)}`}
					></a>
				</div>

				<div className="h-full bg-gradient-to-b from-[transparent] from-40% via-neutral-950/[0.67] via-[67%] to-[#1c1c1c] to-100%">
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
	const isMobile = useMediaQuery("(max-width: 768px)");

	return (
		<ul className="grid list-none grid-cols-[repeat(auto-fill,_minmax(150px,_1fr))] gap-x-6 gap-y-4 p-0">
			{operators.map((op) =>
				isMobile || viewConfig === "compact" ? (
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
