    "use client"

    import Link from "next/link"
    import { ChevronLeft, ChevronRight, Store, BadgeCheck } from "lucide-react"
    import { useRef } from "react"
    import type { Product } from "@/lib/queries/landing-types"
    import { getStorageUrl } from "@/lib/queries/landing-types"

    const PLACEHOLDER = "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400&q=70"

    export default function TopUMKMSection({ products }: { products: Product[] }) {
    const scrollRef = useRef<HTMLDivElement>(null)
    
    const scroll = (dir: "left" | "right") => {
        scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" })
    }

    return (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
            <div>
                <div className="flex items-center gap-2 mb-2">
                <Store className="text-orange-500" size={24} />
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Top UMKM Pilihan</h2>
                </div>
                <p className="text-gray-500 font-medium text-sm sm:text-base">Produk lokal kualitas super yang direkomendasikan langsung oleh Barling-GO.</p>
            </div>
            
            <div className="hidden md:flex gap-2">
                <button onClick={() => scroll("left")} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-[#6EB8BB] hover:text-[#6EB8BB] shadow-sm transition-all">
                <ChevronLeft size={20} />
                </button>
                <button onClick={() => scroll("right")} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-[#6EB8BB] hover:text-[#6EB8BB] shadow-sm transition-all">
                <ChevronRight size={20} />
                </button>
            </div>
            </div>

            {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                <p className="text-gray-400 font-bold">Belum ada UMKM Unggulan bulan ini.</p>
            </div>
            ) : (
            <div ref={scrollRef} className="flex gap-5 overflow-x-auto scrollbar-hide pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8" style={{ scrollSnapType: "x mandatory" }}>
                {products.map((item) => {
                const imgSrc = item.images?.[0] ? getStorageUrl("product-images", item.images[0]) : PLACEHOLDER
                return (
                    <Link key={item.id} href={`/produk/${item.slug}`} className="shrink-0 w-64 sm:w-72 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group cursor-pointer hover:shadow-xl hover:border-[#6EB8BB]/30 transition-all duration-300 flex flex-col" style={{ scrollSnapAlign: "start" }}>
                    <div className="relative h-48 overflow-hidden bg-gray-50">
                        <img src={imgSrc} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-80" />
                        
                        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 border border-gray-100 shadow-sm overflow-hidden">
                            <Store size={14} className="text-gray-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-white text-xs font-black truncate flex items-center gap-1">
                            Official Store <BadgeCheck size={12} className="text-blue-400 fill-white" />
                            </p>
                        </div>
                        </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                        <p className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-[#6EB8BB] transition-colors">{item.name}</p>
                        <div className="mt-auto pt-3">
                        <p className="text-base font-black text-orange-500">
                            Rp {Number(item.discount_price ?? item.price).toLocaleString("id-ID")}
                        </p>
                        </div>
                    </div>
                    </Link>
                )
                })}
            </div>
            )}
        </div>
        </section>
    )
    }