    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import Link from "next/link"
    import { Loader2 } from "lucide-react"

    export default function OrderActionButton({
    orderId, status,
    }: { orderId: string; status: string }) {
    const router   = useRouter()
    const [loading, setLoading] = useState(false)

    async function updateStatus(newStatus: string) {
        setLoading(true)
        await fetch(`/api/pesanan/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        })
        setLoading(false)
        router.refresh()
    }

    if (loading) {
        return (
        <div className="w-24 h-9 flex items-center justify-center">
            <Loader2 size={14} className="animate-spin text-gray-400" />
        </div>
        )
    }

    if (status === "paid") {
        return (
        <button onClick={() => updateStatus("processing")}
            className="px-3 py-1.5 bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white text-xs font-bold rounded-lg transition-all">
            Proses
        </button>
        )
    }
    if (status === "processing" || status === "packing") {
        return (
        <button onClick={() => updateStatus("shipped")}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg transition-all">
            Selesaikan
        </button>
        )
    }
    if (status === "delivered") {
        return (
        <Link href={`/admin/pesanan/${orderId}`}
            className="px-3 py-1.5 text-[#6EB8BB] text-xs font-bold rounded-lg hover:bg-green-50 transition-all">
            Lihat Detail
        </Link>
        )
    }
    if (status === "cancelled") {
        return (
        <Link href={`/admin/pesanan/${orderId}`}
            className="px-3 py-1.5 text-gray-500 text-xs font-medium rounded-lg hover:bg-gray-100 transition-all">
            Lihat Alasan
        </Link>
        )
    }
    return (
        <Link href={`/admin/pesanan/${orderId}`}
        className="px-3 py-1.5 text-gray-500 text-xs font-medium rounded-lg hover:bg-gray-100 transition-all">
        Detail
        </Link>
    )
    }
