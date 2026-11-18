import { create } from "zustand";
import { User } from "@features/auth/domain/entities/User";

interface AuthState {
  user: User | null;
  /** true cuando ya se intentó restaurar la sesión guardada */
  initialized: boolean;
  setUser: (user: User | null) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,
  setUser: (user) => set({ user }),
  setInitialized: (initialized) => set({ initialized }),
}));
