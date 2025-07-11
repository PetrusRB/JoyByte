import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ComponentProps } from "react";
import { cn } from "@/libs/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: `
        group inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ease-in-out
          border-orange-300 bg-orange-100 text-orange-500
          hover:bg-orange-200 hover:border-orange-400 hover:shadow-sm
          dark:border-orange-200/30 dark:bg-zinc-900 dark:text-orange-100
          dark:hover:bg-zinc-800 dark:hover:border-orange-200/50
          focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 dark:focus:ring-orange-400 dark:focus:ring-offset-zinc-900
          active:scale-95`,
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
