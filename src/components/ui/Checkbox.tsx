import * as React from "react";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, type VariantProps } from "class-variance-authority";

import { cx } from "~/utils/styles.ts";

const checkboxVariants = cva("size-[10px] rounded-sm bg-gradient-to-b", {
	variants: {
		variant: {
			primary: "from-purple-light to-purple",
			danger: "from-red-light to-red",
			info: "from-blue-light to-blue",
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
			"ring-offset-background focus-visible:ring-ring peer h-4 w-4 shrink-0 rounded bg-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
			className
		)}
		{...props}
	>
		<CheckboxPrimitive.Indicator
			className={cx("text-current flex items-center justify-center")}
		>
			<div className={cx(checkboxVariants({ variant }))}></div>
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
