// import {useState} from "react";
import Link from "next/link";
import {
    Campaign,
    Dashboard,
    Kol,
    KolType,
    Logout,
    Report,
    Users
} from "@/components/icons";

const sidebarItems = [
    {label: "Dashboard", icon: Dashboard, href: "#"},
    {label: "KOL", icon: Kol, href: "#"},
    {label: "KOL Type", icon: KolType, href: "#"},
    {label: "Campaign", icon: Campaign, href: "#"},
    {label: "Report", icon: Report, href: "#"},
    {label: "Users", icon: Users, href: "#"},
    {label: "Log Out", icon: Logout, href: "#"},
];

export default function Sidebar() {
    // const [isSmall, setIsSmall] = useState(false);
    // const [isOpen, setIsOpen] = useState(false);
    // const [isVisible, setIsVisible] = useState(false);
    //
    // const handleSmall = () => {
    //     setIsSmall((prev) => !prev);
    //     setIsOpen(false);
    //     setIsVisible(false);
    // };
    //
    // const handleSidebar = () => {
    //     setIsSmall(false);
    //     setIsOpen(true);
    //     setIsVisible(true);
    // };
    //
    // const handleClickOutside = () => {
    //     setIsOpen(false);
    //     setIsSmall(true);
    //     setIsVisible(false);
    // };

    return (
        <aside
            className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0">
            <div className="h-full px-3 pb-4 overflow-y-auto bg-white">
                <ul className="space-y-2 font-medium">
                    {sidebarItems.map(({label, icon: Icon, href}) => (
                        <li key={label}>
                            <Link
                                href={href}
                                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
                            >
                                <Icon className="w-6 h-6 fill-dark"/>
                                <span className="ms-3 whitespace-nowrap">{label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
