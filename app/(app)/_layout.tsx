import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { colors } from "@shared/theme/theme";
import { Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text } from "react-native";

export default function AppLayout() {
  const { logout } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textOnPrimary,
        headerTitleStyle: { fontWeight: "bold" },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Salas de Chat",
          headerRight: () => (
            <Pressable
              onPress={logout}
              style={({ pressed }) => [styles.pill, pressed && { opacity: 0.7 }]}
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesión"
            >
              <SymbolView
                name={{
                  ios: "rectangle.portrait.and.arrow.right",
                  android: "logout",
                  web: "logout",
                }}
                size={16}
                tintColor={colors.textOnPrimary}
              />
              <Text style={styles.pillText}>Salir</Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="chat/[roomId]" options={{ title: "Chat" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.headerPill,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: { color: colors.textOnPrimary, fontSize: 14, fontWeight: "600" },
});
