import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold uppercase ring-offset-background transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-display active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-[#3CD3E8] text-brand-blue shadow-lg shadow-[#3CD3E8]/20 hover:bg-[#2BC0D5] hover:text-white hover:-translate-y-0.5",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600",
        outline:
          "border-2 border-brand-blue/10 bg-white text-brand-blue hover:bg-brand-cyan/5 hover:border-brand-cyan/30 shadow-sm",
        secondary:
          "bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20",
        ghost: "hover:bg-brand-cyan/10 hover:text-brand-cyan",
        link: "text-brand-blue underline-offset-4 hover:underline",
        accent: "bg-[#329A00] text-white shadow-md hover:bg-[#287a00]",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-9 rounded-full px-4 text-xs",
        lg: "h-14 rounded-full px-8 text-lg",
        icon: "h-10 w-10",
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