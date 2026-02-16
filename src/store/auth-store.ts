import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Subscription } from '@/types';
import api from '@/lib/axios';
import { API } from '@/config/apis';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  subscription: Subscription | null;
  isAuthenticated: boolean;

  setTokens: (token: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setSubscription: (subscription: Subscription) => void;
  fetchProfile: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      subscription: null,
      isAuthenticated: false,

      setTokens: (token, refreshToken) =>
        set({ token, refreshToken, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      setSubscription: (subscription) => set({ subscription }),

      fetchProfile: async () => {
        try {
          const res = await api.get(API.auth.me);
          set({
            user: res.data.user,
            subscription: res.data.subscription,
          });
        } catch {
          // silently fail
        }
      },

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
