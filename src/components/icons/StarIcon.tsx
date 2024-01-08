import type React from "react";
import type { Rarity } from "../../pages/operators/_store";
type Props = React.HTMLAttributes<SVGElement> & {
	rarity: Rarity;
    selected?: boolean;
};

const StarIcon: React.FC<Props> = ({rarity, selected = false}) => {
	const fill = selected ? 'black' : `url(#rarity${rarity})`;

	return (
		<svg
			width="16.5"
			height="16"
			viewBox="0 0 16.5 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M2.90385 16L8.25 12.0962L13.6346 16L11.5385 9.88461L16.5 6.55769H10.4615L8.25 0L6.07692 6.55769H0L4.96154 9.88461L2.90385 16Z"
				fill={fill}
			></path>
		</svg>
	);
};

export default StarIcon