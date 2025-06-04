import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Arrow, Campaign, Dashboard, Kol, KolTypes, Logout, Report, Users } from '@/components/icons';
import useAuthStore from '@/store/authStore';
import { usePathname, useRouter } from 'next/navigation';

type SidebarProps = {
    mobileVisible: boolean;
    onMobileClose: () => void;
};

type Role = 'ADMIN' | 'KOL_MANAGER' | 'BRAND';

type SidebarItem = {
    label: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    href: string;
};

const roleSidebarItems: Record<Role, SidebarItem[]> = {
    ADMIN: [
        { label: 'Dashboard', icon: Dashboard, href: '/dashboard' },
        { label: 'Report', icon: Report, href: '/reports' },
        { label: 'User', icon: Users, href: '/users' },
        { label: 'Log Out', icon: Logout, href: '#' },
    ],
    KOL_MANAGER: [
        { label: 'Dashboard', icon: Dashboard, href: '/dashboard' },
        { label: 'KOL', icon: Kol, href: '/kols' },
        { label: 'KOL Type', icon: KolTypes, href: '/kol-type' },
        { label: 'Campaign', icon: Campaign, href: '/campaigns' },
        { label: 'Report', icon: Report, href: '/reports' },
        { label: 'Log Out', icon: Logout, href: '#' },
    ],
    BRAND: [
        { label: 'Dashboard', icon: Dashboard, href: '/dashboard' },
        { label: 'Report', icon: Report, href: '/reports' },
        { label: 'Log Out', icon: Logout, href: '#' },
    ],
};

export default function Sidebar({ mobileVisible, onMobileClose }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const [collapsed, setCollapsed] = useState(false);
    const [isMdScreen, setIsMdScreen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const handleResize = () => {
            if (typeof window === 'undefined') return;

            const nowMdScreen = window.innerWidth >= 768;

            if (isMdScreen && !nowMdScreen && mobileVisible) {
                setTimeout(() => {
                    onMobileClose();
                }, 0);
            }

            setIsMdScreen(nowMdScreen);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [mobileVisible, onMobileClose, isMdScreen]);

    if (!user) return null;

    const role = user.role as Role;

    const sidebarItems = roleSidebarItems[role] || [];

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <>
            <div
                onClick={onMobileClose}
                className={`fixed inset-0 bg-dark/10 z-20 md:hidden transition-opacity ${
                    mobileVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            />

            <aside
                className={`min-h-screen md:h-screen overflow-y-auto fixed top-0 left-0 z-20 pt-19 transition-all bg-light border-r border-gray
                    md:translate-x-0 md:relative md:pt-19
                    ${mobileVisible ? 'w-56 translate-x-0' : '-translate-x-full w-56'} 
                    ${isMdScreen && collapsed ? 'md:w-16' : 'md:w-56'} px-3`}
            >
                <ul className='space-y-2 font-medium'>
                    {sidebarItems.map(({ label, icon: Icon, href }: SidebarItem) => {
                        if (label === 'Log Out') {
                            return (
                                <li key={label}>
                                    <button
                                        onClick={handleLogout}
                                        className={`flex items-center p-2 w-full text-dark rounded-lg hover:bg-primary hover:text-dark group ${
                                            collapsed ? 'md:justify-center' : 'space-x-3'
                                        }`}
                                    >
                                        <Icon className='w-6 h-6 fill-error group-hover:fill-light' />
                                        {((isMdScreen && !collapsed) || !isMdScreen) && isClient && (
                                            <span className='whitespace-nowrap text-error group-hover:text-white'>
                                                {label}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            );
                        }

                        return (
                            <li key={label}>
                                <Link
                                    href={href}
                                    onClick={onMobileClose}
                                    className={`flex items-center p-2 rounded-lg ${
                                        pathname === href
                                            ? 'bg-primary text-white'
                                            : 'text-dark hover:bg-primary hover:text-dark'
                                    } group ${collapsed ? 'md:justify-center' : 'space-x-3'}`}
                                >
                                    <Icon className={`w-6 h-6 fill-current group-hover:fill-light`} />
                                    {((isMdScreen && !collapsed) || !isMdScreen) && isClient && (
                                        <span className='whitespace-nowrap group-hover:text-white'>{label}</span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    className='hidden md:block absolute bottom-3 right-3 p-2 rounded-md hover:bg-primary transition-transform group'
                >
                    <Arrow
                        className={`w-6 h-6 fill-dark transition-transform duration-300 group-hover:fill-light ${
                            collapsed ? 'rotate-0' : 'rotate-180'
                        }`}
                    />
                </button>
            </aside>
        </>
    );
}
