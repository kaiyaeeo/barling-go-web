    "use client"

    import { useState, useEffect } from "react"
    import { createClient } from "@/lib/supabase/client"
    import { useRouter } from "next/navigation"
    import {
    Info, CreditCard, Mail, Shield, Database,
    Loader2, Save, Server, Check,
    Bell, FileText, Send, Lock, Clock, LogOut, Edit2, Plus,
    LayoutDashboard, Settings, ChevronRight, AlertCircle,
    Globe, CheckCircle2
    } from "lucide-react"

    import BackupDataTab  from "@/components/super-admin/BackupDataTab"
    import PembayaranTab  from "@/components/super-admin/PembayaranTab"

    type Tab = "umum" | "pembayaran" | "notifikasi" | "keamanan" | "backup"

    const TAB_CONFIG: Record<Tab, { icon: any; label: string; desc: string }> = {
    umum:        { icon: Globe,      label: "Umum",               desc: "Informasi & status platform"        },
    pembayaran:  { icon: CreditCard, label: "Pembayaran & Komisi", desc: "Gateway & skema komisi"             },
    notifikasi:  { icon: Mail,       label: "Notifikasi & Email",  desc: "SMTP & template notifikasi"         },
    keamanan:    { icon: Shield,     label: "Keamanan",            desc: "Kebijakan sandi & sesi"             },
    backup:      { icon: Database,   label: "Backup Data",         desc: "Penjadwalan & riwayat backup"       },
    }

    const PAGE_TITLES: Record<Tab, string> = {
    umum:        "Pengaturan Platform",
    pembayaran:  "Pembayaran & Komisi",
    notifikasi:  "Notifikasi & Email",
    keamanan:    "Keamanan Platform",
    backup:      "Backup & Pemulihan Data",
    }

    const PAGE_DESC: Record<Tab, string> = {
    umum:        "Kelola konfigurasi global, preferensi sistem, dan identitas platform Barling-GO.",
    pembayaran:  "Kelola skema komisi, biaya layanan, dan konfigurasi payment gateway.",
    notifikasi:  "Kelola notifikasi sistem, template email, dan konfigurasi SMTP.",
    keamanan:    "Kelola kebijakan keamanan, 2FA, batas login, dan manajemen sesi.",
    backup:      "Kelola backup otomatis, pencadangan manual, dan pemulihan data.",
    }

    export default function PengaturanPlatformPage() {
    const router  = useRouter()
    const supabase = createClient()

    const [activeTab,      setActiveTab]      = useState<Tab>("umum")
    const [isAuthChecking, setIsAuthChecking] = useState(true)
    const [isSaving,       setIsSaving]       = useState(false)
    const [saved,          setSaved]          = useState(false)

    const [formUmum, setFormUmum] = useState({
        nama: "Barling-GO",
        slogan: "Temukan Pesona Barlingmascakep",
        email: "support@barling-go.com",
        isOnline: true,
    })

    const [formNotif, setFormNotif] = useState({
        mitraBaru:       { push: true,  email: true  },
        transaksiIklan:  { push: true,  email: true  },
        laporanHarian:   { push: false, email: true  },
        keluhan:         { push: true,  email: true  },
        smtpHost:  "smtp.gmail.com",
        smtpPort:  "587",
        smtpEmail: "noreply@barling-go.com",
        smtpPass:  "...........",
    })

    const [formKeamanan, setFormKeamanan] = useState({
        minKarakter:  "10 Karakter",
        masaBerlaku:  "90 hari",
        wajibSpesial: true,
        wajibAngka:   true,
        duaFaktor:    true,
        batasLogin:   5,
        timeout:      "1 Jam",
    })

    useEffect(() => {
        async function checkAuth() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.replace("/login"); return }
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
        if (profile?.role !== "super_admin") { router.replace("/dashboard") }
        setIsAuthChecking(false)
        }
        checkAuth()
    }, [router, supabase])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setTimeout(() => {
        setIsSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
        }, 800)
    }

    const toggleNotif = (setting: keyof typeof formNotif, type: "push" | "email") => {
        setFormNotif(prev => ({
        ...prev,
        [setting]: { ...(prev[setting as keyof typeof formNotif] as any), [type]: !(prev[setting as keyof typeof formNotif] as any)[type] }
        }))
    }

    // Loading state
    if (isAuthChecking) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="animate-spin text-[#6EB8BB]" />
            <p className="text-sm text-gray-500 font-medium">Memuat konfigurasi platform...</p>
        </div>
        </div>
    )

    const SaveBtn = () => (
        <button
        type="submit" disabled={isSaving || saved}
        className={`flex items-center gap-2 px-6 py-2.5 font-semibold text-sm rounded-xl transition-all active:scale-[0.98] ${
            saved
            ? "bg-emerald-500 text-white"
            : "bg-[#6EB8BB] hover:bg-[#5aa5a8] text-white disabled:opacity-70"
        }`}
        >
        {isSaving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
        {saved ? "Tersimpan!" : "Simpan Perubahan"}
        </button>
    )

    const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
        <button
        type="button" onClick={onChange}
        className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${checked ? "bg-[#6EB8BB]" : "bg-gray-200"}`}
        >
        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform ${checked ? "left-6" : "left-1"}`} />
        </button>
    )

    return (
        <main className="min-h-screen bg-gray-50/60">

        {/* ===== TOP NAV ===== */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                <LayoutDashboard size={13} />
                <span className="hover:text-gray-600 cursor-pointer" onClick={() => router.push("/super-admin/dashboard")}>Dashboard</span>
                <ChevronRight size={13} />
                <span className="text-gray-700 font-semibold">Pengaturan Platform</span>
                </div>
                <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl">
                    <AlertCircle size={13} className="text-amber-500" />
                    <span className="text-xs font-medium text-amber-700">Perubahan hanya berlaku setelah disimpan</span>
                </div>
                <div className="h-5 w-px bg-gray-200 mx-1" />
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6EB8BB] to-[#5aa5a8] flex items-center justify-center text-white text-xs font-black">S</div>
                </div>
            </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">

            {/* ===== PAGE HEADER ===== */}
            <div className="mb-6">
            <h1 className="text-2xl font-black text-gray-900">{PAGE_TITLES[activeTab]}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{PAGE_DESC[activeTab]}</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">

            {/* ===== LEFT SIDEBAR ===== */}
            <div className="w-full md:w-60 shrink-0">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Settings size={11} /> Konfigurasi
                    </p>
                </div>
                <nav className="p-2 space-y-0.5">
                    {(Object.keys(TAB_CONFIG) as Tab[]).map((tab) => {
                    const { icon: Icon, label, desc } = TAB_CONFIG[tab]
                    const isActive = activeTab === tab
                    return (
                        <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all group ${
                            isActive
                            ? "bg-[#6EB8BB]/10 text-[#6EB8BB] border border-[#6EB8BB]/20"
                            : "text-gray-600 hover:bg-gray-50 border border-transparent"
                        }`}
                        >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isActive ? "bg-[#6EB8BB]/20" : "bg-gray-100 group-hover:bg-gray-200"
                        }`}>
                            <Icon size={16} className={isActive ? "text-[#6EB8BB]" : "text-gray-500"} />
                        </div>
                        <div className="min-w-0">
                            <p className={`text-sm font-semibold leading-tight truncate ${isActive ? "text-[#6EB8BB]" : "text-gray-700"}`}>{label}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5 truncate">{desc}</p>
                        </div>
                        </button>
                    )
                    })}
                </nav>

                {/* Quick info */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${formUmum.isOnline ? "bg-emerald-400" : "bg-gray-400"}`} />
                    <span className="text-xs font-semibold text-gray-600">{formUmum.isOnline ? "Platform Online" : "Maintenance"}</span>
                    </div>
                    <p className="text-[11px] text-gray-400">{formUmum.nama} · v1.0</p>
                </div>
                </div>
            </div>

            {/* ===== RIGHT CONTENT ===== */}
            <div className="flex-1 min-w-0">

                {/* ===== TAB: UMUM ===== */}
                {activeTab === "umum" && (
                <form onSubmit={handleSave} className="space-y-5 animate-in fade-in duration-300">

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#6EB8BB]/10 flex items-center justify-center">
                        <Globe size={15} className="text-[#6EB8BB]" />
                        </div>
                        <div>
                        <h2 className="text-sm font-bold text-gray-900">Identitas Platform</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">Nama, slogan, dan kontak publik platform</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Nama Platform</label>
                            <input
                            type="text" value={formUmum.nama} onChange={e => setFormUmum({...formUmum, nama: e.target.value})} required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Slogan / Tagline</label>
                            <input
                            type="text" value={formUmum.slogan} onChange={e => setFormUmum({...formUmum, slogan: e.target.value})} required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Kontak Bantuan (Email)</label>
                            <input
                            type="email" value={formUmum.email} onChange={e => setFormUmum({...formUmum, email: e.target.value})} required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Status Platform</label>
                            <div className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${formUmum.isOnline ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"}`}>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${formUmum.isOnline ? "bg-emerald-400 animate-pulse" : "bg-gray-400"}`} />
                                <span className={`text-sm font-semibold ${formUmum.isOnline ? "text-emerald-700" : "text-gray-600"}`}>
                                {formUmum.isOnline ? "Online & Aktif" : "Maintenance"}
                                </span>
                            </div>
                            <Toggle checked={formUmum.isOnline} onChange={() => setFormUmum({...formUmum, isOnline: !formUmum.isOnline})} />
                            </div>
                        </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                        <button type="button" className="px-5 py-2.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:bg-white transition-all">Batalkan</button>
                        <SaveBtn />
                    </div>
                    </div>

                </form>
                )}

                {/* ===== TAB: PEMBAYARAN ===== */}
                {activeTab === "pembayaran" && <PembayaranTab />}

                {/* ===== TAB: NOTIFIKASI ===== */}
                {activeTab === "notifikasi" && (
                <form onSubmit={handleSave} className="space-y-5 animate-in fade-in duration-300">

                    {/* Notifikasi Sistem */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Bell size={15} className="text-blue-500" />
                        </div>
                        <div>
                        <h2 className="text-sm font-bold text-gray-900">Notifikasi Sistem</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">Tentukan channel notifikasi per jenis event</p>
                        </div>
                    </div>

                    {/* Table header */}
                    <div className="grid grid-cols-[1fr_80px_80px] items-center px-6 py-2.5 bg-gray-50/80 border-b border-gray-100">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Event</span>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Push</span>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Email</span>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {([
                        { key: "mitraBaru",      title: "Pendaftaran Mitra Baru",    desc: "Notifikasi saat mitra baru mendaftar" },
                        { key: "transaksiIklan", title: "Transaksi Iklan Baru",      desc: "Pembayaran iklan atau promosi mitra"  },
                        { key: "laporanHarian",  title: "Laporan Harian Platform",   desc: "Ringkasan statistik harian ke email"  },
                        { key: "keluhan",        title: "Keluhan Pengguna",          desc: "Tiket bantuan & laporan mendesak"     },
                        ] as const).map((item) => (
                        <div key={item.key} className="grid grid-cols-[1fr_80px_80px] items-center px-6 py-4 hover:bg-gray-50/40 transition-colors">
                            <div>
                            <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                            </div>
                            <div className="flex justify-center">
                            <div
                                onClick={() => toggleNotif(item.key, "push")}
                                className={`w-5 h-5 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${(formNotif[item.key] as any).push ? "bg-[#6EB8BB] border-[#6EB8BB] text-white" : "bg-white border-gray-300 hover:border-gray-400"}`}
                            >
                                {(formNotif[item.key] as any).push && <Check size={12} strokeWidth={3} />}
                            </div>
                            </div>
                            <div className="flex justify-center">
                            <div
                                onClick={() => toggleNotif(item.key, "email")}
                                className={`w-5 h-5 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${(formNotif[item.key] as any).email ? "bg-[#6EB8BB] border-[#6EB8BB] text-white" : "bg-white border-gray-300 hover:border-gray-400"}`}
                            >
                                {(formNotif[item.key] as any).email && <Check size={12} strokeWidth={3} />}
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>

                    {/* SMTP */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                            <Server size={15} className="text-purple-500" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">Konfigurasi SMTP</h2>
                            <p className="text-[11px] text-gray-400 mt-0.5">Server pengiriman email</p>
                        </div>
                        </div>
                        <button type="button" className="flex items-center gap-1.5 text-xs font-semibold text-[#6EB8BB] border border-[#6EB8BB]/30 px-3 py-1.5 rounded-xl hover:bg-[#6EB8BB]/10 transition-all">
                        <Send size={13} /> Uji Koneksi
                        </button>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[
                        { label: "SMTP Host",         key: "smtpHost",  type: "text"     },
                        { label: "Port",              key: "smtpPort",  type: "text"     },
                        { label: "Email Pengirim",    key: "smtpEmail", type: "text"     },
                        { label: "Password / App Key",key: "smtpPass",  type: "password" },
                        ].map(({ label, key, type }) => (
                        <div key={key}>
                            <label className="block text-sm font-semibold text-gray-800 mb-1.5">{label}</label>
                            <input
                            type={type}
                            value={(formNotif as any)[key]}
                            onChange={e => setFormNotif({...formNotif, [key]: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] font-mono transition-all"
                            />
                        </div>
                        ))}
                    </div>
                    </div>

                    {/* Template Email */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                            <FileText size={15} className="text-amber-500" />
                        </div>
                        <h2 className="text-sm font-bold text-gray-900">Manajemen Template Email</h2>
                        </div>
                        <button type="button" className="flex items-center gap-1.5 text-xs font-semibold text-[#6EB8BB] border border-[#6EB8BB]/30 px-3 py-1.5 rounded-xl hover:bg-[#6EB8BB]/10 transition-all">
                        <Plus size={13} /> Template Baru
                        </button>
                    </div>
                    <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_60px] items-center px-6 py-2.5 bg-gray-50/80 border-b border-gray-100">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nama Template</span>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Trigger</span>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {[
                        { name: "Selamat Datang Mitra",   trigger: "Pendaftaran Selesai"         },
                        { name: "Invoice Iklan",           trigger: "Pembayaran Terkonfirmasi"    },
                        { name: "Reset Password",          trigger: "Lupa Password"               },
                        { name: "Pengingat Pembayaran",    trigger: "H-1 Jatuh Tempo"             },
                        ].map((item, idx) => (
                        <div key={idx} className="grid grid-cols-[2fr_2fr_1fr_60px] items-center px-6 py-3.5 hover:bg-gray-50/40 transition-colors">
                            <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.trigger}</p>
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Aktif
                            </span>
                            <div className="flex justify-end">
                            <button type="button" className="p-1.5 text-gray-400 hover:text-[#6EB8BB] hover:bg-[#6EB8BB]/10 rounded-lg transition-all">
                                <Edit2 size={15} />
                            </button>
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>

                    <div className="flex justify-end gap-3">
                    <button type="button" className="px-5 py-2.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:bg-white transition-all">Batalkan</button>
                    <SaveBtn />
                    </div>
                </form>
                )}

                {/* ===== TAB: KEAMANAN ===== */}
                {activeTab === "keamanan" && (
                <form onSubmit={handleSave} className="space-y-5 animate-in fade-in duration-300">

                    {/* Kebijakan Password */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                        <Lock size={15} className="text-red-400" />
                        </div>
                        <div>
                        <h2 className="text-sm font-bold text-gray-900">Kebijakan Password</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">Standar keamanan sandi semua admin dan mitra</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Minimum Karakter</label>
                            <select
                            value={formKeamanan.minKarakter}
                            onChange={e => setFormKeamanan({...formKeamanan, minKarakter: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] bg-white transition-all"
                            >
                            <option>8 Karakter</option>
                            <option>10 Karakter</option>
                            <option>12 Karakter</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Masa Berlaku Password</label>
                            <select
                            value={formKeamanan.masaBerlaku}
                            onChange={e => setFormKeamanan({...formKeamanan, masaBerlaku: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] bg-white transition-all"
                            >
                            <option>30 hari</option>
                            <option>60 hari</option>
                            <option>90 hari</option>
                            <option>Tidak terbatas</option>
                            </select>
                        </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: "Wajib karakter spesial", desc: "Sertakan simbol (!@#$%^&*)", key: "wajibSpesial" as const },
                            { label: "Wajib angka",            desc: "Sertakan angka (0–9)",       key: "wajibAngka"  as const },
                        ].map(({ label, desc, key }) => (
                            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{label}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                            </div>
                            <Toggle checked={formKeamanan[key]} onChange={() => setFormKeamanan({...formKeamanan, [key]: !formKeamanan[key]})} />
                            </div>
                        ))}
                        </div>
                    </div>
                    </div>

                    {/* Keamanan Tambahan */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                        <Shield size={15} className="text-emerald-500" />
                        </div>
                        <div>
                        <h2 className="text-sm font-bold text-gray-900">Keamanan Tambahan</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">2FA dan perlindungan brute force</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${formKeamanan.duaFaktor ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-100"}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${formKeamanan.duaFaktor ? "bg-emerald-100" : "bg-gray-200"}`}>
                            <Shield size={16} className={formKeamanan.duaFaktor ? "text-emerald-600" : "text-gray-400"} />
                            </div>
                            <div>
                            <p className="text-sm font-semibold text-gray-800">Dua Faktor Otentikasi (2FA)</p>
                            <p className="text-xs text-gray-500 mt-0.5">Wajib untuk semua Super Admin via authenticator atau email</p>
                            </div>
                        </div>
                        <Toggle checked={formKeamanan.duaFaktor} onChange={() => setFormKeamanan({...formKeamanan, duaFaktor: !formKeamanan.duaFaktor})} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Batas Percobaan Login</p>
                            <p className="text-xs text-gray-400 mt-0.5">Akun terkunci 30 menit setelah batas terlampaui</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                            type="number"
                            value={formKeamanan.batasLogin}
                            onChange={e => setFormKeamanan({...formKeamanan, batasLogin: parseInt(e.target.value)})}
                            className="w-16 px-3 py-2 rounded-xl border border-gray-200 text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all"
                            />
                            <span className="text-sm text-gray-500 font-medium">kali</span>
                        </div>
                        </div>
                    </div>
                    </div>

                    {/* Manajemen Sesi */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                        <Clock size={15} className="text-amber-500" />
                        </div>
                        <div>
                        <h2 className="text-sm font-bold text-gray-900">Manajemen Sesi</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">Durasi sesi login aktif</p>
                        </div>
                    </div>
                    <div className="p-6 flex flex-col sm:flex-row items-end gap-4">
                        <div className="flex-1 w-full">
                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">Sesi Timeout Otomatis</label>
                        <select
                            value={formKeamanan.timeout}
                            onChange={e => setFormKeamanan({...formKeamanan, timeout: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] bg-white transition-all"
                        >
                            <option>30 Menit</option>
                            <option>1 Jam</option>
                            <option>2 Jam</option>
                            <option>12 Jam</option>
                        </select>
                        </div>
                        <button
                        type="button"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 border border-red-200 text-red-600 font-semibold text-sm rounded-xl hover:bg-red-50 transition-all"
                        >
                        <LogOut size={16} /> Logout Semua Sesi Aktif
                        </button>
                    </div>
                    </div>

                    <div className="flex justify-end gap-3">
                    <button type="button" className="px-5 py-2.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:bg-white transition-all">Batalkan</button>
                    <SaveBtn />
                    </div>
                </form>
                )}

                {/* ===== TAB: BACKUP ===== */}
                {activeTab === "backup" && <BackupDataTab />}

            </div>
            </div>
        </div>
        </main>
    )
    }