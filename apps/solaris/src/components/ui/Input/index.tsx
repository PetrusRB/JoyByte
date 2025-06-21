import * as React from "react";

import { cn } from "@/libs/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full px-4 py-3 bg-orange-200 dark:bg-zinc-950 border border-orange-300 dark:border-zinc-800 rounded-xl text-base md:text-sm transition-colors",
          "dark:focus:bg-zinc-800 focus:bg-orange-300 dark:focus:border-zinc-600 focus:border-orange-400 focus-visible:outline-none",
          "placeholder:text-zinc-500 dark:hover:border-zinc-700 hover:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed",
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
