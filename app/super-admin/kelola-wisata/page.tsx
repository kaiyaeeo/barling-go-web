    import { createClient } from "@/lib/supabase/server"
    import Link from "next/link"
    import { Plus, Search, Star, TrendingUp, Map, Eye, ChevronDown, LayoutDashboard, Settings, ChevronRight } from "lucide-react"
    import ContentPublishToggle from "@/components/super-admin/ContentPublishToggle"
    import ContentDeleteButton from "@/components/super-admin/ContentDeleteButton"

    type SearchParams = Promise<{ [key: string]: string | undefined }>

    const KABUPATEN_OPTS = ["Semua Kabupaten", "Banjarnegara", "Purbalingga", "Banyumas", "Cilacap", "Kebumen"]

    export default async function KelolaWisataPage({ searchParams }: { searchParams: SearchParams }) {
    const supabase = await createClient()

    const params    = await searchParams
    const q         = params.q         ?? ""
    const kabupaten = params.kabupaten ?? "Semua Kabupaten"
    const page      = parseInt(params.page ?? "1")
    const sort      = params.sort ?? "terbaru"

    const perPage = 8
    const from    = (page - 1) * perPage

    // Summary stats
    const [
        { count: totalDest },
        { count: publishedCount },
        { count: draftCount },
        { data: ratingData },
    ] = await Promise.all([
        supabase.from("contents").select("*", { count: "exact", head: true }).eq("type", "destinasi"),
        supabase.from("contents").select("*", { count: "exact", head: true }).eq("type", "destinasi").eq("is_published", true),
        supabase.from("contents").select("*", { count: "exact", head: true }).eq("type", "destinasi").eq("is_published", false),
        supabase.from("contents").select("rating").eq("type", "destinasi").eq("is_published", true),
    ])

    const avgRating = ratingData?.length
        ? (ratingData.reduce((s, r) => s + (r.rating ?? 0), 0) / ratingData.length).toFixed(1)
        : "0"

    // Main query
    const SORT_MAP: Record<string, { col: string; asc: boolean }> = {
        terbaru:       { col: "created_at",   asc: false },
        terlama:       { col: "created_at",   asc: true  },
        rating_tinggi: { col: "rating",       asc: false },
        rating_rendah: { col: "rating",       asc: true  },
        ulasan:        { col: "review_count", asc: false },
    }
    const { col: sortCol, asc: sortAsc } = SORT_MAP[sort] ?? SORT_MAP["terbaru"]

    let query = supabase
        .from("contents")
        .select("id,title,slug,cover_image,kabupaten,rating,review_count,is_published,tags,ticket_price_min,ticket_price_max,created_at", { count: "exact" })
        .eq("type", "destinasi")
        .order(sortCol, { ascending: sortAsc })
        .range(from, from + perPage - 1)

    if (q)                               query = query.ilike("title", `%${q}%`)
    if (kabupaten !== "Semua Kabupaten") query = query.eq("kabupaten", kabupaten)

    const { data: destinations, count } = await query
    const totalPages = Math.ceil((count ?? 0) / perPage)

    const PLACEHOLDER = "https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=200&q=60"

    function buildUrl(overrides: Record<string, string>) {
        const urlParams: Record<string, string> = { kabupaten, sort, page: "1" }
        if (q) urlParams.q = q
        Object.assign(urlParams, overrides)
        return `/super-admin/kelola-wisata?${new URLSearchParams(urlParams)}`
    }

    return (
        <main className="min-h-screen bg-gray-50/60">

        {/* ===== TOP NAV (BARU, SERAGAM DENGAN LAPORAN PLATFORM) ===== */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                <LayoutDashboard size={13} />
                <Link href="/super-admin/dashboard" className="hover:text-gray-600 transition-colors">Dashboard</Link>
                <ChevronRight size={13} />
                <span className="text-gray-700 font-semibold">Kelola Wisata</span>
                </div>
                <div className="flex items-center gap-2">
                <Link href="/super-admin/pengaturan" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                    <Settings size={17} />
                </Link>
                <div className="h-5 w-px bg-gray-200 mx-1" />
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6EB8BB] to-[#9FCCCE] flex items-center justify-center text-white text-xs font-black shadow-sm">S</div>
                </div>
            </div>
            </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6 pb-12">

            {/* ===== PAGE HEADER ===== */}
            <div className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Manajemen Destinasi Wisata</h1>
                <p className="text-sm text-gray-400 mt-0.5">Kelola dan pantau seluruh aset wisata di wilayah Barling-GO.</p>
            </div>
            <Link
                href="/super-admin/kelola-wisata/tambah"
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
            >
                <Plus size={16} /> Tambah Destinasi
            </Link>
            </div>

            {/* ===== KPI CARDS ===== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <Map size={20} className="text-[#6EB8BB]" />
                </div>
                <div>
                <p className="text-xs text-gray-400 mb-0.5">Total Destinasi</p>
                <p className="text-2xl font-black text-gray-900">{totalDest ?? 0}</p>
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <Star size={20} className="text-amber-500" />
                </div>
                <div>
                <p className="text-xs text-gray-400 mb-0.5">Rating Rata-rata</p>
                <p className="text-2xl font-black text-gray-900 flex items-end gap-1">{avgRating} <span className="text-sm text-amber-400 font-semibold pb-0.5">/ 5</span></p>
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Eye size={20} className="text-blue-500" />
                </div>
                <div>
                <p className="text-xs text-gray-400 mb-0.5">Dipublikasikan</p>
                <p className="text-2xl font-black text-gray-900">{publishedCount ?? 0} <span className="text-sm font-medium text-gray-400">/{totalDest ?? 0}</span></p>
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                <TrendingUp size={20} className="text-purple-500" />
                </div>
                <div>
                <p className="text-xs text-gray-400 mb-0.5">Pertumbuhan</p>
                <p className="text-2xl font-black text-green-600">+12.4%</p>
                </div>
            </div>
            </div>

            {/* ===== FILTER + TABLE SECTION ===== */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Filter toolbar */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
                <form method="GET" className="flex items-center gap-3 flex-wrap flex-1">
                
                {/* Kolom Pencarian (Dipindah ke sini) */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                    name="q" defaultValue={q}
                    placeholder="Cari destinasi wisata..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all font-medium text-gray-700"
                    />
                </div>

                {/* Kabupaten */}
                <div className="relative">
                    <select
                    name="kabupaten" defaultValue={kabupaten}
                    className="pl-4 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] cursor-pointer appearance-none transition-all font-medium text-gray-700"
                    >
                    {KABUPATEN_OPTS.map((k) => <option key={k} value={k}>{k}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Sort */}
                <div className="relative">
                    <Star size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
                    <select
                    name="sort" defaultValue={sort}
                    className="pl-8 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] cursor-pointer appearance-none transition-all font-medium text-gray-700"
                    >
                    <option value="terbaru">Terbaru</option>
                    <option value="terlama">Terlama</option>
                    <option value="rating_tinggi">Rating Tertinggi</option>
                    <option value="rating_rendah">Rating Terendah</option>
                    <option value="ulasan">Ulasan Terbanyak</option>
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white text-sm font-semibold rounded-xl transition-all"
                >
                    Terapkan
                </button>
                </form>

                {/* Active filter chips */}
                {(kabupaten !== "Semua Kabupaten" || q || sort !== "terbaru") && (
                <div className="flex items-center gap-2 flex-wrap w-full mt-2">
                    {q && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-semibold">
                        Pencarian: "{q}"
                        <Link href={buildUrl({ q: "" })} className="hover:text-blue-900">✕</Link>
                    </span>
                    )}
                    {kabupaten !== "Semua Kabupaten" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full text-xs font-semibold">
                        {kabupaten}
                        <Link href={buildUrl({ kabupaten: "Semua Kabupaten" })} className="hover:text-green-900">✕</Link>
                    </span>
                    )}
                    {sort !== "terbaru" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-semibold">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        {{ rating_tinggi: "Rating Tertinggi", rating_rendah: "Rating Terendah", ulasan: "Ulasan Terbanyak", terlama: "Terlama" }[sort] ?? sort}
                        <Link href={buildUrl({ sort: "terbaru" })} className="hover:text-amber-900">✕</Link>
                    </span>
                    )}
                </div>
                )}
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[72px_1fr_140px_110px_90px_110px_80px] items-center px-6 py-3 bg-gray-50/80 border-b border-gray-100">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Foto</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nama Destinasi</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Kabupaten</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Harga Tiket</span>
                <Link
                href={buildUrl({ sort: sort === "rating_tinggi" ? "rating_rendah" : "rating_tinggi" })}
                className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors hover:text-[#6EB8BB] group/rh"
                >
                <span className={sort.startsWith("rating") ? "text-[#6EB8BB]" : "text-gray-400 group-hover/rh:text-[#6EB8BB]"}>Rating</span>
                <span className="text-gray-300 group-hover/rh:text-[#6EB8BB]">
                    {sort === "rating_tinggi" ? "↓" : sort === "rating_rendah" ? "↑" : "↕"}
                </span>
                </Link>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</span>
            </div>

            {/* Table body */}
            {!destinations || destinations.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                <Map size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">Tidak ada destinasi ditemukan.</p>
                <p className="text-xs text-gray-300 mt-1">Coba ubah filter atau tambah destinasi baru.</p>
                <Link
                    href="/super-admin/kelola-wisata/tambah"
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#6EB8BB] text-white text-sm font-semibold rounded-xl hover:bg-[#5AA4A7] transition-all"
                >
                    <Plus size={15} /> Tambah Destinasi
                </Link>
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                {destinations.map((dest: any, i: number) => {
                    const img = dest.cover_image
                    ? dest.cover_image.startsWith("http") ? dest.cover_image
                        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content-images/${dest.cover_image}`
                    : PLACEHOLDER

                    const idStr = `WST-${String(dest.id).slice(0, 8).toUpperCase()}`
                    
                    const price = dest.ticket_price_min
                    ? `Rp ${Number(dest.ticket_price_min).toLocaleString("id-ID")}`
                    : null

                    return (
                    <div
                        key={dest.id}
                        className="grid grid-cols-[72px_1fr_140px_110px_90px_110px_80px] items-center px-6 py-4 hover:bg-gray-50/60 transition-colors group"
                    >
                        {/* Foto */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 ring-1 ring-gray-200">
                        <img src={img} alt={dest.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>

                        {/* Nama */}
                        <div className="min-w-0 pr-4">
                        <Link 
                            href={`/wisata/${dest.slug}`} 
                            className="text-sm font-bold text-gray-800 truncate hover:text-[#6EB8BB] hover:underline transition-colors flex items-center gap-1 cursor-pointer"
                            title="Buka halaman publik di tab baru"
                        >
                            {dest.title} <span className="text-[10px] text-gray-400 font-normal">↗</span>
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-gray-400 font-mono">{idStr}</span>
                            {price && (
                            <span className="text-[11px] font-semibold text-[#6EB8BB]">{price}</span>
                            )}
                            {!price && (
                            <span className="text-[11px] text-gray-300 italic">Harga belum diatur</span>
                            )}
                        </div>
                        {dest.review_count > 0 && (
                            <p className="text-[11px] text-gray-400 mt-0.5">{dest.review_count} ulasan</p>
                        )}
                        </div>

                        {/* Kabupaten */}
                        <p className="text-sm text-gray-600 font-medium">{dest.kabupaten ?? "—"}</p>

                        {/* Harga Tiket */}
                        <div>
                        {price ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-50 border border-green-100 text-[12px] font-bold text-[#6EB8BB]">
                            {price}
                            </span>
                        ) : (
                            <span className="text-xs text-gray-300 italic">—</span>
                        )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5">
                        <Star size={13} className="fill-amber-400 text-amber-400 shrink-0" />
                        <span className="text-sm font-bold text-gray-800">
                            {dest.rating ? Number(dest.rating).toFixed(1) : "—"}
                        </span>
                        </div>

                        {/* Status + Toggle */}
                        <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                            dest.is_published
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dest.is_published ? "bg-green-500" : "bg-gray-400"}`} />
                            {dest.is_published ? "Publik" : "Draft"}
                        </span>
                        <ContentPublishToggle contentId={dest.id} isPublished={dest.is_published} />
                        </div>

                        {/* Aksi */}
                        <div className="flex items-center justify-end gap-1">
                        <Link
                            href={`/super-admin/kelola-wisata/${dest.id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-[#6EB8BB] hover:bg-green-50 rounded-lg transition-all"
                            title="Edit"
                        >
                            ✏️
                        </Link>
                        <ContentDeleteButton contentId={dest.id} />
                        </div>
                    </div>
                    )
                })}
                </div>
            )}

            {/* Table footer / pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <p className="text-sm text-gray-400">
                Menampilkan <span className="font-semibold text-gray-700">{Math.min(from + 1, count ?? 0)}–{Math.min(from + perPage, count ?? 0)}</span> dari <span className="font-semibold text-gray-700">{count ?? 0}</span> destinasi
                </p>
                {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                    {page > 1 && (
                    <Link href={buildUrl({ page: String(page - 1) })} className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition-all">‹</Link>
                    )}
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((pg) => (
                    <Link
                        key={pg} href={buildUrl({ page: String(pg) })}
                        className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                        pg === page ? "bg-[#6EB8BB] text-white shadow-sm" : "border border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        {pg}
                    </Link>
                    ))}
                    {page < totalPages && (
                    <Link href={buildUrl({ page: String(page + 1) })} className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition-all">›</Link>
                    )}
                </div>
                )}
            </div>
            </div>
        </div>
        </main>
    )
    }