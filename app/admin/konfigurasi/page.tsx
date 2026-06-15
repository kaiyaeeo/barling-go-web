    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import { 
    Save, Bell, Lock, Loader2, Truck, FileText, 
    Check, Shield, MapPin, Clock, Smartphone 
    } from "lucide-react"

    type SubTab = "keamanan" | "notifikasi" | "pengiriman" | "kebijakan"

    export default function AdminPengaturanKompleksPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<SubTab>("keamanan")
    const [isSaving, setIsSaving] = useState(false)

    // State 1: Keamanan & Akun
    const [formKeamanan, setFormKeamanan] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
        enable2FA: false
    })

    // State 2: Preferensi Notifikasi (Multi-channel)
    const [formNotif, setFormNotif] = useState({
        pesananBaru: { email: true, push: true, wa: true },
        chatPembeli: { email: false, push: true, wa: true },
        ulasanProduk: { email: true, push: false, wa: false },
        laporanMingguan: { email: true, push: false, wa: false }
    })

    // State 3: Pengiriman & Lokasi Penjemputan
    const [formPengiriman, setFormPengiriman] = useState({
        alamatAsal: "Jl. Jenderal Soedirman No. 45, Purbalingga, Jawa Tengah",
        kodePos: "53311",
        jadwalBuka: "08:00",
        jadwalTutup: "17:00",
        kurir: { jne: true, jnt: true, pos: false, sicepat: true }
    })

    // State 4: Kebijakan Toko
    const [formKebijakan, setFormKebijakan] = useState({
        catatanToko: "Mohon lakukan video unboxing saat membuka paket untuk mempermudah proses klaim jika terjadi kerusakan.",
        kebijakanRetur: "Retur barang maksimal 2 hari setelah produk diterima, ongkir ditanggung oleh pembeli kecuali kesalahan dari pihak merchant.",
        minOrder: "0"
    })

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        
        setTimeout(() => {
        setIsSaving(false)
        alert(`Pengaturan ${activeTab.toUpperCase()} merchant berhasil diperbarui!`)
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

    return (
        <main className="min-h-screen bg-gray-50/50 p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
            
            {/* Header */}
            <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Konfigurasi Toko</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola operasional, sistem pengiriman, integrasi kurir, dan keamanan akun merchant Anda.</p>
            </div>

            {/* Sub-Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6 gap-2 overflow-x-auto">
            {[
                { id: "keamanan", label: "Keamanan Akun", icon: Lock },
                { id: "notifikasi", label: "Notifikasi", icon: Bell },
                { id: "pengiriman", label: "Pengiriman & Lokasi", icon: Truck },
                { id: "kebijakan", label: "Kebijakan Toko", icon: FileText },
            ].map((tab) => {
                const Icon = tab.icon
                return (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as SubTab)}
                    className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                        ? "border-[#6EB8BB] text-[#6EB8BB]" 
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                    <Icon size={16} />
                    {tab.label}
                </button>
                )
            })}
            </div>

            {/* Main Content Form */}
            <form onSubmit={handleSave} className="space-y-6">
            
            {/* TAB 1: KEAMANAN & AKUN */}
            {activeTab === "keamanan" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                    <Shield size={18} className="text-[#6EB8BB]" /> Perbarui Kata Sandi
                    </h2>
                    <div className="space-y-4 max-w-xl">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password Lama</label>
                        <input type="password" value={formKeamanan.oldPassword} onChange={e => setFormKeamanan({...formKeamanan, oldPassword: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#6EB8BB]/20 outline-none" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password Baru</label>
                        <input type="password" value={formKeamanan.newPassword} onChange={e => setFormKeamanan({...formKeamanan, newPassword: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#6EB8BB]/20 outline-none" />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password Baru</label>
                        <input type="password" value={formKeamanan.confirmPassword} onChange={e => setFormKeamanan({...formKeamanan, confirmPassword: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#6EB8BB]/20 outline-none" />
                        </div>
                    </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
                    <div className="flex gap-3">
                    <div className="w-10 h-10 bg-green-50 text-[#6EB8BB] rounded-full flex items-center justify-center shrink-0"><Smartphone size={18} /></div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">Otentikasi Dua Faktor (2FA)</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Amankan akun dari akses mencurigakan dengan verifikasi kode OTP tambahan.</p>
                    </div>
                    </div>
                    <button type="button" onClick={() => setFormKeamanan({...formKeamanan, enable2FA: !formKeamanan.enable2FA})} className={`w-11 h-6 rounded-full relative transition-colors ${formKeamanan.enable2FA ? "bg-[#6EB8BB]" : "bg-gray-300"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formKeamanan.enable2FA ? "left-6" : "left-1"}`} />
                    </button>
                </div>
                </div>
            )}

            {/* TAB 2: NOTIFIKASI MULTI-CHANNEL */}
            {activeTab === "notifikasi" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 animate-in fade-in duration-200">
                <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                    <Bell size={18} className="text-[#6EB8BB]" /> Pengaturan Saluran Notifikasi
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase font-bold">
                        <th className="pb-3">Aktivitas Toko</th>
                        <th className="pb-3 text-center">Email</th>
                        <th className="pb-3 text-center">Push Notif (Web)</th>
                        <th className="pb-3 text-center">WhatsApp OTP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                        {[
                        { key: "pesananBaru", label: "Pesanan Masuk & Pembayaran Terkonfirmasi" },
                        { key: "chatPembeli", label: "Pesan Chat Baru dari Calon Pembeli" },
                        { key: "ulasanProduk", label: "Ulasan / Review Baru dari Pelanggan" },
                        { key: "laporanMingguan", label: "Ringkasan Laporan Performa Toko Mingguan" },
                        ].map((row) => (
                        <tr key={row.key}>
                            <td className="py-4 text-gray-900 text-sm font-semibold">{row.label}</td>
                            {["email", "push", "wa"].map((channel) => {
                            const active = (formNotif[row.key as keyof typeof formNotif] as any)[channel]
                            return (
                                <td key={channel} className="py-4 text-center">
                                <button 
                                    type="button" 
                                    onClick={() => toggleNotif(row.key as keyof typeof formNotif, channel as any)}
                                    className={`w-5 h-5 mx-auto rounded border flex items-center justify-center transition-all ${
                                    active ? "bg-[#6EB8BB] border-[#6EB8BB] text-white" : "bg-white border-gray-300"
                                    }`}
                                >
                                    {active && <Check size={12} strokeWidth={3} />}
                                </button>
                                </td>
                            )
                            })}
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </div>
            )}

            {/* TAB 3: PENGIRIMAN & LOKASI */}
            {activeTab === "pengiriman" && (
                <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-6 animate-in fade-in duration-200">
                {/* Alamat & Operasional */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                    <MapPin size={18} className="text-[#6EB8BB]" /> Detail Penjemputan Paket Kurir
                    </h2>
                    <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat Lengkap Asal Toko (Untuk Hitung Ongkir)</label>
                    <textarea rows={3} value={formPengiriman.alamatAsal} onChange={e => setFormPengiriman({...formPengiriman, alamatAsal: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#6EB8BB]/20 outline-none resize-none" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode Pos</label>
                        <input type="text" value={formPengiriman.kodePos} onChange={e => setFormPengiriman({...formPengiriman, kodePos: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#6EB8BB]/20 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1"><Clock size={14}/> Jam Buka</label>
                        <input type="time" value={formPengiriman.jadwalBuka} onChange={e => setFormPengiriman({...formPengiriman, jadwalBuka: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#6EB8BB]/20 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1"><Clock size={14}/> Jam Tutup</label>
                        <input type="time" value={formPengiriman.jadwalTutup} onChange={e => setFormPengiriman({...formPengiriman, jadwalTutup: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#6EB8BB]/20 outline-none" />
                    </div>
                    </div>
                </div>

                {/* Kurir yang Didukung */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Jasa Ekspedisi Aktif</h3>
                    <p className="text-xs text-gray-400 leading-normal">Pilih kurir logistik yang tersedia di areamu untuk menjemput paket pesanan.</p>
                    <div className="space-y-2.5 pt-2">
                    {[
                        { id: "jne", label: "JNE Express" },
                        { id: "jnt", label: "J&T Express" },
                        { id: "pos", label: "POS Indonesia" },
                        { id: "sicepat", label: "SiCepat Ekspres" },
                    ].map((k) => {
                        const checked = formPengiriman.kurir[k.id as keyof typeof formPengiriman.kurir]
                        return (
                        <div key={k.id} onClick={() => toggleKurir(k.id as any)} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${checked ? 'bg-green-50/50 border-green-200' : 'bg-white border-gray-200'}`}>
                            <div className={`w-4 h-4 rounded flex items-center justify-center ${checked ? 'bg-[#6EB8BB] text-white' : 'bg-white border border-gray-300'}`}>
                            {checked && <Check size={12} strokeWidth={3} />}
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{k.label}</span>
                        </div>
                        )
                    })}
                    </div>
                </div>
                </div>
            )}

            {/* TAB 4: KEBIJAKAN TOKO */}
            {activeTab === "kebijakan" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 animate-in fade-in duration-200">
                <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                    <FileText size={18} className="text-[#6EB8BB]" /> Peraturan & Aturan Toko
                </h2>
                <div className="space-y-5">
                    <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Catatan Otomatis untuk Pembeli (Muncul di Detail Produk)</label>
                    <textarea rows={3} value={formKebijakan.catatanToko} onChange={e => setFormKebijakan({...formKebijakan, catatanToko: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#6EB8BB]/20 outline-none" />
                    </div>
                    <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kebijakan Pengembalian Dana / Retur Barang</label>
                    <textarea rows={3} value={formKebijakan.kebijakanRetur} onChange={e => setFormKebijakan({...formKebijakan, kebijakanRetur: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#6EB8BB]/20 outline-none" />
                    </div>
                    <div className="max-w-xs">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Minimal Transaksi Pembelian (Rp)</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">Rp</span>
                        <input type="number" value={formKebijakan.minOrder} onChange={e => setFormKebijakan({...formKebijakan, minOrder: e.target.value})} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#6EB8BB]/20 outline-none" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Isi "0" jika tidak ada batasan minimal order pembeli.</p>
                    </div>
                </div>
                </div>
            )}

            {/* Form Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => router.push("/admin/dashboard")} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-all">
                Batal
                </button>
                <button 
                type="submit" 
                disabled={isSaving} 
                className="flex items-center gap-2 px-8 py-2.5 bg-[#6EB8BB] hover:bg-[#9FCCCE] text-white font-bold text-sm rounded-xl transition-all disabled:opacity-70 shadow-sm"
                >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
                </button>
            </div>

            </form>
        </div>
        </main>
    )
    }