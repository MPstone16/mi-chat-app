import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { supabase } from "@shared/infrastructure/supabase/client";
import { colors } from "@shared/theme/theme";
import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { SupabaseAuthRepository } from "@features/auth/infrastructure/repositories/SupabaseAuthRepository";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});
const authRepo = new SupabaseAuthRepository();

function AuthGuard() {
  const { user, initialized, setUser, setInitialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // onAuthStateChange emite INITIAL_SESSION al suscribirse, así que también
    // restaura la sesión guardada en SecureStore al iniciar la app.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Supabase recomienda no hacer await de otras llamadas de supabase dentro
      // del callback (puede bloquearse); se difiere con setTimeout.
      setTimeout(async () => {
        try {
          setUser(session ? await authRepo.getCurrentUser() : null);
        } catch {
          setUser(null);
        } finally {
          setInitialized(true);
        }
      }, 0);
    });
    return () => subscription.unsubscribe();
  }, [setUser, setInitialized]);

  useEffect(() => {
    if (!initialized) return;
    const inAuth = segments[0] === "(auth)";
    if (!user && !inAuth) router.replace("/(auth)/login");
    if (user && inAuth) router.replace("/(app)");
  }, [user, initialized, segments, router]);

  return (
    <>
      <Slot />
      {!initialized && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
});
