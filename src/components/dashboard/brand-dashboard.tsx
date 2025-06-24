import { Dashboard } from '@/components/icons';
import React from 'react';

export default function BrandDashboard() {
    return (
        <main className='pb-10 h-full flex flex-col'>
            <div className='w-full h-16 border-b border-gray flex gap-3 items-center px-6'>
                <Dashboard className='w-8 h-8 fill-dark' />
                <span className='text-lg font-semibold'>Dashboard</span>
            </div>
            <div className='h-[calc(100vh-10rem)] overflow-y-auto'>test</div>
        </main>
    );
}
