    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import ProfileForm from "@/components/user/ProfileForm"
    import UserSidebar from "@/components/user/UserSidebar"
    import { 
    Camera, MapPin, Star, Award, TrendingUp, Shield, Crown, 
    ChevronRight, Sparkles, Clock, CreditCard, ShoppingBag, 
    Truck, CheckCircle, Compass, ArrowRight, 
    Lock, Smartphone, Home, ChevronLeft, Bell, Settings
    } from "lucide-react"
    import Link from "next/link"

    export default async function ProfilPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Mengambil profil user
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    // Mengambil semua pesanan user untuk dihitung statusnya
    const { data: orders } = await supabase
        .from("orders")
        .select("status, payment_status")
        .eq("user_id", user.id)

    // Hitung jumlah transaksi berdasarkan status riil di database
    let countMenungguBayar = 0
    let countDiproses = 0
    let countDikirim = 0
    let countSelesai = 0

    if (orders) {
        orders.forEach((order) => {
        // Logika status pesanan:
        if (order.payment_status === "unpaid" || order.payment_status === "pending" || order.status === "pending") {
            countMenungguBayar++
        } else if (order.status === "paid" || order.status === "processing") {
            countDiproses++
        } else if (order.status === "shipped") {
            countDikirim++
        } else if (order.status === "delivered" || order.status === "completed") {
            countSelesai++
        }
        })
    }

    const joinedDate = new Date(user.created_at).toLocaleDateString("id-ID", {
        month: "long", year: "numeric",
    })

    // Data Tier Membership
    const membershipTier = profile?.membership_tier || "free"
    const tierLabels = {
        free: { label: "Explorer", color: "text-gray-600", bg: "bg-gray-100", border: "border-gray-200", icon: Star },
        premium: { label: "Adventurer", color: "text-[#6EB8BB]", bg: "bg-[#6EB8BB]/10", border: "border-[#6EB8BB]/20", icon: Award },
        vip: { label: "Master Explorer", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", icon: Crown },
    }
    const currentTier = tierLabels[membershipTier as keyof typeof tierLabels] || tierLabels.free
    const TierIcon = currentTier.icon

    // Progress Level
    const points = profile?.explorer_points || 0
    const nextLevelPoints = 500
    const progress = Math.min((points / nextLevelPoints) * 100, 100)

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] antialiased text-gray-800 pb-12 md:pb-0">
        
        {/* ── SIDEBAR ── */}
        <div className="hidden md:block w-[280px] shrink-0 bg-white border-r border-gray-200 z-10">
            <UserSidebar active="profil" profile={profile} />
        </div>

        {/* ── KONTEN UTAMA ── */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
            
            {/* ── TOPBAR NAVIGATION ── */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm h-16 flex items-center justify-between px-6 lg:px-10 shrink-0">
            <div className="flex items-center gap-3">
                <Link href="/" className="text-gray-400 hover:text-[#6EB8BB] transition-colors md:hidden">
                <ChevronLeft size={20} />
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-bold">
                <Link href="/" className="text-gray-800 hover:text-[#6EB8BB]">Beranda</Link>
                <ChevronRight size={14} className="text-gray-300" />
                <span className="text-gray-400 font-semibold">Profil Saya</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-[#E6F7F8] hover:bg-[#C5EAE9] text-[#6EB8BB] rounded-xl text-xs font-bold transition-all shadow-sm">
                <Home size={15} /> <span className="hidden sm:block">Beranda</span>
                </Link>
                <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />
                <Link href="/notifikasi" className="p-2 text-gray-400 hover:text-[#6EB8BB] hover:bg-gray-50 rounded-xl transition-all hidden sm:block">
                <Bell size={18} />
                </Link>
                <Link href="/settings" className="p-2 text-gray-400 hover:text-[#6EB8BB] hover:bg-gray-50 rounded-xl transition-all hidden sm:block">
                <Settings size={18} />
                </Link>
            </div>
            </div>

            {/* ── CONTENT AREA (Jarak/Space dikurangi menjadi space-y-4) ── */}
            <div className="p-6 lg:p-10 w-full max-w-7xl mx-auto space-y-4">
            
            {/* ── KARTU IDENTITAS UTAMA ── */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                {/* Avatar Area */}
                <div className="relative group shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-gray-100 shadow-sm overflow-hidden bg-gradient-to-br from-[#6EB8BB] to-[#9FCCCE] flex items-center justify-center">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-white text-3xl font-black select-none">
                        {profile?.full_name?.[0] ?? user.email?.[0]?.toUpperCase() ?? "U"}
                        </span>
                    )}
                    </div>
                    <button className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#6EB8BB] transition-all">
                    <Camera size={13} />
                    </button>
                </div>

                {/* Teks Identitas */}
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                    {profile?.full_name ?? "Pengguna"}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                        <MapPin className="text-gray-400" size={13} />
                        Anggota sejak {joinedDate}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:inline" />
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${currentTier.bg} ${currentTier.color} ${currentTier.border}`}>
                        <TierIcon size={10} /> {currentTier.label}
                    </span>
                    </div>
                </div>
                </div>

                {/* Ringkasan Statistik */}
                <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100 shrink-0 w-full sm:w-auto justify-around sm:justify-start">
                <div className="text-center px-3">
                    <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
                    <Star className="fill-amber-400" size={14} />
                    <span className="text-base font-black text-gray-900">{points.toLocaleString("id-ID")}</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Poin</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-center px-3">
                    <div className="flex items-center justify-center gap-1 text-[#6EB8BB] mb-0.5">
                    <Compass size={14} />
                    <span className="text-base font-black text-gray-900">{profile?.destinations_visited || 0}</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Destinasi</p>
                </div>
                </div>
            </div>

            {/* ── STATUS TRANSAKSI BELANJA INTERAKTIF (DINAMIS DARI DATABASE) ── */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <ShoppingBag className="text-[#6EB8BB]" size={18} />
                    Status Transaksi Belanja
                </h3>
                <Link href="/pesanan" className="text-xs font-bold text-[#6EB8BB] hover:underline flex items-center gap-0.5">
                    Lihat Semua <ArrowRight size={12} />
                </Link>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-center">
                {/* Menunggu Bayar */}
                <Link href="/pesanan?tab=baru" className="p-3 rounded-xl hover:bg-gray-50 transition-all group relative block">
                    <div className="mx-auto w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-[#6EB8BB]/10 group-hover:text-[#6EB8BB] transition-colors mb-2">
                    <CreditCard size={18} />
                    </div>
                    <p className="text-[11px] sm:text-xs font-bold text-gray-600 group-hover:text-[#6EB8BB]">Menunggu Bayar</p>
                    {countMenungguBayar > 0 && (
                    <span className="absolute top-2 right-1/4 sm:right-1/3 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-4 h-4 flex items-center justify-center shadow-sm">
                        {countMenungguBayar > 99 ? "99+" : countMenungguBayar}
                    </span>
                    )}
                </Link>

                {/* Diproses */}
                <Link href="/pesanan?tab=diproses" className="p-3 rounded-xl hover:bg-gray-50 transition-all group relative block">
                    <div className="mx-auto w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-[#6EB8BB]/10 group-hover:text-[#6EB8BB] transition-colors mb-2">
                    <ShoppingBag size={18} />
                    </div>
                    <p className="text-[11px] sm:text-xs font-bold text-gray-600 group-hover:text-[#6EB8BB]">Diproses</p>
                    {countDiproses > 0 && (
                    <span className="absolute top-2 right-1/4 sm:right-1/3 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-4 h-4 flex items-center justify-center shadow-sm">
                        {countDiproses > 99 ? "99+" : countDiproses}
                    </span>
                    )}
                </Link>

                {/* Dikirim */}
                <Link href="/pesanan?tab=dikirim" className="p-3 rounded-xl hover:bg-gray-50 transition-all group relative block">
                    <div className="mx-auto w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-[#6EB8BB]/10 group-hover:text-[#6EB8BB] transition-colors mb-2">
                    <Truck size={18} />
                    </div>
                    <p className="text-[11px] sm:text-xs font-bold text-gray-600 group-hover:text-[#6EB8BB]">Dikirim</p>
                    {countDikirim > 0 && (
                    <span className="absolute top-2 right-1/4 sm:right-1/3 bg-[#6EB8BB] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-4 h-4 flex items-center justify-center shadow-sm">
                        {countDikirim > 99 ? "99+" : countDikirim}
                    </span>
                    )}
                </Link>

                {/* Selesai */}
                <Link href="/pesanan?tab=selesai" className="p-3 rounded-xl hover:bg-gray-50 transition-all group relative block">
                    <div className="mx-auto w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-[#6EB8BB]/10 group-hover:text-[#6EB8BB] transition-colors mb-2">
                    <CheckCircle size={18} />
                    </div>
                    <p className="text-[11px] sm:text-xs font-bold text-gray-600 group-hover:text-[#6EB8BB]">Selesai</p>
                    {countSelesai > 0 && (
                    <span className="absolute top-2 right-1/4 sm:right-1/3 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-4 h-4 flex items-center justify-center shadow-sm">
                        {countSelesai > 99 ? "99+" : countSelesai}
                    </span>
                    )}
                </Link>
                </div>
            </div>

            {/* ── PROGRESS BAR LEVEL ── */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">
                <div className="flex items-center gap-3.5">
                <div className="bg-[#6EB8BB]/10 p-3 rounded-2xl text-[#6EB8BB] shrink-0">
                    <TrendingUp size={20} />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Progress Kemitraan Loyalitas</p>
                    <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-base font-extrabold text-gray-800">{points} <span className="text-gray-400 text-xs font-medium">/ {nextLevelPoints} Poin</span></span>
                    <span className="text-xs font-extrabold text-[#6EB8BB] bg-[#6EB8BB]/10 px-2.5 py-0.5 rounded-full">{Math.round(progress)}%</span>
                    </div>
                </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-center min-w-0 md:max-w-md">
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2 relative shadow-inner">
                    <div 
                    className="h-full bg-gradient-to-r from-[#6EB8BB] to-[#9FCCCE] rounded-full transition-all duration-700 ease-out" 
                    style={{ width: `${progress}%` }} 
                    />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    <span>{currentTier.label}</span>
                    <span>{membershipTier === "free" ? "Adventurer" : membershipTier === "premium" ? "Master Explorer" : "Max Level"}</span>
                </div>
                </div>
            </div>

            {/* ── FORM INFORMASI PRIBADI ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                <div className="border-b border-gray-100 pb-4 mb-5">
                <h2 className="text-lg font-extrabold text-gray-900">Informasi Pribadi</h2>
                <p className="text-xs text-gray-400 mt-1">Kelola data profil Anda untuk manajemen akun yang aman.</p>
                </div>
                <ProfileForm profile={profile} email={user.email ?? ""} />
            </div>

            {/* ── GRID BAWAH: KEAMANAN & RIWAYAT AKTIVITAS (Gap dikurangi menjadi gap-4) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                
                {/* Komponen Keamanan */}
                <SecurityCard twoFactorEnabled={profile?.two_factor_enabled ?? false} userId={user.id} />

                {/* Riwayat Aktivitas & Perjalanan */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Clock className="text-[#6EB8BB]" size={16} />
                    Aktivitas Terbaru
                    </h3>
                </div>
                
                <div className="relative pl-4 border-l-2 border-gray-100 space-y-4 ml-2 py-1">
                    <div className="relative group">
                    <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-white border-2 border-[#6EB8BB] group-hover:scale-125 transition-transform" />
                    <div>
                        <p className="text-xs font-bold text-gray-800">Booking Tiket Wisata</p>
                        <p className="text-[10px] text-gray-400">Hari ini, 14.20 WIB</p>
                    </div>
                    </div>

                    <div className="relative group">
                    <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-white border-2 border-gray-300 group-hover:scale-125 transition-transform" />
                    <div>
                        <p className="text-xs font-bold text-gray-800">Refund BarlingPay Sukses</p>
                        <p className="text-[10px] text-gray-400">15 Juni 2026, 09.15 WIB</p>
                    </div>
                    </div>

                    <div className="relative group">
                    <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-white border-2 border-gray-300 group-hover:scale-125 transition-transform" />
                    <div>
                        <p className="text-xs font-bold text-gray-800">Upgrade Level Akun</p>
                        <p className="text-[10px] text-gray-400">12 Juni 2026, 17.00 WIB</p>
                    </div>
                    </div>
                </div>
                </div>

            </div>
            
            </div>
        </div>
        </div>
    )
    }

    // ── KOMPONEN KEAMANAN AKUN ──
    function SecurityCard({ twoFactorEnabled, userId }: { twoFactorEnabled: boolean; userId: string }) {
    const securityScore = twoFactorEnabled ? 95 : 60
    
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm h-full flex flex-col justify-between">
        <div>
            <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Shield className="text-[#6EB8BB]" size={16} />
                Keamanan Akun
            </h3>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                twoFactorEnabled 
                ? "bg-[#6EB8BB]/10 text-[#6EB8BB] border-[#6EB8BB]/20" 
                : "bg-amber-50 text-amber-600 border-amber-100"
            }`}>
                Skor: {securityScore}%
            </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Pastikan fitur keamanan tingkat lanjut aktif untuk melindungi transaksi dan data Anda.</p>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl mt-auto">
            <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                <Smartphone size={14} />
            </div>
            <div>
                <p className="text-xs font-bold text-gray-700">Two-Factor Auth</p>
                <p className="text-[9px] text-gray-400">Proteksi login ekstra.</p>
            </div>
            </div>
            <TwoFactorToggle enabled={twoFactorEnabled} userId={userId} />
        </div>
        </div>
    )
    }

    function TwoFactorToggle({ enabled, userId }: { enabled: boolean; userId: string }) {
    return (
        <div className={`w-11 h-6 rounded-full transition-colors duration-300 ${enabled ? "bg-[#6EB8BB]" : "bg-gray-200"} relative cursor-pointer p-0.5 shadow-inner shrink-0`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 flex items-center justify-center ${enabled ? "translate-x-5" : "translate-x-0"}`}>
            {enabled && <span className="text-[8px] text-[#6EB8BB] font-black">✓</span>}
        </div>
        </div>
    )
    }