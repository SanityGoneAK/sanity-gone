import {
	forwardRef,
	type ElementRef,
	type ComponentPropsWithoutRef,
} from "react";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import { cx } from "~/utils/styles";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = forwardRef<
	ElementRef<typeof DropdownMenuPrimitive.Trigger>,
	ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>(({ className, ...props }, ref) => (
	<DropdownMenuPrimitive.Trigger
		ref={ref}
		className={cx(
			"flex select-none items-center gap-2 rounded-2xl bg-neutral-500 px-3 py-2 text-base leading-none focus-visible:bg-neutral-500/[.66] [&:not(:disabled)]:hover:bg-neutral-500/[.66]",
			"disabled:cursor-not-allowed disabled:opacity-50",
			"outline-none [html[data-focus-source=key]_&:focus-visible]:-outline-offset-2 [html[data-focus-source=key]_&:focus-visible]:outline-blue-light",
			className
		)}
		{...props}
	/>
));
DropdownMenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuLabel = DropdownMenuPrimitive.Label;

const DropdownMenuContent = forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 5, ...props }, ref) => (
	<DropdownMenuPrimitive.Portal>
		<DropdownMenuPrimitive.Content
			ref={ref}
			sideOffset={sideOffset}
			className={cx(
				"overflow-hidden rounded-2xl bg-neutral-600 shadow-3xl",
				className
			)}
			{...props}
		/>
	</DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const menuItemClasses = `flex min-w-[var(--radix-dropdown-menu-trigger-width)] select-none items-center gap-2 px-3 py-2
	hover:bg-neutral-500/[.66]
	focus-visible:bg-neutral-500/[.66]
	disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50 [&:not(:disabled)]:cursor-pointer data-[state=checked]:bg-neutral-500
	outline-none [html[data-focus-source=key]_&:focus-visible]:-outline-offset-2 [html[data-focus-source=key]_&:focus-visible]:outline-blue-light
`;

const DropdownMenuItem = forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
	<DropdownMenuPrimitive.Item
		ref={ref}
		className={cx(menuItemClasses, className)}
		{...props}
	/>
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuRadioItem = forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, ...props }, ref) => (
	<DropdownMenuPrimitive.RadioItem
		ref={ref}
		className={cx(menuItemClasses, className)}
		{...props}
	/>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuSeparator = forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<DropdownMenuPrimitive.Separator
		ref={ref}
		className={cx("-mx-1 my-1 h-px bg-neutral-600", className)}
		{...props}
	/>
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

export {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
};
