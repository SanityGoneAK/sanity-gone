type Props = React.SVGAttributes<SVGElement>;

const SpCostIcon: React.FC<Props> = (props) => {
	return (
		<svg
			width="14"
			height="16"
			viewBox="0 0 14 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M0.143066 9.6L8.7145 0L7.34307 6.4H13.8574L5.28592 16L6.65735 9.6H0.143066Z"
				fill="#E8E8F2"
			/>
		</svg>
	);
};
export default SpCostIcon;
