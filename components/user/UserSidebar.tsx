    "use client"

    import Link from "next/link"
    import { usePathname, useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import {
    LayoutDashboard, BookOpen, Heart,
    Star, Settings, HelpCircle, LogOut, User,
    Award, Zap, MapPin, ChevronRight, Sparkles,
    TrendingUp
    } from "lucide-react"

    const navItems = [
    // Dikembalikan ke /dashboard agar masuk ke dashboard pengunjung
    { href: "/dashboard",      label: "Dashboard",     icon: LayoutDashboard, key: "dashboard" },
    { href: "/profil",         label: "Profil Saya",   icon: User,            key: "profil"    },
    { href: "/pesanan",        label: "Pesanan",       icon: BookOpen,        key: "pesanan"   },
    { href: "/profil/saved",   label: "Tersimpan",     icon: Heart,           key: "saved"     },
    { href: "/profil/ulasan",  label: "Ulasan Saya",   icon: Star,            key: "ulasan"    },
    { href: "/profil/settings",label: "Pengaturan",    icon: Settings,        key: "settings"  },
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
    free:     {
        label:      "Tourist Explorer",
        textColor:  "text-gray-600",
        bgColor:    "bg-gray-100",
        border:     "border-gray-200",
        gradient:   "from-gray-50 to-white",
        icon:       MapPin,
        nextLabel:  "Explorer",
        nextPoints: 500,
    },
    explorer: {
        label:      "Explorer",
        textColor:  "text-blue-700",
        bgColor:    "bg-blue-50",
        border:     "border-blue-100",
        gradient:   "from-blue-50 to-white",
        icon:       Zap,
        nextLabel:  "Pro Explorer",
        nextPoints: 2000,
    },
    pro:      {
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
        <aside className="sticky top-0 h-screen overflow-y-auto scrollbar-none flex flex-col bg-white">
        {/* ── App Logo ── */}
        <div className="px-6 py-5 flex items-center gap-3 border-b border-gray-100">
            <div className="w-8 h-8 bg-[#6EB8BB] rounded-lg flex items-center justify-center shadow-sm shrink-0">
            <span className="text-white font-black text-xs">BG</span>
            </div>
            <span className="font-black text-gray-900 tracking-widest text-lg truncate">BARLING-GO</span>
        </div>

        {/* ── User identity ── */}
        <div className={`bg-gradient-to-br ${tierInfo.gradient} border-b border-gray-100 p-6`}>
            <div className="flex flex-col xl:flex-row items-center xl:items-start gap-4 mb-5 text-center xl:text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#6EB8BB] flex items-center justify-center text-white font-black text-xl shrink-0 overflow-hidden shadow-sm ring-4 ring-white mx-auto xl:mx-0">
                {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : initials}
            </div>
            <div className="min-w-0">
                <p className="text-base font-black text-gray-900 truncate">{profile?.full_name ?? "Pengguna"}</p>
                <span className={`inline-flex items-center justify-center gap-1.5 text-[10px] font-bold px-2.5 py-1 mt-1.5 rounded-full border ${tierInfo.bgColor} ${tierInfo.textColor} ${tierInfo.border}`}>
                <TierIcon size={11} /> {tierInfo.label}
                </span>
            </div>
            </div>

            {/* Points + progress */}
            <div className="bg-white/80 rounded-2xl p-3.5 border border-gray-200/60 shadow-sm space-y-2 backdrop-blur-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#6EB8BB]" />
                <span className="text-xs font-bold text-gray-700">Explorer Points</span>
                </div>
                <span className="text-sm font-black text-[#6EB8BB]">{points.toLocaleString("id-ID")}</span>
            </div>
            {tierInfo.nextPoints && (
                <>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                    className="h-full bg-gradient-to-r from-[#6EB8BB] to-[#3FA15E] rounded-full transition-all"
                    style={{ width: `${pointsPct}%` }}
                    />
                </div>
                <p className="text-[10px] font-semibold text-gray-500 text-right">
                    {tierInfo.nextPoints - points} poin → <span className="text-gray-800">{tierInfo.nextLabel}</span>
                </p>
                </>
            )}
            </div>
        </div>

        {/* ── Nav items ── */}
        <nav className="p-4 space-y-1.5 flex-1">
            <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 mt-2">Menu Utama</p>
            {navItems.map((item) => {
            const Icon     = item.icon
            const isActive = active ? active === item.key : pathname === item.href || pathname.startsWith(item.href + "/")
            return (
                <Link
                key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                    isActive
                    ? "bg-[#6EB8BB] text-white shadow-md shadow-[#6EB8BB]/20"
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#6EB8BB]"
                }`}
                >
                <Icon size={18} className="shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && <ChevronRight size={14} className="text-white shrink-0 opacity-80" />}
                </Link>
            )
            })}
        </nav>

        {/* ── Bottom links ── */}
        <div className="p-4 border-t border-gray-100 space-y-1 bg-gray-50/50">
            <Link
            href="/bantuan"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-white hover:text-gray-700 transition-all border border-transparent"
            >
            <HelpCircle size={16} /> Pusat Bantuan
            </Link>
            <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-50 hover:text-red-500 transition-all w-full text-left border border-transparent"
            >
            <LogOut size={16} /> Keluar
            </button>
        </div>
        </aside>
    )
    }