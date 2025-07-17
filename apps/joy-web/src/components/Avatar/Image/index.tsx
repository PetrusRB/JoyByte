import { Avatar } from "@mantine/core";

type Props = {
  src: string;
};
export const AvatarImage = ({ src }: Props) => {
  return <Avatar src={src} />;
};
