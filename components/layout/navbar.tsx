    "use client"

    import Link from "next/link"
    import Image from "next/image"
    import { useState, useEffect } from "react"
    import { usePathname } from "next/navigation"
    import { Menu, X, Search, LogOut, User, LayoutDashboard, Bell, ChevronDown, ShoppingCart } from "lucide-react"
    import { createClient } from "@/lib/supabase/client"
    import type { User as SupabaseUser } from "@supabase/supabase-js"

    const navLinks = [
    { label: "Home",       href: "/" },
    { label: "Wisata",     href: "/wisata" },
    { label: "Kuliner",    href: "/kuliner" },
    { label: "Oleh-Oleh",  href: "/oleh-oleh" },
    { label: "AI Assistant", href: "/ai-assistant"},
    ]

    export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchVal, setSearchVal] = useState("")
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const [profile, setProfile] = useState<{ full_name: string | null; role: string; avatar_url: string | null } | null>(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [cartCount, setCartCount] = useState(0)

    const supabase = createClient()
    const pathname = usePathname()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener("scroll", onScroll)
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
        if (user) {
            fetchProfile(user.id)
            fetchCartCount(user.id)
        }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
            fetchProfile(session.user.id)
            fetchCartCount(session.user.id)
        } else {
            setProfile(null)
            setCartCount(0)
        }
        })

        return () => subscription.unsubscribe()
    }, [])

    useEffect(() => {
        if (!user) return

        const channel = supabase.channel('realtime_cart_navbar')
        .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'cart_items', 
            filter: `user_id=eq.${user.id}` 
        }, () => {
            fetchCartCount(user.id)
        })
        .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [user, supabase])

    async function fetchProfile(userId: string) {
        const { data } = await supabase.from("profiles").select("full_name, role, avatar_url").eq("id", userId).single()
        setProfile(data)
    }

    async function fetchCartCount(userId: string) {
        const { count } = await supabase
        .from("cart_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        
        setCartCount(count || 0)
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
            
            {/* ── LOGO ── */}
            <Link href="/" className="flex items-center shrink-0">
                <Image 
                src="/logo.png" 
                alt="Logo Barling-GO" 
                width={160}
                height={60}
                className="object-contain"
                priority
                />
            </Link>

            {/* ── DESKTOP NAV LINKS ── */}
            <nav className="hidden md:flex items-center gap-1.5">
                {navLinks.map((link) => {
                const isActive = link.href === "/" 
                    ? pathname === "/" 
                    : pathname.startsWith(link.href)

                return (
                    <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold rounded-xl transition-all duration-300 ${
                        isActive 
                        ? "text-[#6EB8BB]" 
                        : "text-gray-500 hover:text-[#6EB8BB] hover:bg-gray-50"
                    }`}
                    >
                    {link.icon && <span className="text-base">🤖</span>}
                    {link.label}
                    </Link>
                )
                })}
            </nav>

            {/* ── RIGHT ACTIONS (Desktop) ── */}
            <div className="hidden md:flex items-center gap-2">
                
                {/* Search Toggle */}
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
                    <button onClick={() => setSearchOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-lg">
                    <X size={16} />
                    </button>
                </div>
                ) : (
                <button onClick={() => setSearchOpen(true)} className="p-2 text-gray-500 hover:text-[#6EB8BB] hover:bg-gray-50 rounded-lg transition-all">
                    <Search size={17} />
                </button>
                )}

                {user ? (
                <>
                    {/* ── CART ICON ── */}
                    <Link href="/keranjang" className={`p-2 rounded-lg transition-all relative group ${pathname === '/keranjang' ? 'text-[#6EB8BB]' : 'text-gray-500 hover:text-[#6EB8BB] hover:bg-gray-50'}`}>
                    <ShoppingCart size={17} />
                    {cartCount > 0 && (
                        <span className="absolute top-1 right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full shadow-sm group-hover:scale-110 transition-transform">
                        {cartCount > 99 ? "99+" : cartCount}
                        </span>
                    )}
                    </Link>

                    {/* Notification bell */}
                    <button className="p-2 text-gray-500 hover:text-[#6EB8BB] hover:bg-gray-50 rounded-lg transition-all relative">
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
                        <span className="text-sm font-bold text-gray-700 max-w-[80px] truncate">{profile?.full_name?.split(" ")[0] ?? "Akun"}</span>
                        <ChevronDown size={13} className="text-gray-400" />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 top-11 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 z-50">
                        <div className="px-4 py-3 border-b border-gray-50">
                            <p className="text-sm font-bold text-gray-900 truncate">{profile?.full_name ?? "User"}</p>
                            <p className="text-xs font-medium text-gray-400 capitalize mt-0.5">{profile?.role?.replace("_", " ")}</p>
                        </div>
                        <Link href={dashboardHref} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#6EB8BB]" onClick={() => setDropdownOpen(false)}>
                            <LayoutDashboard size={14} /> Dashboard
                        </Link>
                        <Link href="/profil" className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#6EB8BB]" onClick={() => setDropdownOpen(false)}>
                            <User size={14} /> Profil Saya
                        </Link>
                        <div className="border-t border-gray-50 mt-1">
                            <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 w-full text-left">
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
                    className="ml-1 px-5 py-2 text-sm font-bold text-white bg-[#6EB8BB] hover:bg-[#5AA4A7] rounded-xl transition-all shadow-sm"
                >
                    Login
                </Link>
                )}
            </div>

            {/* ── MOBILE RIGHT ACTIONS (Hamburger & Cart) ── */}
            <div className="flex items-center gap-1 md:hidden">
                
                {user && (
                <Link href="/keranjang" className={`p-2 rounded-lg relative ${pathname === '/keranjang' ? 'text-[#6EB8BB]' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full shadow-sm">
                        {cartCount > 99 ? "99+" : cartCount}
                    </span>
                    )}
                </Link>
                )}

                <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>
            
            </div>
        </div>

        {/* ── MOBILE MENU DROPDOWN ── */}
        {mobileOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 shadow-lg absolute w-full z-40">
            {navLinks.map((link) => {
                const isActive = link.href === "/" 
                ? pathname === "/" 
                : pathname.startsWith(link.href)

                return (
                <Link 
                    key={link.href} 
                    href={link.href} 
                    className={`flex items-center gap-2 py-3.5 text-sm font-bold border-b border-gray-50 ${isActive ? "text-[#6EB8BB]" : "text-gray-700"}`} 
                    onClick={() => setMobileOpen(false)}
                >
                    {link.icon && <span>🤖</span>}
                    {link.label}
                </Link>
                )
            })}
            {user ? (
                <div className="mt-4 space-y-2">
                <Link href={dashboardHref} onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm font-bold text-[#6EB8BB] text-center border border-[#6EB8BB]/30 bg-[#E6F7F8] rounded-xl">Dashboard</Link>
                <button onClick={handleLogout} className="w-full py-2.5 text-sm font-bold text-rose-500 border border-rose-200 bg-rose-50 rounded-xl">Keluar</button>
                </div>
            ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="mt-4 block text-center py-3 text-sm font-bold text-white bg-[#6EB8BB] rounded-xl shadow-sm">Login / Daftar</Link>
            )}
            </div>
        )}
        </header>
    )
    }