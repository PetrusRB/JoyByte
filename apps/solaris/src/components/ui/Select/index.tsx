"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { cn } from "@/libs/utils";

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default" | "lg";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        // Base styles
        "group relative flex w-full items-center justify-between gap-3 rounded-xl border-2 bg-white text-sm font-medium transition-all duration-200 outline-none",
        // Sizing
        "data-[size=sm]:h-9 data-[size=sm]:px-3 data-[size=sm]:text-sm",
        "data-[size=default]:h-11 data-[size=default]:px-4 data-[size=default]:text-sm",
        "data-[size=lg]:h-13 data-[size=lg]:px-5 data-[size=lg]:text-base",
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
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="h-4 w-4 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180 dark:text-gray-500" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          // Base styles
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-xl border-2 shadow-xl backdrop-blur-sm",
          // Light mode colors
          "light:border-orange-200 light:bg-white text-gray-700 placeholder:text-gray-400",
          "light:hover:border-orange-300 light:hover:bg-orange-50",
          "light:focus:border-orange-300 light:focus:bg-orange-50",
          // Dark mode colors
          "dark:bg-zinc-950 dark:border-zinc-900 dark:text-gray-200 dark:placeholder:text-gray-500",
          "dark:hover:border-zinc-900 dark:hover:bg-zinc-950",
          "dark:focus:border-zinc-900 dark:focus:bg-zinc-950",
          // Animations
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          // Popper positioning
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-2",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        "px-3 py-2 text-xs font-semibold uppercase tracking-wider",
        "text-gray-500 dark:text-gray-400",
        className,
      )}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        // Base styles
        "relative flex w-full cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-all duration-150",
        // Light mode
        "text-gray-700 hover:bg-orange-100 hover:text-orange-800",
        "focus:bg-orange-200 focus:text-orange-900",
        "data-[state=checked]:bg-orange-200 data-[state=checked]:text-orange-900",
        // Dark mode
        "dark:text-gray-200 dark:hover:bg-orange-950/30 dark:hover:text-orange-200",
        "dark:focus:bg-orange-950/50 dark:focus:text-orange-100",
        "dark:data-[state=checked]:bg-orange-950/50 dark:data-[state=checked]:text-orange-100",
        // States
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:h-4 [&_svg]:w-4",
        "*:last-child:flex *:last-child:items-center *:last-child:gap-2",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex-1">
        {children}
      </SelectPrimitive.ItemText>
      <span className="flex h-5 w-5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(
        "mx-2 my-1 h-px bg-orange-200 dark:bg-orange-300/20",
        className,
      )}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-2 text-gray-400 hover:text-orange-600 dark:text-gray-500 dark:hover:text-orange-400",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-2 text-gray-400 hover:text-orange-600 dark:text-gray-500 dark:hover:text-orange-400",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
