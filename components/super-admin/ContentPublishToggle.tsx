    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { Loader2 } from "lucide-react"

    export default function ContentPublishToggle({
    contentId, isPublished,
    }: { contentId: string; isPublished: boolean }) {
    const router   = useRouter()
    const supabase = createClient()
    const [pub, setPub]         = useState(isPublished)
    const [loading, setLoading] = useState(false)

    async function handleToggle() {
        setLoading(true)
        const newVal = !pub
        await supabase.from("contents").update({ is_published: newVal, updated_at: new Date().toISOString() }).eq("id", contentId)
        setLoading(false)
        setPub(newVal)
        router.refresh()
    }

    return (
        <button onClick={handleToggle} disabled={loading}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${pub ? "bg-[#6EB8BB]" : "bg-gray-200"}`}>
        {loading
            ? <Loader2 size={10} className="animate-spin mx-auto text-white" />
            : <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${pub ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
        }
        </button>
    )
    }
