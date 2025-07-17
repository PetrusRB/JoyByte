import { FC } from "react";
import Card from "./Card";
import Section from "./Section";

export const Posts: {
  Section: typeof Section;
  Card: FC<any>;
} = {
  Section,
  Card,
};
