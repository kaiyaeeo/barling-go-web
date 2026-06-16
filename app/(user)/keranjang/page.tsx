    "use client"

    import React, { useEffect, useState } from "react"
    import Link from "next/link"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { 
    Trash2, 
    Plus, 
    Minus, 
    ShoppingBag, 
    ArrowRight, 
    Home, 
    ChevronRight, 
    Store, 
    Ticket, 
    ChevronLeft, 
    Heart, 
    ShieldAlert, 
    Info,
    Loader2,
    CheckCircle2
    } from "lucide-react"

    interface CartItem {
    product_id: string
    qty: number
    selected: boolean
    }

    interface ProductDetails {
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

    export default function KeranjangPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [products, setProducts] = useState<Record<string, ProductDetails>>({})
    const [user, setUser] = useState<any>(null)
    const [promoCode, setPromoCode] = useState("")
    const [promoApplied, setPromoApplied] = useState(false)
    const [promoDiscount, setPromoDiscount] = useState(0)

    // 1. Ambil data User & Keranjang dari localStorage
    useEffect(() => {
        async function initCart() {
        // Cek Session User
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        // Load cart items dari localStorage
        const savedCart = localStorage.getItem("barling_cart")
        if (savedCart) {
            try {
            const parsed = JSON.parse(savedCart) as CartItem[]
            setCartItems(parsed)
            
            if (parsed.length > 0) {
                const productIds = parsed.map(item => item.product_id)
                
                // Query detail produk dari Supabase beserta nama UMKM
                const { data: fetchedProducts } = await supabase
                .from("products")
                .select(`
                    id, name, price, discount_price, stock, images, seller_id,
                    profiles:seller_id (umkm_name, umkm_logo)
                `)
                .in("id", productIds)

                if (fetchedProducts) {
                const productMap: Record<string, ProductDetails> = {}
                fetchedProducts.forEach((prod: any) => {
                    productMap[prod.id] = prod
                })
                setProducts(productMap)
                }
            }
            } catch (err) {
            console.error("Error loading cart details:", err)
            }
        }
        setLoading(false)
        }

        initCart()
    }, [])

    // 2. Simpan setiap perubahan keranjang ke localStorage
    const saveCartToStorage = (updatedCart: CartItem[]) => {
        setCartItems(updatedCart)
        localStorage.setItem("barling_cart", JSON.stringify(updatedCart))
    }

    // 3. Tambah / Kurang Kuantitas Produk
    const handleQtyChange = (productId: string, action: "plus" | "minus") => {
        const updated = cartItems.map(item => {
        if (item.product_id === productId) {
            const product = products[productId]
            const maxStock = product ? product.stock : 99
            let newQty = item.qty
            
            if (action === "plus" && item.qty < maxStock) {
            newQty += 1
            } else if (action === "minus" && item.qty > 1) {
            newQty -= 1
            }
            return { ...item, qty: newQty }
        }
        return item
        })
        saveCartToStorage(updated)
    }

    // 4. Hapus Item dari Keranjang
    const handleRemoveItem = (productId: string) => {
        const updated = cartItems.filter(item => item.product_id !== productId)
        saveCartToStorage(updated)
    }

    // 5. Toggle Pilihan Checkbox Item
    const handleToggleSelectItem = (productId: string) => {
        const updated = cartItems.map(item => {
        if (item.product_id === productId) {
            return { ...item, selected: !item.selected }
        }
        return item
        })
        saveCartToStorage(updated)
    }

    // 6. Toggle Select All
    const handleSelectAll = (checked: boolean) => {
        const updated = cartItems.map(item => ({ ...item, selected: checked }))
        saveCartToStorage(updated)
    };

    // 7. Hitung Ringkasan Pembayaran
    const getSelectedItemsSummary = () => {
        let subtotal = 0
        let totalItems = 0
        let potentialDiscount = 0

        cartItems.forEach(item => {
        if (item.selected) {
            const product = products[item.product_id]
            if (product) {
            const itemPrice = product.price
            const activePrice = product.discount_price ?? product.price
            
            subtotal += activePrice * item.qty
            totalItems += item.qty
            
            if (product.discount_price) {
                potentialDiscount += (itemPrice - product.discount_price) * item.qty
            }
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

    // 8. Terapkan Kode Promo
    const handleApplyPromo = () => {
        if (promoCode.toUpperCase() === "EXPLOREBARLING") {
        setPromoApplied(true)
        setPromoDiscount(25000) // Diskon Rp 25.000
        } else {
        alert("Kode promo tidak valid atau kuota habis.")
        }
    }

    // 9. Proses Checkout Ke Halaman Pembayaran / Konfirmasi
    const handleCheckout = () => {
        if (!user) {
        router.push("/login?redirect=/keranjang")
        return
        }

        const selectedItems = cartItems.filter(item => item.selected)
        if (selectedItems.length === 0) return

        // Simpan item terpilih untuk checkout di session/localStorage sementara
        localStorage.setItem("checkout_items", JSON.stringify(selectedItems))
        router.push("/checkout")
    }

    // Grouping item keranjang berdasarkan nama UMKM/Penjual
    const groupedCartItems = () => {
        const groups: Record<string, { sellerName: string; items: CartItem[] }> = {}
        
        cartItems.forEach(item => {
        const product = products[item.product_id]
        const sellerId = product?.seller_id || "default_seller"
        const sellerName = product?.profiles?.umkm_name || "Mitra UMKM Barling"
        
        if (!groups[sellerId]) {
            groups[sellerId] = { sellerName, items: [] }
        }
        groups[sellerId].items.push(item)
        })
        
        return Object.entries(groups)
    }

    const isAllSelected = cartItems.length > 0 && cartItems.every(item => item.selected)

    if (loading) {
        return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans">
            <Loader2 className="animate-spin text-[#6EB8BB]" size={40} />
            <p className="text-sm font-bold text-slate-500 mt-3">Memuat keranjang belanja Anda...</p>
        </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] antialiased text-slate-800 font-sans pb-12">
        
        {/* ── TOPBAR NAVIGATION ── */}
        <div className="bg-white border-b border-slate-200/60 sticky top-0 z-20 shadow-xs h-16 flex items-center justify-between px-6 lg:px-12 shrink-0">
            <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-[#6EB8BB] transition-colors">
                <ChevronLeft size={20} />
            </Link>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                <Link href="/" className="text-slate-800 hover:text-[#6EB8BB]">Beranda</Link>
                <ChevronRight size={14} className="text-slate-350" />
                <span className="text-slate-400 font-semibold">Keranjang Belanja</span>
            </div>
            </div>
            <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-[#6EB8BB]/10 hover:bg-[#6EB8BB]/20 text-[#6EB8BB] rounded-xl text-xs font-bold transition-all">
                <Home size={14} /> <span className="hidden sm:block">Beranda</span>
            </Link>
            </div>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-6">Keranjang Belanja</h1>

            {cartItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-xs max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-[#6EB8BB]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#6EB8BB]">
                <ShoppingBag size={36} />
                </div>
                <h3 className="text-base font-extrabold text-slate-800 mb-1">Keranjang belanjamu kosong</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
                Yuk, jelajahi berbagai produk kuliner dan oleh-oleh khas UMKM terbaik di Barling-go!
                </p>
                <Link href="/produk" className="inline-flex px-6 py-3 bg-gradient-to-r from-[#6EB8BB] to-[#87C5C7] text-white font-extrabold rounded-xl text-sm transition-all shadow-sm hover:scale-[1.01] active:scale-[0.98]">
                Mulai Belanja
                </Link>
            </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Kolom Kiri: Grouped Items */}
                <div className="lg:col-span-2 space-y-4">
            
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input 
                        type="checkbox" 
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-5 h-5 rounded-md border-slate-300 text-[#6EB8BB] focus:ring-[#6EB8BB]/40 focus:ring-2 accent-[#6EB8BB] cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">Pilih Semua ({cartItems.length} Produk)</span>
                    </label>
                    
                    <button 
                    onClick={() => {
                        if(confirm("Hapus semua item terpilih?")) {
                        const updated = cartItems.filter(item => !item.selected)
                        saveCartToStorage(updated)
                        }
                    }}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1.5"
                    >
                    <Trash2 size={14} /> Hapus Terpilih
                    </button>
                </div>

                {/* Grouped Products list */}
                {groupedCartItems().map(([sellerId, group]) => (
                    <div key={sellerId} className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                    
                    {/* Shop Header */}
                    <div className="px-5 py-3.5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                        <Store size={16} className="text-[#6EB8BB]" />
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wide">{group.sellerName}</span>
                    </div>

                    {/* Products list under this seller */}
                    <div className="p-5 divide-y divide-slate-100">
                        {group.items.map(item => {
                        const product = products[item.product_id]
                        if (!product) return null
                        
                        const hasDiscount = product.discount_price !== null
                        const currentPrice = product.discount_price ?? product.price
                        const maxStock = product.stock

                        return (
                            <div key={item.product_id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-start">
                            
                            {/* Checkbox item */}
                            <input 
                                type="checkbox"
                                checked={item.selected}
                                onChange={() => handleToggleSelectItem(item.product_id)}
                                className="w-5 h-5 mt-5 rounded-md border-slate-300 text-[#6EB8BB] focus:ring-[#6EB8BB]/40 focus:ring-2 accent-[#6EB8BB] cursor-pointer shrink-0"
                            />

                            {/* Product Image */}
                            {product.images && product.images.length > 0 ? (
                                <img 
                                src={product.images[0]} 
                                alt={product.name} 
                                className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-100 bg-slate-50 mt-1" 
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 text-slate-300 mt-1">
                                <ShoppingBag size={24} />
                                </div>
                            )}

                            {/* Detail Info */}
                            <div className="flex-1 min-w-0 pr-2">
                                <h4 className="text-sm font-extrabold text-slate-800 leading-snug line-clamp-2 hover:text-[#6EB8BB] transition-colors cursor-pointer">
                                {product.name}
                                </h4>
                                
                                <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-sm font-black text-[#6EB8BB]">
                                    Rp {currentPrice.toLocaleString("id-ID")}
                                </span>
                                {hasDiscount && (
                                    <span className="text-[10px] text-slate-400 line-through">
                                    Rp {product.price.toLocaleString("id-ID")}
                                    </span>
                                )}
                                </div>

                                {/* Stock status indicator */}
                                {maxStock <= 5 ? (
                                <span className="text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md mt-2 inline-flex items-center gap-1">
                                    <ShieldAlert size={10} /> Sisa {maxStock} barang
                                </span>
                                ) : (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-md mt-2 inline-flex items-center gap-1">
                                    <Info size={10} /> Ready stock
                                </span>
                                )}
                            </div>

                            {/* Actions: Qty Controls & Delete */}
                            <div className="flex flex-col items-end gap-5 shrink-0 self-stretch justify-between">
                                <button 
                                onClick={() => handleRemoveItem(item.product_id)}
                                className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-rose-50/50"
                                >
                                <Trash2 size={16} />
                                </button>

                                <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50/50">
                                <button 
                                    onClick={() => handleQtyChange(item.product_id, "minus")}
                                    disabled={item.qty <= 1}
                                    className={`w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-md transition-colors ${item.qty <= 1 ? "opacity-30 cursor-not-allowed" : ""}`}
                                >
                                    <Minus size={12} />
                                </button>
                                <span className="w-8 text-center text-xs font-extrabold text-slate-800">
                                    {item.qty}
                                </span>
                                <button 
                                    onClick={() => handleQtyChange(item.product_id, "plus")}
                                    disabled={item.qty >= maxStock}
                                    className={`w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-md transition-colors ${item.qty >= maxStock ? "opacity-30 cursor-not-allowed" : ""}`}
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
                <div className="space-y-4">
                
                {/* Promo Card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
                    <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Ticket size={16} className="text-[#6EB8BB]" /> Gunakan Promo Belanja
                    </h3>
                    
                    {promoApplied ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-800">
                        <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <div className="text-[11px] font-bold">
                            Promo EXPLOREBARLING Aktif
                            <span className="block text-[9px] text-emerald-600 font-semibold mt-0.5">Diskon Rp 25.000 berhasil dipasang</span>
                        </div>
                        </div>
                        <button 
                        onClick={() => {
                            setPromoApplied(false)
                            setPromoDiscount(0)
                        }}
                        className="text-[10px] font-black text-rose-500 hover:underline shrink-0"
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
                        className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6EB8BB] focus:border-[#6EB8BB] font-semibold uppercase"
                        />
                        <button 
                        onClick={handleApplyPromo}
                        className="px-4 py-2 bg-[#6EB8BB]/10 text-[#6EB8BB] hover:bg-[#6EB8BB]/20 text-xs font-bold rounded-xl transition-all"
                        >
                        Terapkan
                        </button>
                    </div>
                    )}
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Gunakan kode <span className="text-[#6EB8BB] font-bold">EXPLOREBARLING</span> untuk potongan belanja Rp 25.000 pertama Anda!
                    </p>
                </div>

                {/* Checkout Summary Card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                    <h2 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100">Ringkasan Belanja</h2>
                    
                    <div className="space-y-3 text-xs font-bold text-slate-500">
                    <div className="flex justify-between">
                        <span>Total Harga ({summary.totalItems} barang)</span>
                        <span className="text-slate-800">Rp {summary.subtotal.toLocaleString("id-ID")}</span>
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
                    <div className="flex justify-between font-black text-sm text-slate-900 pt-3 border-t border-slate-100">
                        <span>Total Bayar</span>
                        <span className="text-[#6EB8BB] text-base">Rp {summary.total.toLocaleString("id-ID")}</span>
                    </div>
                    </div>

                    <button 
                    onClick={handleCheckout}
                    disabled={!summary.hasSelected}
                    className={`w-full py-3 bg-gradient-to-r from-[#6EB8BB] to-[#87C5C7] text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.98] ${
                        !summary.hasSelected ? "opacity-45 cursor-not-allowed pointer-events-none" : ""
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
