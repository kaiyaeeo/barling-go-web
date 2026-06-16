    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import {
    Plus, Search, Package, TrendingUp, AlertTriangle, Archive,
    LayoutDashboard, Settings, Bell, ChevronRight, Filter,
    ShoppingBag, Eye, EyeOff, ArrowUpRight
    } from "lucide-react"
    import ProductRowActions from "@/components/admin/dashboard/ProductRowActions"
    import DeleteProductButton from "@/components/admin/DeleteProductButton" // <-- Import komponen hapusnya di sini

    type SearchParams = Promise<{ q?: string; page?: string; status?: string }>

    export default async function AdminProdukPage({ searchParams }: { searchParams: SearchParams }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login?mode=seller")

    const { data: profile } = await supabase
        .from("profiles")
        .select("role, umkm_name, full_name, umkm_logo")
        .eq("id", user.id).single()
    if (!["admin", "super_admin"].includes(profile?.role ?? "")) redirect("/dashboard")

    const params  = await searchParams
    const q       = params.q      ?? ""
    const status  = params.status ?? "all"
    const page    = parseInt(params.page ?? "1")
    const perPage = 8
    const from    = (page - 1) * perPage

    // Summary stats
    const [
        { count: totalCount },
        { count: activeCount },
        { count: inactiveCount },
        { count: lowStockCount },
        { count: outOfStockCount },
    ] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }).eq("seller_id", user.id),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("seller_id", user.id).eq("is_active", true),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("seller_id", user.id).eq("is_active", false),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("seller_id", user.id).lte("stock", 5).gt("stock", 0),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("seller_id", user.id).eq("stock", 0),
    ])

    let query = supabase
        .from("products")
        .select("id,name,slug,price,stock,images,is_active,sku,categories(name)", { count: "exact" })
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, from + perPage - 1)

    if (q)                   query = query.ilike("name", `%${q}%`)
    if (status === "active")   query = query.eq("is_active", true)
    if (status === "inactive") query = query.eq("is_active", false)
    if (status === "low")      query = query.lte("stock", 5).gt("stock", 0)
    if (status === "empty")    query = query.eq("stock", 0)

    const { data: products, count } = await query
    const totalPages = Math.ceil((count ?? 0) / perPage)

    const PLACEHOLDER = "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=80&q=60"

    const shopName = profile?.umkm_name ?? profile?.full_name ?? "Toko"
    const logoUrl  = profile?.umkm_logo
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.umkm_logo}`
        : null

    const tabs = [
        { key: "all",      label: "Semua",        count: totalCount    ?? 0, dot: ""                  },
        { key: "active",   label: "Aktif",        count: activeCount   ?? 0, dot: "bg-emerald-400"    },
        { key: "inactive", label: "Nonaktif",     count: inactiveCount   ?? 0, dot: "bg-gray-400"       },
        { key: "low",      label: "Stok Menipis", count: lowStockCount   ?? 0, dot: "bg-amber-400"      },
        { key: "empty",    label: "Stok Habis",   count: outOfStockCount ?? 0, dot: "bg-red-400"        },
    ]

    function buildHref(overrides: Record<string, string>) {
        const p: Record<string, string> = { status, page: "1" }
        if (q) p.q = q
        Object.assign(p, overrides)
        return `/admin/produk?${new URLSearchParams(p)}`
    }

    const kpiCards = [
        { label: "Total Produk",   value: totalCount      ?? 0, icon: Package,       color: "text-[#6EB8BB]",   bg: "bg-[#E6F7F8]",  border: "border-[#6EB8BB]/20", status: "all"      },
        { label: "Produk Aktif",   value: activeCount     ?? 0, icon: Eye,           color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100",  status: "active"   },
        { label: "Stok Menipis",   value: lowStockCount   ?? 0, icon: AlertTriangle, color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100",    status: "low"      },
        { label: "Stok Habis",     value: outOfStockCount ?? 0, icon: Archive,       color: "text-red-500",     bg: "bg-red-50",     border: "border-red-100",      status: "empty"    },
    ]

    return (
        <main className="min-h-screen bg-gray-50/60 pb-20">

        {/* ===== TOP NAV ===== */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                <LayoutDashboard size={13} />
                <Link href="/admin/dashboard" className="hover:text-gray-600 transition-colors">Dashboard</Link>
                <ChevronRight size={13} />
                <span className="text-gray-700 font-semibold">Produk Saya</span>
                </div>
                <div className="flex items-center gap-2">
                <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                    <Bell size={17} />
                    {(lowStockCount ?? 0) > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
                </button>
                <Link href="/admin/pengaturan" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                    <Settings size={17} />
                </Link>
                <div className="h-5 w-px bg-gray-200 mx-1" />
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#6EB8BB]/20 flex items-center justify-center text-[#6EB8BB] text-xs font-black overflow-hidden">
                    {logoUrl ? <img src={logoUrl} alt={shopName} className="w-full h-full object-cover" /> : shopName[0]?.toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-gray-700 truncate max-w-[120px]">{shopName}</span>
                </div>
                </div>
            </div>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

            {/* ===== PAGE HEADER ===== */}
            <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-xs font-bold text-[#6EB8BB] uppercase tracking-widest mb-1">Manajemen Inventaris</p>
                <h1 className="text-2xl font-black text-gray-900">Produk Saya</h1>
                <p className="text-sm text-gray-400 mt-0.5">Kelola seluruh produk, stok, dan status penjualan toko Anda.</p>
            </div>
            <Link
                href="/admin/produk/tambah"
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-[#6EB8BB] hover:bg-[#5AA4A7] active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-[#6EB8BB]/30"
            >
                <Plus size={15} /> Tambah Produk
            </Link>
            </div>

            {/* ===== KPI CARDS ===== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {kpiCards.map(({ label, value, icon: Icon, color, bg, border, status: s }) => (
                <Link
                key={label}
                href={buildHref({ status: s, page: "1" })}
                className={`bg-white rounded-2xl border ${
                    status === s ? `${border} ring-2 ring-[#6EB8BB]/20` : "border-gray-100"
                } p-4 flex items-center gap-3 hover:shadow-md transition-all group`}
                >
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon size={18} className={color} />
                </div>
                <div>
                    <p className="text-xs text-gray-400 font-medium leading-tight">{label}</p>
                    <p className="text-xl font-black text-gray-900 leading-tight">{value}</p>
                </div>
                {status === s && (
                    <ArrowUpRight size={14} className="text-[#6EB8BB] ml-auto shrink-0" />
                )}
                </Link>
            ))}
            </div>

            {/* ===== ALERT STOK MENIPIS ===== */}
            {(lowStockCount ?? 0) > 0 && status !== "low" && status !== "empty" && (
            <div className="flex items-center gap-3 px-5 py-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
                <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                <p className="text-sm font-semibold text-amber-800 flex-1">
                {lowStockCount} produk stok menipis dan {outOfStockCount} produk stok habis — perlu segera diperbarui.
                </p>
                <Link
                href={buildHref({ status: "low" })}
                className="text-xs font-bold text-amber-700 border border-amber-300 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-all shrink-0"
                >
                Lihat Sekarang
                </Link>
            </div>
            )}

            {/* ===== TABLE CARD ===== */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Tab + Search toolbar */}
            <div className="border-b border-gray-100">
                <div className="flex items-center px-4 pt-3 gap-0 overflow-x-auto scrollbar-hide -mb-px">
                {tabs.map((t) => (
                    <Link
                    key={t.key}
                    href={buildHref({ status: t.key, page: "1" })}
                    className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                        status === t.key
                        ? "text-[#6EB8BB] border-[#6EB8BB]"
                        : "text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-200"
                    }`}
                    >
                    {t.dot && <span className={`w-1.5 h-1.5 rounded-full ${t.dot} shrink-0`} />}
                    {t.label}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5 ${
                        status === t.key ? "bg-[#E6F7F8] text-[#6EB8BB]" : "bg-gray-100 text-gray-400"
                    }`}>
                        {t.count}
                    </span>
                    </Link>
                ))}
                </div>

                <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
                <form method="GET" className="flex-1 min-w-0 max-w-sm">
                    <input type="hidden" name="status" value={status} />
                    <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        name="q"
                        defaultValue={q}
                        placeholder="Cari nama produk atau SKU…"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] bg-gray-50/80 placeholder:text-gray-400 transition-all"
                    />
                    </div>
                </form>
                <div className="flex items-center gap-2 shrink-0">
                    <button className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                    <Filter size={13} /> Filter
                    </button>
                    {q && (
                    <Link
                        href={buildHref({ q: "", page: "1" })}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all"
                    >
                        Hapus Pencarian ✕
                    </Link>
                    )}
                </div>
                <div className="ml-auto shrink-0">
                    <p className="text-xs text-gray-400">
                    <span className="font-semibold text-gray-600">{count ?? 0}</span> produk ditemukan
                    </p>
                </div>
                </div>
            </div>

            {/* Table header */}
            <div className="hidden md:grid grid-cols-[56px_1fr_140px_80px_140px_96px] items-center px-5 py-3 bg-gray-50/80 border-b border-gray-100">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Foto</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Produk</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Harga</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Stok</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</span>
            </div>

            {/* Rows */}
            {!products || products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <Package size={28} className="text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500">
                    {q ? `Tidak ada hasil untuk "${q}"` : status !== "all" ? `Tidak ada produk dengan status ini` : "Belum ada produk"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    {!q && status === "all" ? "Mulai tambah produk pertama Anda" : "Coba ubah filter atau kata kunci pencarian"}
                </p>
                {!q && status === "all" && (
                    <Link
                    href="/admin/produk/tambah"
                    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#6EB8BB] text-white text-sm font-bold rounded-xl hover:bg-[#5AA4A7] transition-all"
                    >
                    <Plus size={15} /> Tambah Produk Pertama
                    </Link>
                )}
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                {products.map((p: any) => {
                    const img = p.images?.[0]
                    ? p.images[0].startsWith("http") ? p.images[0]
                        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${p.images[0]}`
                    : PLACEHOLDER

                    const stockCfg =
                    p.stock === 0   ? { label: "Habis",   cls: "bg-red-50 text-red-500 border-red-100",      bar: "bg-red-400"    } :
                    p.stock <= 5    ? { label: "Menipis",  cls: "bg-amber-50 text-amber-600 border-amber-100", bar: "bg-amber-400"  } :
                                        { label: "Tersedia", cls: "bg-emerald-50 text-emerald-600 border-emerald-100", bar: "bg-emerald-400" }

                    return (
                    <div
                        key={p.id}
                        className={`group transition-colors ${p.is_active ? "hover:bg-gray-50/50" : "bg-gray-50/30 hover:bg-gray-50/60"}`}
                    >
                        {/* DESKTOP row */}
                        <div className="hidden md:grid grid-cols-[56px_1fr_140px_80px_140px_96px] items-center px-5 py-4">

                        <div className={`w-11 h-11 rounded-xl overflow-hidden bg-gray-100 shrink-0 ring-1 ${p.is_active ? "ring-gray-200" : "ring-gray-100 opacity-60"}`}>
                            <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>

                        <div className="min-w-0 pr-4">
                            <p className={`text-sm font-bold truncate group-hover:text-[#6EB8BB] transition-colors ${p.is_active ? "text-gray-800" : "text-gray-400 line-through"}`}>
                            {p.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
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

                        <p className={`text-sm font-bold ${p.is_active ? "text-gray-800" : "text-gray-400"}`}>
                            Rp {p.price.toLocaleString("id-ID")}
                        </p>

                        <div>
                            <p className={`text-sm font-black ${
                            p.stock === 0 ? "text-red-500" : p.stock <= 5 ? "text-amber-600" : p.is_active ? "text-gray-800" : "text-gray-400"
                            }`}>
                            {p.stock}
                            </p>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border inline-block mt-0.5 ${stockCfg.cls}`}>
                            {stockCfg.label}
                            </span>
                        </div>

                        <ProductRowActions productId={p.id} isActive={p.is_active} />

                        <div className="flex items-center justify-end gap-1">
                            <Link
                            href={`/admin/produk/${p.id}/edit`}
                            title="Edit"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6EB8BB] hover:bg-[#E6F7F8] transition-colors text-base"
                            >
                            ✏️
                            </Link>
                            
                            {/* Pemasangan Komponen DeleteProductButton di Desktop */}
                            <DeleteProductButton id={p.id} name={p.name} />
                        </div>
                        </div>

                        {/* MOBILE card */}
                        <div className="md:hidden flex items-start gap-3 p-4">
                        <div className={`w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 ring-1 ${p.is_active ? "ring-gray-200" : "ring-gray-100 opacity-60"}`}>
                            <img src={img} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${p.is_active ? "text-gray-800" : "text-gray-400 line-through"}`}>{p.name}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {p.sku && <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{p.sku}</span>}
                            {p.categories?.name && <span className="text-[10px] text-[#6EB8BB] font-semibold bg-[#E6F7F8] px-1.5 py-0.5 rounded-full">{p.categories.name}</span>}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                            <p className="text-sm font-bold text-gray-800">Rp {p.price.toLocaleString("id-ID")}</p>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${stockCfg.cls}`}>
                                Stok: {p.stock} · {stockCfg.label}
                            </span>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                            <ProductRowActions productId={p.id} isActive={p.is_active} />
                            <Link href={`/admin/produk/${p.id}/edit`} className="text-xs font-semibold text-[#6EB8BB] border border-[#6EB8BB]/30 px-3 py-1 rounded-lg hover:bg-[#E6F7F8] transition-all">
                                Edit
                            </Link>
                            
                            {/* Pemasangan Komponen DeleteProductButton di Mobile */}
                            <DeleteProductButton id={p.id} name={p.name} />
                            </div>
                        </div>
                        </div>
                    </div>
                    )
                })}
                </div>
            )}

            {/* Pagination footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                <p className="text-xs text-gray-400">
                Menampilkan{" "}
                <span className="font-semibold text-gray-700">{Math.min(from + 1, count ?? 0)}–{Math.min(from + perPage, count ?? 0)}</span>{" "}
                dari <span className="font-semibold text-gray-700">{count ?? 0}</span> produk
                </p>
                {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                    {page > 1 && (
                    <Link href={buildHref({ page: String(page - 1) })} className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-white transition-all">
                        ‹
                    </Link>
                    )}
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((pg) => (
                    <Link
                        key={pg}
                        href={buildHref({ page: String(pg) })}
                        className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                        pg === page ? "bg-[#6EB8BB] text-white shadow-sm" : "border border-gray-200 text-gray-500 hover:bg-white"
                        }`}
                    >
                        {pg}
                    </Link>
                    ))}
                    {page < totalPages && (
                    <Link href={buildHref({ page: String(page + 1) })} className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-white transition-all">
                        ›
                    </Link>
                    )}
                </div>
                )}
            </div>
            </div>
        </div>
        </main>
    )
    }