    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import { Loader2, Check } from "lucide-react"

    const ORDER_STATUSES = [
    { value: "pending",    label: "Pending" },
    { value: "paid",       label: "Sudah Dibayar" },
    { value: "processing", label: "Diproses" },
    { value: "packing",    label: "Dikemas" },
    { value: "shipped",    label: "Dikirim" },
    { value: "delivered",  label: "Diterima" },
    { value: "cancelled",  label: "Dibatalkan" },
    { value: "refunded",   label: "Refund" },
    ]

    export default function OrderStatusUpdater({
    orderId,
    currentStatus,
    trackingNumber: initialTracking,
    }: {
    orderId: string
    currentStatus: string
    trackingNumber: string
    }) {
    const router = useRouter()
    const [status, setStatus] = useState(currentStatus)
    const [tracking, setTracking] = useState(initialTracking)
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)

    async function handleSave() {
        setLoading(true)
        const res = await fetch(`/api/pesanan/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            status,
            tracking_number: tracking || null,
            payment_status: status === "paid" || status === "processing" ? "paid" : undefined,
        }),
        })
        setLoading(false)
        if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        router.refresh()
        }
    }

    return (
        <div className="space-y-4">
        <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Status Pesanan</label>
            <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] bg-white"
            >
            {ORDER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
            ))}
            </select>
        </div>

        {["shipped", "delivered"].includes(status) && (
            <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Nomor Resi</label>
            <input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="Masukkan nomor resi ekspedisi"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]"
            />
            </div>
        )}

        <button
            onClick={handleSave}
            disabled={loading || saved}
            className={`px-6 py-2.5 font-semibold rounded-xl text-sm flex items-center gap-2 transition-all ${
            saved
                ? "bg-green-500 text-white"
                : "bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white disabled:opacity-60"
            }`}
        >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {saved && <Check size={14} />}
            {saved ? "Tersimpan!" : loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
        </div>
    )
    }