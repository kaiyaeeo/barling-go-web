    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import { Star, Loader2, Send } from "lucide-react"

    export default function ReviewForm({ contentId }: { contentId: string }) {
    const router = useRouter()
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0)
    const [body, setBody] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (rating === 0) { setError("Pilih rating terlebih dahulu."); return }
        if (body.trim().length < 10) { setError("Ulasan minimal 10 karakter."); return }
        setLoading(true); setError(null)

        const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, rating, body }),
        })
        const data = await res.json()
        setLoading(false)
        if (!res.ok) { setError(data.error); return }
        setSuccess(true)
        setRating(0); setBody("")
        setTimeout(() => { setSuccess(false); router.refresh() }, 1500)
    }

    if (success) {
        return (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold text-green-700">✓ Ulasan berhasil dikirim! Terima kasih.</p>
        </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-gray-900">Tulis Ulasanmu</h3>

        {/* Star rating */}
        <div>
            <p className="text-xs text-gray-500 mb-2">Rating kamu:</p>
            <div className="flex gap-1">
            {[1,2,3,4,5].map((s) => (
                <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110"
                >
                <Star
                    size={24}
                    className={(hover || rating) >= s ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
                />
                </button>
            ))}
            </div>
        </div>

        <div>
            <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Ceritakan pengalamanmu mengunjungi tempat ini..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] resize-none"
            />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#6EB8BB] hover:bg-[#5AA4A7] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all"
        >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {loading ? "Mengirim..." : "Kirim Ulasan"}
        </button>
        </form>
    )
    }
