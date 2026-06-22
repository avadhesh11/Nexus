import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";
import api from "@/lib/api";

interface AuthState {
  user: User | null;

  setUser: (user: User) => void;

  logout: () => void;

  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,

      setUser: (user) => {
        set({ user });
      },


      logout: async () => {
        try {
          await api.post("/auth/logout");
          localStorage.removeItem("nexus-workspace");
          localStorage.removeItem("nexus-auth");
        } catch (err) {
          console.log(err);
        }
        set({
          user: null,
        });
      },

      isAuthenticated: () => !!get().user,
    }),

    {
      name: "nexus-auth",

      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);