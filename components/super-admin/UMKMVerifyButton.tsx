    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

    export default function UMKMVerifyButton({
    verificationId, userId,
    }: { verificationId: string; userId: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState<"approve" | "reject" | null>(null)
    const [showReject, setShowReject] = useState(false)
    const [reason, setReason] = useState("")

    async function handleAction(action: "approve" | "reject") {
        setLoading(action)
        const res = await fetch(`/api/umkm/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId, userId, action, reason }),
        })
        setLoading(null)
        if (res.ok) { setShowReject(false); router.refresh() }
    }

    return (
        <div className="flex flex-col items-end gap-2">
        <div className="flex gap-2">
            <button
            onClick={() => handleAction("approve")}
            disabled={!!loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-60"
            >
            {loading === "approve" ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
            Setujui
            </button>
            <button
            onClick={() => setShowReject(!showReject)}
            disabled={!!loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-semibold rounded-lg transition-all"
            >
            <XCircle size={12} /> Tolak
            </button>
        </div>
        {showReject && (
            <div className="flex gap-2 mt-1">
            <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Alasan penolakan..."
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-red-300 w-44"
            />
            <button
                onClick={() => handleAction("reject")}
                disabled={!!loading || !reason}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg disabled:opacity-60"
            >
                {loading === "reject" ? <Loader2 size={11} className="animate-spin" /> : "Kirim"}
            </button>
            </div>
        )}
        </div>
    )
    }
