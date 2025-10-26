import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';

interface AuthStore {
  token: string | null;
  user: any | null;
  setToken: (token: string) => void;
  setUser: (user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: getCookie('token') as string || null,
      user: null,
      setToken: (token) => {
        setCookie('token', token);
        set({ token });
      },
      setUser: (user) => {
        set({ user });
        if (typeof window !== 'undefined') {
          localStorage.setItem('userData', JSON.stringify(user));
        }
      },
      logout: () => {
        deleteCookie('token');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('userData');
        }
        set({ token: null, user: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);