import React from "react";

const GuardIcon: React.FC<React.HTMLAttributes<SVGElement>> = (props) => {
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
				d="M2.33169 1.65616L0.671844 0L0 0.67035L1.65985 2.32651V4.85018H2.63797V2.63211H4.86097V1.65616H2.33169Z"
				fill="#E8E8F2"
			/>
			<path
				d="M10.9965 9.86794L4.12986 3.02643H3.2703L9.31687 9.05958L9.07975 9.29617L3.03317 3.26302V4.12068L9.88992 10.972L10.3938 11.8001L13.5949 13.5647L11.8264 10.3707L10.9965 9.86794Z"
				fill="#E8E8F2"
			/>
			<path
				d="M11.8857 7.59072L14 12.6873V4.86003L13.585 9.1483L11.8857 7.59072Z"
				fill="#E8E8F2"
			/>
			<path
				d="M7.60762 11.8593L12.7156 13.9689H4.87085L9.16866 13.5549L7.60762 11.8593Z"
				fill="#E8E8F2"
			/>
		</svg>
	);
};

export default GuardIcon;
