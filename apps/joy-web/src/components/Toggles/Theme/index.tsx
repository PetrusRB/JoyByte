"use client";

import { Switch } from "@mantine/core";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeSwitch() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Switch
      checked={resolvedTheme === "dark"}
      onChange={(event) =>
        setTheme(event.currentTarget.checked ? "dark" : "light")
      }
      color="orange"
      size="lg"
      thumbIcon={
        resolvedTheme === "dark" ? (
          <Moon size={12} color="black" />
        ) : (
          <Sun size={12} color="black" />
        )
      }
    />
  );
}
