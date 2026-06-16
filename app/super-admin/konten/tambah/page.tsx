    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import {
    Loader2, MapPin, UploadCloud, ChevronRight, LayoutDashboard,
    FileText, X, CheckCircle2, ImageIcon, AlignLeft, BookOpen,
    Ticket, Globe
    } from "lucide-react"

    export default function TambahWisataPage() {
    const router  = useRouter()
    const supabase = createClient()

    const [loading,   setLoading]   = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [preview,   setPreview]   = useState<string | null>(null)
    const [success,   setSuccess]   = useState(false)

    const [formData, setFormData] = useState({
        title:            "",
        kabupaten:        "Banyumas",
        location:         "",
        ticket_price_min: "0",
        description:      "",
        body:             ""
    })

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setFormData((p) => ({ ...p, [e.target.name]: e.target.value }))
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] || null
        setImageFile(file)
        if (file) setPreview(URL.createObjectURL(file))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Sesi tidak valid.")

        let coverUrl = ""

        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `wisata-${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
            .from("contents")
            .upload(fileName, imageFile)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
            .from("contents")
            .getPublicUrl(fileName)

            coverUrl = publicUrl
        }

        const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()

        const { error: insertError } = await supabase.from("contents").insert({
            type:             "destinasi",
            title:            formData.title,
            slug:             slug,
            kabupaten:        formData.kabupaten,
            location:         formData.location,
            ticket_price_min: Number(formData.ticket_price_min),
            description:      formData.description,
            body:             formData.body,
            cover_image:      coverUrl,
            created_by:       user.id,
            is_published:     true
        })

        if (insertError) throw insertError

        setSuccess(true)
        setTimeout(() => router.push("/super-admin/konten"), 1500)

        } catch (error: any) {
        alert("Gagal mempublikasikan: " + error.message)
        } finally {
        setLoading(false)
        }
    }

    const KABUPATEN = ["Banyumas", "Purbalingga", "Banjarnegara", "Cilacap", "Kebumen"]

    // Completeness score
    const fields = [formData.title, formData.location, formData.description, formData.body, imageFile ? "ok" : ""]
    const filled  = fields.filter((f) => f && f.toString().trim().length > 0).length
    const pct     = Math.round((filled / fields.length) * 100)

    return (
        <main className="min-h-screen bg-gray-50/60">

        {/* ===== TOP NAV ===== */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                <LayoutDashboard size={13} />
                <span>Super Admin</span>
                <ChevronRight size={13} />
                <button onClick={() => router.push("/super-admin/konten")} className="hover:text-gray-600 transition-colors">Kelola Konten</button>
                <ChevronRight size={13} />
                <span className="text-gray-700 font-semibold">Tambah Destinasi</span>
                </div>
                <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 hover:bg-gray-100 rounded-xl transition-all"
                >
                <X size={15} /> Batal
                </button>
            </div>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">

            {/* ===== SUCCESS STATE ===== */}
            {success && (
            <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                <div>
                <p className="text-sm font-bold text-emerald-800">Destinasi berhasil dipublikasikan!</p>
                <p className="text-xs text-emerald-600 mt-0.5">Mengalihkan ke halaman konten...</p>
                </div>
            </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">

            {/* ===== MAIN FORM ===== */}
            <form onSubmit={handleSubmit} className="flex-1 space-y-5">

                {/* Section: Informasi Utama */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#6EB8BB]/10 flex items-center justify-center">
                    <Globe size={15} className="text-[#6EB8BB]" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900">Informasi Destinasi</h2>
                </div>
                <div className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">Nama Tempat Wisata <span className="text-red-400">*</span></label>
                        <input
                        required name="title" value={formData.title} onChange={handleChange}
                        placeholder="Contoh: Curug Cipendok Banyumas"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">Kabupaten <span className="text-red-400">*</span></label>
                        <select
                        name="kabupaten" value={formData.kabupaten} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] bg-white transition-all"
                        >
                        {KABUPATEN.map((k) => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">Harga Tiket Masuk <span className="text-red-400">*</span></label>
                        <div className="relative">
                        <Ticket size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            required name="ticket_price_min" type="number" value={formData.ticket_price_min} onChange={handleChange}
                            placeholder="0 untuk gratis"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all"
                        />
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">Isi 0 jika gratis</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">Alamat Singkat <span className="text-red-400">*</span></label>
                        <div className="relative">
                        <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            required name="location" value={formData.location} onChange={handleChange}
                            placeholder="Contoh: Lereng Gunung Slamet, Cilongok"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all"
                        />
                        </div>
                    </div>
                    </div>
                </div>
                </div>

                {/* Section: Deskripsi */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <AlignLeft size={15} className="text-blue-500" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900">Deskripsi Konten</h2>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-semibold text-gray-800">Deskripsi Singkat <span className="text-red-400">*</span></label>
                        <span className="text-xs text-gray-400">{formData.description.length}/200</span>
                    </div>
                    <textarea
                        required name="description" value={formData.description} onChange={handleChange}
                        rows={2} maxLength={200}
                        placeholder="Kalimat penarik wisatawan, tampil di kartu destinasi..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">Akan tampil sebagai tagline di kartu destinasi.</p>
                    </div>
                    <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <BookOpen size={14} className="text-gray-400" />
                        <label className="text-sm font-semibold text-gray-800">Penjelasan Lengkap <span className="text-red-400">*</span></label>
                    </div>
                    <textarea
                        required name="body" value={formData.body} onChange={handleChange}
                        rows={7}
                        placeholder="Ceritakan sejarah, fasilitas, jam operasional, rute perjalanan, dan daya tarik tempat ini secara lengkap..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">Akan tampil di halaman detail destinasi.</p>
                    </div>
                </div>
                </div>

                {/* Section: Cover Image */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <ImageIcon size={15} className="text-purple-500" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900">Cover Gambar</h2>
                </div>
                <div className="p-6">
                    <input required type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="wisata-upload" />
                    {preview ? (
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100">
                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                        <button
                        type="button"
                        onClick={() => { setImageFile(null); setPreview(null) }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all"
                        >
                        <X size={15} />
                        </button>
                        <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/50 text-white text-xs rounded-lg backdrop-blur-sm">
                        {imageFile?.name}
                        </div>
                    </div>
                    ) : (
                    <label
                        htmlFor="wisata-upload"
                        className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl py-12 cursor-pointer hover:bg-gray-50 hover:border-[#6EB8BB]/30 transition-all"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <UploadCloud size={22} className="text-gray-400" />
                        </div>
                        <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">Klik untuk upload gambar</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP · Disarankan rasio 16:9</p>
                        </div>
                    </label>
                    )}
                </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => router.back()} className="px-6 py-3 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                    Batal
                </button>
                <button
                    type="submit" disabled={loading || success}
                    className="flex items-center gap-2 px-8 py-3 bg-[#6EB8BB] hover:bg-[#5AA4A7] disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : success ? <CheckCircle2 size={16} /> : null}
                    {loading ? "Mempublikasikan..." : success ? "Berhasil!" : "Publikasikan Destinasi"}
                </button>
                </div>
            </form>

            {/* ===== SIDEBAR ===== */}
            <div className="lg:w-72 space-y-4 shrink-0">

                {/* Completeness */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Kelengkapan Form</h3>
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-[#6EB8BB] to-[#9FCCCE] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                    />
                    </div>
                    <span className="text-sm font-black text-gray-900">{pct}%</span>
                </div>
                <div className="space-y-2 mt-3">
                    {[
                    { label: "Nama destinasi",    ok: !!formData.title },
                    { label: "Alamat lokasi",     ok: !!formData.location },
                    { label: "Deskripsi singkat", ok: !!formData.description },
                    { label: "Penjelasan lengkap",ok: !!formData.body },
                    { label: "Cover gambar",      ok: !!imageFile },
                    ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.ok ? "bg-emerald-100" : "bg-gray-100"}`}>
                        {item.ok
                            ? <CheckCircle2 size={12} className="text-emerald-500" />
                            : <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        }
                        </span>
                        <span className={`text-xs ${item.ok ? "text-gray-700 font-medium" : "text-gray-400"}`}>{item.label}</span>
                    </div>
                    ))}
                </div>
                </div>

                {/* Panduan */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <FileText size={14} /> Tips Konten Bagus
                </h3>
                <ul className="space-y-2 text-xs text-blue-700 leading-relaxed">
                    <li>✓ Judul yang jelas dan menarik</li>
                    <li>✓ Deskripsi singkat maks 2 kalimat</li>
                    <li>✓ Sertakan jam buka & rute di body</li>
                    <li>✓ Foto berkualitas tinggi, rasio 16:9</li>
                    <li>✓ Harga tiket akurat per orang</li>
                </ul>
                </div>

            </div>
            </div>
        </div>
        </main>
    )
    }