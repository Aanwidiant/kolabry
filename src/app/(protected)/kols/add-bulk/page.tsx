'use client';
import { Kol } from '@/components/icons';
import React from 'react';

export default function AddBulkKolsPage() {

    return (
        <main className='pb-10'>
            <div className='w-full h-16 border-b border-gray flex gap-3 items-center px-6'>
                <Kol className='w-8 h-8 fill-dark' />
                <span className='text-lg font-semibold'>Key Opinion Leader/ Add Bulk</span>
            </div>
            <div>
                Add bulk page
            </div>
        </main>
    );
}
