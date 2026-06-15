    "use client"

    import { useState } from "react"
    import { Loader2, Save, Wallet, Server, Check } from "lucide-react"

    export default function PembayaranTab() {
    const [isSaving, setIsSaving] = useState(false)

    // State khusus untuk Tab Pembayaran dipindah ke sini
    const [formBayar, setFormBayar] = useState({
        komisi: "10", 
        biayaLayanan: "2.500", 
        minPenarikan: "50.000",
        isPpnActive: false, 
        provider: "Midtrans", 
        clientKey: "SB-Mid-client-XXXXX-XXXXX",
        serverKey: "SB-Mid-server-XXXXX-XXXXX", 
        isProduction: true,
        methods: { va: true, qris: true, ewallet: true, creditCard: false }
    })

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setTimeout(() => {
        setIsSaving(false)
        alert("Pengaturan Pembayaran & Komisi berhasil disimpan!")
        }, 800)
    }

    const toggleMethod = (key: keyof typeof formBayar.methods) => {
        setFormBayar(prev => ({ 
        ...prev, 
        methods: { ...prev.methods, [key]: !prev.methods[key] } 
        }))
    }

    return (
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
        
        {/* KIRI: Skema Komisi */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-8 h-8 rounded-lg bg-green-50 text-[#6EB8BB] flex items-center justify-center">
                <Wallet size={16} />
            </div>
            <h2 className="text-base font-bold text-gray-900">Skema Komisi & Biaya Layanan</h2>
            </div>

            <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Komisi Platform (%)</label>
            <div className="relative">
                <input type="text" value={formBayar.komisi} onChange={e => setFormBayar({...formBayar, komisi: e.target.value})} className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#6EB8BB]/20 focus:border-[#6EB8BB] outline-none" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Persentase yang dipotong dari setiap transaksi produk UMKM.</p>
            </div>

            <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Biaya Layanan per Transaksi (Rp)</label>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">Rp</span>
                <input type="text" value={formBayar.biayaLayanan} onChange={e => setFormBayar({...formBayar, biayaLayanan: e.target.value})} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#6EB8BB]/20 focus:border-[#6EB8BB] outline-none" />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Biaya tetap untuk biaya operasional sistem.</p>
            </div>

            <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Minimal Penarikan Saldo Mitra (Rp)</label>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">Rp</span>
                <input type="text" value={formBayar.minPenarikan} onChange={e => setFormBayar({...formBayar, minPenarikan: e.target.value})} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#6EB8BB]/20 focus:border-[#6EB8BB] outline-none" />
            </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between">
            <div>
                <p className="text-sm font-semibold text-gray-900">Biaya PPN 11%</p>
                <p className="text-xs text-gray-500 mt-0.5">Aktifkan kalkulasi pajak otomatis</p>
            </div>
            <button type="button" onClick={() => setFormBayar({...formBayar, isPpnActive: !formBayar.isPpnActive})} className={`w-11 h-6 rounded-full relative transition-colors ${formBayar.isPpnActive ? "bg-[#6EB8BB]" : "bg-gray-300"}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formBayar.isPpnActive ? "left-6" : "left-1"}`} />
            </button>
            </div>
        </div>

        {/* KANAN: Payment Gateway */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-8 h-8 rounded-lg bg-[#6EB8BB]/10 text-[#6EB8BB] flex items-center justify-center">
                <Server size={16} />
            </div>
            <h2 className="text-base font-bold text-gray-900">Konfigurasi Payment Gateway</h2>
            </div>

            <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Penyedia Layanan</label>
            <select value={formBayar.provider} onChange={e => setFormBayar({...formBayar, provider: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#6EB8BB]/20 focus:border-[#6EB8BB] outline-none appearance-none bg-white">
                <option value="Midtrans">Midtrans</option>
                <option value="Xendit">Xendit</option>
                <option value="Manual">Manual Transfer</option>
            </select>
            </div>

            <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Client Key</label>
            <input type="text" value={formBayar.clientKey} onChange={e => setFormBayar({...formBayar, clientKey: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#6EB8BB]/20 focus:border-[#6EB8BB] outline-none font-mono text-gray-600" />
            </div>

            <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Server Key</label>
            <input type="password" value={formBayar.serverKey} onChange={e => setFormBayar({...formBayar, serverKey: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#6EB8BB]/20 focus:border-[#6EB8BB] outline-none font-mono text-gray-600" />
            </div>

            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 flex items-center justify-between">
            <div>
                <p className="text-sm font-bold text-gray-800">Mode Production / Sandbox</p>
                <p className="text-xs text-gray-500 mt-0.5">Status saat ini: <span className={formBayar.isProduction ? "text-[#6EB8BB] font-semibold" : "text-amber-600 font-semibold"}>{formBayar.isProduction ? "Production" : "Sandbox"}</span></p>
            </div>
            <button type="button" onClick={() => setFormBayar({...formBayar, isProduction: !formBayar.isProduction})} className={`w-11 h-6 rounded-full relative transition-colors ${formBayar.isProduction ? "bg-[#6EB8BB]" : "bg-gray-300"}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formBayar.isProduction ? "left-6" : "left-1"}`} />
            </button>
            </div>

            <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">Metode Pembayaran Aktif</label>
            <div className="grid grid-cols-2 gap-3">
                {/* VA */}
                <div onClick={() => toggleMethod('va')} className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${formBayar.methods.va ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${formBayar.methods.va ? 'bg-[#6EB8BB] text-white' : 'bg-white border border-gray-300'}`}>
                    {formBayar.methods.va && <Check size={14} strokeWidth={3} />}
                </div>
                <span className="text-sm font-medium text-gray-700">Transfer Bank (VA)</span>
                </div>
                {/* QRIS */}
                <div onClick={() => toggleMethod('qris')} className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${formBayar.methods.qris ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${formBayar.methods.qris ? 'bg-[#6EB8BB] text-white' : 'bg-white border border-gray-300'}`}>
                    {formBayar.methods.qris && <Check size={14} strokeWidth={3} />}
                </div>
                <span className="text-sm font-medium text-gray-700">QRIS</span>
                </div>
                {/* E-Wallet */}
                <div onClick={() => toggleMethod('ewallet')} className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${formBayar.methods.ewallet ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${formBayar.methods.ewallet ? 'bg-[#6EB8BB] text-white' : 'bg-white border border-gray-300'}`}>
                    {formBayar.methods.ewallet && <Check size={14} strokeWidth={3} />}
                </div>
                <span className="text-sm font-medium text-gray-700">E-Wallet (Gopay/OVO)</span>
                </div>
                {/* Kartu Kredit */}
                <div onClick={() => toggleMethod('creditCard')} className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${formBayar.methods.creditCard ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${formBayar.methods.creditCard ? 'bg-[#6EB8BB] text-white' : 'bg-white border border-gray-300'}`}>
                    {formBayar.methods.creditCard && <Check size={14} strokeWidth={3} />}
                </div>
                <span className="text-sm font-medium text-gray-700">Kartu Kredit</span>
                </div>
            </div>
            </div>
        </div>

        {/* Tombol Aksi */}
        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold text-sm rounded-xl hover:bg-white transition-all flex items-center gap-2">
            <Server size={16} className="text-gray-400" /> Uji Koneksi Gateway
            </button>
            <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-[#6EB8BB] hover:bg-[#9FCCCE] text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-70">
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan Konfigurasi
            </button>
        </div>
        
        {/* Footer Banner */}
        <div className="md:col-span-2 mt-2 bg-gray-900 rounded-2xl p-6 relative overflow-hidden flex items-end min-h-[120px] shadow-sm">
            {/* Background Image Overlay */}
            <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1000')] bg-cover bg-center mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
            <p className="relative z-10 text-sm font-medium text-gray-300 max-w-xl leading-relaxed">
            Sistem pembayaran Barling-GO terintegrasi dengan standar keamanan tinggi untuk menjamin kenyamanan mitra UMKM.
            </p>
        </div>

        </form>
    )
    }