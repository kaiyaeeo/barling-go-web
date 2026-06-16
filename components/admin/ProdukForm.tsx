    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { Loader2, Check, Tag, FileText, Package, ArrowLeft, Trash2 } from "lucide-react"

    type InitialData = {
    id: string
    name: string
    description: string
    price: number
    discount_price: number | null
    stock: number
    is_active: boolean
    }

    export default function ProdukForm({ initialData }: { initialData: InitialData }) {
    const router = useRouter()
    const supabase = createClient()

    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false) // State untuk loading hapus
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price || 0,
        discount_price: initialData.discount_price || 0,
        stock: initialData.stock || 0,
        is_active: initialData.is_active ?? true,
    })

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value, type } = e.target
        setFormData((p) => ({
        ...p,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }))
    }

    // ── Fungsi Update Data ──
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name.trim()) { setError("Nama produk wajib diisi."); return }
        
        setSaving(true)
        setError(null)

        const { error: eDb } = await supabase
        .from("products")
        .update({
            name: formData.name,
            description: formData.description,
            price: Number(formData.price),
            discount_price: Number(formData.discount_price) || null,
            stock: Number(formData.stock),
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
        })
        .eq("id", initialData.id)

        setSaving(false)

        if (eDb) { 
        setError("Gagal memperbarui produk: " + eDb.message); 
        return 
        }

        setSaved(true)
        setTimeout(() => {
        router.refresh()
        router.back()
        }, 1000)
    }

    // ── Fitur Hard Delete (Hapus Permanen) ──
    const handleDelete = async () => {
        const konfirmasi = confirm(`Apakah Anda yakin ingin menghapus produk "${initialData.name}" secara permanen? Tindakan ini tidak dapat dibatalkan.`);
        if (!konfirmasi) return

        setDeleting(true)
        setError(null)

        const { error: eDelete } = await supabase
        .from("products")
        .delete()
        .eq("id", initialData.id)

        setDeleting(false)

        if (eDelete) {
        setError("Gagal menghapus produk: " + eDelete.message)
        } else {
        alert("Produk berhasil dihapus secara permanen.")
        router.refresh()
        router.push("/admin/etalase") // Pindah ke etalase setelah terhapus
        }
    }

    return (
        <div className="max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
            <button 
            type="button"
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors bg-white shadow-sm"
            >
            <ArrowLeft size={18} />
            </button>
            <div>
            <h1 className="text-xl font-black text-gray-900">Edit Produk</h1>
            <p className="text-sm text-gray-400 mt-0.5">Edit informasi untuk: <span className="font-semibold text-gray-600">{initialData.name}</span></p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>
            )}

            {/* Informasi Produk */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Tag size={16} className="text-[#6EB8BB]" /> Informasi Produk
            </h2>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Nama Produk *</label>
                <input 
                name="name" value={formData.name} onChange={handleChange} required
                placeholder="Contoh: Keripik Tempe Khas Banyumas"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]" 
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Deskripsi Lengkap *</label>
                <textarea 
                name="description" value={formData.description} onChange={handleChange} rows={5} required
                placeholder="Jelaskan detail produk, bahan, ukuran, atau rasanya..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] resize-none" 
                />
            </div>
            </div>

            {/* Harga & Stok */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Package size={16} className="text-[#6EB8BB]" /> Harga & Ketersediaan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Harga Asli (Rp) *</label>
                <input 
                    type="number" name="price" value={formData.price} onChange={handleChange} min="0" required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]" 
                />
                </div>
                <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Harga Diskon (Rp)</label>
                <input 
                    type="number" name="discount_price" value={formData.discount_price} onChange={handleChange} min="0"
                    placeholder="Kosongkan jika tidak ada"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]" 
                />
                </div>
                <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Sisa Stok *</label>
                <input 
                    type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]" 
                />
                </div>
            </div>
            </div>

            {/* Publish toggle */}
            <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-5 shadow-sm">
            <label className="flex items-center gap-4 cursor-pointer">
                <input 
                type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} 
                className="w-5 h-5 accent-[#6EB8BB] cursor-pointer" 
                />
                <div>
                <p className="text-sm font-bold text-gray-900">Tampilkan Produk (Aktif)</p>
                <p className="text-xs text-gray-500 mt-0.5">Centang ini agar produk langsung tampil di etalase toko.</p>
                </div>
            </label>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            {/* Tombol Hapus Permanen ditaruh di paling kiri */}
            <button
                type="button"
                onClick={handleDelete}
                disabled={saving || deleting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 border border-red-200 hover:bg-red-50 text-red-600 font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
            >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Hapus Produk
            </button>

            <div className="flex gap-3 w-full sm:w-auto justify-end">
                <button 
                type="button" 
                onClick={() => router.back()}
                className="flex-1 sm:flex-none px-6 py-3.5 border border-gray-200 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-50 transition-all"
                >
                Batal
                </button>
                <button 
                type="submit" 
                disabled={saving || deleting || saved}
                className={`flex-1 sm:flex-none px-8 py-3.5 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                    saved ? "bg-green-500 text-white" : "bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white disabled:opacity-60 hover:-translate-y-0.5"
                }`}
                >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saved   && <Check size={16} />}
                {saved ? "Berhasil Disimpan!" : saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </div>
            </div>
        </form>
        </div>
    )
    }