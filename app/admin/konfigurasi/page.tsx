    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import {
    Save, Bell, Lock, Loader2, Truck, FileText,
    Check, Shield, MapPin, Clock, Smartphone,
    LayoutDashboard, ChevronRight, Settings, CheckCircle2,
    X, Eye, EyeOff, AlertCircle, Info
    } from "lucide-react"

    type SubTab = "keamanan" | "notifikasi" | "pengiriman" | "kebijakan"

    export default function AdminPengaturanKompleksPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<SubTab>("keamanan")
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [showOld, setShowOld] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const [formKeamanan, setFormKeamanan] = useState({
        oldPassword: "", newPassword: "", confirmPassword: "", enable2FA: false
    })

    const [formNotif, setFormNotif] = useState({
        pesananBaru:     { email: true,  push: true,  wa: true  },
        chatPembeli:     { email: false, push: true,  wa: true  },
        ulasanProduk:    { email: true,  push: false, wa: false },
        laporanMingguan: { email: true,  push: false, wa: false }
    })

    const [formPengiriman, setFormPengiriman] = useState({
        alamatAsal:  "Jl. Jenderal Soedirman No. 45, Purbalingga, Jawa Tengah",
        kodePos:     "53311",
        jadwalBuka:  "08:00",
        jadwalTutup: "17:00",
        kurir: { jne: true, jnt: true, pos: false, sicepat: true }
    })

    const [formKebijakan, setFormKebijakan] = useState({
        catatanToko:     "Mohon lakukan video unboxing saat membuka paket untuk mempermudah proses klaim jika terjadi kerusakan.",
        kebijakanRetur:  "Retur barang maksimal 2 hari setelah produk diterima, ongkir ditanggung oleh pembeli kecuali kesalahan dari pihak merchant.",
        minOrder:        "0"
    })

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setTimeout(() => {
        setIsSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
        }, 1000)
    }

    const toggleNotif = (category: keyof typeof formNotif, channel: "email" | "push" | "wa") => {
        setFormNotif(prev => ({
        ...prev,
        [category]: { ...prev[category], [channel]: !prev[category][channel] }
        }))
    }

    const toggleKurir = (key: keyof typeof formPengiriman.kurir) => {
        setFormPengiriman(prev => ({
        ...prev,
        kurir: { ...prev.kurir, [key]: !prev.kurir[key] }
        }))
    }

    const passwordStrength = () => {
        const p = formKeamanan.newPassword
        if (!p) return null
        if (p.length < 6)  return { label: "Terlalu pendek", color: "bg-red-400",   text: "text-red-500"   }
        if (p.length < 10) return { label: "Sedang",         color: "bg-amber-400", text: "text-amber-500" }
        return               { label: "Kuat",             color: "bg-emerald-400",text: "text-emerald-500"}
    }
    const strength = passwordStrength()

    const TABS = [
        { id: "keamanan",   label: "Keamanan Akun",      icon: Lock     },
        { id: "notifikasi", label: "Notifikasi",          icon: Bell     },
        { id: "pengiriman", label: "Pengiriman & Lokasi", icon: Truck    },
        { id: "kebijakan",  label: "Kebijakan Toko",      icon: FileText },
    ]

    const INPUT    = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] bg-white placeholder:text-gray-300 transition-all"
    const LABEL    = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"
    const CARD_HDR = "flex items-center gap-2.5 px-5 py-4 border-b border-gray-100"

    return (
        <main className="min-h-screen bg-[#F5F5F5] pb-20">

        {/* ── Topbar ── */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                <LayoutDashboard size={13} />
                <button onClick={() => router.push("/admin/dashboard")} className="hover:text-gray-600 transition-colors">Dashboard</button>
                <ChevronRight size={13} />
                <span className="text-gray-700 font-semibold">Pengaturan</span>
                </div>
                <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#E6F7F8] border border-[#6EB8BB]/20 text-[#5AA4A7] rounded-xl text-xs font-semibold">
                    <Settings size={12} />
                    <span>Pengaturan Merchant</span>
                </div>
                </div>
            </div>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <form onSubmit={handleSave} className="space-y-5">

            {/* ── Page header ── */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                <p className="text-xs font-semibold text-[#6EB8BB] uppercase tracking-widest mb-1">Manajemen Toko</p>
                <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
                </div>
            </div>

            {/* ── Tab + content card ── */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

                {/* Tab nav */}
                <div className="flex items-center border-b border-gray-100 overflow-x-auto scrollbar-none px-2 pt-1">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id as SubTab)}
                    className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                        activeTab === id
                        ? "text-[#6EB8BB] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#6EB8BB] after:rounded-t-full"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                    >
                    <Icon size={15} />
                    {label}
                    </button>
                ))}
                </div>

                {/* ── TAB 1: KEAMANAN ── */}
                {activeTab === "keamanan" && (
                <div className="p-5 space-y-4">

                    {/* Password card */}
                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    <div className={CARD_HDR}>
                        <div className="w-7 h-7 rounded-lg bg-[#E6F7F8] flex items-center justify-center">
                        <Shield size={14} className="text-[#6EB8BB]" />
                        </div>
                        <div>
                        <p className="text-sm font-bold text-gray-900">Perbarui Kata Sandi</p>
                        <p className="text-[11px] text-gray-400">Gunakan kombinasi huruf, angka, dan simbol minimal 8 karakter</p>
                        </div>
                    </div>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Old password */}
                        <div>
                        <label className={LABEL}>Password Lama</label>
                        <div className="relative">
                            <input
                            type={showOld ? "text" : "password"}
                            value={formKeamanan.oldPassword}
                            onChange={e => setFormKeamanan({ ...formKeamanan, oldPassword: e.target.value })}
                            className={INPUT + " pr-10"}
                            placeholder="••••••••"
                            />
                            <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                        </div>

                        {/* New password */}
                        <div>
                        <label className={LABEL}>Password Baru</label>
                        <div className="relative">
                            <input
                            type={showNew ? "text" : "password"}
                            value={formKeamanan.newPassword}
                            onChange={e => setFormKeamanan({ ...formKeamanan, newPassword: e.target.value })}
                            className={INPUT + " pr-10"}
                            placeholder="••••••••"
                            />
                            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                        {strength && (
                            <div className="mt-1.5 space-y-1">
                            <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                                <div className={`h-full rounded-full ${strength.color} transition-all`}
                                style={{ width: formKeamanan.newPassword.length >= 10 ? "100%" : formKeamanan.newPassword.length >= 6 ? "60%" : "30%" }} />
                            </div>
                            <p className={`text-[10px] font-semibold ${strength.text}`}>{strength.label}</p>
                            </div>
                        )}
                        </div>

                        {/* Confirm password */}
                        <div>
                        <label className={LABEL}>Konfirmasi Password</label>
                        <div className="relative">
                            <input
                            type={showConfirm ? "text" : "password"}
                            value={formKeamanan.confirmPassword}
                            onChange={e => setFormKeamanan({ ...formKeamanan, confirmPassword: e.target.value })}
                            className={INPUT + " pr-10 " + (
                                formKeamanan.confirmPassword && formKeamanan.confirmPassword !== formKeamanan.newPassword
                                ? "border-red-300 focus:border-red-400 focus:ring-red-200/25"
                                : ""
                            )}
                            placeholder="••••••••"
                            />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                        {formKeamanan.confirmPassword && formKeamanan.confirmPassword !== formKeamanan.newPassword && (
                            <p className="text-[10px] text-red-500 font-semibold mt-1 flex items-center gap-1"><AlertCircle size={10} /> Password tidak cocok</p>
                        )}
                        {formKeamanan.confirmPassword && formKeamanan.confirmPassword === formKeamanan.newPassword && (
                            <p className="text-[10px] text-emerald-500 font-semibold mt-1 flex items-center gap-1"><Check size={10} /> Password cocok</p>
                        )}
                        </div>
                    </div>
                    </div>

                    {/* 2FA card */}
                    <div className="border border-gray-100 rounded-2xl p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <Smartphone size={17} className="text-emerald-500" />
                        </div>
                        <div>
                        <p className="text-sm font-bold text-gray-900">Otentikasi Dua Faktor (2FA)</p>
                        <p className="text-xs text-gray-400 mt-0.5">Amankan akun dari akses mencurigakan dengan verifikasi kode OTP tambahan.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${formKeamanan.enable2FA ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-gray-100 text-gray-400"}`}>
                        {formKeamanan.enable2FA ? "Aktif" : "Nonaktif"}
                        </span>
                        <button
                        type="button"
                        onClick={() => setFormKeamanan({ ...formKeamanan, enable2FA: !formKeamanan.enable2FA })}
                        className={`w-12 h-6 rounded-full relative transition-colors ${formKeamanan.enable2FA ? "bg-[#6EB8BB]" : "bg-gray-200"}`}
                        >
                        <div className={`w-4.5 h-4.5 w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] transition-transform shadow-sm ${formKeamanan.enable2FA ? "translate-x-[26px]" : "translate-x-[3px]"}`} />
                        </button>
                    </div>
                    </div>

                    {/* Info note */}
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
                    <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                        Perubahan kata sandi akan membuat semua sesi aktif lainnya keluar secara otomatis. Pastikan Anda mengingat kata sandi baru sebelum menyimpan.
                    </p>
                    </div>
                </div>
                )}

                {/* ── TAB 2: NOTIFIKASI ── */}
                {activeTab === "notifikasi" && (
                <div className="p-5 space-y-4">
                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    <div className={CARD_HDR}>
                        <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Bell size={14} className="text-purple-500" />
                        </div>
                        <div>
                        <p className="text-sm font-bold text-gray-900">Saluran Notifikasi</p>
                        <p className="text-[11px] text-gray-400">Pilih cara Anda ingin menerima pemberitahuan aktivitas toko</p>
                        </div>
                    </div>

                    {/* Channel header */}
                    <div className="grid grid-cols-[1fr_90px_110px_100px] items-center px-5 py-3 bg-gray-50 border-b border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Aktivitas</p>
                        {["Email", "Push Web", "WhatsApp"].map(ch => (
                        <p key={ch} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">{ch}</p>
                        ))}
                    </div>

                    <div className="divide-y divide-gray-50">
                        {[
                        { key: "pesananBaru",     label: "Pesanan Masuk & Pembayaran",      desc: "Notifikasi setiap ada pesanan baru terkonfirmasi" },
                        { key: "chatPembeli",     label: "Pesan Chat dari Calon Pembeli",   desc: "Pesan masuk dari halaman produk atau toko" },
                        { key: "ulasanProduk",    label: "Ulasan & Review Pelanggan",       desc: "Review baru setelah pesanan selesai" },
                        { key: "laporanMingguan", label: "Laporan Performa Mingguan",       desc: "Ringkasan penjualan dikirim setiap Senin" },
                        ].map((row) => {
                        const state = formNotif[row.key as keyof typeof formNotif]
                        return (
                            <div key={row.key} className="grid grid-cols-[1fr_90px_110px_100px] items-center px-5 py-4 hover:bg-gray-50/50 transition-colors">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{row.label}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{row.desc}</p>
                            </div>
                            {(["email", "push", "wa"] as const).map(ch => {
                                const active = (state as any)[ch]
                                return (
                                <div key={ch} className="flex justify-center">
                                    <button
                                    type="button"
                                    onClick={() => toggleNotif(row.key as keyof typeof formNotif, ch)}
                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                        active ? "bg-[#6EB8BB] border-[#6EB8BB]" : "bg-white border-gray-200 hover:border-gray-300"
                                    }`}
                                    >
                                    {active && <Check size={11} strokeWidth={3} className="text-white" />}
                                    </button>
                                </div>
                                )
                            })}
                            </div>
                        )
                        })}
                    </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                    <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-600 leading-relaxed">
                        Notifikasi WhatsApp memerlukan nomor HP aktif yang terdaftar di profil toko Anda. Pastikan nomor sudah diverifikasi.
                    </p>
                    </div>
                </div>
                )}

                {/* ── TAB 3: PENGIRIMAN ── */}
                {activeTab === "pengiriman" && (
                <div className="p-5 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">

                    {/* Alamat & jadwal */}
                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    <div className={CARD_HDR}>
                        <div className="w-7 h-7 rounded-lg bg-cyan-50 flex items-center justify-center">
                        <MapPin size={14} className="text-cyan-500" />
                        </div>
                        <div>
                        <p className="text-sm font-bold text-gray-900">Lokasi Penjemputan Paket</p>
                        <p className="text-[11px] text-gray-400">Digunakan untuk kalkulasi ongkir dan pickup kurir</p>
                        </div>
                    </div>
                    <div className="p-5 space-y-4">
                        <div>
                        <label className={LABEL}>Alamat Lengkap Asal Toko</label>
                        <textarea
                            rows={3} value={formPengiriman.alamatAsal}
                            onChange={e => setFormPengiriman({ ...formPengiriman, alamatAsal: e.target.value })}
                            className={INPUT + " resize-none"}
                        />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className={LABEL}>Kode Pos</label>
                            <input
                            type="text" value={formPengiriman.kodePos}
                            onChange={e => setFormPengiriman({ ...formPengiriman, kodePos: e.target.value })}
                            className={INPUT} placeholder="53311"
                            />
                        </div>
                        <div>
                            <label className={LABEL + " flex items-center gap-1"}><Clock size={10} /> Jam Buka</label>
                            <input
                            type="time" value={formPengiriman.jadwalBuka}
                            onChange={e => setFormPengiriman({ ...formPengiriman, jadwalBuka: e.target.value })}
                            className={INPUT}
                            />
                        </div>
                        <div>
                            <label className={LABEL + " flex items-center gap-1"}><Clock size={10} /> Jam Tutup</label>
                            <input
                            type="time" value={formPengiriman.jadwalTutup}
                            onChange={e => setFormPengiriman({ ...formPengiriman, jadwalTutup: e.target.value })}
                            className={INPUT}
                            />
                        </div>
                        </div>

                        {/* Jam operasional preview */}
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#E6F7F8] border border-[#6EB8BB]/20">
                        <Clock size={13} className="text-[#6EB8BB] shrink-0" />
                        <p className="text-xs text-[#5AA4A7] font-semibold">
                            Toko buka: <span className="font-black">{formPengiriman.jadwalBuka} – {formPengiriman.jadwalTutup} WIB</span>
                        </p>
                        </div>
                    </div>
                    </div>

                    {/* Kurir */}
                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    <div className={CARD_HDR}>
                        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                        <Truck size={14} className="text-amber-500" />
                        </div>
                        <div>
                        <p className="text-sm font-bold text-gray-900">Jasa Ekspedisi</p>
                        <p className="text-[11px] text-gray-400">Kurir aktif di area toko Anda</p>
                        </div>
                    </div>
                    <div className="p-4 space-y-2">
                        {[
                        { id: "jne",     label: "JNE Express",     sub: "Reguler, YES, OKE" },
                        { id: "jnt",     label: "J&T Express",     sub: "Reguler, Cargo"    },
                        { id: "pos",     label: "POS Indonesia",   sub: "Paket Kilat"       },
                        { id: "sicepat", label: "SiCepat Ekspres", sub: "BEST, REG, Gokil"  },
                        ].map(({ id, label, sub }) => {
                        const checked = formPengiriman.kurir[id as keyof typeof formPengiriman.kurir]
                        return (
                            <div
                            key={id}
                            onClick={() => toggleKurir(id as any)}
                            className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${
                                checked ? "bg-[#E6F7F8] border-[#6EB8BB]/30" : "bg-white border-gray-100 hover:border-gray-200"
                            }`}
                            >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                                checked ? "bg-[#6EB8BB] border-[#6EB8BB]" : "bg-white border-gray-300"
                            }`}>
                                {checked && <Check size={11} strokeWidth={3} className="text-white" />}
                            </div>
                            <div className="min-w-0">
                                <p className={`text-sm font-bold ${checked ? "text-[#5AA4A7]" : "text-gray-700"}`}>{label}</p>
                                <p className="text-[10px] text-gray-400">{sub}</p>
                            </div>
                            {checked && (
                                <span className="ml-auto text-[9px] font-black text-[#6EB8BB] bg-white border border-[#6EB8BB]/30 px-1.5 py-0.5 rounded-full">Aktif</span>
                            )}
                            </div>
                        )
                        })}
                    </div>
                    </div>
                </div>
                )}

                {/* ── TAB 4: KEBIJAKAN ── */}
                {activeTab === "kebijakan" && (
                <div className="p-5 space-y-4">
                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    <div className={CARD_HDR}>
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <FileText size={14} className="text-indigo-500" />
                        </div>
                        <div>
                        <p className="text-sm font-bold text-gray-900">Peraturan & Aturan Toko</p>
                        <p className="text-[11px] text-gray-400">Kebijakan ini akan ditampilkan kepada pembeli di halaman toko</p>
                        </div>
                    </div>
                    <div className="p-5 space-y-5">
                        <div>
                        <label className={LABEL}>Catatan Otomatis untuk Pembeli</label>
                        <textarea
                            rows={3} value={formKebijakan.catatanToko}
                            onChange={e => setFormKebijakan({ ...formKebijakan, catatanToko: e.target.value })}
                            className={INPUT + " resize-none"}
                            placeholder="Pesan yang muncul otomatis di detail produk…"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Muncul di halaman detail produk sebagai catatan penting dari penjual.</p>
                        </div>
                        <div>
                        <label className={LABEL}>Kebijakan Retur & Pengembalian Dana</label>
                        <textarea
                            rows={3} value={formKebijakan.kebijakanRetur}
                            onChange={e => setFormKebijakan({ ...formKebijakan, kebijakanRetur: e.target.value })}
                            className={INPUT + " resize-none"}
                            placeholder="Syarat dan ketentuan retur barang…"
                        />
                        </div>
                        <div className="max-w-xs">
                        <label className={LABEL}>Minimal Transaksi (Rp)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 select-none">Rp</span>
                            <input
                            type="number" value={formKebijakan.minOrder}
                            onChange={e => setFormKebijakan({ ...formKebijakan, minOrder: e.target.value })}
                            className={INPUT + " pl-10"}
                            />
                        </div>
                        {formKebijakan.minOrder && Number(formKebijakan.minOrder) > 0 && (
                            <p className="text-[10px] text-[#6EB8BB] font-semibold mt-1">
                            Minimum order: Rp {Number(formKebijakan.minOrder).toLocaleString("id-ID")}
                            </p>
                        )}
                        {(!formKebijakan.minOrder || formKebijakan.minOrder === "0") && (
                            <p className="text-[10px] text-gray-400 mt-1">Isi "0" jika tidak ada batasan minimal order.</p>
                        )}
                        </div>
                    </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                    <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-indigo-600 leading-relaxed">
                        Kebijakan toko yang jelas dan transparan meningkatkan kepercayaan pembeli dan mengurangi potensi sengketa transaksi.
                    </p>
                    </div>
                </div>
                )}

                {/* ── Save bar ── */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                <p className="text-xs text-gray-400 hidden sm:block">
                    {saved
                    ? <span className="text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle2 size={13} /> Pengaturan berhasil disimpan</span>
                    : "Pastikan semua pengaturan sudah sesuai sebelum menyimpan"}
                </p>
                <div className="flex items-center gap-2 ml-auto">
                    <button
                    type="button"
                    onClick={() => router.push("/admin/dashboard")}
                    className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-white transition-all bg-white"
                    >
                    Batal
                    </button>
                    <button
                    type="submit"
                    disabled={isSaving || saved}
                    className={`inline-flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 disabled:opacity-60 ${
                        saved
                        ? "bg-emerald-500 text-white"
                        : "bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white shadow-[#6EB8BB]/30"
                    }`}
                    >
                    {isSaving && <Loader2 size={15} className="animate-spin" />}
                    {saved    && <Check size={15} />}
                    {saved ? "Tersimpan!" : isSaving ? "Menyimpan…" : "Simpan Pengaturan"}
                    </button>
                </div>
                </div>
            </div>
            </form>
        </div>
        </main>
    )
    }