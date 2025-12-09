"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-none border-2 border-black transition-colors focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-brand-green data-[state=unchecked]:bg-white shadow-[2px_2px_0px_0px_#000000]",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-none bg-black ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5 border border-black"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }