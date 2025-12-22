import { cx } from "~/utils/styles";

interface Props extends React.HTMLAttributes<SVGElement> {
	active?: boolean;
	white?: boolean;
}

const EliteTwoIcon: React.FC<Props> = ({ active, white, ...rest }) => {
	return (
		<svg
			width="28"
			height="26"
			viewBox="0 0 28 26"
			// fill="none" Control from the parent element using fill-neutral-200 or similar.
			xmlns="http://www.w3.org/2000/svg"
			{...rest}
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M6.72 25.3203L14 20.4663L21.28 25.3203L19.2 20.2003L16.8 18.6003L19.0406 17.1066L21.28 18.5997L20.3254 16.25L25.92 12.5203L28 7.40028L19.0408 13.3735L16.8 11.8797L25.92 5.79969L28 0.679688L14 10.0137L0 0.679688L2.08 5.79969L11.2 11.8797L8.95923 13.3735L0 7.40028L2.08 12.5203L7.67456 16.25L6.72 18.5997L8.9594 17.1066L11.2 18.6003L8.8 20.2003L6.72 25.3203ZM14 13.7457L11.7588 15.24L14 16.7343L16.2412 15.24L14 13.7457Z"
				// className={cx(
				// 	"fill-neutral-400 transition-[fill] duration-200",
				// 	active
				// 		? "fill-[url(#rarity5)]"
				// 		: "group-hover:fill-neutral-200",
				// 	white ? "fill-neutral-50" : ""
				// )}

				// Commented out the above className. Easier to control the fill color in the parent component,
				// from whatever's using this icon.
			/>
		</svg>
	);
};
export default EliteTwoIcon;
