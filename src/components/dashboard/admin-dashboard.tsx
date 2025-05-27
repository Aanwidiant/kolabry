import { Dashboard } from '@/components/icons';
import React from 'react';

export default function AdminDashboard() {
    return (
        <main className='pb-10'>
            <div className='w-full h-16 border-b border-gray flex gap-3 items-center px-6'>
                <Dashboard className='w-8 h-8 fill-dark' />
                <span className='text-lg font-semibold'>Dashboard</span>
            </div>
        </main>
    );
}
