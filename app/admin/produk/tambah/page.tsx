    "use client"

    import { useState, useEffect, useRef } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import {
    Loader2, UploadCloud, ArrowLeft, Package, Tag, DollarSign,
    Archive, FileText, ImagePlus, CheckCircle2, X, ChevronRight,
    LayoutDashboard, Settings, Bell, AlertCircle, Sparkles, Save
    } from "lucide-react"

    export default function TambahProdukPage() {
    const router   = useRouter()
    const supabase = createClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [loading,      setLoading]      = useState(false)
    const [categories,   setCategories]   = useState<any[]>([])
    const [imageFile,    setImageFile]    = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [success,      setSuccess]      = useState(false)
    const [errorMsg,     setErrorMsg]     = useState<string | null>(null)
    const [shopName,     setShopName]     = useState("Toko")
    const [logoUrl,      setLogoUrl]      = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name:        "",
        category_id: "",
        price:       "",
        stock:       "",
        description: ""
    })

    useEffect(() => {
        async function init() {
        const { data: cats } = await supabase.from("categories").select("id, name").eq("type", "oleh-oleh")
        if (cats) setCategories(cats)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: prof } = await supabase.from("profiles").select("umkm_name, full_name, umkm_logo").eq("id", user.id).single()
            if (prof) {
            setShopName(prof.umkm_name ?? prof.full_name ?? "Toko")
            if (prof.umkm_logo) {
                const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(prof.umkm_logo)
                setLogoUrl(publicUrl)
            }
            }
        }
        }
        init()
    }, [])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        setImageFile(file)
        setImagePreview(file ? URL.createObjectURL(file) : null)
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
            const fileExt  = imageFile.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `product-images/${fileName}`

            const { error: uploadError } = await supabase.storage.from("products").upload(filePath, imageFile)
            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(filePath)
            imageUrls.push(publicUrl)
        }

        const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()

        const { error: insertError } = await supabase.from("products").insert({
            name:        formData.name,
            slug:        slug,
            category_id: formData.category_id,
            price:       Number(formData.price),
            stock:       Number(formData.stock),
            description: formData.description,
            images:      imageUrls,
            seller_id:   user.id,
            is_active:   true
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

    const isFormValid = !!(formData.name && formData.category_id && formData.price && formData.stock && formData.description)

    const fields = [formData.name, formData.category_id, formData.price, formData.stock, formData.description, imageFile ? "ok" : ""]
    const filled  = fields.filter((f) => f && f.toString().trim().length > 0).length
    const pct     = Math.round((filled / fields.length) * 100)

    if (success) {
        return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-4 max-w-sm w-full mx-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <div>
                <p className="text-lg font-black text-gray-900">Produk Ditambahkan!</p>
                <p className="text-sm text-gray-400 mt-1">Mengalihkan ke halaman etalase…</p>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-[#6EB8BB] rounded-full animate-[progress_1.8s_linear_forwards]" />
            </div>
            </div>
            <style jsx>{`@keyframes progress { from { width: 0% } to { width: 100% } }`}</style>
        </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">

        {/* ===== TOP NAV ===== */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                <button onClick={() => router.back()} className="p-1.5 mr-1 hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-lg transition-all" title="Kembali ke halaman sebelumnya">
                    <ArrowLeft size={16} />
                </button>
                <LayoutDashboard size={13} />
                <button onClick={() => router.push("/admin/dashboard")} className="hover:text-gray-600 transition-colors">Dashboard</button>
                <ChevronRight size={13} />
                <button onClick={() => router.push("/admin/produk")} className="hover:text-gray-600 transition-colors">Produk Saya</button>
                <ChevronRight size={13} />
                <span className="text-gray-700 font-semibold">Tambah Produk</span>
                </div>
                <div className="flex items-center gap-2">
                <div className="h-5 w-px bg-gray-200 mx-1" />
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#6EB8BB]/20 flex items-center justify-center text-[#6EB8BB] text-xs font-black overflow-hidden">
                    {logoUrl ? <img src={logoUrl} alt={shopName} className="w-full h-full object-cover" /> : shopName[0]?.toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-gray-700 truncate max-w-[120px]">{shopName}</span>
                </div>
                </div>
            </div>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* ===== PAGE HEADER ===== */}
            <div className="mb-6">
            <h1 className="text-2xl font-black text-gray-900">Tambah Produk Baru</h1>
            <p className="text-sm text-gray-400 mt-1">Lengkapi informasi di bawah ini untuk menampilkan produk Anda di etalase.</p>
            </div>

            {/* ===== ERROR BANNER ===== */}
            {errorMsg && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-5 py-4">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span className="flex-1">{errorMsg}</span>
                <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600 shrink-0">
                <X size={14} />
                </button>
            </div>
            )}

            <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ===== LEFT: main fields ===== */}
                <div className="lg:col-span-2 space-y-6">

                {/* Informasi Dasar */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
                    <Package size={16} className="text-[#6EB8BB]" />
                    <p className="text-sm font-bold text-gray-800">Informasi Dasar</p>
                    </div>
                    <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Nama Produk *</label>
                        <input
                        required type="text" maxLength={100}
                        placeholder="Contoh: Keripik Tempe Rohani 250gr"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <div className="flex justify-between items-center mt-1">
                        <p className="text-[11px] text-gray-400">Gunakan kata kunci yang relevan.</p>
                        <span className="text-[11px] text-gray-400">{formData.name.length}/100</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-2">Deskripsi Lengkap *</label>
                        <textarea
                        required rows={5}
                        placeholder="Jelaskan detail produk, bahan, ukuran, keunggulan, dll…"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    </div>
                </div>

                {/* Kategori */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
                    <Tag size={16} className="text-[#6EB8BB]" />
                    <p className="text-sm font-bold text-gray-800">Kategori Produk</p>
                    </div>
                    <div className="p-6">
                    {categories.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {categories.map((c) => (
                            <button
                            key={c.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, category_id: c.id })}
                            className={`px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all text-left ${
                                formData.category_id === c.id
                                ? "bg-[#6EB8BB]/10 border-[#6EB8BB]/40 text-[#6EB8BB]"
                                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                            >
                            {formData.category_id === c.id && <span className="mr-1">✓</span>}
                            {c.name}
                            </button>
                        ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 py-3 text-gray-400">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-sm">Memuat kategori…</span>
                        </div>
                    )}
                    <input type="hidden" required value={formData.category_id} />
                    </div>
                </div>

                {/* Harga & Stok */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
                    <DollarSign size={16} className="text-[#6EB8BB]" />
                    <p className="text-sm font-bold text-gray-800">Harga & Stok</p>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Harga Jual (Rp) *</label>
                        <input
                        required type="number" min="0" placeholder="0"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Jumlah Stok *</label>
                        <input
                        required type="number" min="0" placeholder="0"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        />
                    </div>
                    </div>
                </div>

                {/* Tombol Simpan Terintegrasi (Bukan Floating) */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm">
                    {isFormValid ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 size={16} /> Siap disimpan
                        </span>
                    ) : (
                        <span className="text-gray-400 flex items-center gap-1.5">
                        Lengkapi form wajib — <span className="font-bold text-gray-600">{pct}% selesai</span>
                        </span>
                    )}
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        type="button" onClick={() => router.back()}
                        className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit" disabled={loading || !isFormValid}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-[#6EB8BB] text-white text-sm font-bold rounded-xl hover:bg-[#5AA4A7] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {loading ? "Menyimpan…" : "Simpan Produk"}
                    </button>
                    </div>
                </div>

                </div>

                {/* ===== RIGHT: image + sidebar ===== */}
                <div className="space-y-6">

                {/* Foto Produk */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
                    <ImagePlus size={16} className="text-[#6EB8BB]" />
                    <p className="text-sm font-bold text-gray-800">Foto Produk *</p>
                    </div>
                    <div className="p-5 space-y-3">
                    {imagePreview ? (
                        <div className="relative group">
                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100 ring-1 ring-gray-200">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <button
                            type="button" onClick={removeImage}
                            className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                        >
                            <X size={14} />
                        </button>
                        </div>
                    ) : (
                        <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#6EB8BB] hover:bg-gray-50 transition-all group"
                        >
                        <div className="w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-[#E6F7F8] flex items-center justify-center transition-colors">
                            <UploadCloud size={22} className="text-gray-400 group-hover:text-[#6EB8BB] transition-colors" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-600 group-hover:text-[#6EB8BB] transition-colors">Klik untuk upload</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG. Maks 2MB.</p>
                        </div>
                        </label>
                    )}
                    <input
                        ref={fileInputRef} type="file" accept="image/*" id="file-upload" required
                        className="hidden" onChange={handleImageChange}
                    />
                    </div>
                </div>

                {/* Tips */}
                <div className="bg-[#E6F7F8] rounded-2xl border border-[#C5EAE9] p-5">
                    <p className="text-xs font-bold text-[#4A9EA1] flex items-center gap-1.5 mb-2">
                    <Sparkles size={12} /> Tips Produk Laris
                    </p>
                    <ul className="text-[11px] text-[#5AACAF] space-y-1.5 leading-relaxed">
                    <li>• Gunakan nama produk yang jelas</li>
                    <li>• Deskripsi detail meningkatkan kepercayaan</li>
                    <li>• Harga kompetitif memicu pembelian</li>
                    <li>• Foto jernih & terang sangat penting</li>
                    </ul>
                </div>

                </div>
            </div>
            </form>
        </div>
        </div>
    )
    }