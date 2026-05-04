import { create } from 'zustand';
import { loginApi, registerApi, logoutApi } from '../api/auth';

interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
}

interface AuthStore {
  user: User | null;
  isAuthed: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthed: false,
  loading: true,

  login: async (username: string, password: string) => {
    const { data } = await loginApi(username, password);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ user: data.user, isAuthed: true });
  },

  register: async (username: string, email: string, password: string) => {
    const { data } = await registerApi(username, email, password);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ user: data.user, isAuthed: true });
  },

  logout: async () => {
    await logoutApi();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, isAuthed: false });
  },

  checkAuth: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      set({ user: JSON.parse(userStr), isAuthed: true, loading: false });
    } else {
      set({ loading: false });
    }
  },
}));
