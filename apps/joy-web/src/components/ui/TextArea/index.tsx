import * as React from "react";

import { cn } from "@/libs/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Base styles
          "group relative flex min-h-[80px] max-h-[250px] w-full items-center justify-between gap-3 rounded-xl border-2 bg-white text-sm font-medium transition-all duration-200 outline-none",
          // Sizing
          "h-11 px-4 text-sm",
          // Light mode colors
          "border-orange-200 text-gray-700",
          "hover:border-orange-300 hover:bg-orange-50/50",
          "focus:border-orange-300 focus:bg-orange-50/30",
          // Dark mode colors
          "dark:bg-zinc-950 dark:border-zinc-900 dark:text-gray-200",
          "dark:hover:border-zinc-900 dark:hover:bg-zinc-950/20",
          "dark:focus:border-zinc-900 dark:focus:bg-zinc-950/10",
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
Textarea.displayName = "Textarea";

export { Textarea };
