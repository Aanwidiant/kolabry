'use client';
import { useEffect, useState } from 'react';
import { getAuthToken } from '@/utilities/auth';
import useAuthStore from '@/store/authStore';
import { decodeToken } from '@/utilities/decode';
import AdminDashboard from '@/components/dashboard/admin-dashboard';
import KolManagerDashboard from '@/components/dashboard/kol-manager-dashboard';
import BrandDashboard from '@/components/dashboard/brand-dashboard';

export default function DashboardPage() {
    const { user, token, login } = useAuthStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = getAuthToken();

        if (storedToken && !token) {
            const payload = decodeToken(storedToken);

            if (payload && typeof payload.username === 'string' && typeof payload.role === 'string') {
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
            return <AdminDashboard />;
        case 'KOL_MANAGER':
            return <KolManagerDashboard />;
        case 'BRAND':
            return <BrandDashboard />;
        default:
            return <p>Role not recognized.</p>;
    }
}
