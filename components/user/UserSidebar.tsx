    "use client"

    import Link from "next/link"
    import { usePathname, useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import {
    LayoutDashboard, 
    BookOpen, 
    Heart,
    Star, 
    Settings, 
    HelpCircle, 
    LogOut, 
    User,
    Award, 
    Zap, 
    ChevronRight, 
    Sparkles,
    BadgeCheck,
    Compass
    } from "lucide-react"

    const navItems = [
    { href: "/dashboard",      label: "Dashboard",   icon: LayoutDashboard, key: "dashboard" },
    { href: "/profil",         label: "Profil Saya", icon: User,            key: "profil"    },
    { href: "/pesanan",        label: "Pesanan",     icon: BookOpen,        key: "pesanan"   },
    { href: "/wishlist",       label: "Tersimpan",   icon: Heart,           key: "saved"     },
    { href: "/ulasan",         label: "Ulasan Saya", icon: Star,            key: "ulasan"    },
    { href: "/settings",       label: "Pengaturan",  icon: Settings,        key: "settings"  },
    ]

    type Profile = {
    full_name:       string | null
    avatar_url:      string | null
    membership_tier: string | null
    explorer_points?: number | null
    }

    const TIER_CONFIG: Record<string, {
    label: string; textColor: string; bgColor: string; border: string;
    gradient: string; icon: any; nextLabel?: string; nextPoints?: number
    }> = {
    free: {
        label:      "Tourist Explorer",
        textColor:  "text-slate-500",
        bgColor:    "bg-slate-100",
        border:     "border-slate-200",
        gradient:   "from-slate-50 to-white",
        icon:       Compass,
        nextLabel:  "Explorer",
        nextPoints: 500,
    },
    explorer: {
        label:      "Explorer",
        textColor:  "text-[#6EB8BB]",
        bgColor:    "bg-[#6EB8BB]/10",
        border:     "border-[#6EB8BB]/20",
        gradient:   "from-[#6EB8BB]/5 to-white",
        icon:       Zap,
        nextLabel:  "Pro Explorer",
        nextPoints: 2000,
    },
    pro: {
        label:     "Pro Explorer",
        textColor: "text-amber-700",
        bgColor:   "bg-amber-50",
        border:    "border-amber-200",
        gradient:  "from-amber-50 to-white",
        icon:      Award,
    },
    }

    export default function UserSidebar({
    profile,
    active,
    }: { profile: Profile | null; active?: string }) {
    const pathname = usePathname()
    const router   = useRouter()
    const supabase = createClient()

    async function handleLogout() {
        await supabase.auth.signOut()
        router.replace("/")
    }

    const initials = profile?.full_name
        ? profile.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
        : "U"

    const tier      = profile?.membership_tier ?? "free"
    const tierInfo  = TIER_CONFIG[tier] ?? TIER_CONFIG["free"]
    const TierIcon  = tierInfo.icon
    const points    = profile?.explorer_points ?? 0
    const pointsPct = tierInfo.nextPoints
        ? Math.min(Math.round((points / tierInfo.nextPoints) * 100), 100)
        : 100

    return (
        <aside className="sticky top-0 h-screen overflow-y-auto scrollbar-none flex flex-col bg-white w-full border-r border-slate-200/50 z-40">
        
        {/* ── App Logo ── */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-gray-100 shrink-0">
            <Link href="/" className="flex items-center">
            <img 
                src="/logo.png" 
                alt="Logo Barling-go" 
                className="h-10 w-auto object-contain max-w-[140px] hover:opacity-90 transition-opacity" 
            />
            </Link>
            <span className="text-[10px] font-bold bg-[#6EB8BB]/10 text-[#6EB8BB] px-2 py-0.5 rounded-full border border-[#6EB8BB]/20 uppercase select-none">
            Client
            </span>
        </div>

        {/* ── User Identity */}
        <div className={`bg-gradient-to-br ${tierInfo.gradient} border-b border-slate-100 p-5`}>
            <div className="flex items-center gap-3.5 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6EB8BB] to-[#9FCCCE] flex items-center justify-center text-white font-black text-lg shrink-0 overflow-hidden shadow-sm ring-2 ring-white">
                {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : initials}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                <p className="text-xl font-black text-slate-800 truncate">{profile?.full_name ?? "Pengguna"}</p>
                <BadgeCheck size={14} className="text-[#6EB8BB] shrink-0 fill-[#6EB8BB]/10" />
                </div>
                <span className={`inline-flex items-center justify-center gap-1 text-[10px] font-bold px-2 py-0.5 mt-1 rounded-md border ${tierInfo.bgColor} ${tierInfo.textColor} ${tierInfo.border}`}>
                <TierIcon size={11} /> {tierInfo.label}
                </span>
            </div>
            </div>

            {/* Points & Progress Bar */}
            <div className="bg-white/95 rounded-xl p-3 border border-slate-150 shadow-2xs space-y-2 backdrop-blur-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#6EB8BB]" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Explorer Points</span>
                </div>
                <span className="text-xs font-black text-[#6EB8BB]">{points.toLocaleString("id-ID")}</span>
            </div>
            
            {tierInfo.nextPoints && (
                <>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
                <div
                    className="h-full bg-gradient-to-r from-[#6EB8BB] to-[#9FCCCE] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${pointsPct}%` }}
                />
                </div>
                <p className="text-[9px] font-semibold text-slate-400 text-right">
                {tierInfo.nextPoints - points} poin lagi → <span className="text-slate-700 font-bold">{tierInfo.nextLabel}</span>
                </p>
                </>
            )}
            </div>
        </div>

        {/* ── Nav Items ── */}
        <nav className="p-4 space-y-1 flex-1">
            <p className="px-3 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3.5 mt-1">Menu Utama</p>
            
            {navItems.map((item) => {
            const Icon   = item.icon
            const isActive = active
                ? active === item.key
                : pathname === item.href || pathname.startsWith(item.href + "/")
            
            return (
                <Link
                key={item.href} 
                href={item.href}
                // PERUBAHAN: text-xs diubah ke text-sm di sini
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all relative ${
                    isActive
                    ? "bg-[#6EB8BB]/10 text-[#6EB8BB] border-l-4 border-[#6EB8BB]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#6EB8BB] border-l-4 border-transparent"
                }`}
                >
                <Icon size={18} className={`shrink-0 ${isActive ? "text-[#6EB8BB]" : "text-slate-400"}`} />
                <span className="flex-1 truncate">{item.label}</span>
                
                {isActive ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6EB8BB]" />
                ) : (
                    <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
                </Link>
            )
            })}
        </nav>

        {/* ── Bottom Links ── */}
        <div className="p-4 border-t border-slate-150 space-y-1 bg-slate-50/50 shrink-0">
            <Link
            href="/bantuan"
            // PERUBAHAN: text-xs diubah ke text-sm di sini
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-white hover:text-slate-800 transition-all border border-transparent shadow-2xs hover:shadow-xs"
            >
            <HelpCircle size={16} className="text-slate-400" /> Pusat Bantuan
            </Link>
            <button
            onClick={handleLogout}
            // PERUBAHAN: text-xs diubah ke text-sm di sini
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all w-full text-left border border-transparent"
            >
            <LogOut size={16} className="text-red-400" /> Keluar
            </button>
        </div>

        </aside>
    )
    }