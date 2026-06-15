    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { Loader2, Check } from "lucide-react"

    // ─── Site Stats Editor ────────────────────────────────────────
    type Stat = { key: string; value: string; label: string; sub_label: string | null }

    export function SiteStatsEditor({ stats }: { stats: Stat[] }) {
    const router = useRouter()
    const supabase = createClient()
    const [data, setData] = useState<Stat[]>(stats)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    function handleChange(key: string, field: keyof Stat, val: string) {
        setData((prev) => prev.map((s) => s.key === key ? { ...s, [field]: val } : s))
    }

    async function handleSave() {
        setSaving(true)
        for (const stat of data) {
        await supabase.from("site_stats").update({
            value: stat.value,
            label: stat.label,
            sub_label: stat.sub_label,
        }).eq("key", stat.key)
        }
        setSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        router.refresh()
    }

    return (
        <div className="space-y-4">
        {data.map((stat) => (
            <div key={stat.key} className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-xl">
            <div>
                <label className="block text-xs text-gray-400 mb-1">Nilai</label>
                <input value={stat.value} onChange={(e) => handleChange(stat.key, "value", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#6EB8BB]" />
            </div>
            <div>
                <label className="block text-xs text-gray-400 mb-1">Label</label>
                <input value={stat.label} onChange={(e) => handleChange(stat.key, "label", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#6EB8BB]" />
            </div>
            <div>
                <label className="block text-xs text-gray-400 mb-1">Sub-label</label>
                <input value={stat.sub_label ?? ""} onChange={(e) => handleChange(stat.key, "sub_label", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#6EB8BB]" />
            </div>
            </div>
        ))}
        <button onClick={handleSave} disabled={saving || saved}
            className={`px-6 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all ${saved ? "bg-green-500 text-white" : "bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white disabled:opacity-60"}`}>
            {saving && <Loader2 size={13} className="animate-spin" />}
            {saved && <Check size={13} />}
            {saved ? "Tersimpan!" : saving ? "Menyimpan..." : "Simpan Statistik"}
        </button>
        </div>
    )
    }

    // ─── Hero Settings Editor ─────────────────────────────────────
    type HeroData = { title: string; subtitle: string; image_url: string | null }

    export function HeroSettingsEditor({ initialData }: { initialData: HeroData }) {
    const router = useRouter()
    const supabase = createClient()
    const [form, setForm] = useState(initialData)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    async function handleSave() {
        setSaving(true)
        await supabase.from("hero_settings").update({
        title: form.title,
        subtitle: form.subtitle,
        image_url: form.image_url,
        updated_at: new Date().toISOString(),
        }).eq("id", 1)
        setSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        router.refresh()
    }

    return (
        <div className="space-y-4">
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Judul Hero</label>
            <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]" />
        </div>
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Subtitle Hero</label>
            <textarea value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
            rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] resize-none" />
        </div>
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">URL Foto Background Hero</label>
            <input value={form.image_url ?? ""} onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value || null }))}
            placeholder="https://... atau path Supabase Storage"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]" />
        </div>
        <button onClick={handleSave} disabled={saving || saved}
            className={`px-6 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all ${saved ? "bg-green-500 text-white" : "bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white disabled:opacity-60"}`}>
            {saving && <Loader2 size={13} className="animate-spin" />}
            {saved && <Check size={13} />}
            {saved ? "Tersimpan!" : saving ? "Menyimpan..." : "Simpan Hero"}
        </button>
        </div>
    )
    }

    export default SiteStatsEditor
