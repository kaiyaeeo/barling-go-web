    "use client"

    import Link from "next/link"
    import { MapPin, Star, TrendingUp, ShoppingCart, Zap } from "lucide-react"
    import WishlistButton from "@/components/ui/WishlistButton"

    type KulinerItem = {
    id: string
    title: string
    slug: string
    image: string
    source: "content" | "product"
    price?: number
    price_max?: number
    rating?: number
    review_count?: number
    kabupaten?: string
    category?: string
    seller_name?: string
    seller_id?: string
    total_sold?: number
    is_featured?: boolean
    discount_price?: number
    }

    export default function KulinerCard({ item, isLoggedIn, inWishlist }: { item: KulinerItem; isLoggedIn: boolean; inWishlist?: boolean }) {
    const href = item.source === "content" ? `/kuliner/${item.slug}` : `/produk/${item.slug}`
    const hasDiscount = item.discount_price && item.price && item.discount_price < item.price
    const discountPct = hasDiscount ? Math.round(((item.price - item.discount_price) / item.price) * 100) : 0
    const displayPrice = item.discount_price || item.price

    return (
        <Link href={href} className="group block bg-white rounded-2xl border border-gray-100/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
            <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />

            {/* Overlay gradien di bagian bawah untuk teks lebih terbaca jika diperlukan */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />

            {/* Badge - Destinasi / UMKM */}
            <span className={`absolute top-3 left-3 text-[10px] font-bold text-white px-3 py-1 rounded-full backdrop-blur-sm shadow-md z-10 ${
            item.source === "content"
                ? "bg-emerald-500/80 hover:bg-emerald-600"
                : "bg-blue-500/80 hover:bg-blue-600"
            } transition-colors`}>
            {item.source === "content" ? "🌿 Destinasi" : "🏪 UMKM"}
            </span>

            {/* Discount Badge */}
            {hasDiscount && (
            <span className="absolute top-3 right-16 text-[10px] font-black text-white bg-gradient-to-r from-red-500 to-red-600 px-2.5 py-1 rounded-full shadow-md z-10">
                -{discountPct}%
            </span>
            )}

            {/* Featured Badge */}
            {item.is_featured && (
            <span className="absolute top-3 right-3 text-[10px] font-black text-amber-900 bg-gradient-to-r from-amber-300 to-yellow-200 px-2.5 py-1 rounded-full shadow-md z-10 flex items-center gap-1">
                <Zap size={10} className="fill-amber-900" /> Unggulan
            </span>
            )}

            {/* Wishlist Button */}
            <div className="absolute bottom-3 right-3 z-20" onClick={(e) => e.preventDefault()}>
            <WishlistButton
                productId={item.source === "product" ? item.id : undefined}
                contentId={item.source === "content" ? item.id : undefined}
                isLoggedIn={isLoggedIn}
                initialSaved={inWishlist ?? false}
            />
            </div>

            {/* Sold Count (only for products) */}
            {item.source === "product" && item.total_sold && item.total_sold > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2.5 py-1 rounded-full">
                <TrendingUp size={12} />
                {item.total_sold} terjual
            </div>
            )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-2.5">
            {/* Title */}
            <h3 className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-[#6EB8BB] transition-colors">
            {item.title}
            </h3>

            {/* Location or Seller */}
            {(item.kabupaten || item.seller_name) && (
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <MapPin size={13} className="text-[#6EB8BB] shrink-0" />
                <span className="truncate font-medium">{item.seller_name || item.kabupaten}</span>
            </p>
            )}

            {/* Rating & Stats */}
            {(item.rating || item.source === "product") && (
            <div className="flex items-center gap-3 flex-wrap pt-0.5">
                {item.rating ? (
                <>
                    <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                        key={s}
                        size={14}
                        className={s <= Math.round(item.rating || 0) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
                        />
                    ))}
                    </div>
                    <span className="text-xs font-bold text-gray-800">{(item.rating || 0).toFixed(1)}</span>
                    {item.review_count && item.review_count > 0 && (
                    <span className="text-[10px] text-gray-400 font-medium">({item.review_count} ulasan)</span>
                    )}
                </>
                ) : (
                // Jika tidak ada rating, tetap tampilkan placeholder kosong
                <span className="text-[10px] text-gray-400">Belum ada rating</span>
                )}
            </div>
            )}

            {/* Price & Discount */}
            {displayPrice ? (
            <div className="pt-2 border-t border-gray-100/80 space-y-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                <p className="text-lg font-black text-gray-900">Rp {displayPrice?.toLocaleString("id-ID")}</p>
                {hasDiscount && (
                    <p className="text-xs line-through text-gray-400 font-medium">Rp {item.price?.toLocaleString("id-ID")}</p>
                )}
                {hasDiscount && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Hemat {discountPct}%
                    </span>
                )}
                </div>
                {item.price_max && item.price_max > 0 && (
                <p className="text-xs text-gray-500 font-medium">- Rp {item.price_max?.toLocaleString("id-ID")}</p>
                )}
            </div>
            ) : null}

            {/* Action Button */}
            {item.source === "product" && (
            <div
                onClick={(e) => {
                e.preventDefault()
                window.location.href = href
                }}
                className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6EB8BB] to-[#5AA4A7] text-white text-xs font-bold hover:shadow-lg hover:shadow-[#6EB8BB]/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97]"
            >
                <ShoppingCart size={14} /> Lihat & Pesan
            </div>
            )}

            {/* Jika destinasi (content), tampilkan tombol eksplorasi */}
            {item.source === "content" && (
            <div className="mt-3 w-full py-2.5 rounded-xl border-2 border-[#6EB8BB] text-[#6EB8BB] text-xs font-bold hover:bg-[#6EB8BB] hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97]">
                Jelajahi
            </div>
            )}
        </div>
        </Link>
    )
    }