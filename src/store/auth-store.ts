import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Subscription } from '@/types';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  subscription: Subscription | null;
  isAuthenticated: boolean;

  setTokens: (token: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setSubscription: (subscription: Subscription) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      subscription: null,
      isAuthenticated: false,

      setTokens: (token, refreshToken) =>
        set({ token, refreshToken, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      setSubscription: (subscription) => set({ subscription }),

      logout: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          subscription: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'vault-auth',
    }
  )
);
