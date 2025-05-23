'use client'

import React, { useState } from "react";
import Navbar from "@/components/layout/dashboard/navbar";
import Sidebar from "@/components/layout/dashboard/sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [mobileVisible, setMobileVisible] = useState(false);

    return (
        <>
            <Navbar
                onMenuClick={() => setMobileVisible(!mobileVisible)}
                isSidebarOpen={mobileVisible}
            />
            <div className="flex">
                <Sidebar
                    mobileVisible={mobileVisible}
                    onMobileClose={() => setMobileVisible(false)}
                />
                <main className="flex-1 min-h-screen bg-light pt-16">
                    {children}
                </main>
            </div>
        </>
    );
}