'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigasiProps {
    layout: 'header' | 'sidebar' | 'footer';
    toggleSidebar?: () => void;
}

export default function LandingNavigasi({
    layout,
    toggleSidebar,
}: NavigasiProps) {
    const pathName = usePathname();

    const layoutClass =
        layout === 'header'
            ? 'flex flex-row text-xl gap-x-10'
            : layout === 'sidebar'
              ? 'flex flex-col gap-y-10 text-lg py-2 ml-4'
              : 'flex flex-col gap-2';

    const handleLinkClick = () => {
        if (layout === 'sidebar' && toggleSidebar) {
            toggleSidebar();
        }
    };

    return (
        <nav>
            <ul className={`${layoutClass}`}>
                {[
                    { href: '/', label: 'Home' },
                    { href: '#about', label: 'About' },
                    { href: '/#pricing', label: 'Pricing' },
                    { href: '/#developer-team', label: 'Developer Team' },
                    { href: '/login', label: 'Login' },
                ].map((item) => (
                    <li key={item.href} className='font-medium'>
                        <Link
                            href={item.href}
                            className={`
              transition duration-300 ease-in-out
              ${
                  layout === 'footer'
                      ? 'hover:text-primary'
                      : layout === 'header' || layout === 'sidebar'
                        ? 'hover:text-light'
                        : ''
              }
              ${pathName === item.href && layout !== 'footer' ? 'font-bold text-xl text-light' : ''}
            `}
                            onClick={handleLinkClick}
                        >
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
