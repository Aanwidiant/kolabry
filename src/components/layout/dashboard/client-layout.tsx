'use client'

import React,{ useState } from "react";
import Navbar from "@/components/layout/dashboard/navbar";
import Sidebar from "@/components/layout/dashboard/sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [sidebarVisible, setSidebarVisible] = useState(false);

    return (
        <>
            <Navbar onMenuClick={() => setSidebarVisible(prev => !prev)} />
            <div className="flex">
                <Sidebar
                    mobileVisible={sidebarVisible}
                    onMobileClose={() => setSidebarVisible(false)}
                />
                <main className="flex-1 min-h-screen bg-light pt-16">
                    {children}
                </main>
            </div>
        </>
    );
}
