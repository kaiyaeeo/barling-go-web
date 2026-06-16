    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import {
    Loader2, Check, ShieldCheck, User, Phone, Calendar,
    Users, Compass, CheckCircle2, X, AlertCircle, Sparkles,
    BadgeCheck, Info
    } from "lucide-react"

    const PREFERENCE_TAGS = [
    { id: "wisata_alam",    label: "🏔 Wisata Alam",       desc: "Gunung, air terjun, alam terbuka"     },
    { id: "kuliner_lokal",  label: "🍜 Kuliner Lokal",     desc: "Masakan khas & jajanan tradisional"   },
    { id: "sejarah_budaya", label: "🏛 Sejarah & Budaya",  desc: "Cagar budaya, museum, kesenian"       },
    { id: "belanja_oleh",   label: "🛍 Belanja Oleh-Oleh", desc: "Kerajinan & produk UMKM lokal"        },
    { id: "petualangan",    label: "🧗 Petualangan",       desc: "Hiking, arung jeram, camping"         },
    { id: "religi",         label: "🕌 Wisata Religi",     desc: "Masjid bersejarah, situs ziarah"      },
    { id: "keluarga",       label: "👨‍👩‍👧 Wisata Keluarga",  desc: "Ramah anak, wahana, taman bermain"    },
    { id: "fotografi",      label: "📸 Fotografi",         desc: "Spot foto estetik & pemandangan"      },
    ]

    type Profile = {
    full_name:     string | null
    phone:         string | null
    date_of_birth: string | null
    gender:        string | null
    preferences:   string[] | null
    }

    const INPUT = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] bg-white placeholder:text-gray-300 transition-all"
    const LABEL = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"

    export default function ProfileForm({
    profile,
    email,
    }: { profile: Profile | null; email: string }) {
    const router = useRouter()

    const [form, setForm] = useState({
        full_name:     profile?.full_name     ?? "",
        phone:         profile?.phone         ?? "",
        date_of_birth: profile?.date_of_birth ?? "",
        gender:        profile?.gender        ?? "male",
    })
    const [prefs,  setPrefs]  = useState<string[]>(profile?.preferences ?? [])
    const [saving, setSaving] = useState(false)
    const [saved,  setSaved]  = useState(false)
    const [error,  setError]  = useState<string | null>(null)

    function togglePref(id: string) {
        setPrefs((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id])
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true); setError(null)

        const res = await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, preferences: prefs }),
        })
        const data = await res.json()
        setSaving(false)
        if (!res.ok) { setError(data.error); return }
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
        router.refresh()
    }

    // Profile completeness
    const completenessItems = [
        { label: "Nama lengkap", ok: !!form.full_name     },
        { label: "Nomor HP",     ok: !!form.phone         },
        { label: "Tanggal lahir",ok: !!form.date_of_birth },
        { label: "Minat wisata", ok: prefs.length > 0     },
    ]
    const filled  = completenessItems.filter(c => c.ok).length
    const pct     = Math.round((filled / completenessItems.length) * 100)

    const completenessColor = pct >= 75 ? "bg-emerald-400" : pct >= 50 ? "bg-[#6EB8BB]" : "bg-amber-400"
    const completenessLabel = pct >= 75 ? "Profil Lengkap" : pct >= 50 ? "Hampir Lengkap" : "Perlu Dilengkapi"

    return (
        <form onSubmit={handleSubmit} className="space-y-5">

        {/* Error banner */}
        {error && (
            <div className="flex items-start gap-3 px-4 py-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
            <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600 shrink-0">
                <X size={14} />
            </button>
            </div>
        )}

        {/* ── Completeness bar ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-[#E6F7F8] flex items-center justify-center shrink-0">
                <ShieldCheck size={17} className="text-[#6EB8BB]" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-bold text-gray-700">Kelengkapan Profil</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    pct >= 75 ? "bg-emerald-50 text-emerald-600" :
                    pct >= 50 ? "bg-[#E6F7F8] text-[#6EB8BB]"   : "bg-amber-50 text-amber-600"
                }`}>{completenessLabel}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                    className={`h-full rounded-full ${completenessColor} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                />
                </div>
                <div className="mt-2 flex items-center gap-3 flex-wrap">
                {completenessItems.map((item) => (
                    <span key={item.label} className={`flex items-center gap-1 text-[10px] font-medium ${item.ok ? "text-gray-500" : "text-gray-400"}`}>
                    {item.ok
                        ? <CheckCircle2 size={11} className="text-emerald-500" />
                        : <span className="w-2.5 h-2.5 rounded-full border border-gray-300 inline-block" />
                    }
                    {item.label}
                    </span>
                ))}
                </div>
            </div>
            </div>
        </div>

        {/* ── Informasi Pribadi ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-[#E6F7F8] flex items-center justify-center shrink-0">
                <User size={15} className="text-[#6EB8BB]" />
            </div>
            <div>
                <p className="text-sm font-bold text-gray-900">Informasi Pribadi</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Data dasar akun Anda di platform Barling-GO</p>
            </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Nama */}
            <div>
                <label className={LABEL}>Nama Lengkap <span className="text-red-400 normal-case font-normal">*</span></label>
                <input
                name="full_name" value={form.full_name} onChange={handleChange}
                placeholder="Nama lengkap Anda" className={INPUT}
                />
            </div>

            {/* Email readonly */}
            <div>
                <label className={LABEL}>Alamat Email</label>
                <div className="relative">
                <input
                    value={email} readOnly
                    className="w-full px-4 py-3 pr-28 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full whitespace-nowrap">
                    <ShieldCheck size={10} /> Terverifikasi
                </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                <Info size={10} /> Email tidak dapat diubah
                </p>
            </div>

            {/* Telepon */}
            <div>
                <label className={LABEL}>Nomor WhatsApp / HP</label>
                <div className="flex gap-2">
                <div className="px-3.5 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500 font-semibold shrink-0 flex items-center gap-1.5">
                    <Phone size={13} className="text-gray-400" /> +62
                </div>
                <input
                    name="phone"
                    value={form.phone.replace(/^\+62/, "")}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="81234567890"
                    className={INPUT + " flex-1"}
                />
                </div>
            </div>

            {/* Tanggal Lahir */}
            <div>
                <label className={LABEL}>Tanggal Lahir</label>
                <div className="relative">
                <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                    type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange}
                    className={INPUT + " pl-10"}
                />
                </div>
            </div>

            {/* Gender */}
            <div className="sm:col-span-2">
                <label className={LABEL}>Jenis Kelamin</label>
                <div className="flex gap-3">
                {[
                    { value: "male",   label: "Laki-laki",  emoji: "👨" },
                    { value: "female", label: "Perempuan",  emoji: "👩" },
                ].map((g) => (
                    <button
                    key={g.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, gender: g.value }))}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border text-sm font-semibold transition-all flex-1 sm:flex-none ${
                        form.gender === g.value
                        ? "bg-[#E6F7F8] border-[#6EB8BB] text-[#6EB8BB] ring-2 ring-[#6EB8BB]/20"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    >
                    <span>{g.emoji}</span>
                    {g.label}
                    {form.gender === g.value && <CheckCircle2 size={14} className="ml-auto text-[#6EB8BB]" />}
                    </button>
                ))}
                </div>
            </div>
            </div>
        </div>

        {/* ── Preferensi Wisata ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                <Compass size={15} className="text-purple-500" />
            </div>
            <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">Preferensi Wisata</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Pilih minat untuk rekomendasi perjalanan yang personal</p>
            </div>
            {prefs.length > 0 && (
                <span className="text-[11px] font-bold px-2.5 py-1 bg-[#E6F7F8] text-[#6EB8BB] border border-[#C5EAE9] rounded-full">
                {prefs.length} dipilih
                </span>
            )}
            </div>

            <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PREFERENCE_TAGS.map((tag) => {
                const isActive = prefs.includes(tag.id)
                return (
                    <button
                    key={tag.id}
                    type="button"
                    onClick={() => togglePref(tag.id)}
                    className={`relative flex flex-col items-start gap-1.5 p-3.5 rounded-xl border text-left transition-all group ${
                        isActive
                        ? "bg-[#E6F7F8] border-[#6EB8BB] ring-2 ring-[#6EB8BB]/20"
                        : "bg-white border-gray-200 hover:border-[#6EB8BB]/40 hover:bg-gray-50"
                    }`}
                    >
                    {isActive && (
                        <div className="absolute top-2 right-2">
                        <CheckCircle2 size={14} className="text-[#6EB8BB]" />
                        </div>
                    )}
                    <span className="text-base leading-none">{tag.label.split(" ")[0]}</span>
                    <p className={`text-xs font-semibold leading-tight ${isActive ? "text-[#6EB8BB]" : "text-gray-700"}`}>
                        {tag.label.split(" ").slice(1).join(" ")}
                    </p>
                    <p className="text-[10px] text-gray-400 leading-snug">{tag.desc}</p>
                    </button>
                )
                })}
            </div>

            {prefs.length === 0 && (
                <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
                <Sparkles size={14} className="text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700">Pilih minimal 1 minat untuk mendapatkan rekomendasi wisata yang lebih personal dari AI kami.</p>
                </div>
            )}
            </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <div className="hidden sm:block">
            {saved ? (
                <span className="text-sm text-emerald-600 font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Profil berhasil diperbarui
                </span>
            ) : (
                <p className="text-xs text-gray-400">
                Terakhir diubah: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
            )}
            </div>
            <div className="flex items-center gap-3 ml-auto">
            <button
                type="button" onClick={() => router.back()}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
            >
                Batalkan
            </button>
            <button
                type="submit" disabled={saving || saved}
                className={`inline-flex items-center gap-2 px-7 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-60 ${
                saved
                    ? "bg-emerald-500 text-white"
                    : "bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white"
                }`}
            >
                {saving && <Loader2 size={15} className="animate-spin" />}
                {saved   && <Check size={15} />}
                {saved ? "Tersimpan!" : saving ? "Menyimpan…" : "Simpan Perubahan"}
            </button>
            </div>
        </div>
        </form>
    )
    }