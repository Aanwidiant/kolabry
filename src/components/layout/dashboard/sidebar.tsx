import Link from "next/link";
import React, {useEffect, useState} from "react";
import {
    Arrow,
    Campaign,
    Dashboard,
    Kol,
    KolType,
    Logout,
    Report,
    Users,
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

type SidebarProps = {
    mobileVisible: boolean;
    onMobileClose: () => void;
};

export default function Sidebar({mobileVisible, onMobileClose}: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (typeof window !== 'undefined') {
                const isMdScreen = window.innerWidth >= 768;
                if (!isMdScreen && mobileVisible) {
                    onMobileClose();
                }
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [mobileVisible, onMobileClose]);

    return (
        <>
            <div
                onClick={onMobileClose}
                className={`fixed inset-0 bg-dark/20 z-30 md:hidden transition-opacity ${
                    mobileVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            />

            <aside
                className={`fixed top-0 left-0 z-40 min-h-screen pt-19 transition-all bg-primary border-r border-gray 
                    md:translate-x-0 md:relative md:pt-19 md:border-none 
                    ${mobileVisible ? "w-56 translate-x-0" : "-translate-x-full w-56"} 
                    ${collapsed ? "md:w-16" : "md:w-56"} px-3`}
            >
                <ul className="space-y-2 font-medium">
                    {sidebarItems.map(({label, icon: Icon, href}) => (
                        <li key={label}>
                            <Link
                                href={href}
                                className={`flex items-center p-2 text-light rounded-lg hover:bg-light hover:text-dark group ${(collapsed ? "md:justify-center" : "space-x-3")} ${mobileVisible ? "space-x-3" : ""}`}
                            >
                                <Icon className="w-6 h-6 fill-light group-hover:fill-dark"/>
                                {(!collapsed || window.innerWidth < 768) &&
                                    <span className="whitespace-nowrap">{label}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="hidden md:block absolute bottom-3 right-3 p-2 rounded-md hover:bg-light transition-transform group"
                >
                    <Arrow
                        className={`w-6 h-6 fill-light transition-transform duration-300 group-hover:fill-dark ${
                            collapsed ? "rotate-0" : "rotate-180"
                        }`}
                    />
                </button>
            </aside>
        </>
    );
}