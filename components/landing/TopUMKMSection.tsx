    "use client"

    import Link from "next/link"
    import Image from "next/image"
    import { ChevronLeft, ChevronRight } from "lucide-react"
    import { useRef } from "react"
    import type { Product } from "@/lib/queries/landing-types"
    import { getStorageUrl } from "@/lib/queries/landing-types"

    const PLACEHOLDER = "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400&q=70"

    type Props = { products: Product[] }

    export default function TopUMKMSection({ products }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const scroll = (dir: "left" | "right") => {
        scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" })
    }

    return (
        <section className="py-16 bg-[#e8f0eb]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Top UMKM</h2>
            <p className="hidden md:block max-w-sm text-sm text-gray-500 text-right leading-relaxed">
                Mulai dari pesona liburan di pulau hingga sejuknya kota pegunungan,<br />
                temukan ke mana petualanganmu selanjutnya akan melangkah.
            </p>
            </div>

            {products.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">Belum ada produk UMKM yang ditampilkan.</div>
            ) : (
            <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2" style={{ scrollSnapType: "x mandatory" }}>
                {products.map((item) => {
                const imgSrc = item.images?.[0] ? getStorageUrl("product-images", item.images[0]) : PLACEHOLDER
                return (
                    <Link key={item.id} href={`/produk/${item.slug}`} className="shrink-0 w-64 rounded-2xl overflow-hidden group cursor-pointer" style={{ scrollSnapAlign: "start" }}>
                    <div className="relative h-44 overflow-hidden">
                        <img src={imgSrc} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        {item.categories && (
                        <span className="absolute bottom-3 left-3 text-xs font-semibold text-white bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full capitalize">
                            {item.categories.name}
                        </span>
                        )}
                    </div>
                    <div className="bg-white px-3 py-2.5">
                        <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                        {item.rating > 0 && (
                        <p className="text-xs text-amber-500 mt-0.5">★ {item.rating.toFixed(1)}</p>
                        )}
                    </div>
                    </Link>
                )
                })}
            </div>
            )}

            <div className="flex items-center justify-between mt-6">
            <Link href="/umkm" className="px-5 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                View More
            </Link>
            <div className="flex gap-2">
                <button onClick={() => scroll("left")} className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-all">
                <ChevronLeft size={16} />
                </button>
                <button onClick={() => scroll("right")} className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-all">
                <ChevronRight size={16} />
                </button>
            </div>
            </div>
        </div>
        </section>
    )
    }
