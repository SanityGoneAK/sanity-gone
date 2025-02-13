import { cx } from "~/utils/styles";

interface Props extends React.HTMLAttributes<SVGElement> {
	active?: boolean;
	white?: boolean;
}

const EliteZeroIcon: React.FC<Props> = ({ active, white, ...rest }) => {
	return (
		<svg
			width="28"
			height="22"
			viewBox="0 0 34 24"
			// fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...rest}
		>
			<path
				d="M13.2986 14.2391L11.5226 15.423L11.3947 15.5084L11.3368 15.6509L9.25677 20.7709L8.64499 22.2768L9.99738 21.3751L17 16.706L24.0026 21.3751L25.355 22.2768L24.7432 20.7709L22.6632 15.6509L22.6053 15.5084L22.4774 15.423L20.7014 14.2391L29.1974 8.57509L29.3253 8.48976L29.3832 8.34725L31.4632 3.22725L32.075 1.72142L30.7226 2.62305L17 11.7721L3.27736 2.62305L1.92502 1.72142L2.53677 3.22725L4.61677 8.34725L4.67466 8.48976L4.80265 8.57509L13.2986 14.2391Z"
				// className={cx(
				// 	"fill-[transparent] stroke-neutral-400 transition-[stroke] duration-200",
				// 	active
				// 		? "stroke-[url(#rarity5)]"
				// 		: "group-hover:stroke-neutral-200",
				// 	white ? "stroke-neutral-50" : ""
				// )}
			/>
		</svg>
	);
};
export default EliteZeroIcon;
