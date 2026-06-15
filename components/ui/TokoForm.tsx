    "use client"

    import { useState, useRef } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import {
    Loader2, Upload, Check, MapPin, Building, Megaphone, Crown,
    ArrowRight, User, ShieldCheck, Store, Star, Package, Eye,
    BadgeCheck, Phone, Globe, Sparkles
    } from "lucide-react"
    import Link from "next/link"

    type Profile = {
    id: string; full_name: string | null; phone: string | null;
    avatar_url: string | null; umkm_name: string | null;
    umkm_logo: string | null; umkm_description: string | null;
    address: string | null; city: string | null;
    postal_code: string | null; promo_package: string | null;
    }

    export default function TokoForm({ initialData }: { initialData: Profile }) {
    const router = useRouter()
    const supabase = createClient()
    const logoRef = useRef<HTMLInputElement>(null)

    const [form, setForm] = useState({
        full_name: initialData.full_name ?? "",
        phone: initialData.phone ?? "",
        umkm_name: initialData.umkm_name ?? "",
        umkm_description: initialData.umkm_description ?? "",
        address: initialData.address ?? "",
        city: initialData.city ?? "",
        postal_code: initialData.postal_code ?? "",
    })

    const [logoUrl, setLogoUrl] = useState<string | null>(
        initialData.umkm_logo
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${initialData.umkm_logo}`
        : null
    )
    const [logoPath, setLogoPath] = useState(initialData.umkm_logo ?? "")
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    }

    async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        const ext = file.name.split(".").pop()
        const path = `umkm-logos/${initialData.id}-${Date.now()}.${ext}`

        const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
        if (!error) {
        setLogoPath(path)
        setLogoUrl(URL.createObjectURL(file))
        }
        setUploading(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true); setError(null)

        const { error } = await supabase
        .from("profiles")
        .update({
            full_name: form.full_name, phone: form.phone,
            umkm_name: form.umkm_name, umkm_logo: logoPath || null,
            umkm_description: form.umkm_description,
            address: form.address, city: form.city, postal_code: form.postal_code,
            updated_at: new Date().toISOString(),
        })
        .eq("id", initialData.id)

        setSaving(false)
        if (error) { setError(error.message); return }
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
        router.refresh()
    }

    // Profile completeness score — encodes how "store-ready" this profile is
    const fields = [form.umkm_name, form.umkm_description, form.address, form.city, form.postal_code, form.full_name, form.phone, logoPath]
    const filled = fields.filter((f) => f && f.toString().trim().length > 0).length
    const completeness = Math.round((filled / fields.length) * 100)

    const packageLabel = initialData.promo_package || "REGULER"
    const isPremium = packageLabel.toUpperCase() !== "REGULER"

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
        {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>
        )}

        {/* ===== HERO / STORE HEADER CARD ===== */}
        <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="h-24 md:h-28 bg-gradient-to-r from-[#9FCCCE] via-[#6EB8BB] to-[#9FCCCE]" />
            <div className="px-6 md:px-8 pb-6 md:pb-8 -mt-12 md:-mt-14 flex flex-col md:flex-row md:items-end gap-5 md:gap-6">
            {/* Logo */}
            <div className="relative shrink-0">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-4 border-white overflow-hidden bg-gray-50 flex items-center justify-center shadow-md">
                {logoUrl ? (
                    <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-4xl font-black text-gray-300">{form.umkm_name?.[0]?.toUpperCase() ?? "T"}</span>
                )}
                </div>
                <button
                type="button"
                onClick={() => logoRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-[#6EB8BB] text-white flex items-center justify-center shadow-md hover:bg-[#5AA4A7] hover:scale-105 active:scale-95 transition-all"
                title="Ganti logo toko"
                >
                {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                </button>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>

            {/* Name + status */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                    {form.umkm_name || "Nama Toko Belum Diisi"}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-50 text-[#6EB8BB] text-xs font-semibold border border-green-100">
                    <BadgeCheck size={13} /> Mitra Aktif
                </span>
                </div>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                <MapPin size={14} className="shrink-0" />
                {form.city ? `${form.city}${form.postal_code ? `, ${form.postal_code}` : ""}` : "Lokasi belum diatur"}
                </p>
            </div>

            {/* Package badge */}
            <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0">
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                isPremium
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                    : "bg-gray-50 text-gray-500 border-gray-200"
                }`}>
                <Crown size={13} className={isPremium ? "text-yellow-500" : "text-gray-400"} />
                Paket {packageLabel}
                </span>
            </div>
            </div>

            {/* Quick stats strip */}
            <div className="grid grid-cols-3 border-t border-gray-100 divide-x divide-gray-100">
            <div className="px-4 md:px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Package size={16} />
                </div>
                <div>
                <p className="text-xs text-gray-400 leading-none mb-1">Produk Aktif</p>
                <p className="text-sm font-bold text-gray-900 leading-none">—</p>
                </div>
            </div>
            <div className="px-4 md:px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Eye size={16} />
                </div>
                <div>
                <p className="text-xs text-gray-400 leading-none mb-1">Dilihat Bulan Ini</p>
                <p className="text-sm font-bold text-gray-900 leading-none">—</p>
                </div>
            </div>
            <div className="px-4 md:px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
                <Star size={16} />
                </div>
                <div>
                <p className="text-xs text-gray-400 leading-none mb-1">Rating Toko</p>
                <p className="text-sm font-bold text-gray-900 leading-none">—</p>
                </div>
            </div>
            </div>
        </div>

        {/* ===== COMPLETENESS BAR ===== */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#6EB8BB]">
                <ShieldCheck size={20} />
            </div>
            <div>
                <p className="text-sm font-bold text-gray-900">Kelengkapan Profil</p>
                <p className="text-xs text-gray-500">Profil lengkap meningkatkan kepercayaan pembeli</p>
            </div>
            </div>
            <div className="flex-1 flex items-center gap-3">
            <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                className="h-full rounded-full bg-gradient-to-r from-[#6EB8BB] to-[#9FCCCE] transition-all duration-500"
                style={{ width: `${completeness}%` }}
                />
            </div>
            <span className="text-sm font-bold text-gray-900 w-12 text-right">{completeness}%</span>
            </div>
        </div>

        {/* ===== 2 KOLOM UTAMA ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* KOLOM KIRI: Profil Dasar */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="border-b border-gray-100 pb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#6EB8BB]">
                <Store size={20} />
                </div>
                <div>
                <h2 className="text-lg font-bold text-gray-900">Profil Dasar UMKM</h2>
                <p className="text-xs text-gray-500 mt-0.5">Identitas utama toko Anda di platform BARLING-GO</p>
                </div>
            </div>

            <div className="space-y-5">
                <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Nama Toko / UMKM</label>
                <input
                    name="umkm_name" value={form.umkm_name} onChange={handleChange} required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all"
                    placeholder="Contoh: Toko Kripik Bu Siti"
                />
                </div>
                <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-semibold text-gray-800">Deskripsi Singkat</label>
                    <span className="text-xs text-gray-400">{form.umkm_description.length}/300</span>
                </div>
                <textarea
                    name="umkm_description" value={form.umkm_description} onChange={handleChange} rows={5} maxLength={300}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all resize-none"
                    placeholder="Ceritakan sejarah singkat, keunggulan, atau produk andalan toko Anda..."
                />
                <p className="text-xs text-gray-400 mt-1.5">Deskripsi ini akan tampil di halaman publik toko Anda.</p>
                </div>
            </div>

            {/* Verification note */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/60 border border-blue-100">
                <Globe size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                Informasi pada bagian ini akan ditampilkan secara publik di etalase toko Anda dan dapat dilihat oleh seluruh pengguna BARLING-GO.
                </p>
            </div>
            </div>

            {/* KOLOM KANAN: Lokasi & Kontak */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6 flex flex-col">
            <div className="border-b border-gray-100 pb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <MapPin size={20} />
                </div>
                <div>
                <h2 className="text-lg font-bold text-gray-900">Lokasi & Kontak</h2>
                <p className="text-xs text-gray-500 mt-0.5">Data penjemputan kurir dan kontak pelanggan</p>
                </div>
            </div>

            <div className="space-y-5">
                <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Alamat Lengkap Outlet / Produksi</label>
                <textarea
                    name="address" value={form.address} onChange={handleChange} rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all resize-none"
                    placeholder="Jl. Raya Contoh No. 123, RT 01/RW 02..."
                />
                </div>
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Kota / Kabupaten</label>
                    <select
                    name="city" value={form.city} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] bg-white transition-all"
                    >
                    <option value="">Pilih Kota...</option>
                    <option value="Purbalingga">Purbalingga</option>
                    <option value="Banyumas">Banyumas</option>
                    <option value="Banjarnegara">Banjarnegara</option>
                    <option value="Cilacap">Cilacap</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Kode Pos</label>
                    <input
                    name="postal_code" value={form.postal_code} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all"
                    placeholder="53311"
                    />
                </div>
                </div>
            </div>

            <div className="pt-5 border-t border-gray-100 mt-auto">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User size={16} className="text-gray-400" /> Penanggung Jawab
                </h3>
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Nama Pemilik</label>
                    <input
                    name="full_name" value={form.full_name} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">WhatsApp Outlet</label>
                    <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        name="phone" value={form.phone} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all"
                        placeholder="08..."
                    />
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>

        {/* ===== TOMBOL SIMPAN ===== */}
        <div className="flex justify-end pt-1">
            <button
            type="submit" disabled={saving || saved}
            className={`px-10 py-3.5 font-bold rounded-2xl text-sm md:text-base flex items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98] ${
                saved ? "bg-[#6EB8BB] text-white" : "bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white disabled:opacity-60"
            }`}
            >
            {saving && <Loader2 size={18} className="animate-spin" />} {saved && <Check size={18} />}
            {saved ? "Data Tersimpan!" : "Simpan Profil Toko"}
            </button>
        </div>

        {/* ===== FULL-WIDTH BAWAH: Mitra Promosi / Langganan ===== */}
        <div className="relative overflow-hidden rounded-3xl shadow-xl bg-gradient-to-br from-gray-900 via-[#11301d] to-[#9FCCCE] text-white p-8 md:p-10">
            <div className="absolute right-0 top-0 opacity-5 translate-x-1/4 -translate-y-1/4 pointer-events-none">
            <Megaphone size={300} />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="w-full md:w-2/3">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="p-2 bg-yellow-400/20 rounded-lg">
                    <Crown size={24} className="text-yellow-400" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white">Program Mitra Promosi</h2>
                <span className="px-3 py-1 bg-white/10 border border-white/20 text-yellow-400 text-xs font-black uppercase tracking-wider rounded-full backdrop-blur-sm shadow-sm">
                    {packageLabel}
                </span>
                </div>
                <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-2xl">
                Tingkatkan omzet toko Anda dengan eksposur maksimal! Gabung dalam program kemitraan kami agar produk UMKM Anda tampil di <strong className="text-white">Halaman Utama</strong> dan menjadi rekomendasi teratas bagi wisatawan Barlingmascakep.
                </p>

                {!isPremium && (
                <div className="mt-5 flex flex-wrap gap-2">
                    {["Tampil di Halaman Utama", "Label Toko Pilihan", "Prioritas Pencarian"].map((perk) => (
                    <span key={perk} className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-200 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                        <Sparkles size={12} className="text-yellow-400" />
                        {perk}
                    </span>
                    ))}
                </div>
                )}
            </div>

            <div className="w-full md:w-auto shrink-0">
                <Link
                href="/admin/langganan"
                className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] hover:scale-[1.02] active:scale-[0.98] w-full md:w-auto text-sm md:text-base"
                >
                {isPremium ? "Kelola Paket" : "Upgrade Paket Sekarang"} <ArrowRight size={20} />
                </Link>
            </div>
            </div>
        </div>
        </form>
    )
    }