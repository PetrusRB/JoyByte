"use client";
import { Spoiler } from "@mantine/core";

interface Props {
  text: string;
}

export default function ContentPreview({ text }: Props) {
  return (
    <Spoiler
      maxHeight={120}
      showLabel="Ver mais"
      hideLabel="Esconder"
      className="dark:text-white text-zinc-700"
    >
      {text}
    </Spoiler>
  );
}
