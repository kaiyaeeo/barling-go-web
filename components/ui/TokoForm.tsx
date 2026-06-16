    "use client"

    import { useState, useRef } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import {
    Loader2, Upload, Check, MapPin, Building, Megaphone, Crown,
    ArrowRight, User, ShieldCheck, Store, Star, Package, Eye,
    BadgeCheck, Phone, Globe, Sparkles, X, Camera, CheckCircle2
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
        full_name:        initialData.full_name ?? "",
        phone:            initialData.phone ?? "",
        umkm_name:        initialData.umkm_name ?? "",
        umkm_description: initialData.umkm_description ?? "",
        address:          initialData.address ?? "",
        city:             initialData.city ?? "",
        postal_code:      initialData.postal_code ?? "",
    })

    const [logoUrl, setLogoUrl] = useState<string | null>(
        initialData.umkm_logo
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${initialData.umkm_logo}`
        : null
    )
    const [logoPath, setLogoPath]   = useState(initialData.umkm_logo ?? "")
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving]       = useState(false)
    const [saved, setSaved]         = useState(false)
    const [error, setError]         = useState<string | null>(null)

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    }

    async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        const ext  = file.name.split(".").pop()
        const path = `umkm-logos/${initialData.id}-${Date.now()}.${ext}`
        const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
        if (!error) { setLogoPath(path); setLogoUrl(URL.createObjectURL(file)) }
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

    const fields       = [form.umkm_name, form.umkm_description, form.address, form.city, form.postal_code, form.full_name, form.phone, logoPath]
    const filled       = fields.filter((f) => f && f.toString().trim().length > 0).length
    const completeness = Math.round((filled / fields.length) * 100)

    const packageLabel = initialData.promo_package || "REGULER"
    const isPremium    = packageLabel.toUpperCase() !== "REGULER"

    const completenessColor =
        completeness >= 80 ? "from-emerald-400 to-[#6EB8BB]" :
        completeness >= 50 ? "from-amber-400 to-[#6EB8BB]" :
        "from-red-400 to-amber-400"

    const completenessLabel =
        completeness >= 80 ? "Profil Lengkap" :
        completeness >= 50 ? "Hampir Lengkap" : "Perlu Dilengkapi"

    const INPUT = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] bg-white placeholder:text-gray-300 transition-all"
    const LABEL = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"

    return (
        <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Error banner ── */}
        {error && (
            <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl">
            <X size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                <X size={13} />
            </button>
            </div>
        )}

        {/* ── Store hero card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Teal banner */}
            <div className="h-24 bg-gradient-to-r from-[#9FCCCE] via-[#6EB8BB] to-[#9FCCCE] relative">
            {isPremium && (
                <span className="absolute top-3 right-4 inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-300 text-gray-900 text-[10px] font-black uppercase tracking-wider rounded-full shadow-md">
                <Crown size={10} className="fill-gray-900" /> Mitra {packageLabel}
                </span>
            )}
            </div>

            <div className="px-6 pb-5 -mt-12 flex flex-col sm:flex-row sm:items-end gap-5">
            {/* Logo upload */}
            <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl border-4 border-white overflow-hidden bg-gray-100 flex items-center justify-center shadow-xl">
                {logoUrl
                    ? <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                    : <span className="text-4xl font-black text-gray-300">{form.umkm_name?.[0]?.toUpperCase() ?? "T"}</span>
                }
                </div>
                <button
                type="button"
                onClick={() => logoRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-[#6EB8BB] text-white flex items-center justify-center shadow-md hover:bg-[#5AA4A7] active:scale-95 transition-all"
                title="Ganti logo"
                >
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
                </button>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>

            {/* Name + location */}
            <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-black text-gray-900 truncate">
                    {form.umkm_name || <span className="text-gray-300 font-normal italic text-lg">Nama toko belum diisi</span>}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
                    <BadgeCheck size={11} /> Mitra Aktif
                </span>
                {!isPremium && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 text-[10px] font-bold border border-gray-100">
                    <Crown size={10} /> {packageLabel}
                    </span>
                )}
                </div>
                {form.umkm_description && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-1 max-w-xl">{form.umkm_description}</p>
                )}
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <MapPin size={11} className="shrink-0" />
                {form.city
                    ? `${form.city}${form.postal_code ? `, ${form.postal_code}` : ""}`
                    : "Lokasi belum diatur"}
                </p>
            </div>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-4 border-t border-gray-100 divide-x divide-gray-100">
            {[
                { icon: Package,      label: "Produk Aktif",      value: "—", bg: "bg-[#E6F7F8]", color: "text-[#6EB8BB]"   },
                { icon: Eye,          label: "Dilihat Bulan Ini", value: "—", bg: "bg-purple-50",  color: "text-purple-500"  },
                { icon: Star,         label: "Rating Toko",       value: "—", bg: "bg-amber-50",   color: "text-amber-500"   },
                { icon: ShieldCheck,  label: "Kelengkapan",       value: `${completeness}%`, bg: completeness >= 80 ? "bg-emerald-50" : "bg-gray-50", color: completeness >= 80 ? "text-emerald-500" : "text-gray-400" },
            ].map(({ icon: Icon, label, value, bg, color }) => (
                <div key={label} className="px-4 py-3.5 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                    <Icon size={14} className={color} />
                </div>
                <div>
                    <p className="text-[10px] text-gray-400 font-medium leading-tight">{label}</p>
                    <p className="text-sm font-bold text-gray-900">{value}</p>
                </div>
                </div>
            ))}
            </div>
        </div>

        {/* ── Completeness bar ── */}
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-[#E6F7F8] flex items-center justify-center shrink-0">
            <ShieldCheck size={17} className="text-[#6EB8BB]" />
            </div>
            <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-bold text-gray-700">Kelengkapan Profil</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                completeness >= 80 ? "bg-emerald-50 text-emerald-600" :
                completeness >= 50 ? "bg-amber-50 text-amber-600" :
                "bg-red-50 text-red-500"
                }`}>
                {completenessLabel}
                </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                className={`h-full rounded-full bg-gradient-to-r ${completenessColor} transition-all duration-500`}
                style={{ width: `${completeness}%` }}
                />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{filled} dari {fields.length} informasi telah diisi · {completeness}% lengkap</p>
            </div>
        </div>

        {/* ── 2-column main fields ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* LEFT: Identitas UMKM */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-xl bg-[#E6F7F8] flex items-center justify-center shrink-0">
                <Store size={15} className="text-[#6EB8BB]" />
                </div>
                <div>
                <p className="text-sm font-bold text-gray-900">Identitas UMKM</p>
                <p className="text-[11px] text-gray-400">Tampil publik di halaman etalase toko</p>
                </div>
            </div>
            <div className="p-5 space-y-4">
                <div>
                <label className={LABEL}>Nama Toko / UMKM <span className="text-red-400 normal-case">*</span></label>
                <input
                    name="umkm_name" value={form.umkm_name} onChange={handleChange} required
                    className={INPUT} placeholder="Contoh: Toko Kripik Bu Siti"
                />
                </div>
                <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className={LABEL.replace("mb-1.5", "")}>Deskripsi Singkat</label>
                    <span className={`text-[10px] font-semibold ${form.umkm_description.length > 270 ? "text-amber-500" : "text-gray-400"}`}>
                    {form.umkm_description.length}/300
                    </span>
                </div>
                <textarea
                    name="umkm_description" value={form.umkm_description} onChange={handleChange}
                    rows={5} maxLength={300}
                    className={INPUT + " resize-none"}
                    placeholder="Ceritakan keunggulan, produk andalan, atau sejarah singkat toko Anda…"
                />
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                <Globe size={14} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-600 leading-relaxed">
                    Informasi ini akan ditampilkan secara publik dan dapat dilihat seluruh pengguna BARLING-GO.
                </p>
                </div>
            </div>
            </div>

            {/* RIGHT: Lokasi & Kontak */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <MapPin size={15} className="text-blue-500" />
                </div>
                <div>
                <p className="text-sm font-bold text-gray-900">Lokasi & Kontak</p>
                <p className="text-[11px] text-gray-400">Data penjemputan kurir & kontak pelanggan</p>
                </div>
            </div>
            <div className="p-5 space-y-4 flex-1">
                <div>
                <label className={LABEL}>Alamat Lengkap</label>
                <textarea
                    name="address" value={form.address} onChange={handleChange} rows={2}
                    className={INPUT + " resize-none"}
                    placeholder="Jl. Raya Contoh No. 123, RT 01/RW 02…"
                />
                </div>
                <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={LABEL}>Kota / Kabupaten</label>
                    <select name="city" value={form.city} onChange={handleChange} className={INPUT}>
                    <option value="">Pilih Kota…</option>
                    <option value="Purbalingga">Purbalingga</option>
                    <option value="Banyumas">Banyumas</option>
                    <option value="Banjarnegara">Banjarnegara</option>
                    <option value="Cilacap">Cilacap</option>
                    </select>
                </div>
                <div>
                    <label className={LABEL}>Kode Pos</label>
                    <input name="postal_code" value={form.postal_code} onChange={handleChange} className={INPUT} placeholder="53311" />
                </div>
                </div>

                {/* Divider penanggung jawab */}
                <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 mb-3">
                    <User size={13} className="text-gray-400" />
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Penanggung Jawab</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                    <label className={LABEL}>Nama Pemilik</label>
                    <input name="full_name" value={form.full_name} onChange={handleChange} className={INPUT} placeholder="Nama lengkap" />
                    </div>
                    <div>
                    <label className={LABEL}>WhatsApp Outlet</label>
                    <div className="relative">
                        <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                        name="phone" value={form.phone} onChange={handleChange}
                        className={INPUT + " pl-9"} placeholder="08…"
                        />
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>

        {/* ── Save button ── */}
        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-5 py-4">
            <p className="text-xs text-gray-400 hidden sm:block">
            {saved
                ? <span className="text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle2 size={13} /> Perubahan berhasil disimpan</span>
                : "Pastikan semua informasi sudah benar sebelum menyimpan"}
            </p>
            <button
            type="submit"
            disabled={saving || saved}
            className={`ml-auto inline-flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 disabled:opacity-60 ${
                saved
                ? "bg-emerald-500 text-white shadow-emerald-200"
                : "bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white shadow-[#6EB8BB]/30"
            }`}
            >
            {saving && <Loader2 size={15} className="animate-spin" />}
            {saved   && <Check size={15} />}
            {saved ? "Tersimpan!" : saving ? "Menyimpan…" : "Simpan Profil Toko"}
            </button>
        </div>

        {/* ── Promo package CTA ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-[#11301d] to-[#1a4a3a] text-white p-7">
            <div className="absolute right-0 top-0 opacity-5 translate-x-1/4 -translate-y-1/4 pointer-events-none">
            <Megaphone size={240} />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                <div className="p-1.5 bg-yellow-400/20 rounded-lg">
                    <Crown size={18} className="text-yellow-400" />
                </div>
                <h3 className="text-base font-bold text-white">Program Mitra Promosi</h3>
                <span className="px-2.5 py-0.5 bg-white/10 border border-white/20 text-yellow-400 text-[10px] font-black uppercase tracking-wider rounded-full">
                    {packageLabel}
                </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed max-w-xl">
                Tingkatkan omzet dengan eksposur maksimal! Produk UMKM Anda tampil di{" "}
                <strong className="text-white">Halaman Utama</strong> dan jadi rekomendasi teratas wisatawan Barlingmascakep.
                </p>
                {!isPremium && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {["Tampil di Halaman Utama", "Label Toko Pilihan", "Prioritas Pencarian"].map((perk) => (
                    <span key={perk} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-200 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                        <Sparkles size={11} className="text-yellow-400" /> {perk}
                    </span>
                    ))}
                </div>
                )}
            </div>
            <Link
                href="/admin/langganan"
                className="shrink-0 inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(250,204,21,0.25)] hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] hover:scale-[1.02] active:scale-[0.97] text-sm"
            >
                {isPremium ? "Kelola Paket" : "Upgrade Sekarang"} <ArrowRight size={17} />
            </Link>
            </div>
        </div>
        </form>
    )
    }