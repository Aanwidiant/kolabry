import { create } from "zustand";
import { setAuthToken, removeAuthToken } from "@/utilities/auth";

interface User {
    username: string;
    role: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    login: (token, user) => {
        setAuthToken(token);
        set({ token, user });
    },
    logout: () => {
        removeAuthToken();
        set({ token: null, user: null });
    },
}));

export default useAuthStore;
