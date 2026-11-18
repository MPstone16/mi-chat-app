// Paleta "Electric Pop" — única fuente de verdad para los colores de la app.
export const colors = {
  // Marca
  primary: "#6C2BD9", // Violeta eléctrico: headers, botones, burbujas propias
  primaryActive: "#551BB8",
  primarySoft: "#EDE7FA", // Fondo de avatares de sala
  accent: "#FF4D6D", // Coral neón: FAB, enviar, indicadores
  accentAlt: "#00D4FF", // Cian vibrante: detalles

  // Superficies
  background: "#F4F2FA",
  surface: "#FFFFFF",
  inputBackground: "#F8F7FC",
  border: "#E2DDF5",
  bubbleOther: "#FFFFFF",
  overlay: "rgba(26, 20, 41, 0.45)",
  headerPill: "rgba(255, 255, 255, 0.18)",

  // Texto
  text: "#1A1429",
  textSecondary: "#6E6587",
  textOnPrimary: "#FFFFFF",

  // Estados
  success: "#00C896",
  error: "#FF2A5F",
} as const;

// Colores para el nombre del autor en chats grupales.
export const authorColors = ["#FF4D6D", "#0099CC", "#6C2BD9"] as const;
