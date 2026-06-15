    "use client"

    import { useState } from "react"
    import { 
    Loader2, Save, Check, RefreshCw, Download, 
    CheckCircle, XCircle, Zap, Clock 
    } from "lucide-react"

    export default function BackupDataTab() {
    const [isSaving, setIsSaving] = useState(false)

    // State khusus untuk form Backup
    const [formBackup, setFormBackup] = useState({
        autoBackup: true, 
        frekuensi: "Harian (Rekomendasi)", 
        waktu: "02:00 AM", 
        lokasi: "Google Cloud Storage",
        manualOptions: { sql: true, media: true, log: false }
    })

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setTimeout(() => {
        setIsSaving(false)
        alert("Pengaturan Backup Data berhasil disimpan!")
        }, 800)
    }

    const toggleManualBackup = (key: keyof typeof formBackup.manualOptions) => {
        setFormBackup(prev => ({ 
        ...prev, 
        manualOptions: { ...prev.manualOptions, [key]: !prev.manualOptions[key] } 
        }))
    }

    return (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 animate-in fade-in duration-300">
        
        {/* KIRI: Konfigurasi Backup */}
        <div className="space-y-6">
            
            {/* Backup Otomatis */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-[#6EB8BB] flex items-center justify-center">
                    <RefreshCw size={16} />
                </div>
                <h2 className="text-sm font-bold text-gray-900">Backup Otomatis</h2>
                </div>
                <button 
                type="button" 
                onClick={() => setFormBackup({...formBackup, autoBackup: !formBackup.autoBackup})} 
                className={`w-11 h-6 rounded-full relative transition-colors ${formBackup.autoBackup ? "bg-[#6EB8BB]" : "bg-gray-300"}`}
                >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formBackup.autoBackup ? "left-6" : "left-1"}`} />
                </button>
            </div>

            <div className="space-y-4">
                <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Frekuensi Backup</label>
                <select 
                    value={formBackup.frekuensi} 
                    onChange={e => setFormBackup({...formBackup, frekuensi: e.target.value})} 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:border-[#6EB8BB]"
                >
                    <option>Harian (Rekomendasi)</option>
                    <option>Mingguan</option>
                    <option>Bulanan</option>
                </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Waktu Eksekusi</label>
                    <input 
                    type="text" 
                    value={formBackup.waktu} 
                    onChange={e => setFormBackup({...formBackup, waktu: e.target.value})} 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6EB8BB]" 
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Lokasi Penyimpanan</label>
                    <select 
                    value={formBackup.lokasi} 
                    onChange={e => setFormBackup({...formBackup, lokasi: e.target.value})} 
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:border-[#6EB8BB]"
                    >
                    <option>Google Cloud Storage</option>
                    <option>AWS S3</option>
                    <option>Lokal Server</option>
                    </select>
                </div>
                </div>
            </div>
            </div>

            {/* Backup Manual */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Download size={16} />
                </div>
                <h2 className="text-sm font-bold text-gray-900">Backup Manual</h2>
            </div>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                Lakukan pencadangan data secara instan sebelum melakukan pembaruan besar pada sistem.
            </p>
            
            <div className="space-y-3 mb-6">
                {/* Opsi SQL */}
                <div onClick={() => toggleManualBackup('sql')} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formBackup.manualOptions.sql ? 'border-[#6EB8BB] bg-green-50/30' : 'border-gray-200 bg-white'}`}>
                <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border shrink-0 ${formBackup.manualOptions.sql ? 'bg-[#6EB8BB] border-[#6EB8BB] text-white' : 'bg-white border-gray-300'}`}>
                    {formBackup.manualOptions.sql && <Check size={12} strokeWidth={3} />}
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-800">Basis Data (SQL)</p>
                    <p className="text-xs text-gray-500 mt-0.5">Seluruh tabel user, transaksi, dan konten.</p>
                </div>
                </div>

                {/* Opsi Media */}
                <div onClick={() => toggleManualBackup('media')} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formBackup.manualOptions.media ? 'border-[#6EB8BB] bg-green-50/30' : 'border-gray-200 bg-white'}`}>
                <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border shrink-0 ${formBackup.manualOptions.media ? 'bg-[#6EB8BB] border-[#6EB8BB] text-white' : 'bg-white border-gray-300'}`}>
                    {formBackup.manualOptions.media && <Check size={12} strokeWidth={3} />}
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-800">Media & File</p>
                    <p className="text-xs text-gray-500 mt-0.5">Foto wisata, produk UMKM, dan aset UI.</p>
                </div>
                </div>

                {/* Opsi Log */}
                <div onClick={() => toggleManualBackup('log')} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formBackup.manualOptions.log ? 'border-[#6EB8BB] bg-green-50/30' : 'border-gray-200 bg-white'}`}>
                <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border shrink-0 ${formBackup.manualOptions.log ? 'bg-[#6EB8BB] border-[#6EB8BB] text-white' : 'bg-white border-gray-300'}`}>
                    {formBackup.manualOptions.log && <Check size={12} strokeWidth={3} />}
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-800">Log Sistem & Aktivitas</p>
                    <p className="text-xs text-gray-500 mt-0.5">Riwayat audit admin dan log server.</p>
                </div>
                </div>
            </div>

            <button type="button" onClick={() => alert("Memulai proses pencadangan (backup) instan...")} className="w-full py-3 bg-[#9FCCCE] hover:bg-[#11331e] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Zap size={16} className="text-amber-400" /> Mulai Backup Sekarang
            </button>
            </div>
        </div>

        {/* KANAN: Riwayat Backup */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center"><Clock size={16} /></div>
                <h2 className="text-base font-bold text-gray-900">Riwayat Backup & Restorasi</h2>
            </div>
            <button type="button" className="text-sm font-semibold text-[#6EB8BB] flex items-center gap-1.5 hover:underline">
                <RefreshCw size={14} /> Refresh
            </button>
            </div>

            <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                    <th className="pb-3 font-semibold">Tanggal & Waktu</th>
                    <th className="pb-3 font-semibold text-center">Ukuran</th>
                    <th className="pb-3 font-semibold text-center">Tipe</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3"></th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                {[
                    { date: "14 Okt 2026", time: "02:00 WIB", size: "2.4 GB", type: "OTOMATIS", status: "Sukses" },
                    { date: "13 Okt 2026", time: "15:42 WIB", size: "1.8 GB", type: "MANUAL", status: "Sukses" },
                    { date: "13 Okt 2026", time: "02:00 WIB", size: "--", type: "OTOMATIS", status: "Gagal" },
                    { date: "12 Okt 2026", time: "02:00 WIB", size: "2.3 GB", type: "OTOMATIS", status: "Sukses" }
                ].map((row, idx) => (
                    <tr key={idx}>
                    <td className="py-4">
                        <p className="font-semibold text-gray-800">{row.date}</p>
                        <p className="text-xs text-gray-500">{row.time}</p>
                    </td>
                    <td className="py-4 text-center font-medium text-gray-600">{row.size}</td>
                    <td className="py-4 text-center">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${row.type === 'OTOMATIS' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {row.type}
                        </span>
                    </td>
                    <td className="py-4">
                        {row.status === "Sukses" ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-green-600"><CheckCircle size={14} /> Sukses</span>
                        ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-red-500"><XCircle size={14} /> Gagal</span>
                        )}
                    </td>
                    <td className="py-4 text-right">
                        {row.status === "Sukses" && (
                        <button type="button" className="text-[#6EB8BB] hover:bg-green-50 p-1.5 rounded-lg transition-colors" title="Unduh File Backup">
                            <Download size={16} />
                        </button>
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
            <p className="text-xs text-gray-500">Menampilkan 4 dari 158 backup data</p>
            <div className="flex gap-2">
                <button type="button" className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50">Sebelumnya</button>
                <button type="button" className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50">Selanjutnya</button>
            </div>
            </div>
        </div>

        {/* Tombol Simpan Tab Backup */}
        <div className="lg:col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
            <button type="button" className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold text-sm rounded-xl hover:bg-white transition-all">Batalkan Perubahan</button>
            <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-[#6EB8BB] text-white font-semibold text-sm rounded-xl hover:bg-[#9FCCCE] transition-all">
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan Perubahan
            </button>
        </div>
        </form>
    )
    }