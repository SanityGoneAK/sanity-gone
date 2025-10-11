import type React from "react";
import type { Rarity } from "~/types/output-types";

type Props = React.HTMLAttributes<SVGElement> & {
	rarity: Rarity;
	selected?: boolean;
};

const StarIcon: React.FC<Props> = (props) => {
	const { rarity, selected = false } = props;
	const fill = selected ? "black" : `url(#rarity${rarity})`;

	return ( // old svg, 16px tall
		// <svg
		// 	width="16.5"
		// 	height="16"
		// 	viewBox="0 0 16.5 16"
		// 	fill="none"
		// 	xmlns="http://www.w3.org/2000/svg"
		// >
		// 	<path
		// 		d="M2.90385 16L8.25 12.0962L13.6346 16L11.5385 9.88461L16.5 6.55769H10.4615L8.25 0L6.07692 6.55769H0L4.96154 9.88461L2.90385 16Z"
		// 		fill={fill}
		// 	/>
		// </svg>
		<svg
			width="13"
			height="12"
			viewBox="0 0 13 12"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M2.17788 12L6.1875 9.07211L10.226 12L8.65384 7.41346L12.375 4.91827H7.84615L6.1875 0L4.55769 4.91827H0L3.72115 7.41346L2.17788 12Z"
				fill={fill} />
		</svg>
	);
};

export default StarIcon;
