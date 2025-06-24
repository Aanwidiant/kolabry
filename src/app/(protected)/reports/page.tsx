import { Report } from '@/components/icons';
import React from 'react';

export default function ReportsPage() {
    return (
        <main className='pb-10 h-full flex flex-col'>
            <div className='w-full h-16 border-b border-gray flex gap-3 items-center px-6'>
                <Report className='w-8 h-8 fill-dark' />
                <span className='text-lg font-semibold'>Report</span>
            </div>
            <div className='w-full h-[calc(100vh-10rem)] overflow-y-auto flex justify-center items-center'>
                <h1 className='text-2xl font-semibold italic'>Sorry, this page is under construction.</h1>
            </div>
        </main>
    );
}
