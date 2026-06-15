    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { Loader2 } from "lucide-react"

    export default function ProductStatusToggle({
    productId, isActive,
    }: { productId: string; isActive: boolean }) {
    const router = useRouter()
    const supabase = createClient()
    const [active, setActive] = useState(isActive)
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
        <button
        onClick={handleToggle}
        disabled={loading}
        title={active ? "Nonaktifkan" : "Aktifkan"}
        className={`w-9 h-7 rounded-lg flex items-center justify-center border text-[11px] font-bold transition-all ${
            active
            ? "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
            : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100"
        }`}
        >
        {loading ? <Loader2 size={11} className="animate-spin" /> : active ? "ON" : "OFF"}
        </button>
    )
    }
