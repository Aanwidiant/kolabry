import { Menu } from "@/components/icons";

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
    return (
        <nav className="fixed top-0 z-50 w-full h-16 bg-primary shadow-dark shadow-xs flex items-center px-6">
            <div className="flex items-center justify-start">
                <button
                    type="button"
                    className="items-center p-2 md:hidden cursor-pointer"
                    onClick={onMenuClick}
                    aria-label="Toggle sidebar"
                >
                    <Menu className="w-6 h-6 fill-light" />
                </button>
                <p className="text-light text-xl font-semibold">KOLABRY</p>
            </div>
        </nav>
    );
}
