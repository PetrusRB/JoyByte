"use client";
import { createAvatar } from "@dicebear/core";
import { pixelArt } from "@dicebear/collection";
import { useMemo } from "react";

export const getRandomAvatar = () => {
  const avatar = useMemo(() => {
    return createAvatar(pixelArt, {
      size: 128,
    }).toDataUri();
  }, []);
  return avatar;
};
