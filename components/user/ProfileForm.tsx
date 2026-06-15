    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import { Loader2, Check, ShieldCheck } from "lucide-react"

    const PREFERENCE_TAGS = [
    { id: "wisata_alam",      label: "🏔 Wisata Alam" },
    { id: "kuliner_lokal",    label: "🍜 Kuliner Lokal" },
    { id: "sejarah_budaya",   label: "🏛 Sejarah & Budaya" },
    { id: "belanja_oleh",     label: "🛍 Belanja Oleh-Oleh" },
    { id: "petualangan",      label: "🧗 Petualangan" },
    { id: "religi",           label: "🕌 Wisata Religi" },
    { id: "keluarga",         label: "👨‍👩‍👧 Wisata Keluarga" },
    { id: "fotografi",        label: "📸 Fotografi" },
    ]

    type Profile = {
    full_name: string | null
    phone: string | null
    date_of_birth: string | null
    gender: string | null
    preferences: string[] | null
    }

    export default function ProfileForm({
    profile,
    email,
    }: { profile: Profile | null; email: string }) {
    const router = useRouter()

    const [form, setForm] = useState({
        full_name: profile?.full_name ?? "",
        phone: profile?.phone ?? "",
        date_of_birth: profile?.date_of_birth ?? "",
        gender: profile?.gender ?? "male",
    })
    const [prefs, setPrefs] = useState<string[]>(profile?.preferences ?? [])
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function togglePref(id: string) {
        setPrefs((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
        )
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        setError(null)

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

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>
        )}

        {/* Personal info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span>📋</span> Informasi Pribadi
            </h2>
            <div className="grid grid-cols-2 gap-4">
            {/* Full name */}
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name</label>
                <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Nama lengkap"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]"
                />
            </div>

            {/* Email — readonly */}
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                <div className="relative">
                <input
                    value={email}
                    readOnly
                    className="w-full px-4 py-2.5 pr-24 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <ShieldCheck size={10} /> Verified
                </span>
                </div>
            </div>

            {/* Phone */}
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone Number</label>
                <div className="flex gap-2">
                <div className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500 font-medium shrink-0">
                    +62
                </div>
                <input
                    name="phone"
                    value={form.phone.replace(/^\+62/, "")}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="81234567890"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]"
                />
                </div>
            </div>

            {/* Date of birth */}
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Date of Birth</label>
                <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]"
                />
            </div>

            {/* Gender */}
            <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-3">Gender</label>
                <div className="flex gap-6">
                {[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                ].map((g) => (
                    <label key={g.value} className="flex items-center gap-2 cursor-pointer">
                    <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        form.gender === g.value
                            ? "border-[#6EB8BB] bg-[#6EB8BB]"
                            : "border-gray-300"
                        }`}
                        onClick={() => setForm((p) => ({ ...p, gender: g.value }))}
                    >
                        {form.gender === g.value && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                    </div>
                    <span className="text-sm text-gray-700">{g.label}</span>
                    </label>
                ))}
                </div>
            </div>
            </div>
        </div>

        {/* Travel preferences */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span>🧭</span> Preferensi Wisata
            </h2>
            <p className="text-sm text-gray-400 mb-5">
            Pilih minat Anda untuk mendapatkan rekomendasi perjalanan yang personal.
            </p>
            <div className="flex flex-wrap gap-2.5">
            {PREFERENCE_TAGS.map((tag) => {
                const active = prefs.includes(tag.id)
                return (
                <button
                    key={tag.id}
                    type="button"
                    onClick={() => togglePref(tag.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    active
                        ? "bg-[#6EB8BB] text-white border-[#6EB8BB]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-[#6EB8BB] hover:text-[#6EB8BB]"
                    }`}
                >
                    {tag.label}
                </button>
                )
            })}
            </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-gray-400">
            Terakhir diubah: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <div className="flex gap-3">
            <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
            >
                Batalkan
            </button>
            <button
                type="submit"
                disabled={saving || saved}
                className={`px-6 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 transition-all ${
                saved
                    ? "bg-green-500 text-white"
                    : "bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white disabled:opacity-60"
                }`}
            >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saved && <Check size={14} />}
                {saved ? "Tersimpan!" : saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            </div>
        </div>
        </form>
    )
    }
