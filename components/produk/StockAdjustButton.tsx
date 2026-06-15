    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import { Edit2, Loader2, X } from "lucide-react"

    export default function StockAdjustButton({
    productId, productName, currentStock,
    }: { productId: string; productName: string; currentStock: number }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [type, setType] = useState<"in" | "out" | "adjustment">("in")
    const [qty, setQty] = useState("")
    const [reason, setReason] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const res = await fetch("/api/inventori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, type, qty: parseInt(qty), reason }),
        })
        const data = await res.json()
        setLoading(false)
        if (!res.ok) { setError(data.error); return }
        setOpen(false)
        setQty("")
        setReason("")
        router.refresh()
    }

    return (
        <>
        <button onClick={() => setOpen(true)} className="p-1.5 text-gray-400 hover:text-[#6EB8BB] hover:bg-green-50 rounded-lg transition-all">
            <Edit2 size={13} />
        </button>

        {open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-900">Ubah Stok</h2>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={18} />
                </button>
                </div>
                <p className="text-sm text-gray-500 mb-4 truncate">{productName}</p>
                <p className="text-sm text-gray-700 mb-5">Stok saat ini: <strong>{currentStock}</strong></p>

                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Tipe</label>
                    <div className="grid grid-cols-3 gap-2">
                    {[
                        { value: "in", label: "▲ Masuk" },
                        { value: "out", label: "▼ Keluar" },
                        { value: "adjustment", label: "⚙ Set" },
                    ].map((t) => (
                        <button
                        key={t.value}
                        type="button"
                        onClick={() => setType(t.value as any)}
                        className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                            type === t.value ? "bg-[#6EB8BB] text-white border-[#6EB8BB]" : "border-gray-200 text-gray-600 hover:border-gray-400"
                        }`}
                        >
                        {t.label}
                        </button>
                    ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    {type === "adjustment" ? "Set Stok Menjadi" : "Jumlah"}
                    </label>
                    <input
                    type="number"
                    min="0"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Keterangan</label>
                    <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Contoh: Restock dari supplier"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]"
                    />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button
                    type="submit"
                    disabled={loading || !qty}
                    className="w-full py-3 bg-[#6EB8BB] hover:bg-[#5AA4A7] disabled:opacity-60 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    {loading ? "Menyimpan..." : "Simpan"}
                </button>
                </form>
            </div>
            </div>
        )}
        </>
    )
    }
