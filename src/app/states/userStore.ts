// src/lib/state/userStore.ts

import { create } from "zustand";

interface UserState {
  isLoggedIn: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
    companyId: string;
  } | null;
  login: (user: UserState["user"]) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  isLoggedIn: false,
  user: null,
  login: (user) => set({ isLoggedIn: true, user }),
  logout: () => set({ isLoggedIn: false, user: null }),
}));