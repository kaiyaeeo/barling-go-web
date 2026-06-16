    import { createClient } from "@/lib/supabase/server"
    import Link from "next/link"
    import Navbar from "@/components/layout/navbar"
    import { Search, SlidersHorizontal, MapPin, ShoppingBag } from "lucide-react"
    import { SortDropdown, HeartButton } from "@/components/ui/WisataClient"

    type SearchParams = { q?: string; kabupaten?: string; kategori?: string; sort?: string; page?: string }

    const KABUPATEN = ["Semua","Banjarnegara","Purbalingga","Banyumas","Cilacap","Kebumen"]
    const KATEGORI  = ["Makanan Olahan","Kerajinan","Fashion","Minuman","Aksesoris"]
    const SORT_OPTS = [
    { value: "terpopuler", label: "Terpopuler" },
    { value: "terbaru",    label: "Terbaru" },
    { value: "termurah",   label: "Harga Termurah" },
    ]

    export default async function OlehOlehPage({ searchParams }: { searchParams: SearchParams }) {
    const supabase  = await createClient()
    const q         = searchParams.q ?? ""
    const kabupaten = searchParams.kabupaten ?? "Semua"
    const kategori  = searchParams.kategori  ?? ""
    const sort      = searchParams.sort      ?? "terpopuler"
    const page      = parseInt(searchParams.page ?? "1")
    const perPage   = 8
    const from      = (page - 1) * perPage

    // Ambil dari tabel products (oleh-oleh = kategori oleh-oleh)
    let prodQuery = supabase
        .from("products")
        .select(`
        id, name, slug, cover_image:images, price, discount_price,
        images, rating, total_sold,
        categories!inner(name, type)
        `, { count: "exact" })
        .eq("is_active", true)
        .eq("categories.type", "oleh-oleh")
        .range(from, from + perPage - 1)

    if (q)    prodQuery = prodQuery.ilike("name", `%${q}%`)
    if (sort === "terpopuler") prodQuery = prodQuery.order("total_sold", { ascending: false })
    else if (sort === "terbaru")  prodQuery = prodQuery.order("created_at", { ascending: false })
    else if (sort === "termurah") prodQuery = prodQuery.order("price", { ascending: true })

    const { data: products, count } = await prodQuery

    // Juga ambil konten tipe oleh-oleh dari tabel contents
    let contQuery = supabase
        .from("contents")
        .select("id,title,slug,cover_image,kabupaten,ticket_price_min,ticket_price_max,rating,review_count,tags", { count: "exact" })
        .eq("type", "oleh-oleh")
        .eq("is_published", true)
        .range(from, from + perPage - 1)

    if (q)                     contQuery = contQuery.ilike("title", `%${q}%`)
    if (kabupaten !== "Semua") contQuery = contQuery.eq("kabupaten", kabupaten)

    const { data: contents } = await contQuery
    const totalPages = Math.ceil((count ?? 0) / perPage)

    // Gabungkan keduanya — prioritaskan produk nyata
    const items = [
        ...(products ?? []).map((p: any) => ({
        id:         p.id,
        title:      p.name,
        slug:       p.slug,
        cover_image: p.images?.[0] ?? null,
        kabupaten:  null,
        price_min:  p.discount_price ?? p.price,
        price_max:  null,
        rating:     p.rating,
        sold:       p.total_sold,
        source:     "product" as const,
        })),
        ...(contents ?? []).map((c: any) => ({
        id:         c.id,
        title:      c.title,
        slug:       c.slug,
        cover_image: c.cover_image,
        kabupaten:  c.kabupaten,
        price_min:  c.ticket_price_min,
        price_max:  c.ticket_price_max,
        rating:     c.rating,
        sold:       c.review_count,
        source:     "content" as const,
        })),
    ].slice(0, perPage)

    const PLACEHOLDER = "https://images.unsplash.com/photo-1606914501449-5a96b6ce24ca?w=400&q=70"

    function imgSrc(item: any) {
        if (!item.cover_image) return PLACEHOLDER
        if (item.cover_image.startsWith("http")) return item.cover_image
        const bucket = item.source === "product" ? "product-images" : "content-images"
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${item.cover_image}`
    }

    function buildUrl(overrides: Record<string,string>) {
        const params: Record<string,string> = { kabupaten, sort, page: "1" }
        if (q)       params.q = q
        if (kategori) params.kategori = kategori
        Object.assign(params, overrides)
        return `/oleh-oleh?${new URLSearchParams(params).toString()}`
    }

    function itemHref(item: any) {
        return item.source === "product" ? `/produk/${item.slug}` : `/oleh-oleh/${item.slug}`
    }

    return (
        <>
        <Navbar />
        <main className="min-h-screen bg-white pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <ShoppingBag size={20} className="text-amber-600" />
                </div>
                <h1 className="text-3xl font-black text-gray-900">Semua Oleh-Oleh Unggulan</h1>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                <SlidersHorizontal size={15} /> Filter
                </button>
            </div>

            {/* Search */}
            <form method="GET" className="mb-6">
                <div className="relative">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="q" defaultValue={q}
                    placeholder="Cari batik, keripik, atau kerajinan khas..."
                    className="w-full pl-12 pr-5 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] bg-gray-50" />
                {kabupaten !== "Semua" && <input type="hidden" name="kabupaten" value={kabupaten} />}
                {kategori && <input type="hidden" name="kategori" value={kategori} />}
                {sort !== "terpopuler" && <input type="hidden" name="sort" value={sort} />}
                </div>
            </form>

            {/* Kabupaten filter */}
            <div className="mb-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">Kabupaten</p>
                <div className="flex gap-2 flex-wrap">
                {KABUPATEN.map((kab) => (
                    <Link key={kab} href={buildUrl({ kabupaten: kab })}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        kabupaten === kab ? "bg-[#6EB8BB] text-white border-[#6EB8BB]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}>{kab}</Link>
                ))}
                </div>
            </div>

            {/* Kategori + Sort */}
            <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
                <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Kategori</p>
                <div className="flex gap-2 flex-wrap">
                    {KATEGORI.map((kat) => (
                    <Link key={kat} href={buildUrl({ kategori: kategori === kat ? "" : kat })}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        kategori === kat ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                        }`}>{kat}</Link>
                    ))}
                </div>
                </div>
                <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Urutkan:</span>
                <form method="GET">
                    {q && <input type="hidden" name="q" value={q} />}
                    {kabupaten !== "Semua" && <input type="hidden" name="kabupaten" value={kabupaten} />}
                    {kategori && <input type="hidden" name="kategori" value={kategori} />}
                    
                    {/* MENGGUNAKAN KOMPONEN DROPDOWN */}
                    <SortDropdown sort={sort} options={SORT_OPTS} />

                </form>
                </div>
            </div>

            {/* Grid */}
            {items.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                <ShoppingBag size={40} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm">Tidak ada oleh-oleh ditemukan.</p>
                <Link href="/oleh-oleh" className="mt-3 inline-block text-sm text-[#6EB8BB] hover:underline">Reset filter</Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {items.map((item) => (
                    <Link key={item.id} href={itemHref(item)} className="group block bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all relative">
                    <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={imgSrc(item)} alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {(item.sold ?? 0) >= 5 && (
                        <span className="absolute top-2.5 left-2.5 text-xs font-bold text-white bg-amber-500 px-2.5 py-1 rounded-full z-10">Terlaris</span>
                        )}
                        
                        {/* MENGGUNAKAN KOMPONEN TOMBOL FAVORIT */}
                        <HeartButton />

                    </div>
                    <div className="p-4">
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">OLEH-OLEH</p>
                        <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-[#6EB8BB] transition-colors line-clamp-1">
                        {item.title}
                        </h3>
                        {item.kabupaten && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                            <MapPin size={11} className="shrink-0" /> {item.kabupaten}
                        </p>
                        )}
                        {item.price_min > 0 && (
                        <p className="text-sm font-bold text-[#6EB8BB]">
                            Rp {item.price_min.toLocaleString("id-ID")}
                            {item.price_max && item.price_max > item.price_min && ` – Rp ${item.price_max.toLocaleString("id-ID")}`}
                        </p>
                        )}
                    </div>
                    </Link>
                ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                {page > 1 && <Link href={buildUrl({ page: String(page-1) })} className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">‹</Link>}
                {[1,2,3].filter(p => p <= totalPages).map((p) => (
                    <Link key={p} href={buildUrl({ page: String(p) })}
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-all ${p === page ? "bg-[#6EB8BB] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                    {p}
                    </Link>
                ))}
                {totalPages > 4 && <span className="text-gray-400">...</span>}
                {totalPages > 3 && <Link href={buildUrl({ page: String(totalPages) })} className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">{totalPages}</Link>}
                {page < totalPages && <Link href={buildUrl({ page: String(page+1) })} className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">›</Link>}
                </div>
            )}
            </div>

            <footer className="border-t border-gray-100 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                <p className="font-black text-gray-900">BARLING-GO</p>
                <p className="text-xs text-gray-400 mt-0.5">© 2026 BARLING-GO. All Rights Reserved</p>
                </div>
                <div className="flex gap-6 text-sm text-gray-500">
                {["Terms of Service","Privacy Policy","Contact Us"].map((l) => (
                    <a key={l} href="#" className="hover:text-gray-800">{l}</a>
                ))}
                </div>
            </div>
            </footer>
        </main>
        </>
    )
    }