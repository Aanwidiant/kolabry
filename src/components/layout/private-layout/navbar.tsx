import { Menu } from '@/components/icons';

export default function Navbar({ onMenuClick, isSidebarOpen }: { onMenuClick: () => void; isSidebarOpen: boolean }) {
    return (
        <nav className='fixed top-0 z-30 w-full h-16 bg-light border-b border-gray flex items-center px-6'>
            <div className='flex items-center justify-start'>
                <div className='items-center p-2 md:hidden scale-75'>
                    <Menu isOpen={isSidebarOpen} toggleSidebar={onMenuClick} />
                </div>
                <p className='text-primary text-2xl font-bold tracking-widest'>KOLABRY</p>
            </div>
        </nav>
    );
}
