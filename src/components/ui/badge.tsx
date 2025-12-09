import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-none border-2 border-black px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 uppercase font-display shadow-[2px_2px_0px_0px_#000000]",
  {
    variants: {
      variant: {
        default:
          "border-black bg-brand-yellow text-black hover:bg-[#FFE580]",
        secondary:
          "border-black bg-brand-cyan text-black hover:bg-[#2BC0D5]",
        destructive:
          "border-black bg-red-500 text-white hover:bg-red-600",
        outline: "text-foreground bg-white hover:bg-gray-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }