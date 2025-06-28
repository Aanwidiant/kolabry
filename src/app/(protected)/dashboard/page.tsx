'use client';
import React, { useEffect, useState } from 'react';
import { getAuthToken } from '@/utilities/auth';
import useAuthStore from '@/store/authStore';
import { decodeToken } from '@/utilities/decode';
import AdminDashboard from '@/components/dashboard/admin-dashboard';
import KolManagerDashboard from '@/components/dashboard/kol-manager-dashboard';
import BrandDashboard from '@/components/dashboard/brand-dashboard';
import Unauthorized from '@/app/unauthorized/page';
import SpinnerLoader from '@/components/globals/spinner-loader';

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

    if (loading)
        return (
            <main className='pb-10 h-full flex items-center justify-center'>
                <SpinnerLoader />
            </main>
        );

    if (!token || !user) {
        return <Unauthorized />;
    }

    switch (user.role) {
        case 'ADMIN':
            return <AdminDashboard />;
        case 'KOL_MANAGER':
            return <KolManagerDashboard />;
        case 'BRAND':
            return <BrandDashboard />;
        default:
            return <Unauthorized />;
    }
}
