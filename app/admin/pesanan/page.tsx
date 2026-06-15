    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import { Search, Download, Printer, Filter, Package, Truck, CheckCircle, XCircle, Clock, ShoppingBag, LayoutDashboard, ChevronRight, Bell, Settings } from "lucide-react"
    import OrderActionButton from "@/components/admin/pesanan/OrderActionButton"

    type SearchParams = { tab?: string; q?: string; page?: string; date?: string }

    const TAB_FILTERS: Record<string, string[]> = {
    semua:       [],
    baru:        ["paid"],
    diproses:    ["processing", "packing"],
    selesai:     ["delivered"],
    dibatalkan:  ["cancelled"],
    }

    export default async function AdminPesananPage({ searchParams }: { searchParams: SearchParams }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login?mode=seller")

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!["admin", "super_admin"].includes(profile?.role ?? "")) redirect("/dashboard")

    const tab     = searchParams.tab  ?? "semua"
    const q       = searchParams.q    ?? ""
    const page    = parseInt(searchParams.page ?? "1")
    const perPage = 8
    const from    = (page - 1) * perPage

    const [
        { count: needProcess },
        { count: inShipping },
        { count: doneToday },
        { count: cancelled },
    ] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["paid", "processing"]),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "shipped"),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "delivered")
        .gte("updated_at", new Date().toISOString().slice(0, 10)),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "cancelled"),
    ])

    const tabCounts: Record<string, number> = {}
    await Promise.all(
        Object.entries(TAB_FILTERS).map(async ([key, statuses]) => {
        let q2 = supabase.from("orders").select("*", { count: "exact", head: true })
        if (statuses.length) q2 = q2.in("status", statuses)
        const { count } = await q2
        tabCounts[key] = count ?? 0
        })
    )

    let query = supabase
        .from("orders")
        .select(`
        id, order_number, status, total_amount, payment_status,
        shipping_name, created_at,
        order_items(product_name, product_image, qty, sku:product_id)
        `, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, from + perPage - 1)

    const tabStatuses = TAB_FILTERS[tab] ?? []
    if (tabStatuses.length) query = query.in("status", tabStatuses)
    if (q) query = query.or(`order_number.ilike.%${q}%,shipping_name.ilike.%${q}%`)

    const { data: orders, count } = await query
    const totalPages = Math.ceil((count ?? 0) / perPage)

    const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
        paid:       { label: "Pesanan Baru",  dot: "bg-blue-500",    badge: "bg-blue-50 text-blue-600 border-blue-100" },
        processing: { label: "Diproses",      dot: "bg-purple-500",  badge: "bg-purple-50 text-purple-600 border-purple-100" },
        packing:    { label: "Dikemas",       dot: "bg-indigo-500",  badge: "bg-indigo-50 text-indigo-600 border-indigo-100" },
        shipped:    { label: "Dikirim",       dot: "bg-cyan-500",    badge: "bg-cyan-50 text-cyan-600 border-cyan-100" },
        delivered:  { label: "Selesai",       dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-600 border-emerald-100" },
        cancelled:  { label: "Dibatalkan",    dot: "bg-red-500",     badge: "bg-red-50 text-red-500 border-red-100" },
        pending:    { label: "Pending",       dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-600 border-amber-100" },
    }

    const TABS = [
        { key: "semua",      label: "Semua Pesanan" },
        { key: "baru",       label: "Baru" },
        { key: "diproses",   label: "Diproses" },
        { key: "selesai",    label: "Selesai" },
        { key: "dibatalkan", label: "Dibatalkan" },
    ]

    function buildUrl(overrides: Record<string, string>) {
        const params: Record<string, string> = { tab, page: "1" }
        if (q) params.q = q
        Object.assign(params, overrides)
        return `/admin/pesanan?${new URLSearchParams(params)}`
    }

    const summaryCards = [
        { icon: Clock,       label: "Perlu Diproses",   value: needProcess ?? 0, color: "text-amber-600",   bg: "bg-amber-50",   iconColor: "text-amber-500"   },
        { icon: Truck,       label: "Dalam Pengiriman", value: inShipping  ?? 0, color: "text-cyan-600",    bg: "bg-cyan-50",    iconColor: "text-cyan-500"    },
        { icon: CheckCircle, label: "Selesai Hari Ini", value: doneToday   ?? 0, color: "text-emerald-600", bg: "bg-emerald-50", iconColor: "text-emerald-500" },
        { icon: XCircle,     label: "Dibatalkan",       value: cancelled   ?? 0, color: "text-red-500",     bg: "bg-red-50",     iconColor: "text-red-400"     },
    ]

    return (
        <main className="min-h-screen bg-[#F5F5F5] pb-20">

        {/* ── Topbar ── */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                <LayoutDashboard size={13} />
                <Link href="/admin/dashboard" className="hover:text-gray-600 transition-colors">Dashboard</Link>
                <ChevronRight size={13} />
                <span className="text-gray-700 font-semibold">Pesanan Masuk</span>
                </div>
                <div className="flex items-center gap-2">
                <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                    <Bell size={16} />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-400 rounded-full" />
                </button>
                <Link href="/admin/pengaturan" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                    <Settings size={16} />
                </Link>
                <Link href="/bantuan" className="px-4 py-2 bg-[#6EB8BB] text-white text-xs font-bold rounded-xl hover:bg-[#5AA4A7] active:scale-95 transition-all">
                    Bantuan
                </Link>
                </div>
            </div>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-5">

            {/* ── Header ── */}
            <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-semibold text-[#6EB8BB] uppercase tracking-widest mb-1">Manajemen Toko</p>
                <h1 className="text-2xl font-bold text-gray-900">Pesanan Masuk</h1>
            </div>
            <div className="flex gap-2">
                <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                <Download size={14} /> Export
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6EB8BB] hover:bg-[#5AA4A7] active:scale-95 text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-[#6EB8BB]/30">
                <Printer size={14} /> Cetak Label
                </button>
            </div>
            </div>

            {/* ── Summary cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {summaryCards.map(({ icon: Icon, label, value, color, bg, iconColor }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon size={18} className={iconColor} />
                </div>
                <div>
                    <p className="text-xs text-gray-400 font-medium leading-tight">{label}</p>
                    <p className={`text-2xl font-black ${color} leading-tight`}>{value}</p>
                </div>
                </div>
            ))}
            </div>

            {/* ── Main table card ── */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

            {/* Tabs */}
            <div className="flex items-center gap-0 px-2 pt-3 border-b border-gray-100 overflow-x-auto scrollbar-none">
                {TABS.map((t) => (
                <Link
                    key={t.key}
                    href={buildUrl({ tab: t.key })}
                    className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                    tab === t.key
                        ? "text-[#6EB8BB] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#6EB8BB] after:rounded-t-full"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                    {t.label}
                    {tabCounts[t.key] > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        tab === t.key ? "bg-[#E6F7F8] text-[#6EB8BB]" : "bg-gray-100 text-gray-400"
                    }`}>
                        {tabCounts[t.key]}
                    </span>
                    )}
                </Link>
                ))}
            </div>

            {/* Search + filter bar */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <form method="GET" className="flex gap-2 flex-wrap sm:flex-nowrap">
                <input type="hidden" name="tab" value={tab} />
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                    name="q"
                    defaultValue={q}
                    placeholder="Cari ID pesanan atau nama pembeli…"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] bg-white placeholder:text-gray-400"
                    />
                </div>
                <input
                    type="date"
                    name="date"
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] text-gray-500 bg-white"
                />
                <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 font-semibold hover:bg-white transition-all bg-white"
                >
                    <Filter size={13} /> Filter
                </button>
                </form>
            </div>

            {/* Table header */}
            <div className="hidden lg:grid grid-cols-[140px_100px_140px_1fr_120px_120px_110px] items-center px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <span>No. Pesanan</span>
                <span>Tanggal</span>
                <span>Pembeli</span>
                <span>Produk</span>
                <span>Total</span>
                <span>Status</span>
                <span className="text-right">Aksi</span>
            </div>

            {/* Rows */}
            {!orders || orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <ShoppingBag size={28} className="text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500">Tidak ada pesanan ditemukan</p>
                <p className="text-xs text-gray-400 mt-1">
                    {q ? `Tidak ada hasil untuk "${q}"` : "Pesanan baru akan muncul di sini"}
                </p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                {orders.map((order: any) => {
                    const item = order.order_items?.[0]
                    const cfg  = STATUS_CONFIG[order.status] ?? { label: order.status, dot: "bg-gray-400", badge: "bg-gray-100 text-gray-600 border-gray-100" }
                    const moreItems = (order.order_items?.length ?? 1) - 1

                    return (
                    <div
                        key={order.id}
                        className="grid grid-cols-1 lg:grid-cols-[140px_100px_140px_1fr_120px_120px_110px] items-center px-5 py-4 hover:bg-gray-50/70 transition-colors gap-2 lg:gap-0"
                    >
                        <div>
                        <p className="text-xs text-gray-400 font-medium lg:hidden">No. Pesanan</p>
                        <p className="text-sm font-bold text-gray-900 font-mono">{order.order_number}</p>
                        </div>

                        <div>
                        <p className="text-xs text-gray-400 font-medium lg:hidden">Tanggal</p>
                        <p className="text-xs text-gray-500 leading-tight">
                            {new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </p>
                        <p className="text-[10px] text-gray-400">
                            {new Date(order.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        </div>

                        <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#E6F7F8] flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-[#6EB8BB]">
                                {order.shipping_name?.charAt(0)?.toUpperCase() ?? "?"}
                            </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-800 truncate">{order.shipping_name}</p>
                        </div>
                        </div>

                        <div className="min-w-0 pr-2">
                        {item ? (
                            <div className="flex items-center gap-2">
                            {item.product_image ? (
                                <img src={item.product_image} alt={item.product_name} className="w-8 h-8 rounded-lg object-cover border border-gray-100 shrink-0" />
                            ) : (
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                <Package size={12} className="text-gray-400" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="text-sm text-gray-700 truncate font-medium">{item.product_name}</p>
                                <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-gray-400">x{item.qty}</span>
                                {moreItems > 0 && (
                                    <span className="text-[10px] text-[#6EB8BB] font-semibold bg-[#E6F7F8] px-1.5 py-0.5 rounded-full">
                                    +{moreItems} item
                                    </span>
                                )}
                                </div>
                            </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">—</p>
                        )}
                        </div>

                        <div>
                        <p className="text-xs text-gray-400 lg:hidden">Total</p>
                        <p className="text-sm font-black text-gray-900">Rp {order.total_amount.toLocaleString("id-ID")}</p>
                        </div>

                        <div>
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                        </span>
                        </div>

                        <div className="flex justify-start lg:justify-end">
                        <OrderActionButton orderId={order.id} status={order.status} />
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
                <span className="font-semibold text-gray-600">{Math.min(perPage, orders?.length ?? 0)}</span>{" "}
                dari{" "}
                <span className="font-semibold text-gray-600">{count ?? 0}</span>{" "}
                pesanan
                </p>
                {totalPages > 1 && (
                <div className="flex items-center gap-1">
                    {page > 1 && (
                    <Link href={buildUrl({ page: String(page - 1) })}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-white hover:border-gray-300 transition-all">‹</Link>
                    )}
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((pg) => (
                    <Link key={pg} href={buildUrl({ page: String(pg) })}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                        pg === page ? "bg-[#6EB8BB] text-white shadow-sm" : "border border-gray-200 text-gray-500 hover:bg-white hover:border-gray-300"
                        }`}>
                        {pg}
                    </Link>
                    ))}
                    {totalPages > 5 && <span className="text-gray-400 text-sm px-1">…</span>}
                    {totalPages > 5 && (
                    <Link href={buildUrl({ page: String(totalPages) })}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-white hover:border-gray-300 transition-all">
                        {totalPages}
                    </Link>
                    )}
                    {page < totalPages && (
                    <Link href={buildUrl({ page: String(page + 1) })}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-white hover:border-gray-300 transition-all">›</Link>
                    )}
                </div>
                )}
            </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-100 bg-white rounded-2xl mt-2">
            <div className="px-6 py-5 flex items-center justify-between">
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
        </div>
        </main>
    )
    }