import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

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
          await fetch(
            "http://localhost:8000/api/auth/logout",
            {
              method: "POST",
              credentials: "include",
            }
          );
        } catch (err) {
          console.log(err);
        }

        localStorage.removeItem("nexus-workspace");

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