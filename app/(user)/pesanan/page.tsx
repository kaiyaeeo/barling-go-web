    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import {
    Package, ChevronRight, ShoppingBag, Home, Bell, Settings,
    Search, Calendar, CreditCard, Truck, CheckCircle,
    HelpCircle, RefreshCw, XCircle, Clock, ArrowRight
    } from "lucide-react"
    import UserSidebar from "@/components/user/UserSidebar"

    const STATUS_LABEL: Record<string, { label: string; color: string; bg: string; border: string; dot: string; icon: any }> = {
    pending:    { label: "Menunggu Bayar",   color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   dot: "bg-amber-400",   icon: CreditCard  },
    paid:       { label: "Sudah Dibayar",    color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200",    dot: "bg-blue-400",    icon: Clock       },
    processing: { label: "Diproses",         color: "text-purple-700",  bg: "bg-purple-50",  border: "border-purple-200",  dot: "bg-purple-400",  icon: RefreshCw   },
    packing:    { label: "Dikemas",          color: "text-indigo-700",  bg: "bg-indigo-50",  border: "border-indigo-200",  dot: "bg-indigo-400",  icon: Package     },
    shipped:    { label: "Dikirim",          color: "text-cyan-700",    bg: "bg-cyan-50",    border: "border-cyan-200",    dot: "bg-cyan-400",    icon: Truck       },
    delivered:  { label: "Selesai",          color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-400", icon: CheckCircle },
    cancelled:  { label: "Dibatalkan",       color: "text-rose-700",    bg: "bg-rose-50",    border: "border-rose-200",    dot: "bg-rose-400",    icon: XCircle     },
    refunded:   { label: "Dikembalikan",     color: "text-gray-600",    bg: "bg-gray-50",    border: "border-gray-200",    dot: "bg-gray-400",    icon: HelpCircle  },
    }

    const FILTER_TABS = [
    { key: "all",              label: "Semua",       statuses: null                                    },
    { key: "pending",          label: "Belum Bayar", statuses: ["pending"]                            },
    { key: "processing_group", label: "Diproses",    statuses: ["paid", "processing", "packing"]     },
    { key: "shipped",          label: "Dikirim",     statuses: ["shipped"]                            },
    { key: "delivered",        label: "Selesai",     statuses: ["delivered"]                          },
    { key: "cancelled",        label: "Dibatalkan",  statuses: ["cancelled", "refunded"]              },
    ]

    type SearchParams = Promise<{ status?: string; q?: string }>

    export default async function PesananPage({ searchParams }: { searchParams: SearchParams }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const params      = await searchParams
    const activeTab   = params.status ?? "all"
    const searchQuery = params.q ?? ""

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    // Fetch semua orders terlebih dahulu untuk hitung badge count
    const { data: allOrders } = await supabase
        .from("orders")
        .select("id, status")
        .eq("user_id", user.id)

    // Hitung count per tab
    const tabCounts = FILTER_TABS.reduce((acc, tab) => {
        if (!tab.statuses) {
        acc[tab.key] = allOrders?.length ?? 0
        } else {
        acc[tab.key] = allOrders?.filter(o => tab.statuses!.includes(o.status)).length ?? 0
        }
        return acc
    }, {} as Record<string, number>)

    // Fetch filtered orders
    const activeTabConfig = FILTER_TABS.find(t => t.key === activeTab)
    let query = supabase
        .from("orders")
        .select(`id, order_number, status, total_amount, payment_method, payment_status, shipping_cost, created_at, order_items(product_name, product_image, qty)`)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    if (activeTabConfig?.statuses) {
        query = query.in("status", activeTabConfig.statuses)
    }

    const { data: orders } = await query

    // Search filter (JS)
    let filteredOrders = orders ?? []
    if (searchQuery) {
        const q = searchQuery.toLowerCase()
        filteredOrders = filteredOrders.filter(o =>
        o.order_number.toLowerCase().includes(q) ||
        o.order_items?.some((item: any) => item.product_name?.toLowerCase().includes(q))
        )
    }

    const totalCount      = allOrders?.length ?? 0
    const unpaidCount     = allOrders?.filter(o => o.status === "pending").length ?? 0
    const processingCount = allOrders?.filter(o => ["paid","processing","packing"].includes(o.status)).length ?? 0

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] antialiased text-gray-800">

        {/* Sidebar */}
        <div className="hidden md:block w-[280px] shrink-0 bg-white border-r border-gray-200 z-10">
            <UserSidebar profile={profile} active="pesanan" />
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

            {/* Topbar */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm h-16 flex items-center justify-between px-6 lg:px-8 shrink-0">
            <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="text-gray-400">Transaksi</span>
                <ChevronRight size={14} className="text-gray-300" />
                <span className="text-gray-800">Daftar Pesanan</span>
            </div>
            <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-[#E6F7F8] hover:bg-[#C5EAE9] text-[#6EB8BB] rounded-xl text-xs font-bold transition-all">
                <Home size={15} /> <span className="hidden sm:block">Beranda</span>
                </Link>
                <div className="h-6 w-px bg-gray-200" />
                <button className="p-2 text-gray-400 hover:text-[#6EB8BB] hover:bg-gray-50 rounded-xl transition-all relative">
                <Bell size={18} />
                {unpaidCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
                </button>
                <Link href="/settings" className="p-2 text-gray-400 hover:text-[#6EB8BB] hover:bg-gray-50 rounded-xl transition-all">
                <Settings size={18} />
                </Link>
            </div>
            </div>

            {/* Content */}
            <div className="p-6 lg:p-10 w-full max-w-5xl mx-auto space-y-6">

            {/* Page header + metrics */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Pesanan Saya</h1>
                <p className="text-xs text-gray-400 mt-1 font-medium">Pantau status pengiriman dan riwayat belanja Anda.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-gray-100 shadow-sm text-xs font-bold">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg text-gray-600">
                    <ShoppingBag size={12} /> Total: <span className="text-gray-900">{totalCount}</span>
                </div>
                {unpaidCount > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg">
                    <CreditCard size={12} /> Belum bayar: <span>{unpaidCount}</span>
                    </div>
                )}
                {processingCount > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg">
                    <RefreshCw size={12} /> Diproses: <span>{processingCount}</span>
                    </div>
                )}
                </div>
            </div>

            {/* ── UNIFIED CARD: tabs + search + results ── */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Tab row */}
                <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide border-b border-gray-100 px-4 pt-4">
                {FILTER_TABS.map((tab) => {
                    const isActive = activeTab === tab.key
                    const count    = tabCounts[tab.key] ?? 0
                    const url      = `/pesanan?status=${tab.key}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`
                    return (
                    <Link
                        key={tab.key}
                        href={url}
                        className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                        isActive
                            ? "border-[#6EB8BB] text-[#6EB8BB]"
                            : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        {tab.label}
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full transition-colors ${
                        isActive ? "bg-[#E6F7F8] text-[#6EB8BB]" : "bg-gray-100 text-gray-400"
                        }`}>
                        {count}
                        </span>
                    </Link>
                    )
                })}
                </div>

                {/* Search bar */}
                <form method="GET" action="/pesanan" className="flex gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <input type="hidden" name="status" value={activeTab} />
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                    type="text"
                    name="q"
                    placeholder="Cari nomor pesanan atau nama produk…"
                    defaultValue={searchQuery}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] font-medium placeholder:text-gray-300 transition-all"
                    />
                </div>
                <button type="submit" className="px-5 py-2.5 bg-[#6EB8BB] hover:bg-[#5ca3a6] text-white text-sm font-bold rounded-xl transition-all shadow-sm shrink-0">
                    Cari
                </button>
                {(searchQuery || activeTab !== "all") && (
                    <Link href="/pesanan" className="px-4 py-2.5 border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-bold rounded-xl transition-all shrink-0">
                    Reset
                    </Link>
                )}
                </form>

                {/* Results */}
                {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 bg-[#E6F7F8] rounded-2xl flex items-center justify-center mb-4">
                    <ShoppingBag size={28} className="text-[#6EB8BB]" />
                    </div>
                    <h3 className="text-base font-black text-gray-900 mb-1">Pesanan tidak ditemukan</h3>
                    <p className="text-xs text-gray-400 text-center max-w-xs mb-6 leading-relaxed">
                    {searchQuery || activeTab !== "all"
                        ? "Coba ubah kata kunci atau pilih tab status yang lain."
                        : "Anda belum memiliki pesanan di Barling-GO."}
                    </p>
                    <Link href="/produk" className="inline-flex items-center gap-2 px-6 py-3 bg-[#6EB8BB] text-white font-bold rounded-xl text-sm hover:bg-[#5ca3a6] transition-all shadow-sm">
                    Mulai Belanja <ArrowRight size={14} />
                    </Link>
                </div>
                ) : (
                <div className="divide-y divide-gray-50">
                    {filteredOrders.map((order: any) => {
                    const status     = STATUS_LABEL[order.status] ?? { label: order.status, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", dot: "bg-gray-400", icon: Package }
                    const StatusIcon = status.icon
                    const firstItem  = order.order_items?.[0]
                    const extraCount = (order.order_items?.length ?? 1) - 1

                    return (
                        <div key={order.id} className="hover:bg-gray-50/40 transition-colors group">
                        <div className="flex items-start gap-4 px-5 py-5">

                            {/* Thumbnail */}
                            {firstItem?.product_image ? (
                            <img src={firstItem.product_image} alt={firstItem.product_name} className="w-16 h-16 rounded-2xl object-cover shrink-0 ring-1 ring-gray-200 group-hover:ring-[#6EB8BB]/30 transition-all" />
                            ) : (
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0">
                                <Package size={20} className="text-gray-400" />
                            </div>
                            )}

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                                <div>
                                <p className="text-xs font-black text-gray-800 tracking-tight">{order.order_number}</p>
                                <p className="text-[11px] text-gray-400 font-medium mt-0.5 flex items-center gap-1">
                                    <Calendar size={10} />
                                    {new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1.5 rounded-full border ${status.bg} ${status.color} ${status.border}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                {status.label}
                                </span>
                            </div>

                            <p className="text-sm font-bold text-gray-800 mt-2 truncate group-hover:text-[#6EB8BB] transition-colors">
                                {firstItem?.product_name ?? "Produk"}
                            </p>
                            {extraCount > 0 && (
                                <span className="inline-block text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md mt-1">
                                +{extraCount} produk lainnya
                                </span>
                            )}

                            <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                                <span className="text-base font-black text-gray-900">
                                Rp {order.total_amount.toLocaleString("id-ID")}
                                </span>
                                <div className="flex items-center gap-2">
                                {order.status === "pending" && (
                                    <Link href={`/pembayaran/${order.id}`} className="px-3.5 py-1.5 bg-[#FF6B35] hover:bg-[#e5592a] text-white text-xs font-black rounded-xl transition-all shadow-sm">
                                    Bayar Sekarang
                                    </Link>
                                )}
                                {order.status === "delivered" && (
                                    <Link href="/ulasan" className="px-3.5 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl transition-all">
                                    Tulis Ulasan
                                    </Link>
                                )}
                                <Link
                                    href={`/pesanan/${order.id}`}
                                    className="px-3.5 py-1.5 bg-[#E6F7F8] hover:bg-[#C5EAE9] text-[#6EB8BB] text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                                >
                                    Detail <ChevronRight size={12} />
                                </Link>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                    )
                    })}
                </div>
                )}

                {/* Footer count */}
                {filteredOrders.length > 0 && (
                <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
                    <p className="text-xs text-gray-400 font-medium">
                    Menampilkan <span className="font-bold text-gray-700">{filteredOrders.length}</span> pesanan
                    {activeTab !== "all" && ` · filter: ${FILTER_TABS.find(t => t.key === activeTab)?.label}`}
                    {searchQuery && ` · pencarian: "${searchQuery}"`}
                    </p>
                </div>
                )}
            </div>

            </div>
        </div>
        </div>
    )
    }