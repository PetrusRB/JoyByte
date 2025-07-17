import * as React from "react";

import { cn } from "@/libs/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "group relative flex w-full items-center justify-between gap-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 outline-none",
          // Sizing
          "h-11 px-4 text-sm",
          // Light mode colors
          "border-orange-200 bg-white text-gray-700 placeholder:text-gray-400",
          "hover:border-orange-300 hover:bg-orange-50",
          "focus:border-orange-300 focus:bg-orange-50",
          // Dark mode colors
          "dark:bg-zinc-950 dark:border-zinc-900 dark:text-gray-200 dark:placeholder:text-gray-500",
          "dark:hover:border-zinc-900 dark:hover:bg-zinc-950",
          "dark:focus:border-zinc-900 dark:focus:bg-zinc-950",
          // States
          "data-[placeholder]:text-gray-400 dark:data-[placeholder]:text-gray-500",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-50 dark:disabled:bg-zinc-950",
          "aria-invalid:border-red-300 aria-invalid:focus:ring-red-200/20",
          "dark:aria-invalid:border-red-400/50 dark:aria-invalid:focus:ring-red-400/10",
          // Content styling
          "*:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
          // File colors
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
