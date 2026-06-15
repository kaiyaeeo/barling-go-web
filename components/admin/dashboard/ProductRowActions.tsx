    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { Loader2 } from "lucide-react"

    export default function ProductRowActions({
    productId, isActive,
    }: { productId: string; isActive: boolean }) {
    const router   = useRouter()
    const supabase = createClient()
    const [active, setActive]   = useState(isActive)
    const [loading, setLoading] = useState(false)

    async function handleToggle() {
        setLoading(true)
        const newVal = !active
        const { error } = await supabase
        .from("products")
        .update({ is_active: newVal, updated_at: new Date().toISOString() })
        .eq("id", productId)
        setLoading(false)
        if (!error) { setActive(newVal); router.refresh() }
    }

    return (
        <div className="flex items-center gap-2">
        {/* Toggle switch */}
        <button
            onClick={handleToggle}
            disabled={loading}
            className="flex items-center gap-2 group"
            title={active ? "Nonaktifkan" : "Aktifkan"}
        >
            {loading ? (
            <Loader2 size={16} className="animate-spin text-gray-400" />
            ) : (
            <div className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${active ? "bg-[#6EB8BB]" : "bg-gray-300"}`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${active ? "translate-x-4" : "translate-x-0"}`} />
            </div>
            )}
            <span className={`text-sm font-medium ${active ? "text-gray-800" : "text-gray-400"}`}>
            {active ? "Aktif" : "Nonaktif"}
            </span>
        </button>
        </div>
    )
    }
