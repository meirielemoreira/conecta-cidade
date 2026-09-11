import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Portal Conecta Cidade",
    short_name: "Conecta Cidade",
    description:
      "Informação, negócios, serviços e eventos da sua cidade em um só lugar.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ff6600",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.png.png",
        sizes: "1254x1254",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}