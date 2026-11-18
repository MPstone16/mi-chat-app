import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { AnimatedButton } from "@shared/components/AnimatedButton";
import { FormInput } from "@shared/components/FormInput";
import { authStyles } from "@shared/theme/authStyles";
import { colors } from "@shared/theme/theme";
import { Link } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuth();

  return (
    <View style={authStyles.container}>
      <View style={authStyles.card}>
        <Text style={authStyles.title}>Bienvenido 👋</Text>
        {error && <Text style={authStyles.error}>{error}</Text>}
        <FormInput
          placeholder="Correo"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <FormInput
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <AnimatedButton
          style={authStyles.button}
          onPress={() => login({ email, password })}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={authStyles.buttonText}>Ingresar</Text>
          )}
        </AnimatedButton>
        <Link href="/(auth)/register" style={authStyles.link}>
          ¿No tienes cuenta? Regístrate
        </Link>
      </View>
    </View>
  );
}
