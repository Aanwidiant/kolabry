import Navbar from "@/components/layout/dashboard/navbar";
import Sidebar from "@/components/layout/dashboard/sidebar";

export default function DashboardPage() {
    return (
        <main className="w-full min-h-screen place-content-center bg-light">
            <Navbar/>
            <Sidebar/>
        </main>
    )
}