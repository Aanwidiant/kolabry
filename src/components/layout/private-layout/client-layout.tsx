'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/private-layout/navbar';
import Sidebar from '@/components/layout/private-layout/sidebar';
import Footer from '@/components/layout/private-layout/footer';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileVisible, setMobileVisible] = useState(false);

    return (
        <>
            <Navbar
                onMenuClick={() => setMobileVisible(!mobileVisible)}
                isSidebarOpen={mobileVisible}
            />
            <div className='flex'>
                <Sidebar
                    mobileVisible={mobileVisible}
                    onMobileClose={() => setMobileVisible(false)}
                />
                <div className='flex-1 flex flex-col pt-16 overflow-auto'>
                    <main className='flex-1'>{children}</main>
                    <Footer />
                </div>
            </div>
        </>
    );
}
