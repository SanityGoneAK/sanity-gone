import Tippy from "@tippyjs/react";

import "tippy.js/dist/tippy.css";

import type { TippyProps } from "@tippyjs/react";

// TODO I have no idea what's going on here
// but that's like, totally not my problem.
// I just want my other components to work. :)
// -Sting

const Tooltip: React.FC<TippyProps> = ({ children, theme, ...rest }) => {
	// attempting to SSR this causes `astro build` to explode
	// we don't actually care about SSRing a tooltip,
	// so just return the tooltip trigger (children) in this case
	if (typeof window === "undefined") {
		return children;
	}

	return (
		// offset: 8px is the height of the tooltip arrow, then spacing(0.5) is 4px
		<Tippy
			theme={theme ?? "sg"}
			offset={[0, 8 + 4]}
			duration={[250, 250]}
			{...rest}
		>
			{children}
		</Tippy>
	);
};
export default Tooltip;
