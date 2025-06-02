import LandingClientLayout from '@/components/layout/landing/landing-client-layout';
import React from 'react';

export default async function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <LandingClientLayout>{children}</LandingClientLayout>;
}
