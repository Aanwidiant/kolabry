'use client';

import React, { useState } from 'react';
import LandingHeader from '@/components/layout/landing/landing-header';
import LandingSidebar from '@/components/layout/landing/landing-sidebar';

export default function LandingNavLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            <LandingHeader isSidebarOpen={isSidebarOpen} toggleSidebar={() => setSidebarOpen((prev) => !prev)} />
            <LandingSidebar isOpen={isSidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />
            {children}
        </>
    );
}
