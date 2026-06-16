    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import UserSidebar from "@/components/user/UserSidebar"
    import { Home, Bell, Settings, ShoppingBag, Heart, Sparkles, MapPin, BellRing, ArrowRight } from "lucide-react"

    export default async function DashboardPengunjung() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) redirect("/login")

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    return (
        // ── LAYOUT UTAMA: Kunci layout agar Sidebar dan Konten tidak saling tumpang tindih ──
        <div className="flex min-h-screen bg-[#F5F5F5]">
        
        {/* ── KIRI: SIDEBAR (Dikunci 280px, Tinggi Penuh) ── */}
        <div className="hidden md:block w-[280px] shrink-0 bg-white border-r border-gray-200 z-10">
            <UserSidebar profile={profile} active="dashboard" />
        </div>

        {/* ── KANAN: KONTEN UTAMA & TOPBAR ── */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

            {/* ── TOPBAR KHUSUS PELANGGAN ── */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm h-16 flex items-center justify-between px-6 lg:px-10 shrink-0">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold">
                <span className="text-gray-800">Dashboard Pengunjung</span>
            </div>
            <div className="flex items-center gap-3">
                {/* Tombol Kembali ke Landing Page (Beranda) */}
                <Link 
                href="/" 
                className="flex items-center gap-2 px-4 py-2 bg-[#E6F7F8] hover:bg-[#C5EAE9] text-[#6EB8BB] rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                <Home size={15} /> <span className="hidden sm:block">Beranda</span>
                </Link>
                <div className="h-6 w-px bg-gray-200 mx-1" />
                <button className="p-2 text-gray-400 hover:text-[#6EB8BB] hover:bg-gray-50 rounded-xl transition-all">
                <Bell size={18} />
                </button>
                <Link href="/profil/settings" className="p-2 text-gray-400 hover:text-[#6EB8BB] hover:bg-gray-50 rounded-xl transition-all">
                <Settings size={18} />
                </Link>
            </div>
            </div>

            {/* ── ISI DASHBOARD ── */}
            <div className="p-6 lg:p-10 w-full max-w-6xl mx-auto space-y-6">

            {/* 1. Green Banner (Dashboard Wisata) */}
            <div className="bg-gradient-to-r from-[#2A5C37] to-[#559b9e] rounded-3xl p-6 md:p-8 text-white shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                    <p className="text-sm text-green-100 mb-1 font-medium">Selamat Malam, {profile?.full_name ?? "Pengguna"} 👋</p>
                    <h1 className="text-3xl md:text-4xl font-black mb-4">Dashboard Wisata</h1>
                    <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-gray-800 text-xs font-bold rounded-full shadow-sm">
                        <MapPin size={12} className="text-[#2A5C37]" /> {profile?.membership_tier === 'pro' ? 'Pro Explorer' : profile?.membership_tier === 'explorer' ? 'Explorer' : 'Tourist Explorer'}
                    </span>
                    {profile?.membership_tier === 'free' && (
                        <span className="text-xs text-green-100 font-medium">· Upgrade untuk fitur eksklusif</span>
                    )}
                    </div>
                </div>
                
                {/* Stats in Banner */}
                <div className="flex items-center gap-6 bg-white/10 px-6 py-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner shrink-0">
                    <div className="text-center">
                    <p className="text-2xl font-black">{profile?.destinations_visited ?? 0}</p>
                    <p className="text-[10px] text-green-100 uppercase tracking-widest mt-1">Destinasi</p>
                    </div>
                    <div className="w-px h-10 bg-white/20" />
                    <div className="text-center">
                    <p className="text-2xl font-black">{profile?.explorer_points ?? 0}</p>
                    <p className="text-[10px] text-green-100 uppercase tracking-widest mt-1">Poin</p>
                    </div>
                    <div className="w-px h-10 bg-white/20" />
                    <div className="text-center">
                    <p className="text-2xl font-black">0</p>
                    <p className="text-[10px] text-green-100 uppercase tracking-widest mt-1">Pesanan</p>
                    </div>
                </div>
                </div>

                {/* Progress bar (Jika belum tier maksimal) */}
                {profile?.membership_tier !== 'pro' && (
                <div className="mt-8 relative z-10 bg-black/10 p-4 rounded-2xl border border-white/10">
                    <div className="flex justify-between text-xs text-green-50 font-bold mb-2.5">
                    <span>Progress ke tier berikutnya — {profile?.explorer_points ?? 0} / 500 poin</span>
                    <span>{Math.min(Math.round(((profile?.explorer_points ?? 0) / 500) * 100), 100)}%</span>
                    </div>
                    <div className="h-2.5 bg-black/30 rounded-full overflow-hidden shadow-inner">
                    <div 
                        className="h-full bg-gradient-to-r from-white/60 to-white rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.min(Math.round(((profile?.explorer_points ?? 0) / 500) * 100), 100)}%` }}
                    />
                    </div>
                    <p className="text-[10px] text-green-200 mt-2 font-medium">Kumpulkan {500 - (profile?.explorer_points ?? 0)} poin lagi untuk naik ke Explorer</p>
                </div>
                )}
            </div>

            {/* 2. Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                { icon: ShoppingBag, label: "Pesanan", color: "text-blue-500", bg: "bg-blue-50 border-blue-100", link: "/pesanan" },
                { icon: Heart, label: "Tersimpan", color: "text-rose-500", bg: "bg-rose-50 border-rose-100", link: "/profil/saved" },
                { icon: BellRing, label: "Notifikasi", color: "text-amber-500", bg: "bg-amber-50 border-amber-100", link: "#" },
                { icon: Sparkles, label: "AI Travel", color: "text-[#6EB8BB]", bg: "bg-[#E6F7F8] border-[#C5EAE9]", link: "#" },
                ].map((item) => (
                <Link href={item.link} key={item.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3 hover:shadow-md hover:-translate-y-1 transition-all active:scale-95 group">
                    <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center border group-hover:scale-110 transition-transform`}>
                    <item.icon size={20} className={item.color} />
                    </div>
                    <span className="text-xs font-black text-gray-700 uppercase tracking-wide">{item.label}</span>
                </Link>
                ))}
            </div>

            {/* 3. AI Banner */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between shadow-sm hover:border-[#6EB8BB] transition-colors cursor-pointer group gap-4">
                <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6EB8BB] to-[#4CAF50] flex items-center justify-center text-white shrink-0 shadow-md">
                    <Sparkles size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-gray-900 group-hover:text-[#6EB8BB] transition-colors">Rencanakan Perjalanan dengan AI</h3>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Tanyakan destinasi, kuliner, atau buat itinerary otomatis untuk liburan di Barlingmascakeb.</p>
                </div>
                </div>
                <span className="w-full sm:w-auto text-center px-6 py-3 bg-gray-50 group-hover:bg-[#E6F7F8] text-gray-700 group-hover:text-[#6EB8BB] rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all">
                Coba Sekarang <ArrowRight size={16} />
                </span>
            </div>

            {/* 4. Two Columns Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pesanan Terbaru */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-72">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-50 rounded-lg"><ShoppingBag size={16} className="text-blue-500" /></div>
                    <h3 className="text-sm font-black text-gray-900">Pesanan Terbaru</h3>
                    </div>
                    <Link href="/pesanan" className="text-xs font-bold text-gray-500 hover:text-[#6EB8BB] transition-colors">Semua &rsaquo;</Link>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <ShoppingBag size={28} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">Belum ada pesanan</p>
                    <p className="text-xs mt-1">Pesanan tiket atau produk Anda akan muncul di sini.</p>
                </div>
                </div>

                {/* Tersimpan */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-72">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-rose-50 rounded-lg"><Heart size={16} className="text-rose-500" /></div>
                    <h3 className="text-sm font-black text-gray-900">Tersimpan</h3>
                    </div>
                    <Link href="/profil/saved" className="text-xs font-bold text-gray-500 hover:text-[#6EB8BB] transition-colors">Semua &rsaquo;</Link>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <Heart size={28} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">Belum ada destinasi tersimpan</p>
                    <p className="text-xs mt-1">Eksplor Barling-GO dan simpan destinasi favoritmu!</p>
                </div>
                </div>
            </div>

            </div>
        </div>
        </div>
    )
    }