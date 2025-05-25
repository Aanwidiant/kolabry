'use client';
import { useEffect, useState } from 'react';
import { getAuthToken } from '@/utilities/auth';
import useAuthStore from '@/store/authStore';
import { decodeToken } from '@/utilities/decode';

export default function DashboardPage() {
    const { user, token, login } = useAuthStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = getAuthToken();

        if (storedToken && !token) {
            const payload = decodeToken(storedToken);

            if (
                payload &&
                typeof payload.username === 'string' &&
                typeof payload.role === 'string'
            ) {
                login(storedToken, {
                    username: payload.username,
                    role: payload.role,
                });
            }
        }

        setLoading(false);
    }, [login, token]);

    if (loading) return <p>Loading...</p>;

    if (!token || !user) {
        return <p>Please login first.</p>;
    }

    switch (user.role) {
        case 'ADMIN':
            return (
                <main>
                    <h1>Admin Dashboard</h1>
                </main>
            );
        case 'KOL_MANAGER':
            return (
                <main>
                    <h1>Manager Dashboard</h1>
                </main>
            );
        case 'BRAND':
            return (
                <main>
                    <h1>User Dashboard</h1>
                </main>
            );
        default:
            return <p>Role not recognized.</p>;
    }
}
