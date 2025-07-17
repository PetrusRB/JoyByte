import { ComponentProps } from "react";
import { AvatarImage } from "../Image";

type Props = ComponentProps<"div"> & {
  srcs: string[];
};

export const Group = (props: Props) => {
  return (
    <div className="flex" {...props}>
      {props.srcs.map((src, index) => (
        <div
          key={index}
          className="rounded-full border-2 border-white"
          style={{ marginLeft: index > 0 ? "-10px" : "0" }}
        >
          <AvatarImage src={src} />
        </div>
      ))}
    </div>
  );
};
