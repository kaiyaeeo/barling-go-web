    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import { RevenueChart, OrdersChart } from "@/components/analytics/SalesCharts"
    import {
    TrendingUp,
    ShoppingCart,
    Package,
    BarChart2,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Download,
    LayoutDashboard,
    ChevronRight,
    Bell,
    Settings,
    } from "lucide-react"

    export default async function AdminAnalitikPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Ambil profile lengkap untuk top bar (nama toko & logo)
    const { data: profile } = await supabase
        .from("profiles")
        .select("role, umkm_name, full_name, umkm_logo")
        .eq("id", user.id)
        .single()

    if (!["admin", "super_admin"].includes(profile?.role ?? "")) redirect("/dashboard")

    // Ambil data stok untuk indikator notifikasi (sama seperti di halaman produk)
    const [{ count: lowStockCount }, { count: outOfStockCount }] = await Promise.all([
        supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .lte("stock", 5)
        .gt("stock", 0),
        supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .eq("stock", 0),
    ])

    // Data utama analitik
    const [{ data: dailySales }, { data: topProducts }] = await Promise.all([
        supabase.from("daily_sales").select("date, revenue, order_count").limit(30),
        supabase.from("top_products").select("name, total_sold, total_revenue").limit(5),
    ])

    // Derived stats
    const totalRevenue = dailySales?.reduce((s: number, d: any) => s + (d.revenue ?? 0), 0) ?? 0
    const totalOrders = dailySales?.reduce((s: number, d: any) => s + (d.order_count ?? 0), 0) ?? 0
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const totalUnitsSold = topProducts?.reduce((s: number, p: any) => s + (p.total_sold ?? 0), 0) ?? 0

    const last7 = dailySales?.slice(-7).reduce((s: number, d: any) => s + (d.revenue ?? 0), 0) ?? 0
    const prior7 = dailySales?.slice(-14, -7).reduce((s: number, d: any) => s + (d.revenue ?? 0), 0) ?? 0
    const revGrowth = prior7 > 0 ? ((last7 - prior7) / prior7) * 100 : 0

    const maxSold = topProducts ? Math.max(...topProducts.map((p: any) => p.total_sold ?? 0)) : 1
    const maxRevenue = topProducts ? Math.max(...topProducts.map((p: any) => p.total_revenue ?? 0)) : 1

    const RANK_COLORS = ["bg-amber-400", "bg-gray-300", "bg-orange-300", "bg-[#6EB8BB]", "bg-[#6EB8BB]"]

    // Data untuk top bar
    const shopName = profile?.umkm_name ?? profile?.full_name ?? "Toko"
    const logoUrl = profile?.umkm_logo
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.umkm_logo}`
        : null

    return (
        <main className="min-h-screen bg-[#F5F5F5] pb-20">
        {/* ===== TOP NAV (sama persis dengan di halaman produk) ===== */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                <LayoutDashboard size={13} />
                <Link href="/admin/dashboard" className="hover:text-gray-600 transition-colors">
                    Dashboard
                </Link>
                <ChevronRight size={13} />
                <span className="text-gray-700 font-semibold">Analitik</span>
                </div>
                <div className="flex items-center gap-2">
                <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                    <Bell size={17} />
                    {(lowStockCount ?? 0) > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                </button>
                <Link
                    href="/admin/pengaturan"
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                >
                    <Settings size={17} />
                </Link>
                <div className="h-5 w-px bg-gray-200 mx-1" />
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#6EB8BB]/20 flex items-center justify-center text-[#6EB8BB] text-xs font-black overflow-hidden">
                    {logoUrl ? (
                        <img src={logoUrl} alt={shopName} className="w-full h-full object-cover" />
                    ) : (
                        shopName[0]?.toUpperCase()
                    )}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-gray-700 truncate max-w-[120px]">
                    {shopName}
                    </span>
                </div>
                </div>
            </div>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-5">
            {/* ── Header ── */}
            <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
                <p className="text-xs font-semibold text-[#6EB8BB] uppercase tracking-widest mb-1">
                Laporan Toko
                </p>
                <h1 className="text-2xl font-bold text-gray-900">Analitik Penjualan</h1>
            </div>
            <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 bg-white rounded-xl text-xs font-semibold text-gray-500">
                <Calendar size={13} /> 30 Hari Terakhir
                </div>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                <Download size={13} /> Export
                </button>
            </div>
            </div>

            {/* ── KPI cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
                {
                icon: TrendingUp,
                label: "Total Omzet",
                value: `Rp ${totalRevenue.toLocaleString("id-ID")}`,
                sub:
                    revGrowth !== 0
                    ? `${revGrowth > 0 ? "+" : ""}${revGrowth.toFixed(1)}% vs minggu lalu`
                    : "vs minggu lalu",
                up: revGrowth >= 0,
                iconBg: "bg-[#E6F7F8]",
                iconColor: "text-[#6EB8BB]",
                },
                {
                icon: ShoppingCart,
                label: "Total Pesanan",
                value: totalOrders.toLocaleString("id-ID"),
                sub: "30 hari terakhir",
                up: true,
                iconBg: "bg-purple-50",
                iconColor: "text-purple-500",
                },
                {
                icon: Package,
                label: "Unit Terjual",
                value: totalUnitsSold.toLocaleString("id-ID"),
                sub: "Dari produk terlaris",
                up: true,
                iconBg: "bg-emerald-50",
                iconColor: "text-emerald-500",
                },
                {
                icon: BarChart2,
                label: "Rata-rata Nilai Order",
                value: `Rp ${Math.round(avgOrderValue).toLocaleString("id-ID")}`,
                sub: "Per transaksi",
                up: true,
                iconBg: "bg-amber-50",
                iconColor: "text-amber-500",
                },
            ].map(({ icon: Icon, label, value, sub, up, iconBg, iconColor }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
                    <Icon size={17} className={iconColor} />
                    </div>
                    {sub.includes("%") && (
                    <span
                        className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                        }`}
                    >
                        {up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {sub}
                    </span>
                    )}
                </div>
                <div>
                    <p className="text-[11px] text-gray-400 font-medium">{label}</p>
                    <p className="text-lg font-black text-gray-900 mt-0.5 leading-tight">{value}</p>
                    {!sub.includes("%") && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
                </div>
                </div>
            ))}
            </div>

            {/* ── Charts row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Revenue chart */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                    <p className="text-sm font-bold text-gray-900">Omzet 30 Hari Terakhir</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Total pendapatan harian</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6EB8BB]" />
                    <span className="text-[11px] text-gray-400 font-medium">Omzet</span>
                </div>
                </div>
                <div className="p-5">
                {dailySales?.length ? (
                    <RevenueChart data={dailySales as any} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                    <BarChart2 size={32} className="mb-2" />
                    <p className="text-sm">Belum ada data penjualan</p>
                    </div>
                )}
                </div>
            </div>

            {/* Orders chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                    <p className="text-sm font-bold text-gray-900">Pesanan Harian</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Jumlah order per hari</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    <span className="text-[11px] text-gray-400 font-medium">Order</span>
                </div>
                </div>
                <div className="p-5">
                {dailySales?.length ? (
                    <OrdersChart data={dailySales as any} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                    <ShoppingCart size={32} className="mb-2" />
                    <p className="text-sm">Belum ada data</p>
                    </div>
                )}
                </div>
            </div>
            </div>

            {/* ── Top products ── */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                <p className="text-sm font-bold text-gray-900">Produk Terlaris</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Berdasarkan total unit terjual</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-[#E6F7F8] text-[#6EB8BB] rounded-full">
                Top {topProducts?.length ?? 0}
                </span>
            </div>

            {topProducts?.length ? (
                <>
                {/* Table header */}
                <div className="grid grid-cols-[32px_1fr_120px_120px_80px] items-center px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>#</span>
                    <span>Produk</span>
                    <span className="text-right">Unit Terjual</span>
                    <span className="text-right">Total Omzet</span>
                    <span className="text-right">Kontribusi</span>
                </div>

                <div className="divide-y divide-gray-50">
                    {topProducts.map((p: any, i: number) => {
                    const pct = maxSold > 0 ? (p.total_sold / maxSold) * 100 : 0
                    const revPct = maxRevenue > 0 ? (p.total_revenue / maxRevenue) * 100 : 0
                    const totalRev = topProducts.reduce((s: number, x: any) => s + (x.total_revenue ?? 0), 0)
                    const contribution = totalRev > 0 ? ((p.total_revenue ?? 0) / totalRev) * 100 : 0

                    return (
                        <div
                        key={i}
                        className="grid grid-cols-[32px_1fr_120px_120px_80px] items-center px-5 py-4 hover:bg-gray-50/70 transition-colors"
                        >
                        <div className={`w-6 h-6 rounded-lg ${RANK_COLORS[i]} flex items-center justify-center`}>
                            <span className="text-[10px] font-black text-white">{i + 1}</span>
                        </div>

                        <div className="min-w-0 px-4">
                            <p className="text-sm font-semibold text-gray-800 truncate mb-1.5">{p.name}</p>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-full max-w-xs">
                            <div
                                className="h-full bg-[#6EB8BB] rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                            />
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                            {(p.total_sold ?? 0).toLocaleString("id-ID")}
                            </p>
                            <p className="text-[10px] text-gray-400">unit</p>
                        </div>

                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                            Rp {Math.round(p.total_revenue ?? 0).toLocaleString("id-ID")}
                            </p>
                            <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-1.5 ml-auto w-16">
                            <div
                                className="h-full bg-purple-400 rounded-full"
                                style={{ width: `${revPct}%` }}
                            />
                            </div>
                        </div>

                        <div className="text-right">
                            <span
                            className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                contribution >= 30
                                ? "bg-emerald-50 text-emerald-600"
                                : contribution >= 15
                                ? "bg-amber-50 text-amber-600"
                                : "bg-gray-100 text-gray-500"
                            }`}
                            >
                            {contribution.toFixed(1)}%
                            </span>
                        </div>
                        </div>
                    )
                    })}
                </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Package size={32} className="text-gray-300 mb-3" />
                <p className="text-sm font-semibold text-gray-500">Belum ada data produk terlaris</p>
                <p className="text-xs text-gray-400 mt-1">Data akan muncul setelah ada transaksi</p>
                </div>
            )}
            </div>
        </div>
        </main>
    )
    }