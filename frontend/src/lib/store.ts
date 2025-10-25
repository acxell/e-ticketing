import { create } from 'zustand';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';

interface AuthStore {
  token: string | null;
  user: any | null;
  setToken: (token: string) => void;
  setUser: (user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: getCookie('token') as string || null,
  user: null,
  setToken: (token) => {
    setCookie('token', token);
    set({ token });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    deleteCookie('token');
    set({ token: null, user: null });
  },
}));