    import AdminSidebar from "@/components/layout/AdminSidebar"

    export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        {/* Main content — offset sesuai sidebar width (w-56 = 224px, collapsed = 64px) */}
        <div className="flex-1 ml-56 transition-all duration-200">
            {children}
        </div>
        </div>
    )
    }
