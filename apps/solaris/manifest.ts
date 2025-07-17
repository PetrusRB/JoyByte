import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JoyByte",
    short_name: "Joy",
    description: "A gamer's social network",
    start_url: "/",
    display: "standalone",
    theme_color: "#000",
    icons: [
      {
        src: "/icons/192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/384x384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/icons/512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    background_color: "#000",
    orientation: "portrait",
  };
}
