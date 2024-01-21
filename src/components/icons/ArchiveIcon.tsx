import * as React from "react";

function ArchiveIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width={34}
			height={32}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M33 27.2a3.2 3.2 0 01-3.2 3.2H4.2A3.2 3.2 0 011 27.2V4.8a3.2 3.2 0 013.2-3.2h7.465a1 1 0 01.832.445l2.606 3.91a1 1 0 00.832.445H29.8A3.2 3.2 0 0133 9.6v17.6z"
				stroke="#87879B"
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export default ArchiveIcon;
