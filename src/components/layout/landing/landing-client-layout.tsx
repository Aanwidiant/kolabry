import React from 'react';
import LandingNavLayout from '@/components/layout/landing/landing-nav-layout';
import LandingFooter from '@/components/layout/landing/landing-footer';

export default function LandingClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <LandingNavLayout>
            <div>{children}</div>
            <LandingFooter />
        </LandingNavLayout>
    );
}
