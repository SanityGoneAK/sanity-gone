const DropdownArrow: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="11"
			height="6"
			viewBox="0 0 11 6"
			fill="none"
			{...props}
		>
			<path
				d="M6.13666 5.84832C5.95224 6.05056 5.65323 6.05056 5.46881 5.84832L0.941998 0.88407C0.644502 0.557826 0.8552 8.40332e-08 1.27592 1.20814e-07L10.3295 9.12307e-07C10.7503 9.49088e-07 10.961 0.557827 10.6635 0.88407L6.13666 5.84832Z"
				className="fill-neutral-50"
			/>
		</svg>
	);
};

export default DropdownArrow;
