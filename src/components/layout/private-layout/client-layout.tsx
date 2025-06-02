'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/private-layout/navbar';
import Sidebar from '@/components/layout/private-layout/sidebar';
import Footer from '@/components/layout/private-layout/footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [mobileVisible, setMobileVisible] = useState(false);

    return (
        <>
            <Navbar onMenuClick={() => setMobileVisible(!mobileVisible)} isSidebarOpen={mobileVisible} />
            <div className='flex h-screen overflow-hidden'>
                <Sidebar mobileVisible={mobileVisible} onMobileClose={() => setMobileVisible(false)} />
                <div className='flex-1 pt-16 flex flex-col overflow-hidden'>
                    <main className='flex-1 overflow-y-auto'>{children}</main>
                    <Footer />
                </div>
            </div>
        </>
    );
}
