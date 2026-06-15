    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import { Heart, Loader2 } from "lucide-react"

    export default function SavePlaceButton({
    contentId, isLoggedIn, initialSaved,
    }: { contentId: string; isLoggedIn: boolean; initialSaved: boolean }) {
    const router = useRouter()
    const [saved, setSaved] = useState(initialSaved)
    const [loading, setLoading] = useState(false)

    async function handleToggle() {
        if (!isLoggedIn) { router.push("/login"); return }
        setLoading(true)
        const res = await fetch("/api/saved-places", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId }),
        })
        setLoading(false)
        if (res.ok) { setSaved(!saved); router.refresh() }
    }

    return (
        <button
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
            saved
            ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
            : "border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
        >
        {loading
            ? <Loader2 size={14} className="animate-spin" />
            : <Heart size={14} className={saved ? "fill-red-500" : ""} />}
        {saved ? "Disimpan" : "Simpan"}
        </button>
    )
    }
