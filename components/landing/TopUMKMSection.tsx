    "use client"

    import Link from "next/link"
    import { ChevronLeft, ChevronRight, Star, ShoppingBag, ArrowRight } from "lucide-react"
    import { useRef } from "react"
    import type { Product } from "@/lib/queries/landing-types"
    import { getStorageUrl } from "@/lib/queries/landing-types"

    const PLACEHOLDER = "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400&q=70"

    type Props = { products: Product[] }

    export default function TopUMKMSection({ products }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const scroll = (dir: "left" | "right") => {
        scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" })
    }

    return (
        <section className="py-20 bg-[#E6F7F8]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
                <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-0.5 bg-[#6EB8BB] rounded-full" />
                <span className="text-xs font-black text-[#6EB8BB] uppercase tracking-widest">Unggulan</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900">Top UMKM Barlingmascakep</h2>
                <p className="text-sm text-gray-400 mt-1">Produk terbaik pilihan kurator lokal kami</p>
            </div>
            <Link
                href="/umkm"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#6EB8BB] hover:text-[#5AA4A7] transition-colors"
            >
                Lihat Semua <ArrowRight size={14} />
            </Link>
            </div>

            {/* Cards */}
            {products.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm bg-white/60 rounded-2xl border border-[#6EB8BB]/10">
                Belum ada produk UMKM yang ditampilkan.
            </div>
            ) : (
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-2 px-2"
                style={{ scrollSnapType: "x mandatory" }}
            >
                {products.map((item, idx) => {
                const imgSrc = item.images?.[0] ? getStorageUrl("product-images", item.images[0]) : PLACEHOLDER
                const hasDisc = item.discount_price && item.discount_price < item.price
                const discPct = hasDisc ? Math.round(((item.price - item.discount_price!) / item.price) * 100) : 0

                return (
                    <Link
                    key={item.id}
                    href={`/produk/${item.slug}`}
                    className="group shrink-0 w-60 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-[#6EB8BB]/15 hover:border-[#6EB8BB]/40 hover:shadow-xl hover:shadow-[#6EB8BB]/10 hover:-translate-y-1 transition-all duration-300"
                    style={{ scrollSnapAlign: "start" }}
                    >
                    {/* Image */}
                    <div className="relative h-44 overflow-hidden bg-[#E6F7F8]/50">
                        <img
                        src={imgSrc}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                        {idx < 3 && (
                        <div
                            className="absolute top-3 left-3 w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-black text-white shadow-md"
                            style={{ background: idx === 0 ? "#F59E0B" : idx === 1 ? "#9CA3AF" : "#B45309" }}
                        >
                            #{idx + 1}
                        </div>
                        )}

                        {hasDisc && (
                        <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                            -{discPct}%
                        </span>
                        )}

                        {item.categories && (
                        <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full capitalize">
                            {item.categories.name}
                        </span>
                        )}
                    </div>

                    {/* Info */}
                    <div className="p-3.5">
                        <p className="text-sm font-bold text-gray-800 truncate mb-1 group-hover:text-[#6EB8BB] transition-colors">
                        {item.name}
                        </p>

                        <div className="flex items-baseline gap-1.5 mb-2">
                        <p className="text-sm font-black text-[#6EB8BB]">
                            Rp {Number(item.discount_price ?? item.price).toLocaleString("id-ID")}
                        </p>
                        {hasDisc && (
                            <p className="text-[10px] text-gray-400 line-through">
                            Rp {Number(item.price).toLocaleString("id-ID")}
                            </p>
                        )}
                        </div>

                        <div className="flex items-center justify-between">
                        {item.rating > 0 ? (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-500">
                            <Star size={11} className="fill-amber-400" /> {item.rating.toFixed(1)}
                            </span>
                        ) : <span />}
                        {item.total_sold > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-gray-400">
                            <ShoppingBag size={10} /> {item.total_sold} terjual
                            </span>
                        )}
                        </div>
                    </div>
                    </Link>
                )
                })}
            </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between mt-6">
            <Link
                href="/umkm"
                className="px-5 py-2.5 text-sm font-bold text-[#6EB8BB] border-2 border-[#6EB8BB]/30 rounded-xl hover:bg-[#6EB8BB]/10 transition-all"
            >
                Jelajahi Semua UMKM
            </Link>
            <div className="flex gap-2">
                <button
                onClick={() => scroll("left")}
                className="w-10 h-10 rounded-full border-2 border-[#6EB8BB]/20 flex items-center justify-center hover:border-[#6EB8BB] hover:text-[#6EB8BB] transition-all bg-white/70 backdrop-blur-sm"
                >
                <ChevronLeft size={16} />
                </button>
                <button
                onClick={() => scroll("right")}
                className="w-10 h-10 rounded-full border-2 border-[#6EB8BB]/20 flex items-center justify-center hover:border-[#6EB8BB] hover:text-[#6EB8BB] transition-all bg-white/70 backdrop-blur-sm"
                >
                <ChevronRight size={16} />
                </button>
            </div>
            </div>
        </div>
        </section>
    )
    }