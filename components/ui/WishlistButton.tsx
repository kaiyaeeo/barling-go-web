    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { Heart, Loader2 } from "lucide-react"

    type Props = {
    productId?:  string
    contentId?:  string
    isLoggedIn:  boolean
    initialSaved: boolean
    }

    export default function WishlistButton({ productId, contentId, isLoggedIn, initialSaved }: Props) {
    const router   = useRouter()
    const supabase = createClient()
    const [saved,   setSaved]   = useState(initialSaved)
    const [loading, setLoading] = useState(false)

    async function toggle() {
        if (!isLoggedIn) { router.push("/login"); return }
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push("/login"); return }

        if (saved) {
        // Remove from wishlist
        let query = supabase.from("wishlists").delete().eq("user_id", user.id)
        if (productId) query = query.eq("product_id", productId)
        if (contentId) query = query.eq("content_id", contentId)
        const { error } = await query
        if (!error) {
            setSaved(false)
            router.refresh() // Memastikan data di server component (seperti sidebar) ikut ter-update
        }
        } else {
        // Add to wishlist
        const payload: any = { user_id: user.id }
        if (productId) payload.product_id = productId
        if (contentId) payload.content_id = contentId
        const { error } = await supabase.from("wishlists").insert(payload)
        if (!error) {
            setSaved(true)
            router.refresh()
        }
        }

        setLoading(false)
    }

    return (
        <button
        onClick={toggle}
        disabled={loading}
        title={saved ? "Hapus dari Tersimpan" : "Simpan ke Tersimpan"}
        className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center border transition-all active:scale-95 shadow-sm ${
            saved
            ? "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100"
            : "bg-white border-gray-200 text-gray-400 hover:border-rose-200 hover:text-rose-400 hover:bg-rose-50/50"
        }`}
        >
        {loading
            ? <Loader2 size={18} className="animate-spin text-gray-400" />
            : <Heart size={20} className={saved ? "fill-rose-500" : ""} />
        }
        </button>
    )
    }