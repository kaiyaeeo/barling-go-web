    "use client"

    import { useState, useEffect, useRef } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { Loader2, UploadCloud, ArrowLeft, Package, Tag, DollarSign, Archive, FileText, ImagePlus, CheckCircle2, X, ChevronRight } from "lucide-react"

    export default function TambahProdukPage() {
    const router = useRouter()
    const supabase = createClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<any[]>([])
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        price: "",
        stock: "",
        description: ""
    })

    useEffect(() => {
        async function fetchCategories() {
        const { data } = await supabase.from("categories").select("id, name").eq("type", "oleh-oleh")
        if (data) setCategories(data)
        }
        fetchCategories()
    }, [])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        setImageFile(file)
        if (file) {
        const url = URL.createObjectURL(file)
        setImagePreview(url)
        } else {
        setImagePreview(null)
        }
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrorMsg(null)

        try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("User tidak ditemukan, silakan login ulang.")

        let imageUrls: string[] = []

        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `product-images/${fileName}`

            const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(filePath, imageFile)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
            .from("products")
            .getPublicUrl(filePath)

            imageUrls.push(publicUrl)
        }

        const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()

        const { error: insertError } = await supabase.from("products").insert({
            name: formData.name,
            slug: slug,
            category_id: formData.category_id,
            price: Number(formData.price),
            stock: Number(formData.stock),
            description: formData.description,
            images: imageUrls,
            seller_id: user.id,
            is_active: true
        })

        if (insertError) throw insertError

        setSuccess(true)
        setTimeout(() => router.push("/admin/etalase"), 1800)

        } catch (error: any) {
        setErrorMsg(error.message)
        } finally {
        setLoading(false)
        }
    }

    const isFormValid = formData.name && formData.category_id && formData.price && formData.stock && formData.description

    // ── Success overlay ──
    if (success) {
        return (
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
            <div className="bg-white rounded-2xl border border-gray-100 p-10 flex flex-col items-center gap-4 max-w-sm w-full mx-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <div>
                <p className="text-lg font-bold text-gray-900">Produk Berhasil Ditambahkan!</p>
                <p className="text-sm text-gray-400 mt-1">Mengalihkan ke halaman etalase…</p>
            </div>
            <div className="w-32 h-1 bg-gray-100 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-[#6EB8BB] rounded-full animate-[progress_1.8s_linear_forwards]" />
            </div>
            </div>
        </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F5F5F5] pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

            {/* ── Breadcrumb & header ── */}
            <div className="mb-6">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                <button onClick={() => router.push("/admin/produk")} className="hover:text-gray-600 transition-colors">Produk Saya</button>
                <ChevronRight size={12} />
                <span className="text-gray-600 font-medium">Tambah Produk</span>
            </div>
            <div className="flex items-center gap-3">
                <button
                onClick={() => router.back()}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                <ArrowLeft size={16} />
                </button>
                <div>
                <p className="text-xs font-semibold text-[#6EB8BB] uppercase tracking-widest mb-0.5">Manajemen Produk</p>
                <h1 className="text-xl font-bold text-gray-900">Tambah Produk Baru</h1>
                </div>
            </div>
            </div>

            {/* ── Error banner ── */}
            {errorMsg && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">
                <X size={16} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
                <button onClick={() => setErrorMsg(null)} className="ml-auto shrink-0 text-red-400 hover:text-red-600">
                <X size={14} />
                </button>
            </div>
            )}

            <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── Left column: main fields ── */}
                <div className="lg:col-span-2 space-y-4">

                {/* Informasi Dasar */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-[#E6F7F8] flex items-center justify-center">
                        <Package size={14} className="text-[#6EB8BB]" />
                    </div>
                    <p className="text-sm font-bold text-gray-800">Informasi Dasar</p>
                    </div>
                    <div className="p-5 space-y-4">
                    {/* Nama Produk */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                        Nama Produk <span className="text-red-400">*</span>
                        </label>
                        <input
                        required
                        type="text"
                        maxLength={100}
                        placeholder="Contoh: Keripik Tempe Rohani 250gr"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] bg-gray-50 placeholder:text-gray-300 transition-all"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <p className="text-[10px] text-gray-400 text-right">{formData.name.length}/100 karakter</p>
                    </div>

                    {/* Deskripsi */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                        Deskripsi Produk <span className="text-red-400">*</span>
                        </label>
                        <textarea
                        required
                        rows={5}
                        placeholder="Ceritakan detail produk Anda: bahan, ukuran, keunggulan, cara penyimpanan…"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] bg-gray-50 placeholder:text-gray-300 transition-all resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <p className="text-[10px] text-gray-400">{formData.description.length} karakter</p>
                    </div>
                    </div>
                </div>

                {/* Kategori */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Tag size={14} className="text-purple-500" />
                    </div>
                    <p className="text-sm font-bold text-gray-800">Kategori</p>
                    </div>
                    <div className="p-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                        Pilih Kategori <span className="text-red-400">*</span>
                        </label>
                        <select
                        required
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] bg-gray-50 text-gray-700 transition-all appearance-none"
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        >
                        <option value="">— Pilih Kategori Produk —</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                        </select>
                        <p className="text-[10px] text-gray-400">Kategori membantu pembeli menemukan produk lebih mudah.</p>
                    </div>
                    </div>
                </div>

                {/* Harga & Stok */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <DollarSign size={14} className="text-emerald-500" />
                    </div>
                    <p className="text-sm font-bold text-gray-800">Harga & Stok</p>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Harga */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                        Harga Jual <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 select-none">Rp</span>
                        <input
                            required
                            type="number"
                            min="0"
                            placeholder="0"
                            className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] bg-gray-50 transition-all"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                        </div>
                        {formData.price && (
                        <p className="text-[10px] text-[#6EB8BB] font-medium">
                            Rp {Number(formData.price).toLocaleString("id-ID")}
                        </p>
                        )}
                    </div>

                    {/* Stok */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                        Jumlah Stok <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                        <Archive size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            required
                            type="number"
                            min="0"
                            placeholder="0"
                            className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] bg-gray-50 transition-all"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        />
                        </div>
                        {formData.stock && (
                        <p className={`text-[10px] font-medium ${Number(formData.stock) <= 5 ? "text-amber-500" : "text-emerald-500"}`}>
                            {Number(formData.stock) === 0 ? "⚠️ Stok habis" : Number(formData.stock) <= 5 ? "⚠️ Stok hampir habis" : "✓ Stok tersedia"}
                        </p>
                        )}
                    </div>
                    </div>
                </div>
                </div>

                {/* ── Right column: image upload ── */}
                <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                        <ImagePlus size={14} className="text-amber-500" />
                    </div>
                    <p className="text-sm font-bold text-gray-800">Foto Produk</p>
                    </div>
                    <div className="p-5 space-y-3">
                    {/* Preview */}
                    {imagePreview ? (
                        <div className="relative group">
                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                            <X size={13} />
                        </button>
                        <div className="mt-2 flex items-center justify-between">
                            <p className="text-xs text-gray-500 truncate max-w-[150px]">{imageFile?.name}</p>
                            <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs text-[#6EB8BB] font-semibold hover:underline"
                            >
                            Ganti
                            </button>
                        </div>
                        </div>
                    ) : (
                        <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#6EB8BB] hover:bg-[#F0FAFB] transition-all group"
                        >
                        <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-[#E6F7F8] flex items-center justify-center transition-colors">
                            <UploadCloud size={22} className="text-gray-400 group-hover:text-[#6EB8BB] transition-colors" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-600 group-hover:text-[#6EB8BB] transition-colors">Klik untuk upload foto</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WEBP — maks. 2MB</p>
                        </div>
                        </label>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        id="file-upload"
                        className="hidden"
                        onChange={handleImageChange}
                    />
                    <ul className="text-[10px] text-gray-400 space-y-0.5 pt-1 border-t border-gray-100">
                        <li>• Gunakan foto dengan pencahayaan baik</li>
                        <li>• Resolusi minimal 500×500 piksel</li>
                        <li>• Tampilkan produk secara jelas & menarik</li>
                    </ul>
                    </div>
                </div>

                {/* ── Tips card ── */}
                <div className="bg-[#E6F7F8] rounded-2xl border border-[#C5EAE9] p-4 space-y-2">
                    <p className="text-xs font-bold text-[#4A9EA1]">💡 Tips Produk Laris</p>
                    <ul className="text-[10px] text-[#5AACAF] space-y-1 leading-relaxed">
                    <li>• Nama produk yang spesifik lebih mudah ditemukan</li>
                    <li>• Deskripsi lengkap meningkatkan kepercayaan pembeli</li>
                    <li>• Harga kompetitif mendorong konversi lebih tinggi</li>
                    <li>• Foto berkualitas tinggi mempercepat keputusan beli</li>
                    </ul>
                </div>
                </div>
            </div>

            {/* ── Sticky action bar ── */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
                <div className="text-xs text-gray-400 hidden sm:block">
                    {isFormValid
                    ? <span className="text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle2 size={13} /> Formulir siap disimpan</span>
                    : "Lengkapi semua kolom yang wajib diisi"}
                </div>
                <div className="flex items-center gap-3 ml-auto">
                    <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                    >
                    Batal
                    </button>
                    <button
                    type="submit"
                    disabled={loading || !isFormValid}
                    className="px-6 py-2.5 bg-[#6EB8BB] hover:bg-[#5AA4A7] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-[#6EB8BB]/30 flex items-center gap-2 min-w-[140px] justify-center"
                    >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                    {loading ? "Menyimpan…" : "Simpan Produk"}
                    </button>
                </div>
                </div>
            </div>
            </form>
        </div>

        <style jsx>{`
            @keyframes progress {
            from { width: 0% }
            to   { width: 100% }
            }
        `}</style>
        </div>
    )
    }