export const getPlaceholder = async (url: string) => {
  if (!url) return "";
  const imageBlur = await fetch(url).then(async (res) => {
    return Buffer.from(await res.arrayBuffer()).toString("base64");
  });
  return imageBlur;
};
