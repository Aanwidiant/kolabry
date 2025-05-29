import React from 'react';
import Image from 'next/image';

export default function DataNotFound() {
    return (
        <div className='flex flex-col items-center justify-center w-full p-3'>
            <div className='relative w-52 h-52'>
                <Image src='/data-not-found.svg' alt='not-found-img' fill priority className='object-contain' />
            </div>
            <p className='text-center text-xl font-semibold'>Data not found.</p>
        </div>
    );
}
