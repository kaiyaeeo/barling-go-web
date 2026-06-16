    "use client"

    import React, { useEffect, useState } from "react"
    import Link from "next/link"
    import { ShoppingCart } from "lucide-react"

    export default function CartBadge() {
    const [count, setCount] = useState(0)

    const updateBadgeCount = () => {
        const saved = localStorage.getItem("barling_cart")
        if (saved) {
        try {
            const cart = JSON.parse(saved)
            // Hitung total kuantiti dari item di keranjang
            const total = cart.reduce((acc: number, item: any) => acc + item.qty, 0)
            setCount(total)
        } catch (e) {
            console.error(e)
        }
        } else {
        setCount(0)
        }
    }

    useEffect(() => {
        // Jalankan pada load pertama kali
        updateBadgeCount()

        // Dengarkan event kustom untuk melakukan update real-time
        window.addEventListener("cart-updated", updateBadgeCount)
        window.addEventListener("storage", updateBadgeCount) // sinkronisasi antar tab

        return () => {
        window.removeEventListener("cart-updated", updateBadgeCount)
        window.removeEventListener("storage", updateBadgeCount)
        }
    }, [])

    return (
        <Link 
        href="/keranjang" 
        className="p-2.5 text-slate-500 hover:text-[#6EB8BB] hover:bg-slate-50 rounded-xl transition-all relative group"
        >
        <ShoppingCart size={18} className="group-hover:scale-105 transition-transform" />
        {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-4.5 h-4.5 flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
            {count > 99 ? "99+" : count}
            </span>
        )}
        </Link>
    )
    }
