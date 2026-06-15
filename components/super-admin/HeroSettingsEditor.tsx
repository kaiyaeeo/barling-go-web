    "use client"

    import { useState } from "react"
    import { Save, Loader2, Image as ImageIcon } from "lucide-react"

    export default function HeroSettingsEditor() {
    const [loading, setLoading] = useState(false)
    
    // Data default untuk Barling-GO
    const [formData, setFormData] = useState({
        title: "Jelajahi Pesona Barlingmascakep",
        subtitle: "Temukan destinasi wisata, kuliner lokal, dan oleh-oleh khas dari Banjarnegara, Purbalingga, Banyumas, Cilacap, dan Kebumen.",
    })

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        
        // Simulasi proses penyimpanan (bisa dihubungkan ke tabel settings Supabase nanti)
        setTimeout(() => {
        setLoading(false)
        alert("Pengaturan Hero Section berhasil disimpan!")
        }, 1000)
    }

    return (
        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <ImageIcon size={20} className="text-[#6EB8BB]" />
            Pengaturan Hero Section
        </h2>
        
        <div className="space-y-5">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul Utama (Headline)</label>
            <input 
                type="text" 
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] outline-none transition-all" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                required 
            />
            </div>
            
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Sub-judul (Deskripsi Singkat)</label>
            <textarea 
                rows={3} 
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] outline-none transition-all" 
                value={formData.subtitle} 
                onChange={e => setFormData({...formData, subtitle: e.target.value})} 
                required 
            />
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-end">
            <button 
                type="submit" 
                disabled={loading} 
                className="flex items-center gap-2 px-6 py-2.5 bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white font-bold rounded-xl transition-all disabled:opacity-70"
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Simpan Perubahan
            </button>
            </div>
        </div>
        </form>
    )
    }