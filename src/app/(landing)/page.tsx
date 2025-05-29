import React from 'react';
import SpinnerLoader from '@/components/globals/spinner-loader';

export default function Home() {
    return (
        <main className='min-h-screen flex justify-center items-center flex-col gap-2'>
            <SpinnerLoader />
        </main>
    );
}
