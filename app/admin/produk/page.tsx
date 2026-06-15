    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import { Plus, Search, Package, TrendingUp, AlertTriangle, Archive } from "lucide-react"
    import ProductRowActions from "@/components/admin/dashboard/ProductRowActions"

    type SearchParams = { q?: string; page?: string; status?: string }

    export default async function AdminProdukPage({ searchParams }: { searchParams: SearchParams }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login?mode=seller")

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!["admin", "super_admin"].includes(profile?.role ?? "")) redirect("/dashboard")

    const q       = searchParams.q ?? ""
    const status  = searchParams.status ?? "all"
    const page    = parseInt(searchParams.page ?? "1")
    const perPage = 8
    const from    = (page - 1) * perPage

    // Summary stats
    const { count: totalCount }   = await supabase.from("products").select("*", { count: "exact", head: true }).eq("seller_id", user.id)
    const { count: activeCount }  = await supabase.from("products").select("*", { count: "exact", head: true }).eq("seller_id", user.id).eq("is_active", true)
    const { count: lowStockCount } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("seller_id", user.id).lte("stock", 5).gt("stock", 0)
    const { count: outOfStockCount } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("seller_id", user.id).eq("stock", 0)

    let query = supabase
        .from("products")
        .select("id,name,slug,price,stock,images,is_active,sku,categories(name)", { count: "exact" })
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, from + perPage - 1)

    if (q) query = query.ilike("name", `%${q}%`)
    if (status === "active")   query = query.eq("is_active", true)
    if (status === "inactive") query = query.eq("is_active", false)
    if (status === "low")      query = query.lte("stock", 5).gt("stock", 0)
    if (status === "empty")    query = query.eq("stock", 0)

    const { data: products, count } = await query
    const totalPages = Math.ceil((count ?? 0) / perPage)

    const PLACEHOLDER = "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=80&q=60"

    const tabs = [
        { key: "all",      label: "Semua",        count: totalCount ?? 0 },
        { key: "active",   label: "Aktif",        count: activeCount ?? 0 },
        { key: "low",      label: "Stok Menipis", count: lowStockCount ?? 0 },
        { key: "empty",    label: "Habis",        count: outOfStockCount ?? 0 },
    ]

    return (
        <main className="min-h-screen bg-[#F5F5F5] pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

            {/* ── Page header ── */}
            <div className="flex items-center justify-between">
            <div>
                <p className="text-xs font-semibold text-[#6EB8BB] uppercase tracking-widest mb-1">Manajemen Inventaris</p>
                <h1 className="text-2xl font-bold text-gray-900">Produk Saya</h1>
            </div>
            <Link
                href="/admin/produk/tambah"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6EB8BB] hover:bg-[#5AA4A7] active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-[#6EB8BB]/30"
            >
                <Plus size={15} />
                Tambah Produk
            </Link>
            </div>

            {/* ── Summary cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
                { icon: Package,       label: "Total Produk",   value: totalCount ?? 0,       color: "text-[#6EB8BB]", bg: "bg-[#E6F7F8]" },
                { icon: TrendingUp,    label: "Produk Aktif",   value: activeCount ?? 0,      color: "text-emerald-600", bg: "bg-emerald-50" },
                { icon: AlertTriangle, label: "Stok Menipis",   value: lowStockCount ?? 0,    color: "text-amber-600",   bg: "bg-amber-50" },
                { icon: Archive,       label: "Stok Habis",     value: outOfStockCount ?? 0,  color: "text-red-500",     bg: "bg-red-50" },
            ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon size={18} className={color} />
                </div>
                <div>
                    <p className="text-xs text-gray-400 font-medium leading-tight">{label}</p>
                    <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
                </div>
                </div>
            ))}
            </div>

            {/* ── Filter & Search bar ── */}
            <div className="bg-white rounded-2xl border border-gray-100">
            {/* Tabs */}
            <div className="flex items-center gap-0 px-2 pt-3 border-b border-gray-100 overflow-x-auto scrollbar-none">
                {tabs.map((t) => (
                <Link
                    key={t.key}
                    href={`/admin/produk?status=${t.key}${q ? `&q=${q}` : ""}`}
                    className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                    status === t.key
                        ? "text-[#6EB8BB] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#6EB8BB] after:rounded-t-full"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                    {t.label}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    status === t.key ? "bg-[#E6F7F8] text-[#6EB8BB]" : "bg-gray-100 text-gray-400"
                    }`}>
                    {t.count}
                    </span>
                </Link>
                ))}
            </div>

            {/* Search */}
            <div className="px-4 py-3">
                <form method="GET">
                <input type="hidden" name="status" value={status} />
                <div className="relative max-w-sm">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                    name="q"
                    defaultValue={q}
                    placeholder="Cari nama produk atau SKU…"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] bg-gray-50 placeholder:text-gray-400"
                    />
                </div>
                </form>
            </div>

            {/* ── Table header ── */}
            <div className="grid grid-cols-[56px_1fr_140px_80px_160px_96px] items-center px-4 py-2.5 bg-gray-50 border-y border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <span>Foto</span>
                <span>Produk</span>
                <span>Harga</span>
                <span>Stok</span>
                <span>Status</span>
                <span className="text-right">Aksi</span>
            </div>

            {/* ── Rows ── */}
            {!products || products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <Package size={28} className="text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500">Belum ada produk ditemukan</p>
                <p className="text-xs text-gray-400 mt-1">
                    {q ? `Tidak ada hasil untuk "${q}"` : "Mulai tambah produk pertama Anda"}
                </p>
                {!q && (
                    <Link href="/admin/produk/tambah" className="mt-4 text-sm font-bold text-[#6EB8BB] hover:underline">
                    + Tambah Produk
                    </Link>
                )}
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                {products.map((p: any) => {
                    const img = p.images?.[0]
                    ? p.images[0].startsWith("http")
                        ? p.images[0]
                        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${p.images[0]}`
                    : PLACEHOLDER

                    const stockStatus =
                    p.stock === 0     ? { label: "Habis",     cls: "bg-red-50 text-red-500 border-red-100" } :
                    p.stock <= 5      ? { label: "Menipis",   cls: "bg-amber-50 text-amber-600 border-amber-100" } :
                                        { label: "Tersedia",  cls: "bg-emerald-50 text-emerald-600 border-emerald-100" }

                    return (
                    <div
                        key={p.id}
                        className="grid grid-cols-[56px_1fr_140px_80px_160px_96px] items-center px-4 py-3.5 hover:bg-gray-50/80 transition-colors group"
                    >
                        {/* Foto */}
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                        <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>

                        {/* Nama */}
                        <div className="min-w-0 pr-4">
                        <p className={`text-sm font-semibold truncate ${p.is_active ? "text-gray-800" : "text-gray-400"}`}>
                            {p.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                            {p.sku && (
                            <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                                {p.sku}
                            </span>
                            )}
                            {p.categories?.name && (
                            <span className="text-[10px] text-[#6EB8BB] font-semibold bg-[#E6F7F8] px-1.5 py-0.5 rounded-full">
                                {p.categories.name}
                            </span>
                            )}
                        </div>
                        </div>

                        {/* Harga */}
                        <div>
                        <p className={`text-sm font-bold ${p.is_active ? "text-gray-800" : "text-gray-400"}`}>
                            Rp {p.price.toLocaleString("id-ID")}
                        </p>
                        </div>

                        {/* Stok */}
                        <div className="flex flex-col gap-1">
                        <p className={`text-sm font-bold ${
                            p.stock === 0 ? "text-red-500" : p.stock <= 5 ? "text-amber-600" : p.is_active ? "text-gray-800" : "text-gray-400"
                        }`}>
                            {p.stock}
                        </p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border inline-block w-fit ${stockStatus.cls}`}>
                            {stockStatus.label}
                        </span>
                        </div>

                        {/* Status toggle */}
                        <ProductRowActions productId={p.id} isActive={p.is_active} />

                        {/* Aksi */}
                        <div className="flex items-center justify-end gap-1">
                        <Link
                            href={`/admin/produk/${p.id}/edit`}
                            title="Edit produk"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6EB8BB] hover:bg-[#E6F7F8] transition-colors text-base"
                        >
                            ✏️
                        </Link>
                        <button
                            title="Hapus produk"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors text-base"
                        >
                            🗑️
                        </button>
                        </div>
                    </div>
                    )
                })}
                </div>
            )}

            {/* ── Pagination footer ── */}
            <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                <p className="text-xs text-gray-400">
                Menampilkan <span className="font-semibold text-gray-600">{Math.min(perPage, products?.length ?? 0)}</span> dari{" "}
                <span className="font-semibold text-gray-600">{count ?? 0}</span> produk
                </p>
                {totalPages > 1 && (
                <div className="flex items-center gap-1">
                    {page > 1 && (
                    <Link
                        href={`/admin/produk?page=${page - 1}&status=${status}${q ? `&q=${q}` : ""}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-white hover:border-gray-300 transition-all"
                    >
                        ‹
                    </Link>
                    )}
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((pg) => (
                    <Link
                        key={pg}
                        href={`/admin/produk?page=${pg}&status=${status}${q ? `&q=${q}` : ""}`}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                        pg === page
                            ? "bg-[#6EB8BB] text-white shadow-sm"
                            : "border border-gray-200 text-gray-500 hover:bg-white hover:border-gray-300"
                        }`}
                    >
                        {pg}
                    </Link>
                    ))}
                    {page < totalPages && (
                    <Link
                        href={`/admin/produk?page=${page + 1}&status=${status}${q ? `&q=${q}` : ""}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-white hover:border-gray-300 transition-all"
                    >
                        ›
                    </Link>
                    )}
                </div>
                )}
            </div>
            </div>
        </div>

        {/* ── Footer ── */}
        <footer className="border-t border-gray-100 bg-white mt-auto">
            <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
            <div>
                <p className="text-sm font-extrabold tracking-tight text-gray-800">BARLING-GO</p>
                <p className="text-xs text-gray-400 mt-0.5">© 2026 Memberdayakan UMKM Barlingmascakep.</p>
            </div>
            <div className="flex gap-5 text-xs text-gray-400">
                {["Tentang Kami", "Pusat Bantuan", "Privasi", "Syarat & Ketentuan"].map((l) => (
                <a key={l} href="#" className="hover:text-gray-600 transition-colors">{l}</a>
                ))}
            </div>
            </div>
        </footer>
        </main>
    )
    }