import { forwardRef } from "react";

import { cx } from "~/utils/styles";

const Input = forwardRef<
	HTMLInputElement,
	React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
	const { className, ...rest } = props;
	return (
		<input
			ref={ref}
			className={cx(
				"box-border inline-flex h-8 rounded-lg bg-neutral-600 px-2.5 py-2 text-center text-base font-normal text-neutral-50",
				className
			)}
			{...rest}
		/>
	);
});
Input.displayName = "Input";

export default Input;
