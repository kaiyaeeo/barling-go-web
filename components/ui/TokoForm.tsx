    "use client"

    import { useState, useRef } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import {
    Loader2, Check, MapPin, Crown, ArrowRight, User, ShieldCheck,
    Store, Star, Package, Eye, BadgeCheck, Phone, Globe, Sparkles,
    X, Camera, CheckCircle2, Zap, TrendingUp, Rocket, Award, BarChart2,
    ShoppingBag, ChevronRight, Lock, Megaphone, AlertTriangle
    } from "lucide-react"
    import Link from "next/link"

    type Profile = {
    id: string; full_name: string | null; phone: string | null;
    avatar_url: string | null; umkm_name: string | null;
    umkm_logo: string | null; umkm_description: string | null;
    address: string | null; city: string | null;
    postal_code: string | null; promo_package: string | null;
    }

    type Stats = {
    activeProducts: number;
    totalSold: number;
    avgRating: number;
    }

    export default function TokoForm({ initialData, stats }: { initialData: Profile, stats: Stats }) {
    const router   = useRouter()
    const supabase = createClient()
    const logoRef  = useRef<HTMLInputElement>(null)

    const [form, setForm] = useState({
        full_name:        initialData.full_name        ?? "",
        phone:            initialData.phone            ?? "",
        umkm_name:        initialData.umkm_name        ?? "",
        umkm_description: initialData.umkm_description ?? "",
        address:          initialData.address          ?? "",
        city:             initialData.city             ?? "",
        postal_code:      initialData.postal_code      ?? "",
    })

    const [logoUrl,   setLogoUrl]   = useState<string | null>(
        initialData.umkm_logo
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${initialData.umkm_logo}`
        : null
    )
    const [logoPath,  setLogoPath]  = useState(initialData.umkm_logo ?? "")
    const [uploading, setUploading] = useState(false)
    const [saving,    setSaving]    = useState(false)
    const [saved,     setSaved]     = useState(false)
    const [error,     setError]     = useState<string | null>(null)

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

    // Completeness
    const fieldItems = [
        { label: "Nama toko",    value: form.umkm_name,        ok: !!form.umkm_name        },
        { label: "Deskripsi",    value: form.umkm_description, ok: !!form.umkm_description  },
        { label: "Alamat",       value: form.address,          ok: !!form.address           },
        { label: "Kota",         value: form.city,             ok: !!form.city              },
        { label: "Kode pos",     value: form.postal_code,      ok: !!form.postal_code       },
        { label: "Nama pemilik", value: form.full_name,        ok: !!form.full_name         },
        { label: "WhatsApp",     value: form.phone,            ok: !!form.phone             },
        { label: "Logo toko",    value: logoPath,              ok: !!logoPath               },
    ]
    const filled       = fieldItems.filter(f => f.ok).length
    const completeness = Math.round((filled / fieldItems.length) * 100)

    const packageLabel = initialData.promo_package || "REGULER"
    const isPremium    = packageLabel.toUpperCase() !== "REGULER"

    const completenessColor =
        completeness >= 80 ? "bg-[#6EB8BB]" :
        completeness >= 50 ? "bg-amber-400" : "bg-red-400"

    const completenessLabel =
        completeness === 100 ? "Profil Lengkap 🎉" :
        completeness >= 80   ? "Hampir Lengkap" :
        completeness >= 50   ? "Perlu Dilengkapi" : "Segera Lengkapi"

    const INPUT = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] bg-white placeholder:text-gray-300 transition-all"
    const LABEL = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"

    const pakets = [
        {
        key: "REGULER", name: "Reguler", price: "Gratis", icon: Store,
        features: [true, true, true, false, false, false, false]
        },
        {
        key: "BASIC", name: "Basic", price: "Rp 50rb/bln", icon: Star,
        features: [true, true, true, true, false, false, false]
        },
        {
        key: "PREMIUM", name: "Premium", price: "Rp 150rb/bln", icon: Crown, popular: true,
        features: [true, true, true, true, true, true, true]
        },
    ]
    const featureLabels = [
        "Etalase toko publik", "Manajemen pesanan", "Produk unlimited",
        "Featured di beranda", "Badge 'Toko Pilihan'", "Prioritas pencarian", "Analitik Lanjutan"
    ]

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-5">

        {/* ── Error banner ── */}
        {error && (
            <div className="flex items-start gap-3 px-5 py-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-2xl">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
            <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <X size={13} />
            </button>
            </div>
        )}

        {/* ── Hero card ── */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {/* Subtle banner */}
            <div className="h-28 bg-gray-100 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#6EB8BB]/5 via-transparent to-[#6EB8BB]/10" />
            {isPremium && (
                <span className="absolute top-4 right-5 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-300 text-gray-900 text-[10px] font-black uppercase tracking-wider rounded-full shadow-md">
                <Crown size={11} className="fill-gray-900" /> Mitra {packageLabel}
                </span>
            )}
            </div>

            {/* Identity row */}
            <div className="px-6 sm:px-8 pb-0 -mt-12 flex flex-col sm:flex-row items-start gap-5 relative z-10">

            {/* Logo */}
            <div className="relative shrink-0">
                <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer group"
                onClick={() => logoRef.current?.click()}
                >
                {logoUrl
                    ? <img src={logoUrl} alt="logo" className="w-full h-full object-cover group-hover:brightness-75 transition-all" />
                    : <span className="text-4xl font-black text-gray-300">{form.umkm_name?.[0]?.toUpperCase() ?? "T"}</span>
                }
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera size={22} className="text-white" />
                </div>
                </div>
                <button
                type="button" onClick={() => logoRef.current?.click()} disabled={uploading}
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center shadow-md hover:bg-[#6EB8BB] hover:text-white hover:border-[#6EB8BB] transition-all"
                >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                </button>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0 pt-2 sm:pt-14 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4 w-full">
                <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 truncate">
                    {form.umkm_name || <span className="text-gray-300 font-normal italic text-lg">Nama toko belum diisi</span>}
                    </h1>
                    <BadgeCheck size={20} className="text-[#6EB8BB] shrink-0" />
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full">Aktif</span>
                    {!isPremium && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-50 text-gray-400 border border-gray-200 rounded-full flex items-center gap-1">
                        <Crown size={9} /> {packageLabel}
                    </span>
                    )}
                </div>
                {form.umkm_description
                    ? <p className="text-sm text-gray-500 mt-1 line-clamp-2 max-w-xl leading-relaxed">{form.umkm_description}</p>
                    : <p className="text-sm text-gray-300 italic mt-1">Tambahkan deskripsi toko di formulir di bawah.</p>
                }
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 font-medium flex-wrap">
                    <span className="flex items-center gap-1"><MapPin size={11} /> {form.city || "Kota belum diatur"}</span>
                    <span className="text-gray-200">·</span>
                    <span className="flex items-center gap-1"><Phone size={11} /> {form.phone || "Kontak belum diatur"}</span>
                </div>
                </div>

                {/* Stats */}
                <div className="flex items-stretch bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden divide-x divide-gray-100 shrink-0 self-start sm:self-auto">
                {[
                    { icon: Package,    label: "Produk",  value: stats.activeProducts, color: "text-[#6EB8BB]"   },
                    { icon: ShoppingBag,label: "Terjual", value: stats.totalSold,      color: "text-purple-500"  },
                    { icon: Star,       label: "Rating",  value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—", color: "text-amber-500" },
                ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="flex flex-col items-center justify-center px-5 py-3 gap-0.5">
                    <div className={`flex items-center gap-1 ${color}`}>
                        <Icon size={11} className="shrink-0" />
                        <p className="text-sm font-black text-gray-900">{value}</p>
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{label}</p>
                    </div>
                ))}
                </div>
            </div>
            </div>

            {/* Completeness bar */}
            <div className="border-t border-gray-100 px-6 sm:px-8 py-4 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 shrink-0">
                <ShieldCheck size={15} className={completeness === 100 ? "text-emerald-500" : "text-gray-400"} />
                <p className="text-xs font-bold text-gray-700">Kelengkapan Profil</p>
                </div>
                <div className="flex-1 flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${completenessColor} rounded-full transition-all duration-500`} style={{ width: `${completeness}%` }} />
                </div>
                <span className="text-xs font-black text-gray-700 w-8 text-right">{completeness}%</span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                completeness === 100 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                completeness >= 80   ? "bg-[#E6F7F8] text-[#6EB8BB] border-[#C5EAE9]" :
                completeness >= 50   ? "bg-amber-50 text-amber-600 border-amber-100" :
                "bg-red-50 text-red-500 border-red-100"
                }`}>
                {completenessLabel}
                </span>
            </div>

            {/* Missing fields hint */}
            {completeness < 100 && (
                <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                <span className="text-[10px] text-gray-400">Belum diisi:</span>
                {fieldItems.filter(f => !f.ok).map(f => (
                    <span key={f.label} className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                    {f.label}
                    </span>
                ))}
                </div>
            )}
            </div>
        </div>

        {/* ── 2-column form ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Card kiri: Identitas */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-[#E6F7F8] flex items-center justify-center">
                <Store size={14} className="text-[#6EB8BB]" />
                </div>
                <div>
                <p className="text-sm font-bold text-gray-900">Identitas Toko</p>
                <p className="text-[11px] text-gray-400">Tampil publik di halaman etalase</p>
                </div>
            </div>
            <div className="p-5 space-y-4">
                <div>
                <label className={LABEL}>Nama Toko / UMKM <span className="text-red-400 normal-case font-normal">*</span></label>
                <input name="umkm_name" value={form.umkm_name} onChange={handleChange} required className={INPUT} placeholder="Contoh: Toko Kripik Bu Siti" />
                </div>
                <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deskripsi Singkat</label>
                    <span className={`text-[10px] font-semibold ${form.umkm_description.length > 270 ? "text-amber-500" : "text-gray-400"}`}>
                    {form.umkm_description.length}/300
                    </span>
                </div>
                <textarea
                    name="umkm_description" value={form.umkm_description} onChange={handleChange}
                    rows={5} maxLength={300} className={INPUT + " resize-none"}
                    placeholder="Ceritakan keunggulan produk andalan atau sejarah singkat toko Anda…"
                />
                </div>
                <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                <Globe size={13} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-600 leading-relaxed">Informasi ini ditampilkan publik dan dapat dilihat seluruh pengguna BARLING-GO.</p>
                </div>
            </div>
            </div>

            {/* Card kanan: Lokasi & Kontak */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <MapPin size={14} className="text-blue-500" />
                </div>
                <div>
                <p className="text-sm font-bold text-gray-900">Lokasi & Kontak</p>
                <p className="text-[11px] text-gray-400">Data pengiriman & kontak pelanggan</p>
                </div>
            </div>
            <div className="p-5 space-y-4 flex-1">
                <div>
                <label className={LABEL}>Alamat Lengkap</label>
                <textarea name="address" value={form.address} onChange={handleChange} rows={2} className={INPUT + " resize-none"} placeholder="Jl. Sudirman No. 123, RT/RW…" />
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
                <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 mb-3">
                    <User size={12} className="text-gray-400" />
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Penanggung Jawab</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                    <label className={LABEL}>Nama Pemilik</label>
                    <input name="full_name" value={form.full_name} onChange={handleChange} className={INPUT} placeholder="Sesuai KTP" />
                    </div>
                    <div>
                    <label className={LABEL}>Nomor WhatsApp</label>
                    <div className="relative">
                        <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input name="phone" value={form.phone} onChange={handleChange} className={INPUT + " pl-9"} placeholder="0812…" />
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>

        {/* ── Sticky save bar ── */}
        <div className="sticky bottom-4 z-30 flex items-center justify-between bg-white rounded-2xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.09)] px-5 py-3.5">
            <p className="text-xs text-gray-400 hidden sm:block">
            {saved
                ? <span className="text-emerald-600 font-bold flex items-center gap-1.5"><CheckCircle2 size={14} /> Profil berhasil diperbarui!</span>
                : `${filled}/${fieldItems.length} atribut terisi · pastikan data sudah benar`
            }
            </p>
            <button
            type="submit" disabled={saving || saved}
            className={`ml-auto inline-flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-60 ${
                saved ? "bg-emerald-500 text-white" : "bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white shadow-sm shadow-[#6EB8BB]/30"
            }`}
            >
            {saving && <Loader2 size={15} className="animate-spin" />}
            {saved   && <Check size={15} />}
            {saved ? "Tersimpan!" : saving ? "Menyimpan…" : "Simpan Perubahan"}
            </button>
        </div>

        {/* ── Section divider ── */}
        <div className="relative py-8">
            <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dashed border-gray-200" />
            </div>
            <div className="relative flex justify-center">
            <span className="bg-[#F5F5F5] px-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Layanan & Promosi
            </span>
            </div>
        </div>

        {/* ── Paket comparison table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                <Crown size={17} className="text-[#6EB8BB]" /> Upgrade & Perluas Jangkauan
                </h2>
                <p className="text-xs text-gray-400 mt-1">Pilih paket mitra untuk tampil di halaman utama dan fitur eksklusif lainnya.</p>
            </div>
            <Link href="/admin/langganan"
                className="inline-flex items-center gap-1 px-4 py-2 bg-[#E6F7F8] text-[#6EB8BB] text-xs font-bold rounded-xl hover:bg-[#C5EAE9] transition-colors shrink-0">
                Lihat Semua Fitur <ChevronRight size={13} />
            </Link>
            </div>

            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[560px]">
                <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Fitur</th>
                    {pakets.map(p => {
                    const isCurrent = packageLabel.toUpperCase() === p.key
                    return (
                        <th key={p.key} className="px-4 py-4 text-center border-l border-gray-100 w-1/4">
                        <div className={`inline-flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border w-full max-w-[130px] mx-auto ${
                            isCurrent
                            ? "ring-2 ring-[#6EB8BB] bg-[#E6F7F8]/40 border-[#6EB8BB]"
                            : p.popular
                            ? "bg-amber-50 border-amber-200"
                            : "bg-white border-gray-200"
                        }`}>
                            {p.popular && !isCurrent && (
                            <span className="text-[9px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full uppercase">Populer</span>
                            )}
                            <p className={`text-sm font-black ${p.popular && !isCurrent ? "text-amber-600" : "text-gray-900"}`}>{p.name}</p>
                            <p className="text-[10px] text-gray-400">{p.price}</p>
                            {isCurrent && <span className="text-[9px] font-black text-[#6EB8BB]">✓ Aktif</span>}
                        </div>
                        </th>
                    )
                    })}
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                {featureLabels.map((label, i) => (
                    <tr key={i} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-600 font-medium">{label}</td>
                    {pakets.map(p => (
                        <td key={p.key} className="px-4 py-3 text-center border-l border-gray-100">
                        {p.features[i]
                            ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" />
                            : <span className="text-gray-300 text-lg font-bold">–</span>
                        }
                        </td>
                    ))}
                    </tr>
                ))}
                <tr className="bg-gray-50/50">
                    <td className="px-6 py-4" />
                    {pakets.map(p => {
                    const isActive = packageLabel.toUpperCase() === p.key
                    return (
                        <td key={p.key} className="px-4 py-4 text-center border-l border-gray-100">
                        {isActive
                            ? <span className="inline-block px-4 py-1.5 bg-[#E6F7F8] text-[#6EB8BB] text-xs font-bold rounded-xl border border-[#C5EAE9]">Paket Saat Ini</span>
                            : <Link href="/admin/langganan"
                                className="inline-block px-4 py-1.5 bg-white border border-gray-200 hover:border-[#6EB8BB] hover:text-[#6EB8BB] text-gray-600 text-xs font-bold rounded-xl transition-all shadow-sm">
                                Pilih {p.name}
                            </Link>
                        }
                        </td>
                    )
                    })}
                </tr>
                </tbody>
            </table>
            </div>
        </div>

        {/* ── Big promo banner ── */}
        <div className="bg-gradient-to-br from-[#1A4C2E] via-[#2D7D46] to-[#6EB8BB] rounded-2xl p-7 lg:p-9 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-5 translate-x-1/4 -translate-y-1/4 pointer-events-none">
            <TrendingUp size={280} />
            </div>
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-7">
            <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                <div className="p-1.5 bg-yellow-400/20 rounded-xl">
                    <Rocket size={18} className="text-yellow-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">Tingkatkan Visibilitas & Penjualan Toko Anda</h3>
                <span className="px-2.5 py-0.5 bg-white/10 border border-white/20 text-yellow-400 text-[10px] font-black uppercase tracking-wider rounded-full">
                    {packageLabel}
                </span>
                </div>
                <p className="text-sm text-green-50 leading-relaxed max-w-2xl">
                Mitra premium Barling-GO tampil lebih menonjol di mata wisatawan. Raih lebih banyak pembeli dengan fitur eksklusif yang dirancang khusus untuk UMKM berkembang.
                </p>
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { icon: TrendingUp, label: "+200% Impresi",    sub: "vs Reguler"          },
                    { icon: Eye,        label: "Beranda Utama",    sub: "Tampil di spotlight" },
                    { icon: Award,      label: "Badge Pilihan",    sub: "Tingkatkan trust"    },
                    { icon: BarChart2,  label: "Analitik Lanjutan",sub: "Data penjualan"      },
                ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 backdrop-blur-sm">
                    <Icon size={16} className="text-green-200 shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-white leading-tight">{label}</p>
                        <p className="text-[10px] text-green-200 mt-0.5">{sub}</p>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            <Link
                href="/admin/langganan"
                className="shrink-0 w-full lg:w-auto inline-flex justify-center items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-green-900 font-black px-7 py-3.5 rounded-xl transition-all shadow-[0_0_25px_rgba(250,204,21,0.25)] hover:scale-[1.02] active:scale-[0.97] text-sm"
            >
                {isPremium ? "Kelola Langganan" : "Upgrade Sekarang"} <ArrowRight size={16} />
            </Link>
            </div>
        </div>

        {/* ── Mini promo cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
            { icon: Megaphone, title: "Iklan Pencarian",  desc: "Tampil paling atas saat pengunjung mencari produk.", link: "/admin/iklan",       soon: false },
            { icon: Rocket,    title: "Toko Pilihan",     desc: "Badge khusus rekomendasi admin untuk trust tinggi.", link: "/admin/langganan",   soon: false },
            { icon: Award,     title: "Flash Sale",       desc: "Ikut serta dalam diskon bulanan Barling-GO.",        link: "/admin/iklan",       soon: true  },
            ].map(({ icon: Icon, title, desc, link, soon }) => (
            <div key={title} className={`bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-3.5 hover:shadow-md transition-all ${soon ? "opacity-60" : ""}`}>
                <div className="w-9 h-9 rounded-xl bg-[#E6F7F8] flex items-center justify-center shrink-0">
                <Icon size={16} className="text-[#6EB8BB]" />
                </div>
                <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-gray-900">{title}</p>
                    {soon && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200 uppercase">Segera</span>
                    )}
                </div>
                <p className="text-xs text-gray-400 mb-2.5 leading-relaxed">{desc}</p>
                <Link href={link} className={`text-xs font-bold text-[#6EB8BB] hover:underline flex items-center gap-1 ${soon ? "pointer-events-none text-gray-400" : ""}`}>
                    {soon ? "Ingatkan Saya" : <>Pelajari lebih lanjut <ArrowRight size={10} /></>}
                </Link>
                </div>
            </div>
            ))}
        </div>

        </form>
    )
    }