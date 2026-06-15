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
        <div className="min-h-screen bg-gray-50">
        {/* Top navbar space */}
        <div className="h-16" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-6">

            {/* Sidebar */}
            <UserSidebar profile={profile} active="profil" />

            {/* Main content */}
            <div className="flex-1 min-w-0">
                {/* Profile header card */}
                <div className="relative bg-gradient-to-r from-[#6EB8BB] to-[#4CAF50] rounded-2xl overflow-hidden mb-5" style={{ height: 140 }}>
                <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 0%, transparent 60%)" }} />
                </div>

                {/* Avatar strip */}
                <div className="flex items-end justify-between -mt-12 mb-6 px-4">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-[#6EB8BB] flex items-center justify-center">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-white text-3xl font-black">
                        {profile?.full_name?.[0] ?? user.email?.[0]?.toUpperCase() ?? "U"}
                        </span>
                    )}
                    </div>
                    <button className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full shadow border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all">
                    <Camera size={13} />
                    </button>
                </div>
                <div className="pb-2">
                    <button className="px-4 py-2 text-sm font-semibold text-[#6EB8BB] border border-[#6EB8BB] rounded-xl hover:bg-green-50 transition-all flex items-center gap-1.5">
                    <Camera size={13} /> Update Foto
                    </button>
                </div>
                </div>

                {/* Name + joined */}
                <div className="px-1 mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{profile?.full_name ?? "Pengguna"}</h1>
                <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={13} /> Terdaftar sejak {joinedDate}
                </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-5">
                {/* Main form - spans 2 cols */}
                <div className="lg:col-span-2 space-y-5">
                    <ProfileForm
                    profile={profile}
                    email={user.email ?? ""}
                    />
                </div>

                {/* Right column */}
                <div className="space-y-4">
                    {/* Security */}
                    <SecurityCard twoFactorEnabled={profile?.two_factor_enabled ?? false} userId={user.id} />

                    {/* Explorer stats */}
                    <div className="bg-[#6EB8BB] rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white mb-4">Statistik Penjelajah</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/15 rounded-xl p-3 text-center">
                        <p className="text-2xl font-black text-white">{profile?.destinations_visited ?? 0}</p>
                        <p className="text-xs text-green-200 mt-0.5">DESTINASI</p>
                        </div>
                        <div className="bg-white/15 rounded-xl p-3 text-center">
                        <p className="text-2xl font-black text-white">
                            {(profile?.explorer_points ?? 0).toLocaleString("id-ID")}
                        </p>
                        <p className="text-xs text-green-200 mt-0.5">POIN</p>
                        </div>
                    </div>
                    </div>

                    {/* Upgrade banner */}
                    {profile?.membership_tier === "free" && (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                        <p className="text-xs font-semibold text-orange-700 mb-2">Pro Explorer Plan</p>
                        <button className="w-full py-2.5 bg-[#FF6B35] hover:bg-[#e5592a] text-white font-bold rounded-xl text-sm transition-all">
                        Upgrade to Premium
                        </button>
                    </div>
                    )}
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
    )
    }

    function SecurityCard({ twoFactorEnabled, userId }: { twoFactorEnabled: boolean; userId: string }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-red-500">🛡️</span> Keamanan
        </h3>
        <div className="space-y-3">
            <a
            href="/profil/ubah-password"
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
            >
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500">
                🔑
                </div>
                <span className="text-sm font-medium text-gray-700">Ubah Kata Sandi</span>
            </div>
            <span className="text-gray-400 group-hover:text-gray-600">›</span>
            </a>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                🔐
                </div>
                <div>
                <p className="text-sm font-medium text-gray-700">Two-Factor Auth</p>
                <p className="text-xs text-gray-400">Proteksi Akun Ekstra</p>
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
        <div className={`w-10 h-6 rounded-full transition-colors ${enabled ? "bg-[#6EB8BB]" : "bg-gray-300"} relative cursor-pointer`}>
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-4" : "translate-x-0.5"}`} />
        </div>
    )
    }
