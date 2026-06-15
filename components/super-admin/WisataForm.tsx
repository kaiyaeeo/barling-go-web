    "use client"

    import { useState, useRef } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { Loader2, Upload, Sparkles, X, Check } from "lucide-react"

    const KABUPATEN_OPTS = ["Banjarnegara","Purbalingga","Banyumas","Cilacap","Kebumen"]
    const TAG_OPTS       = [
    { id:"alam",      label:"Alam" },
    { id:"budaya",    label:"Budaya" },
    { id:"buatan",    label:"Buatan" },
    { id:"religi",    label:"Religi" },
    { id:"pantai",    label:"Pantai" },
    { id:"air_terjun", label:"Air Terjun" },
    { id:"hutan",     label:"Hutan" },
    ]

    type InitialData = {
    id?: string
    title?: string
    slug?: string
    description?: string
    body?: string
    cover_image?: string
    kabupaten?: string
    address?: string
    location?: string
    ticket_price_min?: number
    ticket_price_max?: number
    opening_hours?: string
    phone?: string
    tags?: string[]
    is_published?: boolean
    }

    export default function WisataForm({ initialData }: { initialData?: InitialData }) {
    const router   = useRouter()
    const supabase = createClient()
    const fileRef  = useRef<HTMLInputElement>(null)
    const isEdit   = !!initialData?.id

    const [form, setForm] = useState({
        title:           initialData?.title            ?? "",
        description:     initialData?.description      ?? "",
        body:            initialData?.body             ?? "",
        kabupaten:       initialData?.kabupaten        ?? "Banyumas",
        address:         initialData?.address          ?? "",
        location:        initialData?.location         ?? "",
        ticket_price_min: initialData?.ticket_price_min ?? 0,
        ticket_price_max: initialData?.ticket_price_max ?? 0,
        opening_hours:   initialData?.opening_hours    ?? "07.00 - 17.00 WIB",
        phone:           initialData?.phone            ?? "",
        is_published:    initialData?.is_published     ?? false,
    })
    
    const [tags, setTags]               = useState<string[]>(initialData?.tags ?? [])
    const [coverImg, setCoverImg]       = useState<string | null>(initialData?.cover_image ?? null)
    const [uploading, setUploading]     = useState(false)
    const [saving, setSaving]           = useState(false)
    const [saved, setSaved]             = useState(false)
    const [error, setError]             = useState<string | null>(null)
    const [aiLoading, setAiLoading]     = useState(false)

    function toSlug(str: string) {
        return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value, type } = e.target
        setForm((p) => ({
        ...p,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }))
    }

    function toggleTag(id: string) {
        setTags((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id])
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        const ext  = file.name.split(".").pop()
        const path = `wisata/${Date.now()}.${ext}`
        const { error } = await supabase.storage.from("content-images").upload(path, file, { upsert: true })
        if (!error) setCoverImg(path)
        setUploading(false)
    }

    // AI: generate description dari nama + kabupaten
    async function handleAIGenerate() {
        if (!form.title) { setError("Isi nama destinasi terlebih dahulu."); return }
        setAiLoading(true)
        setError(null)
        try {
        const res = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            messages: [{
                role: "user",
                content: `Tulis deskripsi singkat dan menarik (2-3 kalimat) untuk destinasi wisata "${form.title}" di ${form.kabupaten}, Jawa Tengah. Gunakan bahasa Indonesia yang informatif dan mengundang. Langsung tulis deskripsinya saja tanpa awalan atau penjelasan tambahan.`,
            }],
            sessionId: "wisata-form",
            }),
        })
        const data = await res.json()
        if (data.message) {
            setForm((p) => ({ ...p, description: data.message }))
        }
        } catch { setError("Gagal generate deskripsi AI.") }
        setAiLoading(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!form.title.trim()) { setError("Nama destinasi wajib diisi."); return }
        setSaving(true)
        setError(null)

        const payload = {
        type:              "destinasi",
        title:             form.title,
        slug:              toSlug(form.title),
        description:       form.description,
        body:              form.body,
        cover_image:       coverImg,
        kabupaten:         form.kabupaten,
        address:           form.address,
        location:          form.location,
        ticket_price_min:  Number(form.ticket_price_min) || 0,
        ticket_price_max:  Number(form.ticket_price_max) || 0,
        opening_hours:     form.opening_hours,
        phone:             form.phone,
        tags,
        is_published:      form.is_published,
        updated_at:        new Date().toISOString(),
        }

        let err
        if (isEdit) {
        const { error: e } = await supabase.from("contents").update(payload).eq("id", initialData!.id!)
        err = e
        } else {
        const { error: e } = await supabase.from("contents").insert({ ...payload, created_at: new Date().toISOString() })
        err = e
        }

        setSaving(false)
        if (err) { setError(err.message); return }
        
        setSaved(true)
        setTimeout(() => {
        router.push("/super-admin/kelola-wisata")
        router.refresh() // <-- INI KUNCI AGAR DATA LANGSUNG MUNCUL
        }, 1000)
    }

    const coverUrl = coverImg
        ? coverImg.startsWith("http") ? coverImg
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content-images/${coverImg}`
        : null

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>
        )}

        {/* Informasi dasar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900">Informasi Destinasi</h2>
            <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Nama Destinasi *</label>
            <input name="title" value={form.title} onChange={handleChange} required
                placeholder="Contoh: Pantai Menganti"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]" />
            {form.title && <p className="text-xs text-gray-400 mt-1">Slug: {toSlug(form.title)}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Kabupaten *</label>
                <select name="kabupaten" value={form.kabupaten} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 bg-white">
                {KABUPATEN_OPTS.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Jam Operasional</label>
                <input name="opening_hours" value={form.opening_hours} onChange={handleChange}
                placeholder="07.00 - 17.00 WIB"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]" />
            </div>
            </div>
            <div>
            <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-500">Deskripsi</label>
                <button type="button" onClick={handleAIGenerate} disabled={aiLoading}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline disabled:opacity-50">
                {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Bantu Tulis dengan AI
                </button>
            </div>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                placeholder="Deskripsi singkat destinasi..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] resize-none" />
            </div>
            <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Konten Lengkap (opsional)</label>
            <textarea name="body" value={form.body} onChange={handleChange} rows={4}
                placeholder="Deskripsi panjang, sejarah, fasilitas, tips mengunjungi..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] resize-none" />
            </div>
        </div>

        {/* Lokasi & Kontak */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900">Lokasi & Kontak</h2>
            <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Alamat Lengkap</label>
            <input name="address" value={form.address} onChange={handleChange}
                placeholder="Desa, Kecamatan, Kabupaten"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Nama Lokasi (ringkas)</label>
                <input name="location" value={form.location} onChange={handleChange}
                placeholder="Contoh: Kebumen, Jawa Tengah"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]" />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">No. Telepon / WhatsApp</label>
                <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="+62 812 3456 789"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]" />
            </div>
            </div>
        </div>

        {/* Harga tiket */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900">Harga Tiket</h2>
            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Harga Minimum (Rp)</label>
                <input type="number" name="ticket_price_min" value={form.ticket_price_min} onChange={handleChange} min="0"
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]" />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Harga Maksimum (Rp)</label>
                <input type="number" name="ticket_price_max" value={form.ticket_price_max} onChange={handleChange} min="0"
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]" />
            </div>
            </div>
        </div>

        {/* Tags / Kategori */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Kategori Wisata</h2>
            <div className="flex flex-wrap gap-2">
            {TAG_OPTS.map((tag) => (
                <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    tags.includes(tag.id)
                    ? "bg-[#6EB8BB] text-white border-[#6EB8BB]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}>
                {tag.label}
                </button>
            ))}
            </div>
        </div>

        {/* Foto cover */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Foto Cover</h2>
            {coverUrl ? (
            <div className="relative w-full h-48 rounded-xl overflow-hidden group">
                <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setCoverImg(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md">
                <X size={16} />
                </button>
            </div>
            ) : (
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#6EB8BB] hover:bg-green-50 transition-all text-gray-400 hover:text-[#6EB8BB]">
                {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                <span className="text-sm font-medium">{uploading ? "Mengupload..." : "Klik untuk upload foto"}</span>
                <span className="text-xs">PNG, JPG, WebP. Maks 5MB.</span>
            </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        {/* Publish toggle */}
        <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-5 shadow-sm">
            <label className="flex items-center gap-4 cursor-pointer">
            <input type="checkbox" name="is_published" checked={form.is_published}
                onChange={handleChange} className="w-5 h-5 accent-[#6EB8BB] cursor-pointer" />
            <div>
                <p className="text-sm font-bold text-gray-900">Publikasikan Sekarang</p>
                <p className="text-xs text-gray-500 mt-0.5">Centang ini agar wisata langsung tampil di halaman depan Barling-GO.</p>
            </div>
            </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving || saved}
            className={`px-8 py-3.5 font-bold rounded-xl text-sm flex items-center gap-2 transition-all shadow-md ${
                saved ? "bg-green-500 text-white" : "bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white disabled:opacity-60 hover:-translate-y-0.5"
            }`}>
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saved   && <Check size={16} />}
            {saved ? "Berhasil Disimpan!" : saving ? "Menyimpan Data..." : isEdit ? "Simpan Perubahan" : "Tambah Destinasi"}
            </button>
            <button type="button" onClick={() => router.back()}
            className="px-6 py-3.5 border border-gray-200 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-50 transition-all">
            Batal
            </button>
        </div>
        </form>
    )
    }