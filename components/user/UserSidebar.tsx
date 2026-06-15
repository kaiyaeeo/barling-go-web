    "use client"

    import Link from "next/link"
    import { usePathname, useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import {
    LayoutDashboard, BookOpen, Heart,
    Star, Settings, HelpCircle, LogOut, User
    } from "lucide-react"

    const navItems = [
    { href: "/dashboard",       label: "Dashboard",    icon: LayoutDashboard, key: "dashboard" },
    { href: "/profil",          label: "My Profile",   icon: User,            key: "profil" },
    { href: "/pesanan",         label: "Bookings",     icon: BookOpen,        key: "pesanan" },
    { href: "/profil/saved",    label: "Saved Places", icon: Heart,           key: "saved" },
    { href: "/profil/ulasan",   label: "Reviews",      icon: Star,            key: "ulasan" },
    { href: "/profil/settings", label: "Settings",     icon: Settings,        key: "settings" },
    ]

    type Profile = {
    full_name: string | null
    avatar_url: string | null
    membership_tier: string | null
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

    const tierLabel: Record<string, string> = {
        free:     "Tourist Explorer",
        explorer: "Explorer",
        pro:      "Pro Explorer",
    }

    return (
        <aside className="w-48 shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden sticky top-24">
            {/* User info */}
            <div className="p-4 border-b border-gray-50">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#6EB8BB] flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : initials}
                </div>
                <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{profile?.full_name ?? "Pengguna"}</p>
                <p className="text-xs text-gray-400 truncate">
                    {tierLabel[profile?.membership_tier ?? "free"] ?? "Tourist Explorer"}
                </p>
                </div>
            </div>
            </div>

            {/* Nav */}
            <nav className="p-2">
            {navItems.map((item) => {
                const Icon = item.icon
                const isActive = active
                ? active === item.key
                : pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                    isActive
                        ? "bg-green-50 text-[#6EB8BB]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                >
                    <Icon size={15} className="shrink-0" />
                    {item.label}
                </Link>
                )
            })}
            </nav>

            {/* Bottom */}
            <div className="p-2 border-t border-gray-50">
            {(profile?.membership_tier ?? "free") === "free" && (
                <div className="mx-1 mb-2 p-2.5 bg-orange-50 rounded-xl border border-orange-100">
                <p className="text-[11px] font-semibold text-orange-700 mb-1.5">Pro Explorer Plan</p>
                <button className="w-full py-1.5 bg-[#FF6B35] text-white text-xs font-bold rounded-lg hover:bg-[#e5592a] transition-all">
                    Upgrade to Premium
                </button>
                </div>
            )}
            <Link
                href="/bantuan"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-all"
            >
                <HelpCircle size={15} /> Help Center
            </Link>
            <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-50 transition-all w-full text-left"
            >
                <LogOut size={15} /> Logout
            </button>
            </div>
        </div>
        </aside>
    )
    }
