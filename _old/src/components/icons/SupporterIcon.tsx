import React from "react";

const SupporterIcon: React.FC<React.HTMLAttributes<SVGElement>> = (props) => {
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
				fillRule="evenodd"
				clipRule="evenodd"
				d="M14 0V13.7915H7.5187V12.5493H12.5773V1.24212H8.86238V2.29693H11.5201V10.5087L4.80169 3.80522V1.24212H3.74453V3.74607H1.25476V12.5493H3.55681V11.4945H2.31193V4.80089H3.87297L10.5716 11.4945H7.5187V9.31589L6.4813 8.28079V13.7915H0V0H6.4813V4.65302L7.5187 5.69797V0H14ZM3.20113 1.24212H1.25476V3.19402H3.20113V1.24212Z"
				fill="#E8E8F2"
			/>
		</svg>
	);
};

export default SupporterIcon;
