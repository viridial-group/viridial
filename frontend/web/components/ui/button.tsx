import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)] text-[var(--color-neutral-100)] hover:opacity-90",
        secondary:
          "bg-[var(--color-secondary)] text-white hover:opacity-90",
        success:
          "bg-[var(--color-success)] text-white hover:opacity-90",
        danger:
          "bg-[var(--color-danger)] text-white hover:opacity-90",
        warning:
          "bg-[var(--color-warning)] text-white hover:opacity-90",
        outline:
          "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all",
        light:
          "bg-[var(--color-neutral-100)] text-[var(--color-primary)] border border-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-200)]",
        ghost: "hover:bg-[var(--color-neutral-200)] hover:text-[var(--color-primary)]",
        link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
        accent:
          "bg-[var(--color-accent)] text-white hover:opacity-90",
      },
      size: {
        sm: "h-8 px-3 py-1.5 text-xs rounded-md",
        default: "h-10 px-4 py-2 text-sm rounded-md",
        lg: "h-12 px-6 py-3 text-base rounded-md",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
