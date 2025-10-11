import React from "react";

const VanguardIcon: React.FC<React.HTMLAttributes<SVGElement>> = (props) => {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M12.8144 4.37699L0.395203 10.9622L1.1856 9.4539L13.6048 2.8687L12.8144 4.37699Z"
				fill="#E8E8F2"
			/>
			<path
				d="M9.10939 3.14473L7.18278 4.16011L7.00494 0L6.80734 4.35727L2.88497 6.41761L2.69725 6.78236L0 6.92037L2.54905 7.03867L2.08469 7.9259L3.65561 7.09782L4.32745 7.12739V6.75279L8.3091 4.65301L9.10939 3.14473Z"
				fill="#E8E8F2"
			/>
			<path
				d="M11.3028 7.04852L14 6.92037L11.451 6.79221L11.9153 5.90498L10.3444 6.73306L9.67256 6.70349V7.08795L5.69091 9.17787L4.89062 10.6862L6.81723 9.67077L7.00495 13.8309L7.19267 9.47361L11.115 7.41327L11.3028 7.04852Z"
				fill="#E8E8F2"
			/>
		</svg>
	);
};

export default VanguardIcon;
