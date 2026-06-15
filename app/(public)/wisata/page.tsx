    import { createClient } from "@/lib/supabase/server"
    import Link from "next/link"
    import { Search, SlidersHorizontal, MapPin } from "lucide-react"
    import Navbar from "@/components/layout/navbar"
    import { SortDropdown, HeartButton } from "@/components/ui/WisataClient"

    type SearchParams = Promise<{ [key: string]: string | undefined }>

    const KABUPATEN = ["Semua", "Banjarnegara", "Purbalingga", "Banyumas", "Cilacap", "Kebumen"]
    const SORT_OPTIONS = [
    { value: "terpopuler", label: "Terpopuler" },
    { value: "terbaru",    label: "Terbaru" },
    { value: "termurah",   label: "Termurah" },
    ]

    export default async function WisataPage({ searchParams }: { searchParams: SearchParams }) {
    const supabase = await createClient()
    
    const params = await searchParams
    const q         = params.q ?? ""
    const kabupaten = params.kabupaten ?? "Semua"
    const sort      = params.sort ?? "terpopuler"
    const page      = parseInt(params.page ?? "1")
    
    const perPage   = 8
    const from      = (page - 1) * perPage
    const to        = from + perPage - 1

    let query = supabase
        .from("contents")
        .select("id, title, slug, cover_image, kabupaten, ticket_price_min, ticket_price_max, rating, review_count, is_published", { count: "exact" })
        .eq("type", "destinasi")
        .eq("is_published", true)
        .range(from, to)

    if (q)                     query = query.ilike("title", `%${q}%`)
    if (kabupaten !== "Semua")   query = query.eq("kabupaten", kabupaten)
    if (sort === "terpopuler")   query = query.order("review_count", { ascending: false })
    else if (sort === "terbaru") query = query.order("created_at",   { ascending: false })
    else if (sort === "termurah") query = query.order("ticket_price_min", { ascending: true })

    const { data: destinations, count } = await query
    const totalPages = Math.ceil((count ?? 0) / perPage)

    return (
        <>
        <Navbar />
        <main className="min-h-screen bg-white pt-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black text-gray-900">Semua Wisata Unggulan</h1>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                <SlidersHorizontal size={15} /> Filter
                </button>
            </div>

            {/* Search */}
            <form method="GET" className="mb-6">
                <div className="relative max-w-2xl mx-auto">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    name="q"
                    defaultValue={q}
                    placeholder="Cari destinasi impianmu..."
                    className="w-full pl-12 pr-5 py-3.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] bg-gray-50"
                />
                {kabupaten !== "Semua" && <input type="hidden" name="kabupaten" value={kabupaten} />}
                {sort !== "terpopuler" && <input type="hidden" name="sort" value={sort} />}
                </div>
            </form>

            {/* Filters row */}
            <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
                <div className="flex gap-2 flex-wrap">
                {KABUPATEN.map((kab) => (
                    <Link
                    key={kab}
                    // PERBAIKAN: Menggunakan penggabungan string yang aman dari error
                    href={`/wisata?kabupaten=${kab}${q ? "&q=" + q : ""}&sort=${sort}`}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                        kabupaten === kab
                        ? "bg-[#6EB8BB] text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400"
                    }`}
                    >
                    {kab}
                    </Link>
                ))}
                </div>

                <div className="relative">
                <form method="GET">
                    {q && <input type="hidden" name="q" value={q} />}
                    {kabupaten !== "Semua" && <input type="hidden" name="kabupaten" value={kabupaten} />}
                    <SortDropdown sort={sort} options={SORT_OPTIONS} />
                </form>
                </div>
            </div>

            {/* Grid */}
            {!destinations || destinations.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                <Search size={40} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm">Tidak ada destinasi ditemukan.</p>
                <Link href="/wisata" className="mt-3 inline-block text-sm text-[#6EB8BB] hover:underline">Reset filter</Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {destinations.map((dest: any) => (
                    <WisataCard key={dest.id} dest={dest} />
                ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                {page > 1 && (
                    <Link href={`/wisata?kabupaten=${kabupaten}&sort=${sort}&page=${page - 1}${q ? "&q=" + q : ""}`}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
                    ‹
                    </Link>
                )}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = i + 1
                    return (
                    <Link
                        key={p}
                        href={`/wisata?kabupaten=${kabupaten}&sort=${sort}&page=${p}${q ? "&q=" + q : ""}`}
                        className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-all ${
                        p === page
                            ? "bg-[#6EB8BB] text-white"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        {p}
                    </Link>
                    )
                })}
                {totalPages > 5 && <span className="text-gray-400 text-sm">...</span>}
                {page < totalPages && (
                    <Link href={`/wisata?kabupaten=${kabupaten}&sort=${sort}&page=${page + 1}${q ? "&q=" + q : ""}`}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
                    ›
                    </Link>
                )}
                </div>
            )}

            </div>

            {/* Footer */}
            <footer className="border-t border-gray-100 mt-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                <p className="font-black text-gray-900">BARLING-GO</p>
                <p className="text-xs text-gray-400 mt-0.5">© 2026 BARLING-GO. All Rights Reserved</p>
                </div>
                <div className="flex gap-6 text-sm text-gray-500">
                {["Tentang Kami", "Pusat Bantuan", "Privasi", "Syarat & Ketentuan"].map((l) => (
                    <a key={l} href="#" className="hover:text-gray-800 transition-colors">{l}</a>
                ))}
                </div>
            </div>
            </footer>
        </main>
        </>
    )
    }

    function WisataCard({ dest }: { dest: any }) {
    const PLACEHOLDER = "https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=400&q=70"
    const imgSrc = dest.cover_image
        ? dest.cover_image.startsWith("http")
        ? dest.cover_image
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content-images/${dest.cover_image}`
        : PLACEHOLDER

    const hasPrice = dest.ticket_price_min > 0 || dest.ticket_price_max > 0

    return (
        <div className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all border border-gray-100">
        
        {/* Tombol Love yang aman dari Link */}
        <div className="absolute top-2.5 right-2.5 z-20">
            <HeartButton />
        </div>

        <Link href={`/wisata/${dest.slug}`} className="block relative z-10">
            <div className="relative aspect-[4/3] overflow-hidden">
            <img
                src={imgSrc}
                alt={dest.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {dest.review_count >= 10 && (
                <span className="absolute top-2.5 left-2.5 text-xs font-bold text-white bg-[#FF6B35] px-2.5 py-1 rounded-full shadow-sm">
                Terlaris
                </span>
            )}
            </div>

            <div className="p-4">
            <p className="text-[10px] font-bold text-[#6EB8BB] uppercase tracking-wider mb-1">WISATA</p>
            <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-[#6EB8BB] transition-colors line-clamp-1">
                {dest.title}
            </h3>
            {dest.kabupaten && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                <MapPin size={11} className="shrink-0" /> Kab. {dest.kabupaten}
                </p>
            )}
            {hasPrice && (
                <p className="text-sm font-bold text-gray-900">
                Rp {dest.ticket_price_min.toLocaleString("id-ID")}
                {dest.ticket_price_max > dest.ticket_price_min && (
                    <span className="text-xs text-gray-500 font-medium ml-1">sd Rp {dest.ticket_price_max.toLocaleString("id-ID")}</span>
                )}
                </p>
            )}
            </div>
        </Link>
        </div>
    )
    }