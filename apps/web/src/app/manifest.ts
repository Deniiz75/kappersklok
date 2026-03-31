import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kappersklok",
    short_name: "Kappersklok",
    description: "Online kapper afspraak maken — snel en zonder registratie",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#d4a853",
    icons: [
      { src: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
