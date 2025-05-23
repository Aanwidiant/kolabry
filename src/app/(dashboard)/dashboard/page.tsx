'use client'
import useAuthStore from '@/store/authStore';

export default function DashboardPage() {
    const { user, token } = useAuthStore();

    if (!token) {
        return <p>Please login first.</p>;
    }

    if (!user) {
        return <p>Loading...</p>;
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
