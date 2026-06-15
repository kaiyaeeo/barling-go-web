    import { createClient } from "@/lib/supabase/server"
    import Link from "next/link"
    import {
    BarChart2, TrendingUp, ShoppingBag, Users, Package,
    LayoutDashboard, Settings, ChevronRight, Wallet,
    ArrowUpRight, Calendar, Activity, Receipt
    } from "lucide-react"

    // Di Next.js terbaru, searchParams adalah Promise
    type SearchParams = Promise<{ [key: string]: string | undefined }>

    export default async function LaporanPlatformPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams
    const filter = params.filter ?? "bulanan" // Default filter adalah bulanan

    const supabase = await createClient()

    const [
        { data: rawOrders },
        { count: totalUsers },
        { count: totalProducts },
        { data: dailySales },
    ] = await Promise.all([
        supabase.from("orders")
        .select("total_amount, status, payment_status, created_at")
        .not("status", "in", '("cancelled","refunded")'),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("daily_sales").select("date, revenue, order_count").limit(7),
    ])

    // Hitung KPI (All-time)
    const orders = rawOrders || []
    const totalRevenue   = orders.filter((o) => o.payment_status === "paid").reduce((s, o) => s + o.total_amount, 0)
    const totalOrders    = orders.length
    const avgOrderValue  = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const pendingOrders  = orders.filter((o) => o.payment_status !== "paid").length

    // === LOGIK PENGELOMPOKAN DATA GRAFIK (DINAMIS) ===
    // 1. Urutkan data dari yang terlama ke terbaru agar grafik selalu berurutan dari kiri ke kanan
    const sortedPaidOrders = [...orders]
        .filter((o) => o.payment_status === "paid")
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    const chartMap: Record<string, number> = {}

    sortedPaidOrders.forEach((o) => {
        const date = new Date(o.created_at)
        let key = ""

        if (filter === "tahunan") {
        // Format: 2024, 2025, 2026
        key = date.getFullYear().toString()
        } else if (filter === "triwulan") {
        // Format: Q1 '26, Q2 '26
        const quarter = Math.floor(date.getMonth() / 3) + 1
        const year = date.getFullYear().toString().slice(-2)
        key = `Q${quarter} '${year}`
        } else {
        // Format: Jan 26, Feb 26 (Bulanan default)
        key = date.toLocaleDateString("id-ID", { month: "short", year: "2-digit" })
        }

        chartMap[key] = (chartMap[key] ?? 0) + o.total_amount
    })

    // 2. Tentukan jumlah data yang ditampilkan di grafik agar tidak terlalu padat
    let chartData = Object.entries(chartMap)
    if (filter === "bulanan") chartData = chartData.slice(-6) // 6 bulan terakhir
    else if (filter === "triwulan") chartData = chartData.slice(-4) // 4 kuartal terakhir (1 tahun)
    else if (filter === "tahunan") chartData = chartData.slice(-5) // 5 tahun terakhir

    const maxRevenue = chartData.length > 0 ? Math.max(...chartData.map(([, r]) => r)) : 1

    // === TEKS UI DINAMIS ===
    const chartTitle = filter === "tahunan" ? "Omzet Per Tahun" : filter === "triwulan" ? "Omzet Per Triwulan" : "Omzet Per Bulan"
    const chartDesc = filter === "tahunan" ? "5 tahun terakhir transaksi lunas" : filter === "triwulan" ? "4 kuartal terakhir transaksi lunas" : "6 bulan terakhir transaksi lunas"

    // === DATA HARIAN (Statik sesuai tabel daily_sales) ===
    const totalDailyRevenue = (dailySales ?? []).reduce((s, d: any) => s + Number(d.revenue), 0)
    const totalDailyOrders  = (dailySales ?? []).reduce((s, d: any) => s + Number(d.order_count), 0)
    const maxDailyRevenue   = dailySales && dailySales.length > 0
        ? Math.max(...(dailySales ?? []).map((d: any) => Number(d.revenue)))
        : 1

    const kpis = [
        {
        label:  "Total Omzet",
        value:  `Rp ${(totalRevenue / 1_000_000).toFixed(1)}jt`,
        sub:    "Akumulasi transaksi lunas",
        icon:   Wallet,
        color:  "text-emerald-600",
        bg:     "bg-emerald-50",
        border: "border-emerald-100",
        trend:  "+24%",
        },
        {
        label:  "Total Transaksi",
        value:  totalOrders.toLocaleString("id-ID"),
        sub:    `${pendingOrders} belum lunas`,
        icon:   ShoppingBag,
        color:  "text-blue-600",
        bg:     "bg-blue-50",
        border: "border-blue-100",
        trend:  "+18%",
        },
        {
        label:  "Avg. Order Value",
        value:  `Rp ${Math.round(avgOrderValue / 1_000)}rb`,
        sub:    "Per transaksi selesai",
        icon:   Receipt,
        color:  "text-purple-600",
        bg:     "bg-purple-50",
        border: "border-purple-100",
        trend:  "+7%",
        },
        {
        label:  "Produk Aktif",
        value:  (totalProducts ?? 0).toLocaleString("id-ID"),
        sub:    `${(totalUsers ?? 0).toLocaleString("id-ID")} total pengguna`,
        icon:   Package,
        color:  "text-amber-600",
        bg:     "bg-amber-50",
        border: "border-amber-100",
        trend:  null,
        },
    ]

    const activeTabClass = "px-3 py-1.5 bg-white text-[#6EB8BB] font-bold rounded-lg shadow-sm"
    const inactiveTabClass = "px-3 py-1.5 text-gray-500 font-medium rounded-lg hover:bg-white transition-all cursor-pointer"

    return (
        <main className="min-h-screen bg-gray-50/60">
        {/* ===== TOP NAV ===== */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                <LayoutDashboard size={13} />
                <Link href="/super-admin/dashboard" className="hover:text-gray-600 transition-colors">Dashboard</Link>
                <ChevronRight size={13} />
                <span className="text-gray-700 font-semibold">Laporan Platform</span>
                </div>
                <div className="flex items-center gap-2">
                <Link href="/super-admin/pengaturan" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                    <Settings size={17} />
                </Link>
                <div className="h-5 w-px bg-gray-200 mx-1" />
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6EB8BB] to-[#9FCCCE] flex items-center justify-center text-white text-xs font-black">S</div>
                </div>
            </div>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-12">
            {/* ===== PAGE HEADER ===== */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Laporan Platform</h1>
                <p className="text-sm text-gray-400 mt-0.5">Ringkasan performa transaksi dan pertumbuhan platform Barling-GO.</p>
            </div>
            
            {/* FILTER DINAMIS */}
            <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-sm">
                <Link href="?filter=bulanan" scroll={false} className={filter === "bulanan" ? activeTabClass : inactiveTabClass}>Bulanan</Link>
                <Link href="?filter=triwulan" scroll={false} className={filter === "triwulan" ? activeTabClass : inactiveTabClass}>Triwulan</Link>
                <Link href="?filter=tahunan" scroll={false} className={filter === "tahunan" ? activeTabClass : inactiveTabClass}>Tahunan</Link>
                </div>
            </div>
            </div>

            {/* ===== KPI CARDS ===== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => {
                const Icon = kpi.icon
                return (
                <div key={kpi.label} className={`bg-white rounded-2xl border shadow-sm p-5 ${kpi.border}`}>
                    <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                        <Icon size={18} className={kpi.color} />
                    </div>
                    {kpi.trend && (
                        <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
                        <ArrowUpRight size={11} /> {kpi.trend}
                        </span>
                    )}
                    </div>
                    <p className="text-2xl font-black text-gray-900 leading-none">{kpi.value}</p>
                    <p className="text-sm text-gray-500 mt-1.5">{kpi.label}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{kpi.sub}</p>
                </div>
                )
            })}
            </div>

            {/* ===== DYNAMIC CHART ===== */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#6EB8BB]/10 flex items-center justify-center">
                    <BarChart2 size={15} className="text-[#6EB8BB]" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-gray-900">{chartTitle}</h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">{chartDesc}</p>
                </div>
                </div>
                <div className="text-right">
                <p className="text-sm font-black text-gray-900">Rp {(totalRevenue / 1_000_000).toFixed(1)}jt</p>
                <p className="text-[11px] text-gray-400">Total akumulasi</p>
                </div>
            </div>

            <div className="p-6">
                {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <BarChart2 size={36} className="opacity-20 mb-3" />
                    <p className="text-sm">Belum ada data transaksi untuk rentang waktu ini.</p>
                </div>
                ) : (
                <>
                    {/* Bar chart visual */}
                    <div className="flex items-end gap-3 h-36 mb-4">
                    {chartData.map(([label, revenue]) => {
                        const pct = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0
                        const isMax = revenue === maxRevenue
                        return (
                        <div key={label} className="flex-1 flex flex-col items-center gap-1.5 group">
                            <p className="text-[11px] font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            Rp {(revenue / 1_000_000).toFixed(1)}jt
                            </p>
                            <div className="w-full flex flex-col justify-end" style={{ height: "96px" }}>
                            <div
                                className={`w-full rounded-t-xl transition-all ${isMax ? "bg-[#6EB8BB]" : "bg-[#6EB8BB]/30 group-hover:bg-[#6EB8BB]/60"}`}
                                style={{ height: `${Math.max(pct, 4)}%` }}
                            />
                            </div>
                            <span className="text-[11px] text-gray-400 font-medium truncate w-full text-center">{label}</span>
                        </div>
                        )
                    })}
                    </div>

                    {/* Table below chart */}
                    <div className="border-t border-gray-100 pt-4 space-y-2.5">
                    {chartData.map(([label, revenue]) => {
                        const pct = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0
                        return (
                        <div key={label} className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-gray-500 w-16 shrink-0 truncate">{label}</span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#6EB8BB] to-[#9FCCCE] rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                            />
                            </div>
                            <span className="text-xs font-bold text-gray-700 w-20 text-right shrink-0">
                            Rp {(revenue / 1_000_000).toFixed(1)}jt
                            </span>
                        </div>
                        )
                    })}
                    </div>
                </>
                )}
            </div>
            </div>

            {/* ===== 7 HARI TERAKHIR ===== */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Calendar size={15} className="text-blue-500" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-gray-900">7 Hari Terakhir</h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">Performa harian dari tabel daily_sales</p>
                </div>
                </div>
                <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-gray-900">Rp {(totalDailyRevenue / 1_000_000).toFixed(1)}jt</p>
                <p className="text-[11px] text-gray-400">{totalDailyOrders} pesanan</p>
                </div>
            </div>

            <div className="grid grid-cols-[1fr_100px_140px_130px] items-center px-6 py-3 bg-gray-50/80 border-b border-gray-100">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tanggal</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Pesanan</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Omzet</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Proporsi</span>
            </div>

            {(!dailySales || dailySales.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                <Activity size={36} className="opacity-20 mb-3" />
                <p className="text-sm">Belum ada data penjualan harian.</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                {(dailySales ?? []).map((d: any) => {
                    const rev = Number(d.revenue)
                    const pct = maxDailyRevenue > 0 ? Math.round((rev / maxDailyRevenue) * 100) : 0
                    const isTop = rev === maxDailyRevenue
                    return (
                    <div key={d.date} className={`grid grid-cols-[1fr_100px_140px_130px] items-center px-6 py-4 transition-colors ${isTop ? "bg-emerald-50/40" : "hover:bg-gray-50/40"}`}>
                        <div className="flex items-center gap-2">
                        {isTop && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
                        <span className="text-sm font-semibold text-gray-700">
                            {new Date(d.date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
                        </span>
                        {isTop && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Tertinggi</span>}
                        </div>
                        <div className="text-right">
                        <span className="text-sm font-bold text-gray-700">{d.order_count}</span>
                        <span className="text-xs text-gray-400 ml-1">pesanan</span>
                        </div>
                        <div className="text-right">
                        <span className="text-sm font-bold text-[#6EB8BB]">Rp {rev.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                        <div className="flex-1 max-w-[60px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                            className={`h-full rounded-full ${isTop ? "bg-emerald-400" : "bg-[#6EB8BB]/40"}`}
                            style={{ width: `${pct}%` }}
                            />
                        </div>
                        <span className="text-xs font-bold text-gray-500 w-8 text-right">{pct}%</span>
                        </div>
                    </div>
                    )
                })}
                </div>
            )}

            <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                <span className="font-semibold text-gray-700">{dailySales?.length ?? 0}</span> hari terdata |{" "}
                Total <span className="font-semibold text-[#6EB8BB]">Rp {(totalDailyRevenue / 1_000_000).toFixed(2)}jt</span>
                </p>
                <p className="text-xs text-gray-400">
                Rata-rata <span className="font-semibold text-gray-700">
                    {dailySales && dailySales.length > 0
                    ? `Rp ${Math.round(totalDailyRevenue / dailySales.length / 1_000)}rb`
                    : "-"
                    }
                </span> / hari
                </p>
            </div>
            </div>
        </div>
        </main>
    )
    }