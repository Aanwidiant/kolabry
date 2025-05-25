'use client';
import React from 'react';

interface SpinnerLoaderProps {
    size?: number;
    borderWidth?: number;
    centerTextSize?: string;
}

export default function SpinnerLoader({
    size = 128,
    borderWidth = 8,
    centerTextSize = 'text-2xl',
}: SpinnerLoaderProps) {
    return (
        <div className='flex flex-col items-center justify-center space-y-4'>
            <div className='relative' style={{ width: size, height: size }}>
                <div
                    className='absolute inset-0 animate-spin rounded-full border-primary/50 border-t-primary'
                    style={{
                        borderWidth: borderWidth,
                    }}
                />
                <div className='absolute inset-0 flex items-center justify-center'>
                    <p className={`${centerTextSize} font-semibold text-dark`}>
                        Kolabry
                    </p>
                </div>
            </div>
            <p className='text-lg font-medium'>Please wait ...</p>
        </div>
    );
}
