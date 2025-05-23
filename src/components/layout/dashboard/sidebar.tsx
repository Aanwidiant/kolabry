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
    {label: "Dashboard", icon: Dashboard, href: "/dashboard"},
    {label: "KOL", icon: Kol, href: "/kols"},
    {label: "KOL Type", icon: KolType, href: "/kol-type"},
    {label: "Campaign", icon: Campaign, href: "/campaigns"},
    {label: "Report", icon: Report, href: "/reports"},
    {label: "Users", icon: Users, href: "/users"},
    {label: "Log Out", icon: Logout, href: "#"},
];

type SidebarProps = {
    mobileVisible: boolean;
    onMobileClose: () => void;
};

export default function Sidebar({mobileVisible, onMobileClose}: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [isMdScreen, setIsMdScreen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const handleResize = () => {
            if (typeof window === "undefined") return;

            const nowMdScreen = window.innerWidth >= 768;

            if (isMdScreen && !nowMdScreen && mobileVisible) {
                setTimeout(() => {
                    onMobileClose();
                }, 0);
            }

            setIsMdScreen(nowMdScreen);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [mobileVisible, onMobileClose, isMdScreen])

    return (
        <>
            <div
                onClick={onMobileClose}
                className={`fixed inset-0 bg-dark/10 z-30 md:hidden transition-opacity ${
                    mobileVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            />

            <aside
                className={`fixed top-0 left-0 z-40 min-h-screen pt-19 transition-all bg-light border-r border-gray
                    md:translate-x-0 md:relative md:pt-19
                    ${mobileVisible ? "w-56 translate-x-0" : "-translate-x-full w-56"} 
                    ${isMdScreen && collapsed ? "md:w-16" : "md:w-56"} px-3`}
            >
                <ul className="space-y-2 font-medium">
                    {sidebarItems.map(({label, icon: Icon, href}) => (
                        <li key={label}>
                            <Link
                                href={href}
                                className={`flex items-center p-2 text-dark rounded-lg hover:bg-primary hover:text-dark group ${(collapsed ? "md:justify-center" : "space-x-3")} ${mobileVisible ? "space-x-3" : ""}`}
                            >
                                <Icon className="w-6 h-6 fill-dark group-hover:fill-light"/>
                                {(isMdScreen && !collapsed || !isMdScreen) && isClient &&
                                    <span className="whitespace-nowrap text-dark group-hover:text-white">{label}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="hidden md:block absolute bottom-3 right-3 p-2 rounded-md hover:bg-primary transition-transform group"
                >
                    <Arrow
                        className={`w-6 h-6 fill-dark transition-transform duration-300 group-hover:fill-light ${
                            collapsed ? "rotate-0" : "rotate-180"
                        }`}
                    />
                </button>
            </aside>
        </>
    );
}