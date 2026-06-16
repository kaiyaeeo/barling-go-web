    import { createClient } from "@/lib/supabase/server"
    import { redirect, notFound } from "next/navigation"
    import Link from "next/link"
    import {
    Star, MapPin, ShieldCheck, Package, Truck, RefreshCw,
    ChevronRight, Store, BadgeCheck, MessageCircle, Share2,
    Tag, Clock, TrendingUp, AlertTriangle
    } from "lucide-react"
    import AddToCartButton from "@/components/product/AddToCartButton"
    import WishlistButton  from "@/components/ui/WishlistButton"

    export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch produk + seller
    const { data: product } = await supabase
        .from("products")
        .select(`
        id, name, slug, description, price, discount_price, sku,
        stock, images, is_active, is_featured, rating, total_sold,
        category_id,
        categories(name, slug),
        profiles!seller_id(id, full_name, umkm_name, umkm_logo, city, umkm_description)
        `)
        .eq("slug", params.slug)
        .eq("is_active", true)
        .single()

    if (!product) notFound()

    const seller = product.profiles as any
    const category = product.categories as any

    // Reviews dari tabel testimonials yang terhubung ke user
    const { data: reviews } = await supabase
        .from("testimonials")
        .select("id, name, avatar_initials, avatar_color, rating, content, created_at")
        .order("created_at", { ascending: false })
        .limit(6)

    // Cart status user (sudah ada di cart atau belum)
    let cartQty   = 0
    let inWishlist = false

    if (user) {
        const [{ data: cartItem }, { data: wishItem }] = await Promise.all([
        supabase.from("cart_items").select("qty").eq("user_id", user.id).eq("product_id", product.id).single(),
        supabase.from("wishlists").select("id").eq("user_id", user.id).eq("product_id", product.id).single(),
        ])
        cartQty    = cartItem?.qty ?? 0
        inWishlist = !!wishItem
    }

    // Produk lain dari seller yang sama
    const { data: relatedProducts } = await supabase
        .from("products")
        .select("id, name, slug, price, discount_price, images, rating, total_sold")
        .eq("seller_id", seller?.id)
        .eq("is_active", true)
        .neq("id", product.id)
        .limit(4)

    const PLACEHOLDER = "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=70"
    const images: string[] = product.images?.length
        ? product.images.map((img: string) =>
            img.startsWith("http") ? img
            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${img}`
        )
        : [PLACEHOLDER]

    const hasDiscount  = product.discount_price && product.discount_price < product.price
    const discountPct  = hasDiscount ? Math.round(((product.price - product.discount_price!) / product.price) * 100) : 0
    const finalPrice   = product.discount_price ?? product.price

    const sellerLogo = seller?.umkm_logo
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${seller.umkm_logo}`
        : null
    const sellerName = seller?.umkm_name ?? seller?.full_name ?? "Penjual"
    const sellerInitials = sellerName.slice(0, 2).toUpperCase()

    const avgRating = reviews?.length
        ? reviews.reduce((s: number, r: any) => s + (r.rating ?? 0), 0) / reviews.length
        : product.rating ?? 0

    return (
        <main className="min-h-screen bg-[#F5F5F5] antialiased text-gray-800">

        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <Link href="/" className="hover:text-gray-600 transition-colors">Beranda</Link>
                <ChevronRight size={11} />
                <Link href="/produk" className="hover:text-gray-600 transition-colors">Produk</Link>
                {category && <>
                <ChevronRight size={11} />
                <Link href={`/kategori/${category.slug}`} className="hover:text-gray-600 transition-colors">{category.name}</Link>
                </>}
                <ChevronRight size={11} />
                <span className="text-gray-700 font-bold truncate max-w-[160px] sm:max-w-xs">{product.name}</span>
            </nav>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">

            {/* ── Top section: image + info ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr_320px] gap-6 items-start">

            {/* Kolom 1: Image gallery (Kiri) */}
            <div className="space-y-3 sticky top-24">
                <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100 relative group shadow-sm">
                <img
                    src={images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {hasDiscount && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-sm">
                    -{discountPct}%
                    </span>
                )}
                {product.is_featured && (
                    <span className="absolute top-3 right-3 bg-[#6EB8BB] text-white text-xs font-black px-2.5 py-1 rounded-full shadow-sm">
                    ⭐ Unggulan
                    </span>
                )}
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-white text-gray-800 font-black text-sm px-4 py-2 rounded-full shadow-sm">Stok Habis</span>
                    </div>
                )}
                </div>

                {/* Thumbnail strip */}
                {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {images.slice(1).map((img, i) => (
                    <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 hover:border-[#6EB8BB] transition-colors shrink-0 cursor-pointer shadow-sm">
                        <img src={img} alt={`${product.name} ${i + 2}`} className="w-full h-full object-cover" />
                    </div>
                    ))}
                </div>
                )}
            </div>

            {/* Kolom 2: Product info (Tengah) */}
            <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">

                {/* Category + share */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                    {category && (
                        <Link href={`/kategori/${category.slug}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6EB8BB] bg-[#E6F7F8] px-2.5 py-1 rounded-full hover:bg-[#C5EAE9] transition-colors border border-[#6EB8BB]/10">
                        <Tag size={10} /> {category.name}
                        </Link>
                    )}
                    {product.sku && (
                        <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">SKU: {product.sku}</span>
                    )}
                    </div>
                    <div className="flex items-center gap-2">
                    <WishlistButton
                        productId={product.id}
                        isLoggedIn={!!user}
                        initialSaved={inWishlist}
                    />
                    <button className="w-12 h-12 rounded-xl flex items-center justify-center border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-[#6EB8BB] hover:bg-gray-50 transition-all bg-white shadow-sm active:scale-95">
                        <Share2 size={16} />
                    </button>
                    </div>
                </div>

                {/* Name */}
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug tracking-tight">{product.name}</h1>

                {/* Rating + sold */}
                <div className="flex items-center gap-3 flex-wrap">
                    {avgRating > 0 && (
                    <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(s => (
                        <Star key={s} size={14} className={s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"} />
                        ))}
                        <span className="text-sm font-black text-gray-800 ml-1">{avgRating.toFixed(1)}</span>
                        <span className="text-xs font-semibold text-gray-400">({reviews?.length ?? 0} ulasan)</span>
                    </div>
                    )}
                    {product.total_sold > 0 && (
                    <>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                        <TrendingUp size={12} className="text-[#6EB8BB]" /> <span className="text-gray-800 font-bold">{product.total_sold.toLocaleString("id-ID")}</span> terjual
                        </span>
                    </>
                    )}
                </div>

                {/* Price */}
                <div className="space-y-1.5 pt-2">
                    <div className="flex items-end gap-3 flex-wrap">
                    <p className="text-3xl font-black text-gray-900">
                        Rp {Number(finalPrice).toLocaleString("id-ID")}
                    </p>
                    {hasDiscount && (
                        <p className="text-sm text-gray-400 line-through font-bold mb-1">
                        Rp {Number(product.price).toLocaleString("id-ID")}
                        </p>
                    )}
                    </div>
                    {hasDiscount && (
                    <span className="inline-block text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                        Hemat Rp {(Number(product.price) - Number(finalPrice)).toLocaleString("id-ID")}
                    </span>
                    )}
                </div>

                </div>

                {/* Seller card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <Link href={`/toko/${seller?.id}`} className="flex items-center gap-3 group">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6EB8BB] to-[#9FCCCE] flex items-center justify-center text-white font-black text-lg overflow-hidden shrink-0 shadow-sm border-2 border-white">
                    {sellerLogo
                        ? <img src={sellerLogo} alt={sellerName} className="w-full h-full object-cover" />
                        : <span>{sellerInitials}</span>
                    }
                    </div>
                    <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <p className="text-sm font-black text-gray-900 group-hover:text-[#6EB8BB] transition-colors truncate">{sellerName}</p>
                        <BadgeCheck size={14} className="text-[#6EB8BB] shrink-0 fill-[#6EB8BB]/10" />
                    </div>
                    {seller?.city && (
                        <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {seller.city}
                        </p>
                    )}
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-[#6EB8BB] transition-colors shrink-0" />
                </Link>

                {seller?.umkm_description && (
                    <p className="text-xs text-gray-500 font-medium mt-4 line-clamp-2 leading-relaxed px-1">
                    {seller.umkm_description}
                    </p>
                )}

                <div className="flex gap-2 mt-4">
                    <Link href={`/toko/${seller?.id}`}
                    className="flex-1 text-center py-2.5 text-xs font-bold text-[#6EB8BB] border border-[#6EB8BB]/30 rounded-xl hover:bg-[#E6F7F8] transition-colors">
                    Kunjungi Toko
                    </Link>
                    <Link href={`/chat/${seller?.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100">
                    <MessageCircle size={14} /> Chat Penjual
                    </Link>
                </div>
                </div>

                {/* Deskripsi produk */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <Package size={16} className="text-[#6EB8BB]" />
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Detail Produk</h2>
                </div>
                <div className="px-6 py-5">
                    {product.description
                    ? <p className="text-sm text-gray-600 font-medium leading-relaxed whitespace-pre-line">{product.description}</p>
                    : <p className="text-sm text-gray-400 italic">Belum ada deskripsi produk.</p>
                    }
                </div>
                </div>

            </div>

            {/* Kolom 3: Add to cart / Action (Kanan - Sticky) */}
            <div className="space-y-5 sticky top-24">
                
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-gray-900 pb-3 border-b border-gray-100">Beli Produk Ini</h3>
                
                {/* Add to cart component */}
                <AddToCartButton
                    productId={product.id}
                    stock={product.stock}
                    initialQty={cartQty}
                    isLoggedIn={!!user}
                />
                </div>

                {/* Guarantees */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Layanan Barling-go</h3>
                <div className="space-y-3">
                    {[
                    { icon: ShieldCheck, label: "Jaminan Asli",  sub: "Produk 100% Original UMKM"  },
                    { icon: Truck,       label: "Bebas Ongkir", sub: "Untuk pembelian di atas 50rb" },
                    { icon: RefreshCw,   label: "Retur Mudah",   sub: "Proses cepat maksimal 2 hari"},
                    ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#E6F7F8] flex items-center justify-center text-[#6EB8BB] shrink-0">
                        <Icon size={14} />
                        </div>
                        <div>
                        <p className="text-xs font-bold text-gray-800">{label}</p>
                        <p className="text-[10px] font-medium text-gray-400">{sub}</p>
                        </div>
                    </div>
                    ))}
                </div>
                </div>

            </div>

            </div>

            {/* ── BAGIAN BAWAH: Ulasan pelanggan ── */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mt-4">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2.5">
                <Star size={18} className="text-amber-400 fill-amber-400" />
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Ulasan Pembeli</h2>
                {reviews?.length ? (
                    <span className="text-[10px] font-black px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
                    {reviews.length} ulasan
                    </span>
                ) : null}
                </div>
                {avgRating > 0 && (
                <div className="flex items-center gap-2 text-right">
                    <div>
                    <div className="flex items-center gap-0.5 justify-end">
                        {[1,2,3,4,5].map(s => (
                        <Star key={s} size={12} className={s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                        ))}
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wide">dari 5 bintang</p>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{avgRating.toFixed(1)}</p>
                </div>
                )}
            </div>

            {reviews && reviews.length > 0 ? (
                <div className="divide-y divide-gray-100">
                {reviews.map((r: any) => (
                    <div key={r.id} className="px-6 py-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full ${r.avatar_color ?? "bg-[#6EB8BB]/10 text-[#6EB8BB]"} flex items-center justify-center text-sm font-black shrink-0 border border-gray-200`}>
                        {r.avatar_initials ?? r.name?.slice(0,2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                            <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                            {r.name}
                            <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">Pembeli</span>
                            </p>
                            <p className="text-[10px] font-bold text-gray-400">
                            {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                        </div>
                        <div className="flex items-center gap-0.5 mb-2">
                            {[1,2,3,4,5].map(s => (
                            <Star key={s} size={12} className={s <= r.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                            ))}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed font-medium">{r.content}</p>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <MessageCircle size={32} className="text-gray-200 mb-3" />
                <p className="text-sm font-bold text-gray-500">Belum ada ulasan untuk produk ini</p>
                <p className="text-xs text-gray-400 mt-1 font-medium">Jadilah yang pertama membuktikan kualitasnya!</p>
                </div>
            )}
            </div>

            {/* ── Produk lain dari toko ini ── */}
            {relatedProducts && relatedProducts.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mt-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2.5">
                    <Store size={16} className="text-[#6EB8BB]" />
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Produk Lain dari Toko Ini</h2>
                </div>
                <Link href={`/toko/${seller?.id}`} className="text-[10px] font-bold text-[#6EB8BB] hover:underline flex items-center gap-1 uppercase tracking-wider">
                    Lihat Semua <ChevronRight size={12} />
                </Link>
                </div>
                <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedProducts.map((p: any) => {
                    const rImg = p.images?.[0]
                    ? p.images[0].startsWith("http") ? p.images[0]
                        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${p.images[0]}`
                    : PLACEHOLDER
                    const rFinal = p.discount_price ?? p.price
                    const rHasDisc = p.discount_price && p.discount_price < p.price
                    const rDisc = rHasDisc ? Math.round(((p.price - p.discount_price) / p.price) * 100) : 0

                    return (
                    <Link key={p.id} href={`/produk/${p.slug}`}
                        className="group block rounded-2xl border border-gray-100 overflow-hidden hover:border-[#6EB8BB]/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-white">
                        <div className="aspect-square overflow-hidden bg-gray-50 relative border-b border-gray-100">
                        <img src={rImg} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {rHasDisc && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">-{rDisc}%</span>
                        )}
                        </div>
                        <div className="p-3.5">
                        <p className="text-xs font-bold text-gray-800 line-clamp-2 group-hover:text-[#6EB8BB] transition-colors mb-1.5">{p.name}</p>
                        <p className="text-sm font-black text-gray-900">Rp {Number(rFinal).toLocaleString("id-ID")}</p>
                        {p.total_sold > 0 && (
                            <p className="text-[10px] font-bold text-gray-400 mt-1">{p.total_sold} terjual</p>
                        )}
                        </div>
                    </Link>
                    )
                })}
                </div>
            </div>
            )}

        </div>
        </main>
    )
    }