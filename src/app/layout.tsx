import type { Metadata } from 'next';
import './globals.css';
import React from 'react';
import { ToastContainer } from 'react-toastify';

export const metadata: Metadata = {
    title: 'Kolabry',
    description: 'Web application key opinion leader management',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en' className='scroll-smooth transition duration-300 ease-in-out font-body'>
            <body className='bg-light text-dark custom-scroll'>
                {children}
                <ToastContainer position='bottom-right' />
            </body>
        </html>
    );
}
