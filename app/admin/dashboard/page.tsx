    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import {
    Package, ShoppingBag, TrendingUp, Star,
    ArrowRight, ChevronRight, AlertTriangle,
    Clock, CheckCircle2, Truck, XCircle,
    LayoutDashboard, Settings, Bell, Plus,
    Wallet, BadgeCheck, Activity, Eye
    } from "lucide-react"
    import SellerWeekChart from "@/components/admin/dashboard/SellerWeekChart"
    import AIInsightBox    from "@/components/admin/dashboard/AIInsightBox"

    const STATUS_CONFIG: Record<string, { label: string; textColor: string; bgColor: string; borderColor: string; dotColor: string; icon: any }> = {
    pending:    { label: "Menunggu",   textColor: "text-amber-700",   bgColor: "bg-amber-50",   borderColor: "border-amber-100",   dotColor: "bg-amber-400",   icon: Clock         },
    paid:       { label: "Dibayar",    textColor: "text-blue-700",    bgColor: "bg-blue-50",    borderColor: "border-blue-100",    dotColor: "bg-blue-400",    icon: CheckCircle2  },
    processing: { label: "Diproses",   textColor: "text-purple-700",  bgColor: "bg-purple-50",  borderColor: "border-purple-100",  dotColor: "bg-purple-400",  icon: Activity      },
    packing:    { label: "Dikemas",    textColor: "text-indigo-700",  bgColor: "bg-indigo-50",  borderColor: "border-indigo-100",  dotColor: "bg-indigo-400",  icon: Package       },
    shipped:    { label: "Dikirim",    textColor: "text-cyan-700",    bgColor: "bg-cyan-50",    borderColor: "border-cyan-100",    dotColor: "bg-cyan-400",    icon: Truck         },
    delivered:  { label: "Selesai",    textColor: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-100", dotColor: "bg-emerald-400", icon: CheckCircle2  },
    cancelled:  { label: "Dibatalkan", textColor: "text-red-700",     bgColor: "bg-red-50",     borderColor: "border-red-100",     dotColor: "bg-red-400",     icon: XCircle       },
    }

    export default async function AdminDashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login?mode=seller")

    const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name, umkm_name, umkm_logo")
        .eq("id", user.id)
        .single()

    if (!["admin", "super_admin"].includes(profile?.role ?? "")) redirect("/dashboard")

    const today         = new Date()
    const monthStart    = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString()
    const lastMonthEnd  = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
    const todayStr      = today.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

    const [
        { count: totalProducts },
        { count: totalProductsLastMonth },
        { data: newOrders },
        { data: revenueThisMonth },
        { data: revenueLastMonth },
        { data: allRatings },
        { data: weekSales },
        { data: recentOrders },
        { data: lowStockProducts },
        { data: topProducts },
    ] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }).eq("seller_id", user.id).eq("is_active", true),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("seller_id", user.id).eq("is_active", true).lt("created_at", monthStart),
        supabase.from("orders").select("id, order_number, status, total_amount, shipping_name, created_at, order_items(product_name, product_image, qty)").in("status", ["paid", "processing"]).gte("created_at", monthStart).order("created_at", { ascending: false }).limit(5),
        supabase.from("orders").select("total_amount, created_at").eq("payment_status", "paid").gte("created_at", monthStart),
        supabase.from("orders").select("total_amount").eq("payment_status", "paid").gte("created_at", lastMonthStart).lt("created_at", lastMonthEnd),
        supabase.from("content_reviews").select("rating").limit(100),
        supabase.from("daily_sales").select("date, order_count, revenue").order("date", { ascending: true }).limit(7),
        supabase.from("orders").select("id, order_number, status, total_amount, payment_status, shipping_name, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("products").select("id, name, stock, sku").eq("seller_id", user.id).eq("is_active", true).lte("stock", 5).order("stock", { ascending: true }).limit(5),
        supabase.from("products").select("id, name, total_sold, images, price").eq("seller_id", user.id).eq("is_active", true).order("total_sold", { ascending: false }).limit(5),
    ])

    const revenue    = revenueThisMonth?.reduce((s, o) => s + o.total_amount, 0) ?? 0
    const revPrev    = revenueLastMonth?.reduce((s, o) => s + o.total_amount, 0) ?? 0
    const revGrowth  = revPrev > 0 ? Math.round(((revenue - revPrev) / revPrev) * 100) : 0
    const prodGrowth = totalProductsLastMonth != null
        ? Math.round((((totalProducts ?? 0) - totalProductsLastMonth) / Math.max(totalProductsLastMonth, 1)) * 100)
        : 0
    const avgRating = allRatings?.length
        ? (allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length).toFixed(1)
        : "—"

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return { date: d.toLocaleDateString("id-ID", { weekday: "short" }), revenue: 0, order_count: 0 }
    })
    if (weekSales) {
        weekSales.forEach((s: any, i: number) => {
        if (last7Days[i]) {
            last7Days[i].revenue     = s.revenue ?? 0
            last7Days[i].order_count = s.order_count ?? 0
        }
        })
    }

    const peakIdx   = last7Days.reduce((best, d, i) => d.order_count > last7Days[best].order_count ? i : best, 0)
    const peakDay   = last7Days[peakIdx]?.date ?? "Rabu"
    const aiInsight = `Aktivitas pengguna web Barling-GO melonjak tajam pada hari ${peakDay}. Optimalkan pembaruan info produk di hari tersebut!`

    const shopName  = profile?.umkm_name ?? profile?.full_name ?? "Toko"
    const firstName = profile?.full_name?.split(" ")[0] ?? shopName

    const hour     = today.getHours()
    const greeting = hour < 11 ? "Selamat Pagi" : hour < 15 ? "Selamat Siang" : hour < 18 ? "Selamat Sore" : "Selamat Malam"

    const kpis = [
        {
        label:    "Total Produk",
        value:    totalProducts ?? 0,
        sub:      `${prodGrowth >= 0 ? "+" : ""}${prodGrowth}% dari bulan lalu`,
        up:       prodGrowth >= 0,
        icon:     Package,
        color:    "text-emerald-600",
        bg:       "bg-emerald-50",
        border:   "border-emerald-100",
        href:     "/admin/produk",
        },
        {
        label:    "Pesanan Baru",
        value:    newOrders?.length ?? 0,
        sub:      "Perlu diproses segera",
        up:       true,
        icon:     ShoppingBag,
        color:    "text-blue-600",
        bg:       "bg-blue-50",
        border:   "border-blue-100",
        href:     "/admin/pesanan",
        },
        {
        label:    "Pendapatan Bulan Ini",
        value:    revenue >= 1_000_000
                    ? `Rp ${(revenue / 1_000_000).toFixed(1)}jt`
                    : `Rp ${Math.round(revenue / 1_000)}rb`,
        sub:      `${revGrowth >= 0 ? "+" : ""}${revGrowth}% dari bulan lalu`,
        up:       revGrowth >= 0,
        icon:     Wallet,
        color:    "text-purple-600",
        bg:       "bg-purple-50",
        border:   "border-purple-100",
        href:     "/admin/laporan",
        },
        {
        label:    "Rating Toko",
        value:    avgRating,
        sub:      `Dari ${allRatings?.length ?? 0} ulasan`,
        up:       true,
        icon:     Star,
        color:    "text-amber-500",
        bg:       "bg-amber-50",
        border:   "border-amber-100",
        href:     "/admin/analitik",
        },
    ]

    const quickLinks = [
        { label: "Tambah Produk", href: "/admin/produk/tambah",   icon: Plus,       color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Pesanan",       href: "/admin/pesanan",         icon: ShoppingBag,color: "text-blue-600",    bg: "bg-blue-50"    },
        { label: "Analitik",      href: "/admin/analitik",        icon: Activity,   color: "text-purple-600",  bg: "bg-purple-50"  },
        { label: "Etalase",       href: "/admin/etalase",         icon: Eye,        color: "text-cyan-600",    bg: "bg-cyan-50"    },
        { label: "Laporan",       href: "/admin/laporan",         icon: TrendingUp, color: "text-amber-600",   bg: "bg-amber-50"   },
        { label: "Pengaturan",    href: "/admin/pengaturan",      icon: Settings,   color: "text-gray-600",    bg: "bg-gray-100"   },
    ]

    const logoUrl = profile?.umkm_logo
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.umkm_logo}`
        : null

    return (
        <main className="min-h-screen bg-gray-50/60">

        {/* ===== TOP NAV ===== */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                <LayoutDashboard size={13} />
                <span className="text-gray-700 font-semibold">Dashboard Merchant</span>
                </div>
                <div className="flex items-center gap-2">
                {(newOrders?.length ?? 0) > 0 && (
                    <Link href="/admin/pesanan" className="relative p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all">
                    <Bell size={17} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </Link>
                )}
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

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-12">

            {/* ===== GREETING HERO ===== */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#6EB8BB] via-[#6EB8BB] to-[#6EB8BB] p-6 md:p-8 text-white">
            <div className="absolute right-0 top-0 w-56 h-56 opacity-5 translate-x-1/4 -translate-y-1/4 pointer-events-none">
                <TrendingUp size={224} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                <p className="text-teal-100 text-sm font-medium mb-1">{greeting}, {firstName} 👋</p>
                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{shopName}</h1>
                <div className="flex items-center gap-2 mt-1.5">
                    <BadgeCheck size={15} className="text-teal-200" />
                    <p className="text-teal-100 text-sm">Merchant Partner · {todayStr}</p>
                </div>
                </div>
                <div className="flex flex-wrap gap-3 shrink-0">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-center min-w-[90px]">
                    <p className="text-xl font-black text-white">{totalProducts ?? 0}</p>
                    <p className="text-[11px] text-teal-100 mt-0.5">Produk</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-center min-w-[90px]">
                    <p className="text-xl font-black text-amber-300">{newOrders?.length ?? 0}</p>
                    <p className="text-[11px] text-teal-100 mt-0.5">Perlu Diproses</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-center min-w-[90px]">
                    <p className="text-xl font-black text-white flex items-center justify-center gap-1">
                    {avgRating}<Star size={13} className="fill-white text-white" />
                    </p>
                    <p className="text-[11px] text-teal-100 mt-0.5">Rating</p>
                </div>
                </div>
            </div>
            </div>

            {/* ===== LOW STOCK ALERT (kalau ada, tampil di atas) ===== */}
            {lowStockProducts && lowStockProducts.length > 0 && (
            <div className="flex items-center gap-3 px-5 py-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
                <AlertTriangle size={17} className="text-amber-500 shrink-0" />
                <p className="text-sm font-semibold text-amber-800 flex-1">
                {lowStockProducts.length} produk stok menipis —{" "}
                <span className="font-normal text-amber-700">
                    {lowStockProducts.map((p: any) => p.name).join(", ")}
                </span>
                </p>
                <Link href="/admin/inventori" className="text-xs font-bold text-amber-700 border border-amber-300 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-all shrink-0">
                Kelola Stok
                </Link>
            </div>
            )}

            {/* ===== KPI CARDS ===== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => {
                const Icon = kpi.icon
                return (
                <Link
                    key={kpi.label} href={kpi.href}
                    className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md hover:border-gray-200 transition-all group ${kpi.border}`}
                >
                    <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                        <Icon size={18} className={kpi.color} />
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${kpi.up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                        {kpi.up ? "↑" : "↓"}
                    </span>
                    </div>
                    <p className="text-2xl font-black text-gray-900 leading-none">{kpi.value}</p>
                    <p className="text-sm text-gray-500 mt-1.5">{kpi.label}</p>
                    <p className={`text-[11px] mt-1 font-medium flex items-center justify-between ${kpi.up ? "text-emerald-600" : "text-red-500"}`}>
                    {kpi.sub}
                    <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                </Link>
                )
            })}
            </div>

            {/* ===== QUICK LINKS ===== */}
            <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Menu Cepat</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {quickLinks.map((ql) => {
                const Icon = ql.icon
                return (
                    <Link
                    key={ql.label} href={ql.href}
                    className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-2.5 text-center hover:shadow-md hover:border-gray-200 transition-all group"
                    >
                    <div className={`w-10 h-10 rounded-xl ${ql.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon size={18} className={ql.color} />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 leading-tight">{ql.label}</span>
                    </Link>
                )
                })}
            </div>
            </div>

            {/* ===== CHART ===== */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#6EB8BB]/10 flex items-center justify-center">
                    <Activity size={15} className="text-[#6EB8BB]" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-gray-900">Penjualan 7 Hari Terakhir</h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">Omzet harian dari tabel daily_sales</p>
                </div>
                </div>
                <Link href="/admin/analitik" className="text-xs font-semibold text-[#6EB8BB] border border-[#6EB8BB]/30 px-3 py-1.5 rounded-xl hover:bg-[#6EB8BB]/10 transition-all flex items-center gap-1">
                Analitik lengkap <ArrowRight size={11} />
                </Link>
            </div>
            <div className="p-6">
                <SellerWeekChart data={last7Days} />
                <AIInsightBox text={aiInsight} />
            </div>
            </div>

            {/* ===== 2 KOLOM: Pesanan & Top Produk ===== */}
            <div className="grid lg:grid-cols-2 gap-5">

            {/* Pesanan Masuk */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <ShoppingBag size={15} className="text-blue-500" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900">Pesanan Masuk</h2>
                </div>
                <Link href="/admin/pesanan" className="text-xs font-semibold text-[#6EB8BB] border border-[#6EB8BB]/30 px-2.5 py-1.5 rounded-xl hover:bg-[#6EB8BB]/10 transition-all flex items-center gap-1">
                    Semua <ChevronRight size={11} />
                </Link>
                </div>

                {!recentOrders || recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                    <ShoppingBag size={32} className="opacity-20 mb-3" />
                    <p className="text-sm font-medium text-gray-500">Belum ada pesanan</p>
                </div>
                ) : (
                <div className="divide-y divide-gray-50">
                    {recentOrders.map((order: any) => {
                    const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["pending"]
                    const StatusIcon = cfg.icon
                    return (
                        <Link
                        key={order.id} href={`/admin/pesanan/${order.id}`}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors group"
                        >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bgColor}`}>
                            <StatusIcon size={14} className={cfg.textColor} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate group-hover:text-[#6EB8BB] transition-colors">{order.order_number}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{order.shipping_name}</p>
                        </div>
                        <div className="text-right shrink-0 space-y-0.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} /> {cfg.label}
                            </span>
                            <p className="text-xs font-bold text-gray-800">Rp {order.total_amount.toLocaleString("id-ID")}</p>
                        </div>
                        </Link>
                    )
                    })}
                </div>
                )}
                <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50">
                <Link href="/admin/pesanan" className="text-xs font-semibold text-[#6EB8BB] hover:underline flex items-center gap-1">
                    Kelola semua pesanan <ArrowRight size={11} />
                </Link>
                </div>
            </div>

            {/* Top Produk */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <TrendingUp size={15} className="text-emerald-500" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900">Produk Terlaris</h2>
                </div>
                <Link href="/admin/produk" className="text-xs font-semibold text-[#6EB8BB] border border-[#6EB8BB]/30 px-2.5 py-1.5 rounded-xl hover:bg-[#6EB8BB]/10 transition-all flex items-center gap-1">
                    Semua <ChevronRight size={11} />
                </Link>
                </div>

                {!topProducts || topProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                    <Package size={32} className="opacity-20 mb-3" />
                    <p className="text-sm font-medium text-gray-500 mb-3">Belum ada produk</p>
                    <Link href="/admin/produk/tambah" className="text-xs font-semibold text-[#6EB8BB] border border-[#6EB8BB]/30 px-4 py-2 rounded-xl hover:bg-[#6EB8BB]/10 transition-all flex items-center gap-1">
                    <Plus size={13} /> Tambah Produk
                    </Link>
                </div>
                ) : (
                <div className="divide-y divide-gray-50">
                    {topProducts.map((p: any, i: number) => {
                    const img = p.images?.[0]
                        ? p.images[0].startsWith("http") ? p.images[0]
                        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${p.images[0]}`
                        : null
                    const maxSold = Math.max(...(topProducts.map((x: any) => x.total_sold ?? 0)))
                    const pct = maxSold > 0 ? ((p.total_sold ?? 0) / maxSold) * 100 : 0
                    const RANK_COLORS = ["text-amber-500", "text-gray-400", "text-orange-400", "text-gray-300", "text-gray-300"]

                    return (
                        <Link
                        key={p.id} href={`/admin/produk/${p.id}/edit`}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors group"
                        >
                        <span className={`text-sm font-black w-5 shrink-0 ${RANK_COLORS[i] ?? "text-gray-300"}`}>{i + 1}</span>
                        {img ? (
                            <img src={img} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0 ring-1 ring-gray-200 group-hover:scale-105 transition-transform" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <Package size={14} className="text-gray-400" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-[#6EB8BB] transition-colors">{p.name}</p>
                            <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#6EB8BB] to-[#5aa5a8] rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-gray-700">{p.total_sold ?? 0}</p>
                            <p className="text-[10px] text-gray-400">terjual</p>
                        </div>
                        </Link>
                    )
                    })}
                </div>
                )}
                <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50">
                <Link href="/admin/produk/tambah" className="text-xs font-semibold text-[#6EB8BB] hover:underline flex items-center gap-1">
                    <Plus size={11} /> Tambah produk baru
                </Link>
                </div>
            </div>
            </div>

            {/* ===== STOK MENIPIS DETAIL (tabel) ===== */}
            {lowStockProducts && lowStockProducts.length > 0 && (
            <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100 bg-amber-50/60">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <AlertTriangle size={15} className="text-amber-600" />
                    </div>
                    <div>
                    <h2 className="text-sm font-bold text-amber-900">Stok Menipis</h2>
                    <p className="text-[11px] text-amber-600 mt-0.5">{lowStockProducts.length} produk butuh perhatian</p>
                    </div>
                </div>
                <Link href="/admin/inventori" className="text-xs font-bold text-amber-700 border border-amber-300 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-all flex items-center gap-1">
                    Kelola Inventori <ChevronRight size={11} />
                </Link>
                </div>
                <div className="divide-y divide-gray-50">
                {lowStockProducts.map((p: any) => (
                    <Link
                    key={p.id} href={`/admin/produk/${p.id}/edit`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-amber-50/30 transition-colors group"
                    >
                    <div>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-amber-700 transition-colors">{p.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">{p.sku ?? "No SKU"}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                        p.stock === 0
                        ? "bg-red-50 text-red-600 border-red-100"
                        : "bg-amber-50 text-amber-700 border-amber-100"
                    }`}>
                        {p.stock === 0 ? "Stok Habis" : `${p.stock} tersisa`}
                    </span>
                    </Link>
                ))}
                </div>
            </div>
            )}

        </div>
        </main>
    )
    }