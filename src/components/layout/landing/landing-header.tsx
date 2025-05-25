import LandingNavigasi from '@/components/layout/landing/landing-navigasi';
import Link from 'next/link';
import { Menu } from '@/components/icons';

interface HeaderProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

export default function LandingHeader({
    isSidebarOpen,
    toggleSidebar,
}: HeaderProps) {
    return (
        <header className=' fixed top-0 left-0 z-10 flex items-center w-full shadow-sm bg-primary shadow-primary/75'>
            <div className='container'>
                <div className='flex items-center justify-between w-full h-20'>
                    <div className='px-4 flex gap-x-4 items-center'>
                        <Link
                            href='/'
                            className='text-2xl lg:text-3xl italic font-semibold text-light'
                        >
                            Kolabry
                        </Link>
                    </div>
                    <div className='items-center p-4 hidden lg:flex gap-x-8'>
                        <LandingNavigasi layout='header' />
                    </div>
                    <div className='h-full items-center flex lg:hidden p-4'>
                        <Menu
                            isOpen={isSidebarOpen}
                            toggleSidebar={toggleSidebar}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
