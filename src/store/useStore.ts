import { create } from 'zustand';
import { User, PageData, PersonalInfo, ToastState } from '@/types';
import { getMe, clearToken } from '@/utils/api';

interface AppState {
  // 认证状态
  user: User | null;
  myPage: PageData | null;
  authLoading: boolean;
  setAuth: (user: User, page: PageData) => void;
  logout: () => void;
  loadAuth: () => Promise<void>;

  // Toast
  toast: ToastState;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  myPage: null,
  authLoading: true,

  setAuth: (user, page) => set({ user, myPage: page, authLoading: false }),

  logout: () => {
    clearToken();
    set({ user: null, myPage: null, authLoading: false });
  },

  loadAuth: async () => {
    try {
      const result = await getMe();
      if (result) {
        set({ user: result.user, myPage: result.page, authLoading: false });
      } else {
        set({ user: null, myPage: null, authLoading: false });
      }
    } catch {
      set({ user: null, myPage: null, authLoading: false });
    }
  },

  toast: { message: '', type: 'info', visible: false },

  showToast: (message, type) => {
    set({ toast: { message, type, visible: true } });
    setTimeout(() => {
      set((state) => ({ toast: { ...state.toast, visible: false } }));
    }, 3000);
  },

  hideToast: () => {
    set((state) => ({ toast: { ...state.toast, visible: false } }));
  },
}));
