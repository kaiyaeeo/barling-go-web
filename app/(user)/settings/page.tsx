    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import UserSidebar from "@/components/user/UserSidebar"
    import { 
    Home, Bell, Settings as SettingsIcon, ShieldCheck, Mail, Smartphone, 
    User, Lock, CreditCard, Globe, HelpCircle, ChevronRight, 
    Award, Sparkles, Clock, AlertCircle 
    } from "lucide-react"

    export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    // Data dummy untuk status
    const twoFactorEnabled = profile?.two_factor_enabled ?? false
    const membershipTier = profile?.membership_tier || "free"

    return (
        <div className="flex min-h-screen bg-[#F5F7FA]">
        
        {/* ── SIDEBAR ── */}
        <div className="hidden md:block w-[280px] shrink-0 bg-white border-r border-gray-200/80 z-10">
            <UserSidebar profile={profile} active="settings" />
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
            
            {/* TOPBAR dengan desain lebih modern */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-20 shadow-sm h-16 flex items-center justify-between px-6 lg:px-10 shrink-0">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Link href="/" className="hover:text-teal-600 transition-colors">Beranda</Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-800 font-bold">Pengaturan</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 border border-gray-200/60">
                <ShieldCheck size={12} className="text-teal-500" />
                <span>Akun Terproteksi</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-xs font-bold transition-all shadow-sm border border-teal-200/50">
                <Home size={15} /> <span className="hidden sm:inline">Beranda</span>
                </Link>
                <div className="h-6 w-px bg-gray-200" />
                <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-gray-50 rounded-xl transition-all relative">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                <button className="p-2 text-teal-600 bg-teal-50 rounded-xl transition-all border border-teal-200/50">
                <SettingsIcon size={18} />
                </button>
            </div>
            </div>

            {/* ── CONTENT ── */}
            <div className="p-6 lg:p-10 w-full max-w-6xl mx-auto space-y-8">
            
            {/* Header Section dengan deskripsi dan badge */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Pengaturan Akun</h1>
                <p className="text-sm text-gray-500 mt-1 font-medium">Kelola preferensi, keamanan, dan privasi akun kamu.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200/80 shadow-sm">
                <div className={`w-2 h-2 rounded-full ${membershipTier !== 'free' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                <span className="text-xs font-bold text-gray-700">
                    {membershipTier === 'free' ? 'Explorer' : membershipTier === 'premium' ? 'Adventurer' : 'Master Explorer'}
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-xs text-gray-400">{profile?.email || user.email}</span>
                </div>
            </div>

            {/* Grid Settings dengan kategori */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* ── KATEGORI: PREFERENSI NOTIFIKASI ── */}
                <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="p-5 border-b border-gray-100/80 bg-gray-50/50 flex items-center gap-3">
                    <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
                    <Bell size={18} />
                    </div>
                    <div>
                    <h2 className="text-sm font-black text-gray-900">Notifikasi</h2>
                    <p className="text-[11px] font-medium text-gray-400 mt-0.5">Atur pemberitahuan yang ingin kamu terima.</p>
                    </div>
                </div>
                <div className="p-5 space-y-5">
                    <div className="flex items-center justify-between group">
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-teal-50 transition-colors">
                        <Mail size={16} className="text-gray-400 group-hover:text-teal-600 transition-colors" />
                        </div>
                        <div>
                        <p className="text-sm font-bold text-gray-800">Email Promosi</p>
                        <p className="text-xs font-medium text-gray-400 mt-0.5">Diskon, tiket murah, & penawaran eksklusif.</p>
                        </div>
                    </div>
                    <div className="w-11 h-6 rounded-full bg-teal-500 relative cursor-pointer shadow-inner shrink-0 transition-colors">
                        <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform translate-x-5" />
                    </div>
                    </div>

                    <div className="flex items-center justify-between group">
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-teal-50 transition-colors">
                        <Smartphone size={16} className="text-gray-400 group-hover:text-teal-600 transition-colors" />
                        </div>
                        <div>
                        <p className="text-sm font-bold text-gray-800">Update Pesanan</p>
                        <p className="text-xs font-medium text-gray-400 mt-0.5">Pemberitahuan resi & pengiriman via WhatsApp.</p>
                        </div>
                    </div>
                    <div className="w-11 h-6 rounded-full bg-teal-500 relative cursor-pointer shadow-inner shrink-0 transition-colors">
                        <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform translate-x-5" />
                    </div>
                    </div>

                    <div className="flex items-center justify-between group">
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-teal-50 transition-colors">
                        <Clock size={16} className="text-gray-400 group-hover:text-teal-600 transition-colors" />
                        </div>
                        <div>
                        <p className="text-sm font-bold text-gray-800">Pengingat Aktivitas</p>
                        <p className="text-xs font-medium text-gray-400 mt-0.5">Notifikasi harian tentang event & promo terbaru.</p>
                        </div>
                    </div>
                    <div className="w-11 h-6 rounded-full bg-gray-300 relative cursor-pointer shadow-inner shrink-0 transition-colors">
                        <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform translate-x-0.5" />
                    </div>
                    </div>
                </div>
                </div>

                {/* ── KATEGORI: PRIVASI & KEAMANAN ── */}
                <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="p-5 border-b border-gray-100/80 bg-gray-50/50 flex items-center gap-3">
                    <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
                    <ShieldCheck size={18} />
                    </div>
                    <div>
                    <h2 className="text-sm font-black text-gray-900">Privasi & Keamanan</h2>
                    <p className="text-[11px] font-medium text-gray-400 mt-0.5">Kelola visibilitas data dan keamanan akun.</p>
                    </div>
                </div>
                <div className="p-5 space-y-5">
                    <div className="flex items-center justify-between group">
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-teal-50 transition-colors">
                        <Lock size={16} className="text-gray-400 group-hover:text-teal-600 transition-colors" />
                        </div>
                        <div>
                        <p className="text-sm font-bold text-gray-800">Kata Sandi</p>
                        <p className="text-xs font-medium text-gray-400 mt-0.5">Ubah kata sandi secara berkala.</p>
                        </div>
                    </div>
                    <Link href="/profil/ubah-password" className="text-teal-600 hover:text-teal-700 font-bold text-xs bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-1">
                        Ubah <ChevronRight size={12} />
                    </Link>
                    </div>

                    <div className="flex items-center justify-between group">
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-teal-50 transition-colors">
                        <ShieldCheck size={16} className="text-gray-400 group-hover:text-teal-600 transition-colors" />
                        </div>
                        <div>
                        <p className="text-sm font-bold text-gray-800">Two-Factor Authentication</p>
                        <p className="text-xs font-medium text-gray-400 mt-0.5">Lapisan keamanan ekstra untuk akun.</p>
                        </div>
                    </div>
                    <div className={`w-11 h-6 rounded-full relative cursor-pointer shadow-inner shrink-0 transition-colors ${twoFactorEnabled ? 'bg-teal-500' : 'bg-gray-300'}`}>
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${twoFactorEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    </div>

                    <div className="flex items-center justify-between group">
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-teal-50 transition-colors">
                        <Globe size={16} className="text-gray-400 group-hover:text-teal-600 transition-colors" />
                        </div>
                        <div>
                        <p className="text-sm font-bold text-gray-800">Visibilitas Profil</p>
                        <p className="text-xs font-medium text-gray-400 mt-0.5">Tampilkan profil ke publik atau hanya teman.</p>
                        </div>
                    </div>
                    <select className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all">
                        <option>Publik</option>
                        <option>Teman</option>
                        <option>Pribadi</option>
                    </select>
                    </div>
                </div>
                </div>

                {/* ── KATEGORI: METODE PEMBAYARAN (dummy) ── */}
                <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="p-5 border-b border-gray-100/80 bg-gray-50/50 flex items-center gap-3">
                    <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
                    <CreditCard size={18} />
                    </div>
                    <div>
                    <h2 className="text-sm font-black text-gray-900">Metode Pembayaran</h2>
                    <p className="text-[11px] font-medium text-gray-400 mt-0.5">Kelola kartu & dompet digital.</p>
                    </div>
                </div>
                <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100/80">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center text-white text-[8px] font-black">VISA</div>
                        <div>
                        <p className="text-sm font-bold text-gray-800">•••• 4242</p>
                        <p className="text-xs text-gray-400">Exp 12/26</p>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Utama</span>
                    </div>
                    <button className="text-sm font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2.5 rounded-xl transition-all border border-teal-200/50 w-full text-center flex items-center justify-center gap-2">
                    <Sparkles size={14} /> Tambah Metode Pembayaran
                    </button>
                </div>
                </div>

                {/* ── KATEGORI: AKUN & LANGGANAN ── */}
                <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="p-5 border-b border-gray-100/80 bg-gray-50/50 flex items-center gap-3">
                    <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
                    <Award size={18} />
                    </div>
                    <div>
                    <h2 className="text-sm font-black text-gray-900">Akun & Langganan</h2>
                    <p className="text-[11px] font-medium text-gray-400 mt-0.5">Kelola keanggotaan dan preferensi akun.</p>
                    </div>
                </div>
                <div className="p-5 space-y-5">
                    <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-gray-50 rounded-lg">
                        <User size={16} className="text-gray-400" />
                        </div>
                        <div>
                        <p className="text-sm font-bold text-gray-800">Tipe Akun</p>
                        <p className="text-xs font-medium text-gray-400 mt-0.5 capitalize">{membershipTier}</p>
                        </div>
                    </div>
                    <Link href="/profil" className="text-teal-600 hover:text-teal-700 font-bold text-xs bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-1">
                        Lihat Profil <ChevronRight size={12} />
                    </Link>
                    </div>

                    {membershipTier === "free" && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200/70 rounded-xl p-4 flex items-center justify-between">
                        <div>
                        <p className="text-sm font-bold text-orange-800">Upgrade ke Premium</p>
                        <p className="text-xs text-orange-700/80">Dapatkan akses eksklusif!</p>
                        </div>
                        <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition-all">
                        Upgrade
                        </button>
                    </div>
                    )}

                    <div className="pt-4 border-t border-gray-100/80">
                    <button className="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-all border border-red-100/80 w-full text-center flex items-center justify-center gap-2">
                        <AlertCircle size={14} /> Minta Hapus Akun
                    </button>
                    <p className="text-[10px] font-medium text-gray-400 mt-2 text-center">Menghapus akun bersifat permanen dan tidak dapat dipulihkan.</p>
                    </div>
                </div>
                </div>

            </div>

            {/* ── INFO TAMBAHAN: KEAMANAN & DUKUNGAN ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-100/60 p-5 flex items-start gap-4 shadow-sm">
                <div className="p-2 bg-white/80 rounded-xl shadow-sm">
                    <ShieldCheck size={20} className="text-teal-600" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-gray-800">Akun Aman</h4>
                    <p className="text-xs text-gray-600 mt-1">Kami menjaga data kamu dengan enkripsi terbaik. Jangan bagikan kata sandi kepada siapapun.</p>
                </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/60 p-5 flex items-start gap-4 shadow-sm">
                <div className="p-2 bg-white/80 rounded-xl shadow-sm">
                    <HelpCircle size={20} className="text-blue-600" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-gray-800">Pusat Bantuan</h4>
                    <p className="text-xs text-gray-600 mt-1">Butuh bantuan? Kunjungi FAQ atau hubungi tim dukungan kami 24/7.</p>
                    <Link href="#" className="text-xs font-bold text-blue-600 hover:underline mt-1 inline-block">Kunjungi Pusat Bantuan →</Link>
                </div>
                </div>
            </div>

            </div>
        </div>
        </div>
    )
    }