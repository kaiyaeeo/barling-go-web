    "use client"

    import Link from "next/link"
    import { useState, useTransition } from "react"
    import { ArrowRight, Loader2, MapPin, Star, ShoppingBag } from "lucide-react"
    import { getStorageUrl } from "@/lib/queries/landing-types"
    import { createClient } from "@/lib/supabase/client"

    const PLACEHOLDER = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=70"
    const tabs = [
    { key: "All",       label: "Semua"      },
    { key: "Kuliner",   label: "Kuliner"    },
    { key: "Wisata",    label: "Wisata"     },
    { key: "Oleh-oleh", label: "Oleh-oleh" },
    ]

    type Props = { initialProducts: any[] }

    export default function FavoritesSection({ initialProducts }: Props) {
    const supabase = createClient()
    const [active,    setActive]    = useState("All")
    const [products,  setProducts]  = useState<any[]>(initialProducts)
    const [isPending, startTransition] = useTransition()

    async function handleFilter(tab: string) {
        setActive(tab)
        startTransition(async () => {
        try {
            if (tab === "All") {
            // 1. Ambil data produk UMKM
            const { data: prodData } = await supabase.from("products").select("*, categories(name)").limit(6)
            
            // 2. Ambil data wisata dari tabel 'contents' dengan type 'destinasi'
            const { data: wisataData } = await supabase.from("contents").select("*").eq("type", "destinasi").limit(6)
            
            const combined = [
                ...(prodData?.map(p => ({ ...p, source: "produk" })) || []),
                ...(wisataData?.map(w => ({ ...w, source: "wisata" })) || [])
            ]
            
            // Acak urutan agar campur antara wisata dan produk
            setProducts(combined.sort(() => Math.random() - 0.5))

            } else if (tab === "Wisata") {
            // Mengambil wisata dari tabel 'contents' dengan type 'destinasi'
            const { data } = await supabase.from("contents").select("*").eq("type", "destinasi").limit(8)
            setProducts(data?.map(w => ({ ...w, source: "wisata" })) || [])

            } else {
            // Tab Kuliner atau Oleh-oleh
            // PERBAIKAN: Cari berdasarkan kolom 'type' (huruf kecil), bukan nama
            const { data: categories } = await supabase
                .from("categories")
                .select("id")
                .eq("type", tab.toLowerCase())
            
            if (categories && categories.length > 0) {
                // Ambil semua ID kategori yang cocok
                const categoryIds = categories.map(c => c.id)
                
                // Ambil produk yang category_id-nya termasuk dalam daftar ID di atas
                const { data } = await supabase
                .from("products")
                .select("*, categories(name)")
                .in("category_id", categoryIds)
                .limit(8)
                
                setProducts(data?.map(p => ({ ...p, source: "produk" })) || [])
            } else {
                setProducts([])
            }
            }
        } catch (err) {
            console.error("Gagal memfilter data:", err)
            setProducts([]) 
        }
        })
    }

    const getImageUrl = (item: any) => {
        if (item.source === "wisata" && item.cover_image) {
        return item.cover_image.startsWith("http")
            ? item.cover_image
            : getStorageUrl("content-images", item.cover_image)
        }
        if (item.images?.[0]) return getStorageUrl("product-images", item.images[0])
        return PLACEHOLDER
    }

    return (
        <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-6 h-0.5 bg-[#6EB8BB] rounded-full" />
                <span className="text-xs font-black text-[#6EB8BB] uppercase tracking-widest">Favorit Pilihan</span>
                <div className="w-6 h-0.5 bg-[#6EB8BB] rounded-full" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3">
                Destinasi & UMKM Terbaik
            </h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
                Temukan destinasi wisata dan produk UMKM pilihan terbaik di Barlingmascakep
            </p>
            </div>

            {/* Filter tabs */}
            <div className="flex justify-center gap-2 mb-10 flex-wrap">
            {tabs.map((tab) => (
                <button
                key={tab.key}
                onClick={() => handleFilter(tab.key)}
                className={`px-5 py-2 text-sm font-bold rounded-full border-2 transition-all active:scale-95 ${
                    active === tab.key
                    ? "bg-[#6EB8BB] text-white border-[#6EB8BB] shadow-md shadow-[#6EB8BB]/25"
                    : "bg-white text-gray-500 border-gray-200 hover:border-[#6EB8BB] hover:text-[#6EB8BB]"
                }`}
                >
                {tab.label}
                </button>
            ))}
            </div>

            {/* Grid */}
            <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 transition-all duration-300 ${isPending ? "opacity-40 scale-[0.99]" : "opacity-100 scale-100"}`}>
            {isPending ? (
                <div className="col-span-4 flex justify-center py-16">
                <Loader2 size={28} className="animate-spin text-[#6EB8BB]" />
                </div>
            ) : !Array.isArray(products) || products.length === 0 ? (
                <div className="col-span-4 text-center py-16 text-gray-400 text-sm bg-gray-50 rounded-2xl font-medium">
                Belum ada konten untuk kategori ini.
                </div>
            ) : (
                products.map((item) => {
                const imgSrc  = getImageUrl(item)
                const href    = item.source === "wisata" ? `/wisata/${item.slug || item.id}` : `/produk/${item.slug || item.id}`
                const isWisata = item.source === "wisata"

                return (
                    <Link
                    key={item.id}
                    href={href}
                    className="group relative rounded-2xl overflow-hidden bg-gray-100 cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                    style={{ aspectRatio: "1" }}
                    >
                    <img
                        src={imgSrc}
                        alt={item.name || item.title || "Image"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Base gradient always visible */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Category pill */}
                    <span className="absolute top-3 left-3 text-[9px] font-white text-white bg-[#6EB8BB]/80 backdrop-blur-sm px-2 py-0.5 rounded-full capitalize">
                        {isWisata ? "Wisata" : (item.categories?.name ?? "UMKM")}
                    </span>

                    {/* Rating */}
                    {item.rating > 0 && (
                        <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-white bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        <Star size={9} className="fill-amber-400 text-amber-400" /> {Number(item.rating).toFixed(1)}
                        </span>
                    )}

                    {/* Bottom info — always partially visible, expands on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-3.5">
                        <p className="text-white text-sm font-black leading-tight mb-0.5 drop-shadow">
                        {item.name || item.title}
                        </p>
                        <div className="flex items-center justify-between overflow-hidden max-h-0 group-hover:max-h-10 transition-all duration-300">
                        {isWisata && item.kabupaten && (
                            <span className="text-[10px] text-white/80 flex items-center gap-1">
                            <MapPin size={9} /> {item.kabupaten}
                            </span>
                        )}
                        {!isWisata && item.price && (
                            <span className="text-[11px] font-white text-white font-semibold">
                            Rp {Number(item.discount_price ?? item.price).toLocaleString("id-ID")}
                            </span>
                        )}
                        <span className="text-[9px] font-bold text-white/60 bg-white/10 px-2 py-0.5 rounded-full ml-auto">
                            {isWisata ? "Lihat" : "Beli"}  →
                        </span>
                        </div>
                    </div>
                    </Link>
                )
                })
            )}
            </div>

            {/* CTA */}
            <div className="flex justify-center mt-10">
            <Link
                href="/wisata"
                className="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold text-[#6EB8BB] border-2 border-[#6EB8BB]/30 rounded-2xl hover:bg-[#E6F7F8] hover:border-[#6EB8BB] transition-all"
            >
                Jelajahi Lebih Banyak <ArrowRight size={15} />
            </Link>
            </div>
        </div>
        </section>
    )
    }