import { ReactNode } from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type Props = {
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  accessibilityLabel?: string;
};

const SPRING = { damping: 15, stiffness: 300 };

/** Botón con efecto rebote: se encoge a 0.94 al presionar y vuelve con resorte. */
export function AnimatedButton({ onPress, disabled, style, children, accessibilityLabel }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <Animated.View style={[style, animatedStyle, disabled && { opacity: 0.6 }]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => scale.set(withSpring(0.94, SPRING))}
        onPressOut={() => scale.set(withSpring(1, SPRING))}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={{ flex: 1, alignItems: "center", justifyContent: "center", alignSelf: "stretch" }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
