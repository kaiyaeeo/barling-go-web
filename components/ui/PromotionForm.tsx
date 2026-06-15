    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import { Loader2 } from "lucide-react"
    import { createClient } from "@/lib/supabase/client"

    export default function PromotionForm() {
    const router = useRouter()
    const supabase = createClient()
    const [form, setForm] = useState({
        code: "", name: "", type: "percentage",
        value: "", min_purchase: "", quota: "", is_active: true,
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value, type } = e.target
        setForm((p) => ({ ...p, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true); setError(null)

        const { error } = await supabase.from("promotions").insert({
        code: form.code.toUpperCase(),
        name: form.name,
        type: form.type,
        value: parseFloat(form.value),
        min_purchase: parseFloat(form.min_purchase || "0"),
        quota: form.quota ? parseInt(form.quota) : null,
        is_active: form.is_active,
        })

        setLoading(false)
        if (error) { setError(error.message); return }
        setForm({ code: "", name: "", type: "percentage", value: "", min_purchase: "", quota: "", is_active: true })
        router.refresh()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
        {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
        {[
            { name: "code", label: "Kode Voucher", placeholder: "CONTOH10", upper: true },
            { name: "name", label: "Nama Promo", placeholder: "Diskon Akhir Tahun" },
        ].map((f) => (
            <div key={f.name}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
            <input name={f.name} value={(form as any)[f.name]} onChange={handleChange} required
                placeholder={f.placeholder}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] font-mono" />
            </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
            <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipe</label>
            <select name="type" value={form.type} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 bg-white">
                <option value="percentage">Persentase (%)</option>
                <option value="fixed">Nominal (Rp)</option>
            </select>
            </div>
            <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nilai</label>
            <input type="number" name="value" value={form.value} onChange={handleChange} required min="0"
                placeholder={form.type === "percentage" ? "10" : "15000"}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]" />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
            <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Min. Pembelian (Rp)</label>
            <input type="number" name="min_purchase" value={form.min_purchase} onChange={handleChange} min="0" placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30" />
            </div>
            <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Kuota (kosong = unlimited)</label>
            <input type="number" name="quota" value={form.quota} onChange={handleChange} min="1" placeholder="100"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30" />
            </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="accent-[#6EB8BB]" />
            <span className="text-sm text-gray-700">Langsung aktifkan</span>
        </label>
        <button type="submit" disabled={loading}
            className="w-full py-3 bg-[#6EB8BB] hover:bg-[#5AA4A7] disabled:opacity-60 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Menyimpan..." : "Buat Voucher"}
        </button>
        </form>
    )
    }
