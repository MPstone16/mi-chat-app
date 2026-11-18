import { useState } from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";
import { colors, spacing } from "@shared/theme/theme";

/** Input de formulario: borde lavanda de 1px que pasa a violeta de 2px al enfocar. */
export function FormInput({ style, onFocus, onBlur, ...props }: TextInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      placeholderTextColor={colors.textSecondary}
      {...props}
      style={[styles.input, focused && styles.focused, style]}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
    />
  );
}

const PADDING_H = spacing.md;
const PADDING_V = 13;

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: PADDING_H,
    paddingVertical: PADDING_V,
    marginBottom: 12,
    fontSize: 15,
    color: colors.text,
  },
  // +1px de borde, -1px de padding: el contenido no se desplaza al enfocar
  focused: {
    borderWidth: 2,
    borderColor: colors.primary,
    paddingHorizontal: PADDING_H - 1,
    paddingVertical: PADDING_V - 1,
  },
});
