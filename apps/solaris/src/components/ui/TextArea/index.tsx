import * as React from "react";

import { cn } from "@/libs/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full px-3 py-2 bg-orange-200 dark:bg-zinc-950 border border-orange-300 dark:border-zinc-800 rounded-xl text-base md:text-sm transition-colors",
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
Textarea.displayName = "Textarea";

export { Textarea };
