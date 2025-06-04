import React from 'react';
import ClientLayout from '@/components/layout/client-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <ClientLayout>{children}</ClientLayout>;
}
