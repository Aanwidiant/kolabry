import { CampaignType } from '@/components/icons';
import React from 'react';

export default function CampaignTypePage() {
    return (
        <main className='pb-10'>
            <div className='w-full h-16 border-b border-gray flex gap-3 items-center px-6'>
                <CampaignType className='w-8 h-8 fill-dark' />
                <span className='text-lg font-semibold'>Campaign Type</span>
            </div>
        </main>
    );
}
