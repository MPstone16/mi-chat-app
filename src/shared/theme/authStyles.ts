import { StyleSheet } from "react-native";
import { colors, radius, shadows, spacing } from "./theme";

// Estilos compartidos por las pantallas de login y registro.
export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 52,
    marginTop: spacing.xs,
    ...shadows.primary,
  },
  buttonText: { color: colors.textOnPrimary, fontWeight: "700", fontSize: 16 },
  error: { color: colors.error, marginBottom: 12, textAlign: "center" },
  info: { color: colors.success, marginBottom: 12, textAlign: "center" },
  link: {
    marginTop: spacing.md,
    textAlign: "center",
    color: colors.primary,
    fontWeight: "600",
  },
});
