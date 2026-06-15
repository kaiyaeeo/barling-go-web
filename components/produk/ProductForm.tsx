    import { createClient } from "@/lib/supabase/server"
    import { getStorageUrl } from "@/lib/queries/landing"
    import Link from "next/link"
    import { Search, SlidersHorizontal } from "lucide-react"

    const PLACEHOLDER = "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=70"

    type SearchParams = { type?: string; q?: string; page?: string }

    export default async function ProdukPage({
    searchParams,
    }: {
    searchParams: SearchParams
    }) {
    const supabase = await createClient()
    const type = searchParams.type ?? "all"
    const q = searchParams.q ?? ""
    const page = parseInt(searchParams.page ?? "1")
    const perPage = 12
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    // Ambil kategori untuk filter tabs
    const { data: categories } = await supabase
        .from("categories")
        .select("id, name, type, slug")
        .eq("is_active", true)
        .order("type")

    // Query produk dengan filter
    let query = supabase
        .from("products")
        .select(`id, name, slug, price, discount_price, images, rating, total_sold, categories(name, type)`, { count: "exact" })
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(from, to)

    if (type !== "all") query = query.eq("categories.type", type)
    if (q) query = query.ilike("name", `%${q}%`)

    const { data: products, count } = await query
    const totalPages = Math.ceil((count ?? 0) / perPage)

    const tabs = [
        { label: "Semua", value: "all" },
        { label: "Kuliner", value: "kuliner" },
        { label: "Wisata", value: "wisata" },
        { label: "Oleh-oleh", value: "oleh-oleh" },
    ]

    return (
        <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 pt-20 pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-5">Jelajahi Produk & Destinasi</h1>

            {/* Search */}
            <form method="GET" className="flex gap-3 mb-5">
                <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    name="q"
                    defaultValue={q}
                    placeholder="Cari produk, kuliner, wisata..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] bg-gray-50"
                />
                </div>
                {type !== "all" && <input type="hidden" name="type" value={type} />}
                <button type="submit" className="px-5 py-2.5 bg-[#6EB8BB] text-white text-sm font-medium rounded-xl hover:bg-[#5AA4A7] transition-all">
                Cari
                </button>
            </form>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {tabs.map((tab) => (
                <Link
                    key={tab.value}
                    href={`/produk?type=${tab.value}${q ? `&q=${q}` : ""}`}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-all ${
                    type === tab.value
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                >
                    {tab.label}
                </Link>
                ))}
            </div>
            </div>
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {!products || products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
                <SlidersHorizontal size={40} className="mx-auto mb-4 opacity-30" />
                <p className="text-sm">Tidak ada produk ditemukan.</p>
                <Link href="/produk" className="mt-4 inline-block text-sm text-[#6EB8BB] hover:underline">Reset filter</Link>
            </div>
            ) : (
            <>
                <p className="text-sm text-gray-400 mb-5">{count} produk ditemukan</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((item: any) => {
                    const imgSrc = item.images?.[0] ? getStorageUrl("product-images", item.images[0]) : PLACEHOLDER
                    const discounted = item.discount_price && item.discount_price < item.price
                    return (
                    <Link key={item.id} href={`/produk/${item.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all">
                        <div className="relative aspect-square overflow-hidden">
                        <img src={imgSrc} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {discounted && (
                            <span className="absolute top-2.5 left-2.5 text-xs font-bold text-white bg-[#FF6B35] px-2 py-0.5 rounded-full">
                            -{Math.round((1 - item.discount_price / item.price) * 100)}%
                            </span>
                        )}
                        </div>
                        <div className="p-3">
                        <p className="text-sm font-semibold text-gray-800 truncate mb-1">{item.name}</p>
                        <div className="flex items-center justify-between">
                            <div>
                            {discounted ? (
                                <div>
                                <span className="text-[#6EB8BB] font-bold text-sm">
                                    Rp {item.discount_price.toLocaleString("id-ID")}
                                </span>
                                <span className="ml-1.5 text-xs text-gray-400 line-through">
                                    Rp {item.price.toLocaleString("id-ID")}
                                </span>
                                </div>
                            ) : (
                                <span className="text-gray-800 font-bold text-sm">
                                Rp {item.price.toLocaleString("id-ID")}
                                </span>
                            )}
                            </div>
                            {item.rating > 0 && (
                            <span className="text-xs text-amber-500">★ {item.rating.toFixed(1)}</span>
                            )}
                        </div>
                        </div>
                    </Link>
                    )
                })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                        key={p}
                        href={`/produk?type=${type}&page=${p}${q ? `&q=${q}` : ""}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all border ${
                        p === page ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                        }`}
                    >
                        {p}
                    </Link>
                    ))}
                </div>
                )}
            </>
            )}
        </div>
        </main>
    )
    }