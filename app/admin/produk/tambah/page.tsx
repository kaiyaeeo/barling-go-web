    "use client"

    import { useState, useEffect, useRef } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import {
    Loader2, UploadCloud, ArrowLeft, Package, Tag, DollarSign,
    Archive, FileText, ImagePlus, CheckCircle2, X, ChevronRight,
    LayoutDashboard, Settings, Bell, AlertCircle, Sparkles
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
        // categories
        const { data: cats } = await supabase.from("categories").select("id, name").eq("type", "oleh-oleh")
        if (cats) setCategories(cats)
        // profile for nav
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

    // Completeness score
    const fields = [formData.name, formData.category_id, formData.price, formData.stock, formData.description, imageFile ? "ok" : ""]
    const filled  = fields.filter((f) => f && f.toString().trim().length > 0).length
    const pct     = Math.round((filled / fields.length) * 100)

    // ── Success overlay ──
    if (success) {
        return (
        <div className="min-h-screen bg-gray-50/60 flex items-center justify-center">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-4 max-w-sm w-full mx-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <div>
                <p className="text-lg font-black text-gray-900">Produk Berhasil Ditambahkan!</p>
                <p className="text-sm text-gray-400 mt-1">Mengalihkan ke halaman etalase…</p>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-[#6EB8BB] rounded-full animate-[progress_1.8s_linear_forwards]" />
            </div>
            </div>
            <style jsx>{`
            @keyframes progress { from { width: 0% } to { width: 100% } }
            `}</style>
        </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/60 pb-24">

        {/* ===== TOP NAV (konsisten dengan halaman lain) ===== */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                <LayoutDashboard size={13} />
                <button onClick={() => router.push("/admin/dashboard")} className="hover:text-gray-600 transition-colors">Dashboard</button>
                <ChevronRight size={13} />
                <button onClick={() => router.push("/admin/produk")} className="hover:text-gray-600 transition-colors">Produk Saya</button>
                <ChevronRight size={13} />
                <span className="text-gray-700 font-semibold">Tambah Produk</span>
                </div>
                <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                    <Bell size={17} />
                </button>
                <button onClick={() => router.push("/admin/pengaturan")} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                    <Settings size={17} />
                </button>
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

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

            {/* ===== PAGE HEADER ===== */}
            <div className="flex items-center gap-3 mb-6">
            <button
                onClick={() => router.back()}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
                <ArrowLeft size={16} />
            </button>
            <div>
                <p className="text-xs font-bold text-[#6EB8BB] uppercase tracking-widest mb-0.5">Manajemen Produk</p>
                <h1 className="text-2xl font-black text-gray-900">Tambah Produk Baru</h1>
            </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ===== LEFT: main fields ===== */}
                <div className="lg:col-span-2 space-y-5">

                {/* Informasi Dasar */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-[#E6F7F8] flex items-center justify-center">
                        <Package size={15} className="text-[#6EB8BB]" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800">Informasi Dasar</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Nama dan deskripsi yang menarik meningkatkan penjualan</p>
                    </div>
                    </div>
                    <div className="p-6 space-y-5">
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-semibold text-gray-800">Nama Produk <span className="text-red-400">*</span></label>
                        <span className="text-[11px] text-gray-400">{formData.name.length}/100</span>
                        </div>
                        <input
                        required type="text" maxLength={100}
                        placeholder="Contoh: Keripik Tempe Rohani 250gr"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] bg-gray-50 placeholder:text-gray-300 transition-all"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <p className="text-[11px] text-gray-400 mt-1.5">Gunakan kata kunci yang pembeli sering cari.</p>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-semibold text-gray-800">Deskripsi Produk <span className="text-red-400">*</span></label>
                        <span className="text-[11px] text-gray-400">{formData.description.length} karakter</span>
                        </div>
                        <textarea
                        required rows={6}
                        placeholder="Ceritakan detail produk Anda: bahan, ukuran, keunggulan, cara penyimpanan…"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] bg-gray-50 placeholder:text-gray-300 transition-all resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    </div>
                </div>

                {/* Kategori */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Tag size={15} className="text-purple-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800">Kategori Produk</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Bantu pembeli menemukan produk lebih mudah</p>
                    </div>
                    </div>
                    <div className="p-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                        Pilih Kategori <span className="text-red-400">*</span>
                    </label>
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
                                : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100"
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
                    {/* fallback select for accessibility */}
                    <input type="hidden" required value={formData.category_id} />
                    {!formData.category_id && (
                        <p className="text-[11px] text-gray-400 mt-3">Pilih salah satu kategori di atas.</p>
                    )}
                    </div>
                </div>

                {/* Harga & Stok */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <DollarSign size={15} className="text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800">Harga & Stok</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Tetapkan harga jual dan ketersediaan stok</p>
                    </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">

                    {/* Harga */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                        Harga Jual <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 select-none">Rp</span>
                        <input
                            required type="number" min="0" placeholder="0"
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] bg-gray-50 transition-all"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                        </div>
                        {formData.price && (
                        <div className="mt-2 px-3 py-2 bg-[#E6F7F8] rounded-xl">
                            <p className="text-xs font-bold text-[#6EB8BB]">Rp {Number(formData.price).toLocaleString("id-ID")}</p>
                        </div>
                        )}
                    </div>

                    {/* Stok */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                        Jumlah Stok <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                        <Archive size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            required type="number" min="0" placeholder="0"
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] bg-gray-50 transition-all"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        />
                        </div>
                        {formData.stock && (
                        <div className={`mt-2 px-3 py-2 rounded-xl ${
                            Number(formData.stock) === 0 ? "bg-red-50" :
                            Number(formData.stock) <= 5  ? "bg-amber-50" : "bg-emerald-50"
                        }`}>
                            <p className={`text-xs font-bold ${
                            Number(formData.stock) === 0 ? "text-red-500" :
                            Number(formData.stock) <= 5  ? "text-amber-600" : "text-emerald-600"
                            }`}>
                            {Number(formData.stock) === 0    ? "⚠️ Stok habis — produk tidak akan tampil"
                            : Number(formData.stock) <= 5    ? `⚠️ Stok hampir habis (${formData.stock} unit)`
                            :                                   `✓ Stok tersedia (${formData.stock} unit)`}
                            </p>
                        </div>
                        )}
                    </div>
                    </div>
                </div>
                </div>

                {/* ===== RIGHT: image + sidebar ===== */}
                <div className="space-y-5">

                {/* Foto Produk */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                        <ImagePlus size={15} className="text-amber-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800">Foto Produk</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, WEBP — maks. 2MB</p>
                    </div>
                    </div>
                    <div className="p-5 space-y-3">
                    {imagePreview ? (
                        <div className="relative group">
                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100 ring-1 ring-gray-200">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <button
                            type="button" onClick={removeImage}
                            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                        >
                            <X size={13} />
                        </button>
                        <div className="mt-2 flex items-center justify-between px-1">
                            <p className="text-[11px] text-gray-500 truncate max-w-[140px]">{imageFile?.name}</p>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[11px] text-[#6EB8BB] font-bold hover:underline shrink-0">
                            Ganti Foto
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
                            <p className="text-[11px] text-gray-400 mt-0.5">atau seret & lepas file di sini</p>
                        </div>
                        </label>
                    )}
                    <input
                        ref={fileInputRef} type="file" accept="image/*" id="file-upload"
                        className="hidden" onChange={handleImageChange}
                    />
                    <ul className="text-[10px] text-gray-400 space-y-0.5 pt-2 border-t border-gray-100">
                        <li>• Pencahayaan yang baik meningkatkan daya tarik</li>
                        <li>• Resolusi minimal 500×500 piksel</li>
                        <li>• Tampilkan produk dengan jelas & menarik</li>
                    </ul>
                    </div>
                </div>

                {/* Kelengkapan Form */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Kelengkapan Form</h3>
                    <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                        className={`h-full rounded-full transition-all duration-500 ${
                            pct === 100 ? "bg-emerald-400" : pct >= 60 ? "bg-[#6EB8BB]" : "bg-amber-400"
                        }`}
                        style={{ width: `${pct}%` }}
                        />
                    </div>
                    <span className="text-sm font-black text-gray-900 w-10 text-right">{pct}%</span>
                    </div>
                    <div className="space-y-2">
                    {[
                        { label: "Nama produk",      ok: !!formData.name        },
                        { label: "Kategori",          ok: !!formData.category_id },
                        { label: "Harga jual",        ok: !!formData.price       },
                        { label: "Jumlah stok",       ok: !!formData.stock       },
                        { label: "Deskripsi produk",  ok: !!formData.description },
                        { label: "Foto produk",       ok: !!imageFile            },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.ok ? "bg-emerald-100" : "bg-gray-100"}`}>
                            {item.ok
                            ? <CheckCircle2 size={11} className="text-emerald-500" />
                            : <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            }
                        </div>
                        <span className={`text-xs ${item.ok ? "text-gray-700 font-medium" : "text-gray-400"}`}>{item.label}</span>
                        </div>
                    ))}
                    </div>
                </div>

                {/* Tips */}
                <div className="bg-[#E6F7F8] rounded-2xl border border-[#C5EAE9] p-5">
                    <p className="text-xs font-bold text-[#4A9EA1] flex items-center gap-1.5 mb-2">
                    <Sparkles size={12} /> Tips Produk Laris
                    </p>
                    <ul className="text-[11px] text-[#5AACAF] space-y-1.5 leading-relaxed">
                    <li>• Nama spesifik lebih mudah ditemukan pembeli</li>
                    <li>• Deskripsi lengkap meningkatkan kepercayaan</li>
                    <li>• Harga kompetitif mendorong konversi lebih tinggi</li>
                    <li>• Foto berkualitas mempercepat keputusan beli</li>
                    </ul>
                </div>
                </div>
            </div>
            </form>
        </div>

        {/* ===== STICKY ACTION BAR ===== */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <div className="hidden sm:block">
                {isFormValid ? (
                <span className="text-sm text-emerald-600 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={15} /> Formulir siap disimpan
                </span>
                ) : (
                <span className="text-sm text-gray-400">
                    Lengkapi semua kolom yang wajib diisi — <span className="font-semibold text-gray-600">{pct}% selesai</span>
                </span>
                )}
            </div>
            <div className="flex items-center gap-3 ml-auto">
                <button
                type="button" onClick={() => router.back()}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                Batal
                </button>
                <button
                type="submit" form="tambah-form"
                onClick={(e) => {
                    const form = document.querySelector("form")
                    if (form) form.requestSubmit()
                }}
                disabled={loading || !isFormValid}
                className="flex items-center gap-2 px-8 py-2.5 bg-[#6EB8BB] hover:bg-[#5AA4A7] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-[#6EB8BB]/30 min-w-[160px] justify-center"
                >
                {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                {loading ? "Menyimpan…" : "Simpan Produk"}
                </button>
            </div>
            </div>
        </div>

        <style jsx>{`
            @keyframes progress { from { width: 0% } to { width: 100% } }
        `}</style>
        </div>
    )
    }