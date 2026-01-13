import * as React from "react";

function SortDescending(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width={16}
			height={14}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M9.5 12h-2a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h2a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5zm-9-8H2v9.5a.5.5 0 00.5.5h1a.5.5 0 00.5-.5V4h1.5a.5.5 0 00.354-.853l-2.5-3a.5.5 0 00-.707 0l-2.5 3A.5.5 0 00.5 4zm13 0h-6a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h6a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5zm-2 4h-4a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h4a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5zm4-8h-8a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h8a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5z"
				fill="#E8E8F2"
			/>
		</svg>
	);
}

export default SortDescending;
