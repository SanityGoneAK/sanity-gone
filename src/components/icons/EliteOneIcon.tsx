import { cx } from "~/utils/styles";

interface Props extends React.HTMLAttributes<SVGElement> {
	active?: boolean;
	white?: boolean;
}
/**
 * TODO
 *
 * This should have a transition from
 * ```css
 * background: linear-gradient(0deg, rgba(232, 232, 242, 0.66), rgba(232, 232, 242, 0.66)), linear-gradient(180deg, #FFEBB8 0%, #FED874 100%);
 * ```
 * to
 * ```css
 * background: linear-gradient(180deg, #FFEBB8 0%, #FED874 100%);
 * ```
 * over 200ms
 */
const EliteOneIcon: React.FC<Props> = ({ active, white, ...rest }) => {
	return (
		<svg
			width="28"
			height="18"
			viewBox="0 0 28 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...rest}
		>
			<path
				d="M14.0001 13.106L6.72006 17.96L8.80006 12.84L11.2001 11.24L2.08006 5.16004L6.10352e-05 0.0400391L14.0001 9.37404L28.0001 0.0400391L25.9201 5.16004L16.8001 11.24L19.2001 12.84L21.2801 17.96L14.0001 13.106Z"
				className={cx(
					"fill-neutral-400 transition-[fill] duration-200",
					active
						? "fill-[url(#rarity5)]"
						: "group-hover:fill-neutral-200",
					white ? "fill-neutral-50" : ""
				)}
			/>
		</svg>
	);
};
export default EliteOneIcon;
