"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000]", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "flex justify-between pt-1 relative items-center px-2",
        caption_label: "text-lg font-black uppercase font-display",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 hover:bg-brand-yellow border-2 border-black rounded-none shadow-[2px_2px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse space-y-1",
        head_row: "flex w-full justify-between",
        head_cell:
          "text-black rounded-none w-9 font-bold text-[0.8rem] uppercase font-display",
        row: "flex w-full mt-2 justify-between",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-brand-cyan first:[&:has([aria-selected])]:rounded-l-none last:[&:has([aria-selected])]:rounded-r-none focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-medium aria-selected:opacity-100 rounded-none hover:bg-brand-yellow hover:text-black font-body border-2 border-transparent hover:border-black"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-brand-cyan text-black hover:bg-brand-cyan hover:text-black focus:bg-brand-cyan focus:text-black border-2 border-black font-bold shadow-[2px_2px_0px_0px_#000000]",
        day_today: "bg-gray-100 text-black border-2 border-black font-bold",
        day_outside:
          "day-outside text-gray-400 opacity-50 aria-selected:bg-gray-100/50 aria-selected:text-gray-500 aria-selected:opacity-30",
        day_disabled: "text-gray-300 opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-5 w-5", className)} strokeWidth={3} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-5 w-5", className)} strokeWidth={3} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }