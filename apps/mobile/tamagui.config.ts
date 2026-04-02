import { createTamagui } from "tamagui";
import { createInterFont } from "@tamagui/font-inter";
import { shorthands } from "@tamagui/shorthands";
import { themes as defaultThemes, tokens as defaultTokens } from "@tamagui/config/v4";

const interFont = createInterFont();

const kappersklokDark = {
  background: "#000000",
  backgroundHover: "#121212",
  backgroundPress: "#1c1c1e",
  backgroundFocus: "#121212",
  color: "#ffffff",
  colorHover: "#e0e0e0",
  colorPress: "#aeaeb2",
  colorFocus: "#ffffff",
  borderColor: "#2c2c2e",
  borderColorHover: "#3c3c3e",
  borderColorFocus: "#d4a853",
  borderColorPress: "#2c2c2e",
  placeholderColor: "#8e8e93",
  accentBackground: "#d4a853",
  accentColor: "#000000",
};

const config = createTamagui({
  defaultFont: "body",
  fonts: {
    body: interFont,
    heading: interFont,
  },
  tokens: defaultTokens,
  themes: {
    ...defaultThemes,
    dark: {
      ...defaultThemes.dark,
      ...kappersklokDark,
    },
  },
  shorthands,
});

export type AppConfig = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
