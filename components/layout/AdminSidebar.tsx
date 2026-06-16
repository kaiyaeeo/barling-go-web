    "use client"

    import Link from "next/link"
    import { usePathname, useRouter } from "next/navigation"
    import {
    LayoutDashboard, Store, Package, Plus,
    ShoppingBag, BarChart2, User, Settings, LogOut
    } from "lucide-react"
    import { useState, useEffect } from "react"
    import { createClient } from "@/lib/supabase/client"
    import NotificationBell from "@/components/admin/NotificationBell" // <-- Import komponen di sini

    const MENU_ITEMS = [
    { href: "/admin/dashboard",  label: "Dashboard",      icon: LayoutDashboard },
    { href: "/admin/etalase",    label: "Etalase",        icon: Store },
    { href: "/admin/produk",     label: "Produk",         icon: Package },
    { href: "/admin/produk/tambah", label: "Tambah Produk", icon: Plus },
    { href: "/admin/pesanan",    label: "Pesanan",        icon: ShoppingBag },
    { href: "/admin/analitik",   label: "Analitik",       icon: BarChart2 },
    ]

    const AKUN_ITEMS = [
    { href: "/admin/toko",       label: "Profil",         icon: User },
    { href: "/admin/konfigurasi", label: "Pengaturan",    icon: Settings },
    ]

    export default function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [profile, setProfile] = useState<{ full_name: string | null; umkm_name: string | null; umkm_logo: string | null } | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return
        supabase.from("profiles").select("full_name, umkm_name, umkm_logo").eq("id", user.id).single()
            .then(({ data }) => setProfile(data))
        })
    }, [supabase])

    async function handleLogout() {
        await supabase.auth.signOut()
        router.replace("/login")
    }

    const initials = profile?.umkm_name
        ? profile.umkm_name.slice(0, 2).toUpperCase()
        : profile?.full_name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() ?? "AD"

    return (
        <aside className="fixed top-0 left-0 h-full w-52 bg-[#9FCCCE] z-40 flex flex-col shadow-lg">
        
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-white/10">
            <Link href="/admin/dashboard" className="flex items-center">
            <span className="text-base font-black text-white tracking-tight drop-shadow-sm">BARLING-GO</span>
            </Link>
            
            {/* <-- Lonceng Realtime dipasang di sini --> */}
            <div className="brightness-200 saturate-0 scale-90">
            <NotificationBell />
            </div>
        </div>

        {/* MENU section */}
        <nav className="flex-1 overflow-y-auto py-3">
            <p className="px-4 text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1">Menu</p>
            
            {MENU_ITEMS.map((item) => {
            const Icon = item.icon
            const isExact = pathname === item.href
            const isSubRoute = pathname.startsWith(item.href + "/") && !MENU_ITEMS.some(m => m.href !== item.href && pathname.startsWith(m.href))
            const active = isExact || isSubRoute
            
            return (
                <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                    active
                    ? "bg-[#6EB8BB] text-white shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
                >
                <Icon size={16} className="shrink-0" />
                {item.label}
                </Link>
            )
            })}

            <p className="px-4 text-[10px] font-bold text-white/50 uppercase tracking-wider mt-5 mb-1">Akun</p>
            
            {AKUN_ITEMS.map((item) => {
            const Icon = item.icon
            const active = pathname.startsWith(item.href)
            
            return (
                <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                    active
                    ? "bg-[#6EB8BB] text-white shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
                >
                <Icon size={16} className="shrink-0" />
                {item.label}
                </Link>
            )
            })}
        </nav>

        {/* Bottom: store info + logout */}
        <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#6EB8BB] font-black text-sm shrink-0 shadow-sm">
                {initials}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate drop-shadow-sm">
                {profile?.umkm_name ?? profile?.full_name ?? "Toko Saya"}
                </p>
                <p className="text-[11px] text-white/70 font-medium">Merchant Partner</p>
            </div>
            </div>
            <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 mt-1 rounded-xl text-sm font-medium text-white/80 hover:bg-red-500 hover:text-white hover:shadow-md transition-all"
            >
            <LogOut size={15} /> Keluar
            </button>
        </div>
        </aside>
    )
    }