    "use client"

    import Link from "next/link"
    import { usePathname, useRouter } from "next/navigation"
    import {
    LayoutDashboard, Users, Store, FileText,
    ShieldCheck, BarChart2, Settings, LogOut,
    Map, Megaphone, DollarSign
    } from "lucide-react"
    import { createClient } from "@/lib/supabase/client"

    const navSections = [
    {
        label: null,
        items: [
        { href: "/super-admin/dashboard",        label: "Dashboard",        icon: LayoutDashboard },
        ]
    },
    {
        label: null,
        items: [
        { href: "/super-admin/umkm",             label: "Kelola Mitra",     icon: Users },
        { href: "/super-admin/kelola-wisata",    label: "Kelola Wisata",    icon: Map },
        { href: "/super-admin/konten",           label: "Kelola Konten",    icon: FileText },
        { href: "/super-admin/iklan",            label: "Iklan & Promosi",  icon: Megaphone }, // <--- Tautan sudah diperbaiki!
        { href: "/super-admin/laporan-platform", label: "Laporan Keuangan", icon: DollarSign },
        { href: "/super-admin/konfigurasi",      label: "Pengaturan Platform", icon: Settings },
        ]
    },
    ]

    export default function SuperAdminSidebar() {
    const pathname = usePathname()
    const router   = useRouter()
    const supabase = createClient()

    async function handleLogout() {
        await supabase.auth.signOut()
        router.replace("/login")
    }

    return (
        <aside className="fixed top-0 left-0 h-full w-52 bg-[#9FCCCE] z-40 flex flex-col">
        {/* Logo */}
        <div className="flex flex-col px-5 pt-5 pb-4 border-b border-white/10">
            <Link href="/super-admin/dashboard">
            <span className="text-sm font-black text-white tracking-tight">Admin Panel</span>
            </Link>
            <span className="text-xs text-[#1a3a22]/60 mt-0.5">Regional Tourism</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
            {navSections.map((section, si) => (
            <div key={si} className={si > 0 ? "mt-1" : ""}>
                {section.items.map((item) => {
                const Icon   = item.icon
                const active = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/super-admin/dashboard")
                return (
                    <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                        active
                        ? "bg-[#6EB8BB] text-white"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                    >
                    <Icon size={16} className="shrink-0" />
                    {item.label}
                    </Link>
                )
                })}
            </div>
            ))}
        </nav>

        {/* Bottom: admin profile + logout */}
        <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                A
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">Admin Profile</p>
                <p className="text-[10px] text-[#1a3a22]/60">Super Admin Access</p>
            </div>
            </div>
            <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all"
            >
            <LogOut size={15} /> Keluar
            </button>
        </div>
        </aside>
    )
    }