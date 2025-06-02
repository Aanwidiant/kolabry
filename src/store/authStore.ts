import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAuthToken, removeAuthToken } from '@/utilities/auth';

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

const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            login: (token, user) => {
                setAuthToken(token);
                set({ token, user });
            },
            logout: () => {
                removeAuthToken(); // hapus dari cookie
                set({ token: null, user: null });
            },
        }),
        {
            name: 'kolabry',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
            }),
        }
    )
);

export default useAuthStore;
