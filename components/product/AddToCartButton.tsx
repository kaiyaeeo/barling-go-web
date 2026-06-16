    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { ShoppingCart, Plus, Minus, Loader2, Check } from "lucide-react"

    type Props = {
    productId: string
    stock: number
    initialQty?: number   // qty yang sudah ada di cart (0 = belum)
    isLoggedIn: boolean
    }

    export default function AddToCartButton({ productId, stock, initialQty = 0, isLoggedIn }: Props) {
    const router   = useRouter()
    const supabase = createClient()

    const [qty,      setQty]      = useState(initialQty > 0 ? initialQty : 1)
    const [loading, setLoading] = useState(false)
    const [added,   setAdded]   = useState(false)
    const [inCart,  setInCart]  = useState(initialQty > 0)

    const isOutOfStock = stock === 0

    async function handleAddToCart() {
        if (!isLoggedIn) { router.push("/login"); return }
        if (isOutOfStock) return

        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push("/login"); return }

        // Upsert: jika sudah ada update qty, jika belum insert baru
        const { error } = await supabase
        .from("cart_items")
        .upsert(
            { user_id: user.id, product_id: productId, qty: qty },
            { onConflict: "user_id,product_id" }
        )

        setLoading(false)
        if (!error) {
        setAdded(true)
        setInCart(true)
        // Memberitahu komponen/halaman lain untuk refresh data keranjang
        router.refresh()
        setTimeout(() => setAdded(false), 2000)
        } else {
        console.error(error)
        alert("Gagal menambahkan ke keranjang")
        }
    }

    async function handleBuyNow() {
        if (!isLoggedIn) { router.push("/login"); return }
        if (isOutOfStock) return

        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push("/login"); return }

        await supabase
        .from("cart_items")
        .upsert(
            { user_id: user.id, product_id: productId, qty: qty },
            { onConflict: "user_id,product_id" }
        )

        setLoading(false)
        router.refresh()
        router.push("/keranjang") // Arahkan ke keranjang atau langsung ke checkout
    }

    return (
        <div className="space-y-4">
        {/* Qty selector */}
        <div className="flex items-center gap-4">
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Atur Jumlah</p>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <button
                type="button"
                onClick={() => setQty(q => Math.max(1, q - 1))}
                disabled={qty <= 1 || isOutOfStock}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
            >
                <Minus size={14} />
            </button>
            <span className="w-10 text-center text-sm font-black text-gray-900">{isOutOfStock ? 0 : qty}</span>
            <button
                type="button"
                onClick={() => setQty(q => Math.min(stock, q + 1))}
                disabled={qty >= stock || isOutOfStock}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-[#E6F7F8] hover:text-[#6EB8BB] disabled:opacity-30 transition-colors"
            >
                <Plus size={14} />
            </button>
            </div>
            <span className="text-xs font-semibold text-gray-400">
            Stok: <span className={`font-black ${stock <= 5 && stock > 0 ? "text-amber-500" : isOutOfStock ? "text-red-500" : "text-gray-700"}`}>
                {stock === 0 ? "Habis" : stock}
            </span>
            </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
            <button
            onClick={handleAddToCart}
            disabled={loading || isOutOfStock}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all active:scale-[0.98] disabled:opacity-50 border-2 ${
                added
                ? "border-emerald-400 bg-emerald-50 text-emerald-600 shadow-sm"
                : inCart
                ? "border-[#6EB8BB]/40 bg-[#E6F7F8] text-[#6EB8BB] hover:bg-[#C5EAE9] hover:border-[#6EB8BB]/60"
                : "border-[#6EB8BB] bg-white text-[#6EB8BB] hover:bg-[#E6F7F8] shadow-sm"
            }`}
            >
            {loading ? <Loader2 size={16} className="animate-spin" /> :
            added   ? <Check size={16} />  : <ShoppingCart size={16} />}
            {added ? "Ditambahkan!" : inCart ? "Update Jumlah" : "+ Keranjang"}
            </button>

            <button
            onClick={handleBuyNow}
            disabled={loading || isOutOfStock}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-orange-500/20"
            >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {isOutOfStock ? "Stok Habis" : "Beli Langsung"}
            </button>
        </div>
        </div>
    )
    }