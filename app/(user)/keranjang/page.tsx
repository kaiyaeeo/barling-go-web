    "use client"

    import { useCartStore } from "@/store/cartStore"
    import Link from "next/link"
    import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, ArrowRight } from "lucide-react"

    export default function KeranjangPage() {
    const { items, removeItem, updateQty, totalPrice, totalItems } = useCartStore()

    if (items.length === 0) {
        return (
        <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
            <div className="text-center">
            <ShoppingCart size={56} className="mx-auto text-gray-200 mb-5" />
            <h1 className="text-xl font-bold text-gray-800 mb-2">Keranjang masih kosong</h1>
            <p className="text-sm text-gray-400 mb-8">Yuk, temukan produk & destinasi favoritmu!</p>
            <Link href="/produk" className="inline-flex items-center gap-2 px-6 py-3 bg-[#6EB8BB] text-white font-semibold rounded-xl text-sm hover:bg-[#5AA4A7] transition-all">
                <ArrowLeft size={15} /> Jelajahi Produk
            </Link>
            </div>
        </main>
        )
    }

    return (
        <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-3 mb-8">
            <Link href="/produk" className="text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft size={18} />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">
                Keranjang Belanja
                <span className="ml-2 text-sm font-normal text-gray-400">({totalItems()} item)</span>
            </h1>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
            {/* Item list */}
            <div className="lg:col-span-2 space-y-3">
                {items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate mb-1">{item.name}</p>
                    <p className="text-base font-bold text-[#6EB8BB]">
                        Rp {item.price.toLocaleString("id-ID")}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                        {/* Qty */}
                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg overflow-hidden">
                        <button
                            onClick={() => updateQty(item.id, item.qty - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors"
                        >
                            <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                        <button
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            disabled={item.qty >= item.stock}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors disabled:opacity-30"
                        >
                            <Plus size={13} />
                        </button>
                        </div>
                        {/* Subtotal & delete */}
                        <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-800">
                            Rp {(item.price * item.qty).toLocaleString("id-ID")}
                        </span>
                        <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all"
                        >
                            <Trash2 size={15} />
                        </button>
                        </div>
                    </div>
                    </div>
                </div>
                ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
                <h2 className="text-base font-bold text-gray-900 mb-4">Ringkasan Pesanan</h2>
                <div className="space-y-2.5 mb-4 pb-4 border-b border-gray-100">
                    {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-500 truncate max-w-[140px]">{item.name} x{item.qty}</span>
                        <span className="font-medium text-gray-700 shrink-0 ml-2">
                        Rp {(item.price * item.qty).toLocaleString("id-ID")}
                        </span>
                    </div>
                    ))}
                </div>
                <div className="flex justify-between mb-1.5">
                    <span className="text-sm text-gray-500">Subtotal</span>
                    <span className="text-sm font-medium">Rp {totalPrice().toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between mb-5">
                    <span className="text-sm text-gray-500">Ongkos kirim</span>
                    <span className="text-sm text-gray-400">Dihitung saat checkout</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 mb-5 pt-3 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-[#6EB8BB]">Rp {totalPrice().toLocaleString("id-ID")}</span>
                </div>
                <Link
                    href="/checkout"
                    className="w-full py-3.5 bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
                >
                    Lanjut ke Checkout <ArrowRight size={15} />
                </Link>
                <Link
                    href="/produk"
                    className="mt-3 w-full py-3 border border-gray-200 text-gray-600 font-medium rounded-xl text-sm flex items-center justify-center hover:bg-gray-50 transition-all"
                >
                    Tambah Produk Lain
                </Link>
                </div>
            </div>
            </div>
        </div>
        </main>
    )
    }