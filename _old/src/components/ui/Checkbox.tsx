import * as React from "react";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, type VariantProps } from "class-variance-authority";

import { cx } from "~/utils/styles.ts";

const checkboxVariants = cva("size-4 rounded-sm border-0", {
	variants: {
		variant: {
			primary: "bg-purple-light",
			danger: "bg-red-light",
			info: "bg-blue-light",
		},
	},
	defaultVariants: {
		variant: "primary",
	},
});

export interface CheckboxProps
	extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
		VariantProps<typeof checkboxVariants> {}

const Checkbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	CheckboxProps
>(({ className, variant, ...props }, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		className={cx(
			"ring-offset-background peer h-4 w-4 shrink-0 rounded border-2 border-neutral-400",
			"disabled:cursor-not-allowed disabled:opacity-50",
			"focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
			"data-[state=checked]:border-none",
			className
		)}
		{...props}
	>
		<CheckboxPrimitive.Indicator
			className={"text-current flex items-center justify-center relative"}
		>
			<div className={checkboxVariants({ variant })}></div>
			<svg className="absolute inset-0 m-auto mt-[5px]" width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M1 3L4 6L9 1" stroke="#14141B" strokeWidth="2" strokeLinecap="round" />
			</svg>
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export default Checkbox;
