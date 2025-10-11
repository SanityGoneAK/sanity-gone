import React from "react";

const SpecialistIcon: React.FC<React.HTMLAttributes<SVGElement>> = (props) => {
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
				d="M7.36063 9.4539H11.1941L7.08399 1.40971L6.99507 0L6.91603 1.40971L3.54694 8.02448H6.65914L7.26183 6.83165H5.41426L6.99507 3.7165L9.32675 8.27093H7.96331L7.36063 9.4539Z"
				fill="#E8E8F2"
			/>
			<path
				d="M1.25476 12.7859H12.7452L14 13.5154L12.7946 12.5986L11.7968 10.6467H10.5321L11.0162 11.5931H2.98377L4.19901 9.20744H2.93437L1.20536 12.5986L0 13.5154L1.25476 12.7859Z"
				fill="#E8E8F2"
			/>
		</svg>
	);
};

export default SpecialistIcon;
