    "use client"

    import { useState } from "react"
    import { ShoppingCart, Minus, Plus, Check } from "lucide-react"

    type Product = { id: string; name: string; price: number; image: string; stock: number }

    // Inline zustand-compatible cart store (import dari store/cartStore jika sudah ada)
    function useCart() {
    // Fallback: pakai localStorage langsung sampai Zustand store dibuat
    function addItem(product: Product, qty: number) {
        try {
        const raw = localStorage.getItem("cart-storage")
        const cart = raw ? JSON.parse(raw) : { state: { items: [] } }
        const items: any[] = cart.state.items ?? []
        const existing = items.find((i: any) => i.id === product.id)
        if (existing) existing.qty += qty
        else items.push({ ...product, qty })
        cart.state.items = items
        localStorage.setItem("cart-storage", JSON.stringify(cart))
        window.dispatchEvent(new Event("cart-updated"))
        } catch { /* noop */ }
    }
    return { addItem }
    }

    export default function AddToCartButton({ product }: { product: Product }) {
    const [qty, setQty] = useState(1)
    const [added, setAdded] = useState(false)
    const { addItem } = useCart()

    function handleAdd() {
        addItem(product, qty)
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    if (product.stock === 0) {
        return (
        <button disabled className="w-full py-3.5 bg-gray-200 text-gray-400 font-semibold rounded-xl text-sm cursor-not-allowed">
            Stok Habis
        </button>
        )
    }

    return (
        <div className="space-y-3">
        {/* Qty selector */}
        <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Jumlah:</span>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl overflow-hidden">
            <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600"
            >
                <Minus size={14} />
            </button>
            <span className="w-10 text-center text-sm font-semibold text-gray-900">{qty}</span>
            <button
                onClick={() => setQty(Math.min(product.stock, qty + 1))}
                className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600"
            >
                <Plus size={14} />
            </button>
            </div>
            <span className="text-xs text-gray-400">maks. {product.stock}</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
            <button
            onClick={handleAdd}
            className={`flex-1 py-3.5 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all ${
                added
                ? "bg-green-500 text-white"
                : "bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white hover:scale-[1.02]"
            }`}
            >
            {added ? <Check size={16} /> : <ShoppingCart size={16} />}
            {added ? "Ditambahkan!" : "Tambah ke Keranjang"}
            </button>
        </div>
        </div>
    )
    }
