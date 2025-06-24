import { Dashboard } from '@/components/icons';
import React from 'react';
import Greeting from '@/components/globals/greeting';
import useAuthStore from '@/store/authStore';

export default function KolManagerDashboard() {
    const user = useAuthStore((state) => state.user);

    return (
        <main className='pb-10 h-full flex flex-col'>
            <div className='w-full h-16 border-b border-gray flex gap-3 items-center px-6'>
                <Dashboard className='w-8 h-8 fill-dark' />
                <span className='text-lg font-semibold'>Dashboard</span>
            </div>
            <div className='h-[calc(100vh-10rem)] overflow-y-auto p-6'>
                {user && <Greeting name={user.username} role={user.role} />}
            </div>
        </main>
    );
}
