    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import ProfileForm from "@/components/user/ProfileForm"
    import UserSidebar from "@/components/user/UserSidebar"
    import { Camera, MapPin, Star } from "lucide-react"

    export default async function ProfilPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    const joinedDate = new Date(user.created_at).toLocaleDateString("id-ID", {
        month: "long", year: "numeric",
    })

    return (
        // Struktur flex row ini yang mengunci layout agar tidak saling melar
        <div className="min-h-screen bg-[#F5F5F5] flex flex-col md:flex-row">
        
        {/* ── BUNGKUS SIDEBAR (Dikunci lebarnya 280px & Nempel kiri) ── */}
        <div className="w-full md:w-[280px] shrink-0 bg-white border-r border-gray-200 z-10">
            <UserSidebar profile={profile} active="profil" />
        </div>

        {/* ── BUNGKUS KONTEN UTAMA (Mengisi sisa ruang kanan) ── */}
        <div className="flex-1 min-w-0 p-5 md:p-8 lg:p-10">
            
            {/* max-w-5xl agar form di tengah tidak merentang sampai gepeng */}
            <div className="max-w-5xl mx-auto w-full">
            
            {/* Profile header card */}
            <div className="relative bg-gradient-to-r from-[#6EB8BB] to-[#4CAF50] rounded-2xl overflow-hidden mb-5 w-full shadow-sm" style={{ height: 160 }}>
                <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 0%, transparent 60%)" }} />
            </div>

            {/* Avatar strip */}
            <div className="flex items-end justify-between -mt-14 mb-6 px-4 md:px-6 relative z-10">
                <div className="relative shrink-0">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-[#6EB8BB] flex items-center justify-center">
                    {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                    <span className="text-white text-4xl font-black">
                        {profile?.full_name?.[0] ?? user.email?.[0]?.toUpperCase() ?? "U"}
                    </span>
                    )}
                </div>
                <button className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-[#6EB8BB] hover:border-[#6EB8BB] transition-all">
                    <Camera size={14} />
                </button>
                </div>
                <div className="pb-2">
                <button className="px-4 py-2 md:px-5 md:py-2.5 text-xs md:text-sm font-bold text-[#6EB8BB] border border-[#6EB8BB] bg-white rounded-xl hover:bg-[#E6F7F8] transition-all flex items-center gap-2 shadow-sm">
                    <Camera size={14} /> Ubah Sampul
                </button>
                </div>
            </div>

            {/* Name + joined */}
            <div className="px-2 mb-8">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900">{profile?.full_name ?? "Pengguna"}</h1>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1 font-medium">
                <MapPin size={14} className="text-gray-400" /> Terdaftar sejak {joinedDate}
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
                {/* Main form */}
                <div className="xl:col-span-2 space-y-6 w-full">
                <ProfileForm
                    profile={profile}
                    email={user.email ?? ""}
                />
                </div>

                {/* Right column */}
                <div className="space-y-6 w-full">
                {/* Security */}
                <SecurityCard twoFactorEnabled={profile?.two_factor_enabled ?? false} userId={user.id} />

                {/* Explorer stats */}
                <div className="bg-[#6EB8BB] rounded-2xl p-6 shadow-sm overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 opacity-10">
                    <Star size={120} />
                    </div>
                    <h3 className="text-sm font-black text-white mb-5 relative z-10">Statistik Penjelajah</h3>
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-white/15 border border-white/20 rounded-xl p-4 text-center backdrop-blur-sm">
                        <p className="text-3xl font-black text-white">{profile?.destinations_visited ?? 0}</p>
                        <p className="text-[10px] font-bold text-green-100 mt-1 uppercase tracking-widest">Destinasi</p>
                    </div>
                    <div className="bg-white/15 border border-white/20 rounded-xl p-4 text-center backdrop-blur-sm">
                        <p className="text-3xl font-black text-white">
                        {(profile?.explorer_points ?? 0).toLocaleString("id-ID")}
                        </p>
                        <p className="text-[10px] font-bold text-green-100 mt-1 uppercase tracking-widest">Poin</p>
                    </div>
                    </div>
                </div>

                {/* Upgrade banner */}
                {profile?.membership_tier === "free" && (
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🔥</span>
                        <p className="text-sm font-black text-orange-800 uppercase tracking-widest">Pro Explorer</p>
                    </div>
                    <p className="text-xs text-orange-700/80 font-medium mb-5">Dapatkan poin 2x lipat, diskon eksklusif, dan akses fitur premium.</p>
                    <button className="w-full py-3 bg-[#FF6B35] hover:bg-[#e5592a] text-white font-black rounded-xl text-sm transition-all shadow-md active:scale-95">
                        Upgrade Sekarang
                    </button>
                    </div>
                )}
                </div>
            </div>
            </div>

        </div>
        </div>
    )
    }

    function SecurityCard({ twoFactorEnabled, userId }: { twoFactorEnabled: boolean; userId: string }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-sm font-black text-gray-900 mb-5 flex items-center gap-2">
            <span className="text-blue-500">🛡️</span> Keamanan Akun
        </h3>
        <div className="space-y-3">
            <a
            href="/profil/ubah-password"
            className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-gray-100 group"
            >
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm group-hover:text-[#6EB8BB] group-hover:border-[#6EB8BB] transition-colors">
                🔑
                </div>
                <span className="text-sm font-bold text-gray-700">Ubah Kata Sandi</span>
            </div>
            <span className="text-gray-400 group-hover:text-gray-600 transition-colors">›</span>
            </a>

            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm shrink-0">
                🔐
                </div>
                <div>
                <p className="text-sm font-bold text-gray-700">Two-Factor Auth</p>
                <p className="text-[10px] font-medium text-gray-400 mt-0.5">Proteksi Akun Ekstra</p>
                </div>
            </div>
            <TwoFactorToggle enabled={twoFactorEnabled} userId={userId} />
            </div>
        </div>
        </div>
    )
    }

    function TwoFactorToggle({ enabled, userId }: { enabled: boolean; userId: string }) {
    return (
        <div className={`w-11 h-6 rounded-full transition-colors ${enabled ? "bg-[#6EB8BB]" : "bg-gray-300"} relative cursor-pointer shadow-inner`}>
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
        </div>
    )
    }