import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { Message } from "@features/chat/domain/entities/Message";
import { useChat } from "@features/chat/presentation/hooks/useChat";
import { AnimatedButton } from "@shared/components/AnimatedButton";
import { colors, getAuthorColor, radius, shadows, spacing } from "@shared/theme/theme";
import { useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function ChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { messages, sendMessage, isLoading } = useChat(roomId);
  const user = useAuthStore((s) => s.user);
  const [input, setInput] = useState("");
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  }, [input, sendMessage]);

  const renderMsg = ({ item }: { item: Message }) => {
    const isOwn = item.userId === user?.id;
    return (
      <Animated.View
        entering={FadeInUp.duration(250).springify()}
        style={[styles.row, isOwn && styles.rowOwn]}
      >
        <View style={[styles.bubble, isOwn ? styles.own : styles.other]}>
          {!isOwn && (
            <Text style={[styles.author, { color: getAuthorColor(item.userId) }]}>
              {item.authorUsername}
            </Text>
          )}
          <Text style={[styles.text, isOwn && styles.textOwn]}>{item.content}</Text>
          <Text style={[styles.time, isOwn && styles.timeOwn]}>
            {item.createdAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {isLoading && (
        <ActivityIndicator style={{ marginTop: spacing.md }} color={colors.primary} />
      )}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMsg}
        contentContainerStyle={{ padding: 12 }}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe..."
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={500}
        />
        <AnimatedButton
          style={styles.sendBtn}
          onPress={handleSend}
          accessibilityLabel="Enviar mensaje"
        >
          <SymbolView
            name={{ ios: "paperplane.fill", android: "send", web: "send" }}
            size={20}
            tintColor={colors.textOnPrimary}
            fallback={<Text style={styles.sendIcon}>➤</Text>}
          />
        </AnimatedButton>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  row: { flexDirection: "row", marginVertical: 4 },
  rowOwn: { justifyContent: "flex-end" },
  bubble: { maxWidth: "75%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  own: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  other: {
    backgroundColor: colors.bubbleOther,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  author: { fontSize: 12, fontWeight: "700", marginBottom: 2 },
  text: { fontSize: 15, color: colors.text },
  textOwn: { color: colors.textOnPrimary },
  time: { fontSize: 10, color: colors.textSecondary, marginTop: 4, alignSelf: "flex-end" },
  timeOwn: { color: "rgba(255, 255, 255, 0.75)" },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    margin: 10,
    padding: 6,
    paddingLeft: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 28,
    ...shadows.card,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendBtn: {
    marginLeft: spacing.sm,
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    ...shadows.accent,
  },
  sendIcon: { color: colors.textOnPrimary, fontSize: 16 },
});
