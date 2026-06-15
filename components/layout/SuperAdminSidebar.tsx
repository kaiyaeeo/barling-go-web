    "use client"

    import Link from "next/link"
    import { usePathname, useRouter } from "next/navigation"
    import {
    LayoutDashboard, Users, Store, FileText,
    ShieldCheck, BarChart2, Settings, LogOut,
    ChevronLeft, Menu, Globe
    } from "lucide-react"
    import { useState } from "react"
    import { createClient } from "@/lib/supabase/client"

    const navItems = [
    { href: "/super-admin/dashboard",        label: "Dashboard",        icon: LayoutDashboard },
    { href: "/super-admin/users",            label: "Kelola User",      icon: Users },
    { href: "/super-admin/umkm",             label: "Verifikasi UMKM",  icon: Store },
    { href: "/super-admin/konten",           label: "Konten",           icon: FileText },
    { href: "/super-admin/permission",       label: "Permission",       icon: ShieldCheck },
    { href: "/super-admin/laporan-platform", label: "Laporan Platform", icon: BarChart2 },
    { href: "/super-admin/konfigurasi",      label: "Konfigurasi",      icon: Settings },
    ]

    export default function SuperAdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [collapsed, setCollapsed] = useState(false)

    async function handleLogout() {
        await supabase.auth.signOut()
        router.replace("/login")
    }

    return (
        <aside className={`fixed top-0 left-0 h-full bg-[#1a2e22] z-40 flex flex-col transition-all duration-200 ${collapsed ? "w-16" : "w-56"}`}>
        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-white/10 px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
            {!collapsed && (
            <Link href="/super-admin/dashboard" className="flex items-center gap-1.5">
                <Globe size={16} className="text-[#4CAF50]" />
                <span className="text-sm font-bold text-white tracking-tight">Super Admin</span>
            </Link>
            )}
            <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            {collapsed ? <Menu size={15} /> : <ChevronLeft size={15} />}
            </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
            {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname.startsWith(item.href)
            return (
                <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                    active ? "bg-[#6EB8BB] text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
                >
                <Icon size={16} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                </Link>
            )
            })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
            <button
            onClick={handleLogout}
            title={collapsed ? "Keluar" : undefined}
            className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all ${collapsed ? "justify-center" : ""}`}
            >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Keluar</span>}
            </button>
        </div>
        </aside>
    )
    }
