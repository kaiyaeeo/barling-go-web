    "use client"

    import React, { useEffect, useState } from "react"
    import Link from "next/link"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { 
    Trash2, Plus, Minus, ShoppingBag, ArrowRight, Home, 
    ChevronRight, Store, Ticket, ChevronLeft, ShieldAlert, 
    Info, Loader2, CheckCircle2
    } from "lucide-react"

    // Struktur data gabungan dari tabel cart_items dan products
    interface CartItem {
    product_id: string
    qty: number
    selected: boolean
    product: {
        id: string
        name: string
        price: number
        discount_price: number | null
        stock: number
        images: string[]
        seller_id: string
        profiles: {
        umkm_name: string | null
        umkm_logo: string | null
        } | null
    }
    }

    export default function KeranjangPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [user, setUser] = useState<any>(null)
    
    const [promoCode, setPromoCode] = useState("")
    const [promoApplied, setPromoApplied] = useState(false)
    const [promoDiscount, setPromoDiscount] = useState(0)

    // 1. Ambil data Keranjang dari Database Supabase
    useEffect(() => {
        async function fetchCart() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push("/login?redirect=/keranjang")
            return
        }
        setUser(user)

        try {
            // Query Join: Ambil cart_items beserta detail produknya sekaligus
            const { data: items, error } = await supabase
            .from("cart_items")
            .select(`
                product_id, qty,
                products (
                id, name, price, discount_price, stock, images, seller_id,
                profiles:seller_id (umkm_name, umkm_logo)
                )
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: true })

            if (error) throw error

            if (items) {
            // Format data agar sesuai interface, abaikan jika produk sudah dihapus dari DB
            const formattedCart: CartItem[] = items
                .filter((item: any) => item.products !== null)
                .map((item: any) => ({
                product_id: item.product_id,
                qty: item.qty,
                selected: true, // Default: semua tercentang
                product: item.products
                }))
            
            setCartItems(formattedCart)
            }
        } catch (err) {
            console.error("Gagal memuat keranjang:", err)
        } finally {
            setLoading(false)
        }
        }

        fetchCart()
    }, [router, supabase])

    // 2. Tambah / Kurang Kuantitas (Update DB & UI)
    const handleQtyChange = async (productId: string, action: "plus" | "minus") => {
        // 1. Optimistic UI Update (Ubah UI seketika biar terasa cepat)
        let newQtyToSave = 1
        const updated = cartItems.map(item => {
        if (item.product_id === productId) {
            const maxStock = item.product.stock || 99
            let newQty = item.qty
            
            if (action === "plus" && item.qty < maxStock) newQty += 1
            else if (action === "minus" && item.qty > 1) newQty -= 1
            
            newQtyToSave = newQty
            return { ...item, qty: newQty }
        }
        return item
        })
        setCartItems(updated)

        // 2. Background Update ke Supabase
        await supabase
        .from("cart_items")
        .update({ qty: newQtyToSave })
        .eq("user_id", user.id)
        .eq("product_id", productId)
    }

    // 3. Hapus Item dari Keranjang
    const handleRemoveItem = async (productId: string) => {
        if (!confirm("Hapus produk ini dari keranjang?")) return

        // Hapus dari UI
        setCartItems(prev => prev.filter(item => item.product_id !== productId))

        // Hapus dari Supabase
        await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId)
    }

    // 4. Toggle Pilihan Checkbox Item
    const handleToggleSelectItem = (productId: string) => {
        setCartItems(prev => prev.map(item => 
        item.product_id === productId ? { ...item, selected: !item.selected } : item
        ))
    }

    // 5. Toggle Select All
    const handleSelectAll = (checked: boolean) => {
        setCartItems(prev => prev.map(item => ({ ...item, selected: checked })))
    }

    // 6. Hitung Ringkasan Pembayaran
    const getSelectedItemsSummary = () => {
        let subtotal = 0
        let totalItems = 0
        let potentialDiscount = 0

        cartItems.forEach(item => {
        if (item.selected) {
            const itemPrice = item.product.price
            const activePrice = item.product.discount_price ?? item.product.price
            
            subtotal += activePrice * item.qty
            totalItems += item.qty
            
            if (item.product.discount_price) {
            potentialDiscount += (itemPrice - item.product.discount_price) * item.qty
            }
        }
        })

        const total = Math.max(0, subtotal - promoDiscount)

        return {
        subtotal,
        totalItems,
        potentialDiscount,
        total,
        hasSelected: totalItems > 0
        }
    }

    const summary = getSelectedItemsSummary()

    // 7. Terapkan Kode Promo
    const handleApplyPromo = () => {
        if (promoCode.toUpperCase() === "EXPLOREBARLING") {
        setPromoApplied(true)
        setPromoDiscount(25000) // Diskon Rp 25.000
        } else {
        alert("Kode promo tidak valid atau kuota habis.")
        }
    }

    // 8. Proses Checkout Ke Halaman Pembayaran / Konfirmasi
    const handleCheckout = () => {
        const selectedItems = cartItems.filter(item => item.selected)
        if (selectedItems.length === 0) return

        // Simpan item terpilih untuk checkout di session/localStorage sementara
        localStorage.setItem("checkout_items", JSON.stringify(selectedItems))
        
        // Jika ada promo, simpan juga
        if (promoApplied) localStorage.setItem("checkout_promo", JSON.stringify({ code: promoCode, discount: promoDiscount }))
        else localStorage.removeItem("checkout_promo")

        router.push("/checkout")
    }

    // Grouping item keranjang berdasarkan nama UMKM/Penjual
    const groupedCartItems = () => {
        const groups: Record<string, { sellerName: string; items: CartItem[] }> = {}
        
        cartItems.forEach(item => {
        const sellerId = item.product.seller_id || "default_seller"
        const sellerName = item.product.profiles?.umkm_name || "Mitra UMKM Barling"
        
        if (!groups[sellerId]) {
            groups[sellerId] = { sellerName, items: [] }
        }
        groups[sellerId].items.push(item)
        })
        
        return Object.entries(groups)
    }

    const isAllSelected = cartItems.length > 0 && cartItems.every(item => item.selected)

    // ── LOADING STATE ──
    if (loading) {
        return (
        <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center antialiased">
            <Loader2 className="animate-spin text-[#6EB8BB]" size={40} />
            <p className="text-sm font-bold text-gray-500 mt-3">Memuat keranjang belanja Anda...</p>
        </div>
        )
    }

    // ── MAIN RENDER ──
    return (
        <div className="min-h-screen bg-[#F5F5F5] antialiased text-gray-800 pb-12">
        
        {/* ── TOPBAR NAVIGATION ── */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm h-16 flex items-center justify-between px-6 lg:px-12 shrink-0">
            <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-[#6EB8BB] transition-colors">
                <ChevronLeft size={20} />
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-bold">
                <Link href="/" className="text-gray-800 hover:text-[#6EB8BB]">Beranda</Link>
                <ChevronRight size={14} className="text-gray-300" />
                <span className="text-gray-400 font-semibold">Keranjang Belanja</span>
            </div>
            </div>
            <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-[#E6F7F8] hover:bg-[#C5EAE9] text-[#6EB8BB] rounded-xl text-xs font-bold transition-all">
                <Home size={14} /> <span className="hidden sm:block">Beranda</span>
            </Link>
            </div>
        </div>

        {/* ── MAIN LAYOUT (FULL WIDTH) ── */}
        <div className="w-full max-w-full px-4 md:px-8 lg:px-12 mt-6">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-6">Keranjang Belanja</h1>

            {cartItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-7xl mx-auto">
                <div className="w-20 h-20 bg-[#E6F7F8] rounded-full flex items-center justify-center mx-auto mb-4 text-[#6EB8BB]">
                <ShoppingBag size={36} />
                </div>
                <h3 className="text-base font-black text-gray-800 mb-1">Keranjang belanjamu kosong</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mb-6 font-medium">
                Yuk, jelajahi berbagai produk kuliner dan oleh-oleh khas UMKM terbaik di Barling-go!
                </p>
                <Link href="/produk" className="inline-flex px-6 py-3 bg-[#6EB8BB] text-white font-bold rounded-xl text-sm transition-all shadow-sm hover:scale-[1.01] active:scale-[0.98]">
                Mulai Belanja
                </Link>
            </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 items-start">
                
                {/* Kolom Kiri: Grouped Items (Mengambil porsi lebih besar di layar lebar) */}
                <div className="lg:col-span-2 xl:col-span-3 space-y-4">
                
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input 
                        type="checkbox" 
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-5 h-5 rounded-md border-gray-300 text-[#6EB8BB] focus:ring-[#6EB8BB]/40 focus:ring-2 accent-[#6EB8BB] cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-700">Pilih Semua ({cartItems.length} Produk)</span>
                    </label>
                    
                    <button 
                    onClick={async () => {
                        if(confirm("Hapus semua item terpilih?")) {
                        const selectedIds = cartItems.filter(i => i.selected).map(i => i.product_id)
                        setCartItems(prev => prev.filter(item => !item.selected))
                        await supabase.from("cart_items").delete().eq("user_id", user.id).in("product_id", selectedIds)
                        }
                    }}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1.5"
                    >
                    <Trash2 size={14} /> Hapus Terpilih
                    </button>
                </div>

                {/* Grouped Products list */}
                {groupedCartItems().map(([sellerId, group]) => (
                    <div key={sellerId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    
                    {/* Shop Header */}
                    <div className="px-5 py-3.5 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2">
                        <Store size={16} className="text-[#6EB8BB]" />
                        <span className="text-xs font-black text-gray-800 uppercase tracking-wide">{group.sellerName}</span>
                    </div>

                    {/* Products list under this seller */}
                    <div className="p-5 divide-y divide-gray-100">
                        {group.items.map(item => {
                        const product = item.product
                        const hasDiscount = product.discount_price !== null
                        const currentPrice = product.discount_price ?? product.price
                        const maxStock = product.stock

                        return (
                            <div key={item.product_id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-start group/item">
                            
                            {/* Checkbox item */}
                            <input 
                                type="checkbox"
                                checked={item.selected}
                                onChange={() => handleToggleSelectItem(item.product_id)}
                                className="w-5 h-5 mt-5 rounded-md border-gray-300 text-[#6EB8BB] focus:ring-[#6EB8BB]/40 focus:ring-2 accent-[#6EB8BB] cursor-pointer shrink-0"
                            />

                            {/* Product Image */}
                            <Link href={`/produk/${product.id}`} className="shrink-0">
                                {product.images && product.images.length > 0 ? (
                                <img 
                                    src={product.images[0].startsWith('http') ? product.images[0] : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${product.images[0]}`} 
                                    alt={product.name} 
                                    className="w-20 h-20 rounded-xl object-cover border border-gray-100 bg-gray-50 mt-1 hover:border-[#6EB8BB]/50 transition-colors" 
                                />
                                ) : (
                                <div className="w-20 h-20 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-300 mt-1">
                                    <ShoppingBag size={24} />
                                </div>
                                )}
                            </Link>

                            {/* Detail Info */}
                            <div className="flex-1 min-w-0 pr-2">
                                <Link href={`/produk/${product.id}`}>
                                <h4 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 hover:text-[#6EB8BB] transition-colors cursor-pointer">
                                    {product.name}
                                </h4>
                                </Link>
                                
                                <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-sm font-black text-[#6EB8BB]">
                                    Rp {currentPrice.toLocaleString("id-ID")}
                                </span>
                                {hasDiscount && (
                                    <span className="text-[10px] text-gray-400 line-through font-semibold">
                                    Rp {product.price.toLocaleString("id-ID")}
                                    </span>
                                )}
                                </div>

                                {/* Stock status indicator */}
                                {maxStock <= 5 && maxStock > 0 ? (
                                <span className="text-[10px] font-bold text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md mt-2 inline-flex items-center gap-1">
                                    <ShieldAlert size={10} /> Sisa {maxStock} barang
                                </span>
                                ) : maxStock === 0 ? (
                                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md mt-2 inline-flex items-center gap-1">
                                    Stok Habis
                                </span>
                                ) : null}
                            </div>

                            {/* Actions: Qty Controls & Delete */}
                            <div className="flex flex-col items-end gap-5 shrink-0 self-stretch justify-between">
                                <button 
                                onClick={() => handleRemoveItem(item.product_id)}
                                className="text-gray-400 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-rose-50/50"
                                title="Hapus dari keranjang"
                                >
                                <Trash2 size={16} />
                                </button>

                                <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-gray-50/50">
                                <button 
                                    onClick={() => handleQtyChange(item.product_id, "minus")}
                                    disabled={item.qty <= 1}
                                    className={`w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition-all ${item.qty <= 1 ? "opacity-30 cursor-not-allowed" : ""}`}
                                >
                                    <Minus size={12} />
                                </button>
                                <span className="w-8 text-center text-xs font-black text-gray-800">
                                    {item.qty}
                                </span>
                                <button 
                                    onClick={() => handleQtyChange(item.product_id, "plus")}
                                    disabled={item.qty >= maxStock}
                                    className={`w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition-all ${item.qty >= maxStock ? "opacity-30 cursor-not-allowed" : ""}`}
                                >
                                    <Plus size={12} />
                                </button>
                                </div>
                            </div>

                            </div>
                        )
                        })}
                    </div>
                    </div>
                ))}
                </div>

                {/* Kolom Kanan: Summary Card */}
                <div className="space-y-4 lg:col-span-1 lg:sticky lg:top-24">
                
                {/* Promo Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
                    <h3 className="text-xs font-black text-gray-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <Ticket size={16} className="text-[#6EB8BB]" /> Gunakan Promo Belanja
                    </h3>
                    
                    {promoApplied ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800">
                        <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <div className="text-[11px] font-bold">
                            Promo {promoCode.toUpperCase()} Aktif
                            <span className="block text-[9px] text-emerald-600 font-semibold mt-0.5">Diskon Rp {(promoDiscount).toLocaleString('id-ID')} berhasil dipasang</span>
                        </div>
                        </div>
                        <button 
                        onClick={() => {
                            setPromoApplied(false)
                            setPromoDiscount(0)
                            setPromoCode("")
                        }}
                        className="text-[10px] font-black text-rose-500 hover:underline shrink-0 bg-white px-2 py-1 rounded-md"
                        >
                        Batal
                        </button>
                    </div>
                    ) : (
                    <div className="flex gap-2">
                        <input 
                        type="text" 
                        placeholder="Masukkan kode promo..."
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/40 focus:border-[#6EB8BB] font-bold uppercase placeholder:normal-case"
                        />
                        <button 
                        onClick={handleApplyPromo}
                        disabled={!promoCode}
                        className="px-4 py-2 bg-[#E6F7F8] text-[#6EB8BB] hover:bg-[#C5EAE9] disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold rounded-xl transition-all"
                        >
                        Terapkan
                        </button>
                    </div>
                    )}
                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                    Gunakan kode <span className="text-[#6EB8BB] font-bold">EXPLOREBARLING</span> untuk potongan belanja Rp 25.000 pertama Anda!
                    </p>
                </div>

                {/* Checkout Summary Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                    <h2 className="text-sm font-black text-gray-900 pb-3 border-b border-gray-100">Ringkasan Belanja</h2>
                    
                    <div className="space-y-3 text-xs font-bold text-gray-500">
                    <div className="flex justify-between">
                        <span>Total Harga ({summary.totalItems} barang)</span>
                        <span className="text-gray-800">Rp {summary.subtotal.toLocaleString("id-ID")}</span>
                    </div>
                    {summary.potentialDiscount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                        <span>Total Hemat Diskon</span>
                        <span>- Rp {summary.potentialDiscount.toLocaleString("id-ID")}</span>
                        </div>
                    )}
                    {promoApplied && (
                        <div className="flex justify-between text-[#6EB8BB]">
                        <span>Diskon Promo</span>
                        <span>- Rp {promoDiscount.toLocaleString("id-ID")}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-black text-sm text-gray-900 pt-3 border-t border-gray-100">
                        <span>Total Bayar</span>
                        <span className="text-[#6EB8BB] text-base">Rp {summary.total.toLocaleString("id-ID")}</span>
                    </div>
                    </div>

                    <button 
                    onClick={handleCheckout}
                    disabled={!summary.hasSelected}
                    className={`w-full py-3.5 bg-gradient-to-r from-[#6EB8BB] to-[#87C5C7] text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.98] ${
                        !summary.hasSelected ? "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100" : ""
                    }`}
                    >
                    Beli ({summary.totalItems}) <ArrowRight size={14} />
                    </button>
                </div>

                </div>

            </div>
            )}

        </div>
        </div>
    )
    }