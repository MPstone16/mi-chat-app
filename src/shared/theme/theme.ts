import { ViewStyle } from "react-native";
import { authorColors, colors } from "./colors";

export { authorColors, colors };

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radius = { sm: 8, md: 16, lg: 24, full: 9999 } as const;

// Sombra suave con tinte de color (iOS usa shadow*, Android usa elevation).
function tintedShadow(color: string, opacity: number, radiusPx: number, elevation: number): ViewStyle {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: opacity,
    shadowRadius: radiusPx,
    elevation,
  };
}

export const shadows = {
  card: tintedShadow(colors.primary, 0.08, 12, 2),
  primary: tintedShadow(colors.primary, 0.35, 10, 5),
  accent: tintedShadow(colors.accent, 0.4, 12, 6),
} as const;

/** Color estable para el nombre de un autor según su userId. */
export function getAuthorColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }
  return authorColors[Math.abs(hash) % authorColors.length];
}

export const theme = { colors, spacing, radius, shadows } as const;
