'use client';
import React from 'react';

interface SpinnerLoaderProps {
    scale?: string;
}

export default function SpinnerLoader({ scale = 'scale-100' }: SpinnerLoaderProps) {
    return (
        <div className={`flex flex-col items-center justify-center space-y-4 ${scale}`}>
            <div className="relative w-32 h-32">
                <div
                    className="absolute inset-0 animate-spin rounded-full border-primary/50 border-t-primary"
                    style={{ borderWidth: 8 }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-2xl font-semibold text-dark">Kolabry</p>
                </div>
            </div>
            <p className="text-lg font-medium">Please wait ...</p>
        </div>
    );
}
