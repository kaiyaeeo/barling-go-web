    "use client"

    import React, { useEffect, useState } from "react"
    import Link from "next/link"
    import Navbar from "@/components/layout/navbar"
    import { Search, SlidersHorizontal, MapPin, Loader2, Star } from "lucide-react"
    import { createClient } from "@/lib/supabase/client"
    import { HeartButton } from "@/components/ui/WisataClient"
    import KulinerCard from "@/components/kuliner/KulinerCard"

    const KABUPATEN  = ["Semua","Banjarnegara","Purbalingga","Banyumas","Cilacap","Kebumen"]
    const KATEGORI   = ["Makanan Berat","Minuman","Jajanan","Dessert"]
    const SORT_OPTS  = [
    { value: "rating",   label: "Rating Tertinggi" },
    { value: "terbaru",  label: "Terbaru" },
    { value: "termurah", label: "Termurah" },
    ]

    export default function KulinerPage() {
    const supabase = createClient()
    const [items, setItems] = useState<any[]>([])
    const [filteredItems, setFilteredItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [wishlists, setWishlists] = useState<Set<string>>(new Set())

    // Filter States
    const [q, setQ] = useState("")
    const [kabupaten, setKabupaten] = useState("Semua")
    const [kategori, setKategori] = useState("")
    const [sort, setSort] = useState("rating")
    
    // Pagination State
    const [page, setPage] = useState(1)
    const perPage = 8

    // Ambil user session
    useEffect(() => {
        async function getUser() {
            const { data: { user: currentUser } } = await supabase.auth.getUser()
            setUser(currentUser)
            
            if (currentUser) {
                // Fetch wishlist user
                const { data: wishlistData } = await supabase
                    .from("wishlists")
                    .select("product_id, content_id")
                    .eq("user_id", currentUser.id)
                
                const wishlistIds = new Set(
                    wishlistData?.map((w: any) => w.product_id || w.content_id).filter(Boolean) || []
                )
                setWishlists(wishlistIds)
            }
        }
        getUser()
    }, [supabase])

    // Mengambil dan Menggabungkan Data (Super Admin + UMKM)
    useEffect(() => {
        async function fetchData() {
        try {
            // 1. Fetch Tempat Kuliner (Super Admin dari tabel 'contents')
            const { data: contents } = await supabase
            .from("contents")
            .select("id, title, slug, cover_image, kabupaten, ticket_price_min, ticket_price_max, rating, review_count, tags, created_at, is_featured")
            .eq("type", "kuliner")
            .eq("is_published", true)

            // 2. Fetch Produk Kuliner (UMKM dari tabel 'products')
            const { data: catData } = await supabase.from("categories").select("id").eq("type", "kuliner")
            const catIds = catData?.map((c: any) => c.id) || []
            
            const { data: products } = await supabase
            .from("products")
            .select("id, name, slug, images, price, discount_price, rating, total_sold, is_featured, created_at, categories(name), profiles(city, full_name, umkm_name)")
            .in("category_id", catIds)
            .eq("is_active", true)

            // Standarisasi Format Data
            const formattedContents = contents?.map(c => ({
            id: c.id,
            title: c.title,
            slug: c.slug,
            image: c.cover_image,
            kabupaten: c.kabupaten,
            price: c.ticket_price_min,
            price_max: c.ticket_price_max,
            rating: c.rating,
            review_count: c.review_count,
            tags: c.tags || [],
            source: "content",
            is_featured: c.is_featured,
            created_at: c.created_at
            })) || []

            const formattedProducts = products?.map(p => ({
            id: p.id,
            title: p.name,
            slug: p.slug,
            image: p.images?.[0],
            seller_name: p.profiles?.umkm_name || p.profiles?.full_name,
            seller_id: p.profiles?.id,
            kabupaten: p.profiles?.city || "",
            price: p.price,
            discount_price: p.discount_price,
            price_max: 0,
            rating: p.rating,
            review_count: p.total_sold,
            total_sold: p.total_sold,
            category: p.categories?.name,
            source: "product",
            is_featured: p.is_featured,
            created_at: p.created_at
            })) || []

            // Gabungkan
            setItems([...formattedContents, ...formattedProducts])
        } catch (error) {
            console.error("Error fetching kuliner data:", error)
        } finally {
            setLoading(false)
        }
        }
        fetchData()
    }, [supabase])

    // Logika Filter Instan (Tanpa Reload Halaman)
    useEffect(() => {
        let result = [...items]

        if (q) {
        result = result.filter(item => item.title.toLowerCase().includes(q.toLowerCase()))
        }
        if (kabupaten !== "Semua") {
        result = result.filter(item => item.kabupaten?.toLowerCase() === kabupaten.toLowerCase())
        }
        if (kategori) {
        result = result.filter(item => {
            if (item.source === "content") {
            return item.tags?.includes(kategori.toLowerCase().replace(" ", "_"))
            } else {
            return item.category?.toLowerCase() === kategori.toLowerCase()
            }
        })
        }

        if (sort === "rating") {
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        } else if (sort === "terbaru") {
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        } else if (sort === "termurah") {
        result.sort((a, b) => (a.price || 0) - (b.price || 0))
        }

        setFilteredItems(result)
        setPage(1) // Reset ke halaman pertama setiap kali filter berubah
    }, [items, q, kabupaten, kategori, sort])

    const totalPages = Math.ceil(filteredItems.length / perPage)
    const paginatedItems = filteredItems.slice((page - 1) * perPage, page * perPage)

    const getImageUrl = (item: any) => {
        if (item.source === "content" && item.image) {
        return item.image.startsWith("http")
            ? item.image
            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content-images/${item.image}`
        }
        if (item.source === "product" && item.image) {
        return item.image.startsWith("http")
            ? item.image
            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${item.image}`
        }
        return "https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=70"
    }

    return (
        <>
        <Navbar />
        <main className="min-h-screen bg-white pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black text-gray-900">Semua Kuliner Unggulan</h1>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                <SlidersHorizontal size={15} /> Filter
                </button>
            </div>

            {/* Search Interaktif */}
            <div className="mb-6 relative">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari sroto, mendoan, atau jajanan lainnya..."
                className="w-full pl-12 pr-5 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] bg-gray-50 transition-all"
                />
            </div>

            {/* Kabupaten Filter */}
            <div className="mb-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">Kabupaten</p>
                <div className="flex gap-2 flex-wrap">
                {KABUPATEN.map((kab) => (
                    <button 
                    key={kab} 
                    onClick={() => setKabupaten(kab)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        kabupaten === kab ? "bg-[#6EB8BB] text-white border-[#6EB8BB]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                    >
                    {kab}
                    </button>
                ))}
                </div>
            </div>

            {/* Kategori + Sort Row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Kategori</p>
                <div className="flex gap-2 flex-wrap">
                    {KATEGORI.map((kat) => (
                    <button 
                        key={kat} 
                        onClick={() => setKategori(kategori === kat ? "" : kat)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        kategori === kat ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                        }`}
                    >
                        {kat}
                    </button>
                    ))}
                </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm text-gray-500">Urutkan:</span>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] cursor-pointer transition-all"
                >
                    {SORT_OPTS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                </div>
            </div>

            {/* Grid Render */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-[#6EB8BB]" /></div>
            ) : paginatedItems.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                <Search size={40} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm">Tidak ada kuliner ditemukan.</p>
                <button onClick={() => { setQ(""); setKabupaten("Semua"); setKategori("") }} className="mt-3 inline-block text-sm text-[#6EB8BB] font-bold hover:underline">Reset filter</button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {paginatedItems.map((item: any) => (
                    <KulinerCard 
                        key={item.id}
                        item={item}
                        isLoggedIn={!!user}
                        inWishlist={wishlists.has(item.id)}
                    />
                ))}
                </div>
            )}

            {/* Pagination Interaktif */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                {page > 1 && (
                    <button onClick={() => setPage(page - 1)} className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">‹</button>
                )}
                {[1, 2, 3].filter(p => p <= totalPages).map((p) => (
                    <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-all ${
                    p === page ? "bg-[#6EB8BB] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}>{p}</button>
                ))}
                {totalPages > 4 && <span className="text-gray-400">...</span>}
                {totalPages > 3 && (
                    <button onClick={() => setPage(totalPages)} className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-all ${
                    page === totalPages ? "bg-[#6EB8BB] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}>{totalPages}</button>
                )}
                {page < totalPages && (
                    <button onClick={() => setPage(page + 1)} className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">›</button>
                )}
                </div>
            )}

            </div>
        </main>
        </>
    )
    }