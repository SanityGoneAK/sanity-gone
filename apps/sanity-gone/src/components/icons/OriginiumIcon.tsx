const OriginiumIcon: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M8.00004 0.761864L1.73163 4.38093V11.6191L8.00004 15.2381L14.2684 11.6191V4.38093L8.00004 0.761864ZM14.9282 4L8.00004 0L1.07184 4V12L8.00004 16L14.9282 12V4Z"
				fill="url(#paint0_linear_4981_12458)"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M7.99999 1.48454L13.6426 4.74227V11.2577L9.92846 9.1134L7.99999 10.2268V14.5155L2.35744 11.2577V4.74227L7.99999 1.48454ZM8 8.41237L5.93814 6.35052L8 4.28866L10.0619 6.35052L8 8.41237ZM9.36203 6.35052L8 7.71255L6.63796 6.35052L8 4.98848L9.36203 6.35052Z"
				fill="url(#paint1_linear_4981_12458)"
			/>
			<defs>
				<linearGradient
					id="paint0_linear_4981_12458"
					x1="8.00004"
					y1="0"
					x2="8.00004"
					y2="16"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#FFEBB8" />
					<stop offset="1" stopColor="#FED874" />
				</linearGradient>
				<linearGradient
					id="paint1_linear_4981_12458"
					x1="8.00004"
					y1="0"
					x2="8.00004"
					y2="16"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#FFEBB8" />
					<stop offset="1" stopColor="#FED874" />
				</linearGradient>
			</defs>
		</svg>
	);
};
export default OriginiumIcon;
