import React from 'react';
import ClientLayout from '@/components/layout/private-layout/client-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <ClientLayout>{children}</ClientLayout>;
}
