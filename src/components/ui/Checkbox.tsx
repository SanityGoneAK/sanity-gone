import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { cva, type VariantProps } from "class-variance-authority"

import { cx } from "../../utils/styles";

const checkboxVariants = cva('size-[10px] rounded-sm bg-gradient-to-b', {
  variants: {
    variant: {
      primary: 'from-purple-light to-purple',
      danger: 'from-red-light to-red',
      info: 'from-blue-light to-blue',
    }
  },
  defaultVariants: {
    variant: 'primary'
  }
})

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cx(
      "peer h-4 w-4 shrink-0 rounded ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-neutral-600",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cx("flex items-center justify-center text-current")}
    >
      <div className={cx(checkboxVariants({variant}))}></div>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }