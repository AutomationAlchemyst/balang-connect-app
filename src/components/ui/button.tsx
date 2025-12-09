import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-bold uppercase ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:-translate-y-0.5 font-display",
  {
    variants: {
      variant: {
        default: "bg-brand-yellow text-black hover:bg-[#FFE580]",
        destructive:
          "bg-red-500 text-white hover:bg-red-600",
        outline:
          "bg-white text-black hover:bg-gray-100",
        secondary:
          "bg-brand-cyan text-black hover:bg-[#2BC0D5]",
        ghost: "border-transparent shadow-none hover:bg-gray-100 hover:shadow-none active:translate-x-0 active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline shadow-none border-0 p-0 h-auto",
        accent: "bg-brand-green text-white hover:bg-[#329A00]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-14 px-8 text-lg",
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