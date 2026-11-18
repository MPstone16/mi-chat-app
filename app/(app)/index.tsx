import { Room } from "@features/chat/domain/entities/Room";
import { useRooms } from "@features/chat/presentation/hooks/useRooms";
import { AnimatedButton } from "@shared/components/AnimatedButton";
import { colors, radius, shadows, spacing } from "@shared/theme/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInRight, ZoomIn } from "react-native-reanimated";

export default function RoomsScreen() {
  const { rooms, isLoading, createRoom, isCreating, createError } = useRooms();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [roomName, setRoomName] = useState("");

  const handleCreate = () => {
    if (!roomName.trim() || isCreating) return;
    createRoom(roomName.trim(), {
      onSuccess: () => {
        setRoomName("");
        setModalVisible(false);
      },
    });
  };

  const renderRoom = ({ item, index }: { item: Room; index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 60).duration(300)}>
      <TouchableOpacity
        style={styles.roomItem}
        activeOpacity={0.8}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>#</Text>
        </View>
        <Text style={styles.roomName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.roomDate}>{item.createdAt.toLocaleDateString()}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={(r) => r.id}
        renderItem={renderRoom}
        contentContainerStyle={
          rooms.length === 0 ? { flex: 1 } : { paddingVertical: spacing.sm, paddingBottom: 100 }
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.empty}>No hay salas aún. ¡Crea una!</Text>
          </View>
        }
      />

      <AnimatedButton
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Crear sala"
      >
        <Text style={styles.fabText}>+</Text>
      </AnimatedButton>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />
          <Animated.View entering={ZoomIn.duration(200)} style={styles.dialog}>
            <Text style={styles.dialogTitle}>Nueva sala</Text>
            {createError && <Text style={styles.dialogError}>{createError}</Text>}
            <TextInput
              style={styles.dialogInput}
              placeholder="Nombre de la sala"
              placeholderTextColor={colors.textSecondary}
              value={roomName}
              onChangeText={setRoomName}
              autoFocus
              maxLength={50}
            />
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createBtn, isCreating && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color={colors.textOnPrimary} size="small" />
                ) : (
                  <Text style={styles.createText}>Crear</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  empty: { color: colors.textSecondary, fontSize: 16 },
  roomItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: 6,
    padding: 14,
    borderRadius: radius.md,
    ...shadows.card,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: colors.primary, fontSize: 20, fontWeight: "bold" },
  roomName: { flex: 1, fontSize: 16, fontWeight: "600", color: colors.text },
  roomDate: { fontSize: 12, color: colors.textSecondary },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    ...shadows.accent,
  },
  fabText: { color: colors.textOnPrimary, fontSize: 30, lineHeight: 34 },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    padding: spacing.lg,
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  dialogError: { color: colors.error, fontSize: 13, marginBottom: 8 },
  dialogInput: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: spacing.md,
    color: colors.text,
  },
  dialogActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  cancelBtn: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  cancelText: { color: colors.textSecondary, fontSize: 15, fontWeight: "600" },
  createBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    minWidth: 80,
    alignItems: "center",
  },
  createText: { color: colors.textOnPrimary, fontWeight: "600", fontSize: 15 },
});
