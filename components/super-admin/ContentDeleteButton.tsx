    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { Loader2 } from "lucide-react"

    export default function ContentDeleteButton({ contentId }: { contentId: string }) {
    const router   = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [confirm, setConfirm] = useState(false)

    async function handleDelete() {
        if (!confirm) { setConfirm(true); return }
        setLoading(true)
        await supabase.from("contents").delete().eq("id", contentId)
        setLoading(false)
        router.refresh()
    }

    if (loading) return <Loader2 size={14} className="animate-spin text-gray-400" />

    return (
        <button
        onClick={handleDelete}
        onBlur={() => setConfirm(false)}
        title={confirm ? "Klik lagi untuk konfirmasi" : "Hapus"}
        className={`p-1.5 rounded-lg transition-all text-sm ${
            confirm ? "bg-red-100 text-red-600 animate-pulse" : "text-gray-400 hover:text-red-400 hover:bg-red-50"
        }`}
        >
        🗑️
        </button>
    )
    }
