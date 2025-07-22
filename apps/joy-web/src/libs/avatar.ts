import { getRandomAvatar } from "./rand-avatar";

export const getAvatar = (src: string) => {
  return src || getRandomAvatar();
};
