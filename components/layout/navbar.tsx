    "use client"

    import Link from "next/link"
    import Image from "next/image" // Tambahan import untuk Image
    import { useState, useEffect } from "react"
    import { Menu, X, Search, LogOut, User, LayoutDashboard, Bell, ChevronDown } from "lucide-react"
    import { createClient } from "@/lib/supabase/client"
    import type { User as SupabaseUser } from "@supabase/supabase-js"

    const navLinks = [
    { label: "Home",       href: "/" },
    { label: "Wisata",     href: "/wisata" },
    { label: "Kuliner",    href: "/kuliner" },
    { label: "Oleh-Oleh",  href: "/oleh-oleh" },
    { label: "AI Assistant", href: "/ai-assistant", icon: true },
    ]

    export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchVal, setSearchVal] = useState("")
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const [profile, setProfile] = useState<{ full_name: string | null; role: string; avatar_url: string | null } | null>(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener("scroll", onScroll)
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
        if (user) fetchProfile(user.id)
        })
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.id)
        else setProfile(null)
        })
        return () => subscription.unsubscribe()
    }, [])

    async function fetchProfile(userId: string) {
        const { data } = await supabase.from("profiles").select("full_name, role, avatar_url").eq("id", userId).single()
        setProfile(data)
    }

    async function handleLogout() {
        await supabase.auth.signOut()
        setDropdownOpen(false)
        window.location.href = "/"
    }

    const initials = profile?.full_name
        ? profile.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
        : "U"

    const dashboardHref =
        profile?.role === "super_admin" ? "/super-admin/dashboard"
        : profile?.role === "admin" ? "/admin/dashboard"
        : "/dashboard"

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
            
            {/* BAGIAN LOGO YANG SUDAH DIREVISI */}
            <Link href="/" className="flex items-center shrink-0">
                <Image 
                src="/logo.png" 
                alt="Logo Barling-GO" 
                width={160} // Sesuaikan angka ini untuk mengatur lebar logo
                height={60} // Sesuaikan angka ini untuk mengatur tinggi logo
                className="object-contain"
                priority
                />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
                {navLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                >
                    {link.icon && <span className="text-base">🤖</span>}
                    {link.label}
                </Link>
                ))}
            </nav>

            {/* Right actions */}
            <div className="hidden md:flex items-center gap-2">
                {/* Search */}
                {searchOpen ? (
                <div className="flex items-center gap-2">
                    <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        autoFocus
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                        onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                        placeholder="Explore Barlingmascakep..."
                        className="pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] w-52"
                    />
                    </div>
                    <button onClick={() => setSearchOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600">
                    <X size={16} />
                    </button>
                </div>
                ) : (
                <button onClick={() => setSearchOpen(true)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all">
                    <Search size={17} />
                </button>
                )}

                {user ? (
                <>
                    {/* Notification bell */}
                    <button className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all relative">
                    <Bell size={17} />
                    </button>

                    {/* User dropdown */}
                    <div className="relative ml-1">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                        {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="avatar" className="w-7 h-7 rounded-lg object-cover" />
                        ) : (
                        <div className="w-7 h-7 rounded-lg bg-[#6EB8BB] flex items-center justify-center text-white text-xs font-bold">{initials}</div>
                        )}
                        <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate">{profile?.full_name?.split(" ")[0] ?? "Akun"}</span>
                        <ChevronDown size={13} className="text-gray-400" />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 top-11 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 z-50">
                        <div className="px-4 py-3 border-b border-gray-50">
                            <p className="text-sm font-semibold text-gray-900 truncate">{profile?.full_name ?? "User"}</p>
                            <p className="text-xs text-gray-400 capitalize mt-0.5">{profile?.role?.replace("_", " ")}</p>
                        </div>
                        <Link href={dashboardHref} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                            <LayoutDashboard size={14} /> Dashboard
                        </Link>
                        <Link href="/profil" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                            <User size={14} /> Profil Saya
                        </Link>
                        <div className="border-t border-gray-50 mt-1">
                            <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full text-left">
                            <LogOut size={14} /> Keluar
                            </button>
                        </div>
                        </div>
                    )}
                    </div>
                </>
                ) : (
                <Link
                    href="/login"
                    className="ml-1 px-5 py-2 text-sm font-bold text-white bg-[#6EB8BB] hover:bg-[#5AA4A7] rounded-xl transition-all"
                >
                    Login
                </Link>
                )}
            </div>

            {/* Mobile toggle */}
            <button className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4">
            {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block py-3 text-sm font-medium text-gray-700 border-b border-gray-50" onClick={() => setMobileOpen(false)}>
                {link.label}
                </Link>
            ))}
            {user ? (
                <div className="mt-3 space-y-2">
                <Link href={dashboardHref} className="block py-2.5 text-sm font-semibold text-[#6EB8BB] text-center border border-[#6EB8BB] rounded-xl">Dashboard</Link>
                <button onClick={handleLogout} className="w-full py-2.5 text-sm font-semibold text-red-500 border border-red-200 rounded-xl">Keluar</button>
                </div>
            ) : (
                <Link href="/login" className="mt-3 block text-center py-2.5 text-sm font-bold text-white bg-[#6EB8BB] rounded-xl">Login</Link>
            )}
            </div>
        )}
        </header>
    )
    }