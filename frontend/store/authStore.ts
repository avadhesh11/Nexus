import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        if (typeof window !== "undefined") localStorage.setItem("nexus_token", token);
        set({ token, user });
      },
      logout: () => {
        if (typeof window !== "undefined") localStorage.removeItem("nexus_token");
        set({ token: null, user: null });
      },
      isAuthenticated: () => !!get().token,
    }),
    { name: "nexus-auth", partialize: (state) => ({ token: state.token, user: state.user }) }
  )
);
