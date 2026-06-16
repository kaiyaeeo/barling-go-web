    "use client"

    import { useState, useEffect, useMemo } from "react"
    import { createClient } from "@/lib/supabase/client"
    import { useRouter } from "next/navigation"
    import {
    Megaphone, LayoutGrid, Receipt, Loader2, RefreshCw,
    LayoutDashboard, Settings, Bell, ChevronRight, Search,
    TrendingUp, Wallet, Users, Clock, CheckCircle2, XCircle,
    AlertCircle, Crown, Star, Zap, Package, Filter, ChevronDown,
    Eye, ArrowUpRight, CalendarDays, BadgeCheck
    } from "lucide-react"
    import AdStatusToggle from "@/components/super-admin/AdStatusToggle"

    type Tab = "transaksi" | "paket"

    const STATUS_CONFIG: Record<string, {
    label: string; textColor: string; bgColor: string; borderColor: string; dotColor: string; icon: any
    }> = {
    pending:   { label: "Menunggu",   textColor: "text-amber-700",   bgColor: "bg-amber-50",   borderColor: "border-amber-200",   dotColor: "bg-amber-400",   icon: Clock        },
    paid:      { label: "Dibayar",    textColor: "text-blue-700",    bgColor: "bg-blue-50",    borderColor: "border-blue-200",    dotColor: "bg-blue-400",    icon: CheckCircle2 },
    active:    { label: "Aktif",      textColor: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", dotColor: "bg-emerald-400", icon: Zap          },
    expired:   { label: "Kedaluwarsa",textColor: "text-gray-600",    bgColor: "bg-gray-50",    borderColor: "border-gray-200",    dotColor: "bg-gray-400",    icon: AlertCircle  },
    cancelled: { label: "Dibatalkan", textColor: "text-red-700",     bgColor: "bg-red-50",     borderColor: "border-red-200",     dotColor: "bg-red-400",     icon: XCircle      },
    }

    const PKG_STYLE: Record<string, { icon: any; gradient: string; badge: string; ring: string; label: string }> = {
    BASIC:   { icon: Package, gradient: "from-gray-100 to-gray-50",         badge: "bg-gray-100 text-gray-600 border-gray-200",              ring: "ring-gray-200",    label: "Paket Dasar"    },
    PRO:     { icon: Star,    gradient: "from-[#E6F7F8] to-white",           badge: "bg-[#E6F7F8] text-[#6EB8BB] border-[#C5EAE9]",          ring: "ring-[#6EB8BB]/30",label: "Paket Pro"      },
    PREMIUM: { icon: Crown,   gradient: "from-amber-50 to-yellow-50",        badge: "bg-amber-50 text-amber-700 border-amber-200",            ring: "ring-amber-300",   label: "Paket Premium"  },
    }

    export default function SuperAdminIklanPage() {
    const router   = useRouter()
    const supabase = createClient()

    const [orders,    setOrders]    = useState<any[]>([])
    const [packages,  setPackages]  = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<Tab>("transaksi")
    const [search,    setSearch]    = useState("")
    const [filterStatus, setFilterStatus] = useState("all")

    const fetchData = async () => {
        setIsLoading(true)
        const [{ data: ordersData }, { data: packagesData }] = await Promise.all([
        supabase
            .from("ad_orders")
            .select(`*, profiles(umkm_name, full_name), ad_packages(name, duration_days)`)
            .order("created_at", { ascending: false }),
        supabase.from("ad_packages").select("*").order("price", { ascending: true }),
        ])
        if (ordersData)   setOrders(ordersData)
        if (packagesData) setPackages(packagesData)
        setIsLoading(false)
    }

    useEffect(() => { fetchData() }, [])

    // Derived stats
    const totalRevenue  = orders.filter(o => o.payment_status === "paid").reduce((s, o) => s + o.amount, 0)
    const activeAds     = orders.filter(o => o.status === "active").length
    const pendingAds    = orders.filter(o => o.status === "pending").length
    const totalMitras   = new Set(orders.map(o => o.seller_id)).size

    // Filtered orders
    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
        const name    = (o.profiles?.umkm_name ?? o.profiles?.full_name ?? "").toLowerCase()
        const pkg     = (o.ad_packages?.name ?? "").toLowerCase()
        const matchQ  = !search || name.includes(search.toLowerCase()) || pkg.includes(search.toLowerCase())
        const matchSt = filterStatus === "all" || o.status === filterStatus
        return matchQ && matchSt
        })
    }, [orders, search, filterStatus])

    const tabs = [
        { key: "transaksi" as Tab, label: "Transaksi & Pengajuan", icon: Receipt,    count: orders.length    },
        { key: "paket"     as Tab, label: "Konfigurasi Paket",     icon: LayoutGrid, count: packages.length  },
    ]

    const kpis = [
        { label: "Total Pendapatan", value: `Rp ${(totalRevenue / 1_000_000).toFixed(1)}jt`, sub: "Dari iklan lunas",    icon: Wallet,    color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", trend: true  },
        { label: "Iklan Aktif",      value: activeAds,                                        sub: "Sedang berjalan",    icon: Zap,       color: "text-[#6EB8BB]",   bg: "bg-[#E6F7F8]", border: "border-[#6EB8BB]/20", trend: true  },
        { label: "Menunggu Review",  value: pendingAds,                                       sub: "Perlu tindakan",     icon: Clock,     color: "text-amber-600",   bg: "bg-amber-50",  border: "border-amber-100",    trend: false },
        { label: "Total Mitra Iklan",value: totalMitras,                                      sub: "Unik beriklan",      icon: Users,     color: "text-purple-600",  bg: "bg-purple-50", border: "border-purple-100",   trend: true  },
    ]

    return (
        <main className="min-h-screen bg-gray-50/60">

        {/* ===== TOP NAV ===== */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                <LayoutDashboard size={13} />
                <button onClick={() => router.push("/super-admin/dashboard")} className="hover:text-gray-600 transition-colors">Dashboard</button>
                <ChevronRight size={13} />
                <span className="text-gray-700 font-semibold">Iklan & Promosi</span>
                </div>
                <div className="flex items-center gap-2">
                {pendingAds > 0 && (
                    <span className="relative p-2 text-amber-500">
                    <Bell size={17} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </span>
                )}
                <button onClick={() => router.push("/super-admin/pengaturan")} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                    <Settings size={17} />
                </button>
                <div className="h-5 w-px bg-gray-200 mx-1" />
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6EB8BB] to-[#5aa5a8] flex items-center justify-center text-white text-xs font-black">S</div>
                </div>
            </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-12">

            {/* ===== PAGE HEADER ===== */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Pusat Iklan & Promosi</h1>
                <p className="text-sm text-gray-400 mt-0.5">Kelola paket komersial dan tinjau performa promosi seluruh mitra UMKM.</p>
            </div>
            <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 shadow-sm transition-all"
            >
                <RefreshCw size={15} className={isLoading ? "animate-spin text-[#6EB8BB]" : ""} />
                Refresh Data
            </button>
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
                        <ArrowUpRight size={11} /> naik
                        </span>
                    )}
                    </div>
                    <p className="text-2xl font-black text-gray-900 leading-none">{kpi.value}</p>
                    <p className="text-sm text-gray-500 mt-1.5">{kpi.label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{kpi.sub}</p>
                </div>
                )
            })}
            </div>

            {/* ===== PENDING ALERT ===== */}
            {pendingAds > 0 && (
            <div className="flex items-center gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <AlertCircle size={18} className="text-amber-500 shrink-0" />
                <div className="flex-1">
                <p className="text-sm font-bold text-amber-900">{pendingAds} iklan menunggu persetujuan</p>
                <p className="text-xs text-amber-700 mt-0.5">Tinjau dan aktifkan iklan mitra yang sudah melakukan pembayaran.</p>
                </div>
                <button
                onClick={() => { setActiveTab("transaksi"); setFilterStatus("pending") }}
                className="text-xs font-bold text-amber-700 border border-amber-300 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-all shrink-0"
                >
                Tinjau Sekarang
                </button>
            </div>
            )}

            {/* ===== MAIN CARD ===== */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Tab bar */}
            <div className="flex items-center border-b border-gray-100 px-6">
                {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                    <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-4 text-sm font-bold border-b-2 transition-all ${
                        activeTab === tab.key
                        ? "border-[#6EB8BB] text-[#6EB8BB]"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                    >
                    <Icon size={15} />
                    {tab.label}
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                        activeTab === tab.key ? "bg-[#E6F7F8] text-[#6EB8BB]" : "bg-gray-100 text-gray-400"
                    }`}>
                        {tab.count}
                    </span>
                    </button>
                )
                })}

                {/* Refresh badge */}
                <div className="ml-auto flex items-center gap-2 py-3">
                <span className="text-xs text-gray-400 hidden sm:block">
                    {filteredOrders.length} {activeTab === "transaksi" ? "transaksi" : "paket"} ditampilkan
                </span>
                </div>
            </div>

            {/* ===== LOADING ===== */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 size={28} className="animate-spin text-[#6EB8BB]" />
                <p className="text-sm text-gray-400 font-medium">Memuat data iklan…</p>
                </div>

            /* ===== TAB: TRANSAKSI ===== */
            ) : activeTab === "transaksi" ? (
                <>
                {/* Filter toolbar */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-0 max-w-sm">
                    <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari nama mitra atau paket…"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] bg-gray-50 transition-all"
                    />
                    </div>

                    {/* Status filter pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                    {["all", "pending", "paid", "active", "expired", "cancelled"].map((s) => (
                        <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                            filterStatus === s
                            ? "bg-[#6EB8BB] text-white border-[#6EB8BB] shadow-sm"
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                        }`}
                        >
                        {s === "all" ? "Semua" : STATUS_CONFIG[s]?.label ?? s}
                        </button>
                    ))}
                    </div>
                </div>

                {/* Table header */}
                <div className="hidden md:grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_140px] items-center px-6 py-3 bg-gray-50/80 border-b border-gray-100">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Mitra</span>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Paket</span>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nominal</span>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tanggal</span>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Durasi</span>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Kelola</span>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Megaphone size={36} className="opacity-20 mb-3" />
                    <p className="text-sm font-medium text-gray-500">
                        {search || filterStatus !== "all" ? "Tidak ada hasil yang cocok" : "Belum ada pengajuan iklan."}
                    </p>
                    {(search || filterStatus !== "all") && (
                        <button onClick={() => { setSearch(""); setFilterStatus("all") }} className="mt-3 text-xs font-semibold text-[#6EB8BB] hover:underline">
                        Reset Filter
                        </button>
                    )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                    {filteredOrders.map((order) => {
                        const cfg       = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["pending"]
                        const StatusIcon = cfg.icon
                        const mitraName  = order.profiles?.umkm_name ?? order.profiles?.full_name ?? "Mitra"
                        const pkgName    = order.ad_packages?.name ?? "—"
                        const pkgStyle   = PKG_STYLE[pkgName?.toUpperCase()] ?? PKG_STYLE["BASIC"]
                        const PkgIcon    = pkgStyle.icon

                        return (
                        <div key={order.id} className="group hover:bg-gray-50/40 transition-colors">
                            {/* DESKTOP */}
                            <div className="hidden md:grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_140px] items-center px-6 py-4 gap-3">
                            {/* Mitra */}
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6EB8BB]/20 to-[#6EB8BB]/5 flex items-center justify-center text-[#6EB8BB] font-black text-sm shrink-0 border border-[#6EB8BB]/10">
                                {mitraName[0]?.toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate group-hover:text-[#6EB8BB] transition-colors">{mitraName}</p>
                                <p className="text-[11px] text-gray-400 font-mono truncate">{order.midtrans_order_id ?? order.id.slice(0, 12) + "…"}</p>
                                </div>
                            </div>

                            {/* Paket */}
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl border w-fit ${pkgStyle.badge}`}>
                                <PkgIcon size={12} /> {pkgName}
                            </span>

                            {/* Nominal */}
                            <p className="text-sm font-bold text-gray-800">
                                Rp {Number(order.amount).toLocaleString("id-ID")}
                            </p>

                            {/* Tanggal */}
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <CalendarDays size={12} className="text-gray-400 shrink-0" />
                                {new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            </div>

                            {/* Durasi */}
                            <p className="text-xs text-gray-500 font-medium">
                                {order.ad_packages?.duration_days ? `${order.ad_packages.duration_days} hari` : "—"}
                            </p>

                            {/* Status + Toggle */}
                            <div className="flex items-center justify-end gap-2">
                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                                {cfg.label}
                                </span>
                                <AdStatusToggle orderId={order.id} initialStatus={order.status} onStatusChange={fetchData} />
                            </div>
                            </div>

                            {/* MOBILE */}
                            <div className="md:hidden p-5 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#E6F7F8] flex items-center justify-center text-[#6EB8BB] font-black text-sm shrink-0">
                                    {mitraName[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">{mitraName}</p>
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                                    {cfg.label}
                                    </span>
                                </div>
                                </div>
                                <AdStatusToggle orderId={order.id} initialStatus={order.status} onStatusChange={fetchData} />
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500 pl-1">
                                <span className="flex items-center gap-1"><Package size={11} /> {pkgName}</span>
                                <span className="font-bold text-gray-800">Rp {Number(order.amount).toLocaleString("id-ID")}</span>
                                <span>{new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                            </div>
                            </div>
                        </div>
                        )
                    })}
                    </div>
                )}

                {/* Footer */}
                <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                    <span className="font-semibold text-gray-700">{filteredOrders.length}</span> dari{" "}
                    <span className="font-semibold text-gray-700">{orders.length}</span> transaksi
                    </p>
                    <p className="text-xs text-gray-400">
                    Total terpilih:{" "}
                    <span className="font-semibold text-emerald-600">
                        Rp {filteredOrders.filter(o => o.payment_status === "paid").reduce((s, o) => s + o.amount, 0).toLocaleString("id-ID")}
                    </span>
                    </p>
                </div>
                </>

            /* ===== TAB: PAKET ===== */
            ) : (
                <>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-800">{packages.length}</span> paket iklan tersedia untuk mitra
                    </p>
                    <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl font-medium">
                    Hanya tampilan · edit via database
                    </span>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {packages.length === 0 ? (
                        <div className="col-span-3 flex flex-col items-center justify-center py-20 text-gray-400">
                        <LayoutGrid size={36} className="opacity-20 mb-3" />
                        <p className="text-sm font-medium text-gray-500">Belum ada paket iklan dikonfigurasi.</p>
                        </div>
                    ) : packages.map((pkg) => {
                        const pkgKey   = (pkg.name ?? "").toUpperCase()
                        const style    = PKG_STYLE[pkgKey] ?? PKG_STYLE["BASIC"]
                        const PkgIcon  = style.icon
                        const isTop    = pkgKey === "PREMIUM"

                        return (
                        <div
                            key={pkg.id}
                            className={`relative rounded-2xl border overflow-hidden shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${
                            isTop ? `ring-2 ${style.ring}` : "border-gray-100"
                            }`}
                        >
                            {/* Top gradient header */}
                            <div className={`bg-gradient-to-br ${style.gradient} px-6 pt-6 pb-5 border-b border-gray-100`}>
                            {isTop && (
                                <span className="absolute top-4 right-4 text-[10px] font-black px-2.5 py-1 bg-amber-400 text-amber-900 rounded-full uppercase tracking-wide">
                                Terlaris
                                </span>
                            )}
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${style.badge} border`}>
                                <PkgIcon size={20} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">{pkg.name}</h3>
                            <div className="mt-2">
                                <span className="text-2xl font-black text-gray-900">Rp {Number(pkg.price).toLocaleString("id-ID")}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Masa aktif {pkg.duration_days} hari</p>
                            </div>

                            {/* Body */}
                            <div className="bg-white px-6 py-5 space-y-4">
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Maks. Produk</span>
                                <span className="font-bold text-gray-900">{pkg.max_products} produk</span>
                                </div>
                                <div className="flex items-start justify-between text-sm gap-3">
                                <span className="text-gray-500 shrink-0">Penempatan</span>
                                <div className="flex flex-wrap gap-1 justify-end">
                                    {(pkg.placement ?? []).map((p: string) => (
                                    <span key={p} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.badge}`}>
                                        {p}
                                    </span>
                                    ))}
                                </div>
                                </div>
                                {pkg.features && Array.isArray(pkg.features) && (
                                <div className="pt-2 border-t border-gray-100 space-y-1.5">
                                    {(pkg.features as string[]).map((f) => (
                                    <div key={f} className="flex items-start gap-2 text-xs text-gray-600">
                                        <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                                        {f}
                                    </div>
                                    ))}
                                </div>
                                )}
                            </div>

                            {/* Status badge */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl border ${
                                pkg.is_active
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : "bg-gray-50 text-gray-500 border-gray-200"
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${pkg.is_active ? "bg-emerald-400" : "bg-gray-400"}`} />
                                {pkg.is_active ? "Tersedia" : "Nonaktif"}
                                </span>
                                <p className="text-xs text-gray-400">
                                {orders.filter(o => o.ad_packages?.name === pkg.name).length} transaksi
                                </p>
                            </div>
                            </div>
                        </div>
                        )
                    })}
                    </div>
                </div>
                </>
            )}
            </div>

        </div>
        </main>
    )
    }