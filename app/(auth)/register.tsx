import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { AnimatedButton } from "@shared/components/AnimatedButton";
import { FormInput } from "@shared/components/FormInput";
import { authStyles } from "@shared/theme/authStyles";
import { colors } from "@shared/theme/theme";
import { Link } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { register, isLoading, error, info } = useAuth();

  return (
    <View style={authStyles.container}>
      <View style={authStyles.card}>
        <Text style={authStyles.title}>Crear cuenta</Text>
        {error && <Text style={authStyles.error}>{error}</Text>}
        {info && <Text style={authStyles.info}>{info}</Text>}
        <FormInput
          placeholder="Usuario (sin espacios)"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <FormInput
          placeholder="Correo"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <FormInput
          placeholder="Contraseña (mín. 6 caracteres)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <AnimatedButton
          style={authStyles.button}
          onPress={() => register({ email, password, username })}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={authStyles.buttonText}>Registrarse</Text>
          )}
        </AnimatedButton>
        <Link href="/(auth)/login" style={authStyles.link}>
          ¿Ya tienes cuenta? Inicia sesión
        </Link>
      </View>
    </View>
  );
}
