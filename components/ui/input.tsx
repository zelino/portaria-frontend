import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg",
          "border-2 border-slate-300 dark:border-slate-600",
          "bg-white dark:bg-slate-900",
          "px-4 py-2.5 text-base",
          "ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-slate-400 dark:placeholder:text-slate-500",
          "focus-visible:outline-none",
          "focus-visible:border-blue-500 dark:focus-visible:border-blue-400",
          "focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0",
          "transition-colors duration-200",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800",
          "md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
