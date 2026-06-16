    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import { 
    Package, ChevronRight, ShoppingBag, Home, Bell, Settings, 
    Search, Filter, Calendar, CreditCard, Truck, CheckCircle,
    HelpCircle, RefreshCw, XCircle, Clock
    } from "lucide-react"
    import UserSidebar from "@/components/user/UserSidebar"

    const STATUS_LABEL: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
    pending:    { label: "Menunggu Pembayaran", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200/60", icon: CreditCard },
    paid:       { label: "Sudah Dibayar",       color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200/60", icon: Clock },
    processing: { label: "Diproses",            color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200/60", icon: RefreshCw },
    packing:    { label: "Dikemas",             color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200/60", icon: Package },
    shipped:    { label: "Dikirim",             color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200/60", icon: Truck },
    delivered:  { label: "Diterima",            color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200/60", icon: CheckCircle },
    cancelled:  { label: "Dibatalkan",          color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200/60", icon: XCircle },
    refunded:   { label: "Dikembalikan",        color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200/60", icon: HelpCircle },
    }

    // Map filter status to DB status
    const FILTER_TABS = [
    { key: "all", label: "Semua" },
    { key: "pending", label: "Belum Bayar" },
    { key: "processing_group", label: "Diproses" }, // combining processing & packing
    { key: "shipped", label: "Dikirim" },
    { key: "delivered", label: "Selesai" },
    { key: "cancelled", label: "Dibatalkan" },
    ]

    export default async function PesananPage({
    searchParams
    }: {
    searchParams: { status?: string; q?: string }
    }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) redirect("/login")
    
    // Active Filters
    const activeTab = searchParams.status || "all"
    const searchQuery = searchParams.q || ""
    
    // Fetch profile for Sidebar
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        
    // Fetch orders
    const { data: orders } = await supabase
        .from("orders")
        .select(`
        id, order_number, status, total_amount,
        payment_method, payment_status, created_at,
        order_items(product_name, product_image, qty)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        
    // Filter orders in JS for robust search & status filtering
    let filteredOrders = orders || []
    if (activeTab !== "all") {
        if (activeTab === "processing_group") {
        filteredOrders = filteredOrders.filter(
            order => order.status === "processing" || order.status === "packing" || order.status === "paid"
        )
        } else {
        filteredOrders = filteredOrders.filter(order => order.status === activeTab)
        }
    }
    
    if (searchQuery) {
        const q = searchQuery.toLowerCase()
        filteredOrders = filteredOrders.filter(
        order =>
            order.order_number.toLowerCase().includes(q) ||
            order.order_items.some((item: any) => item.product_name.toLowerCase().includes(q))
        )
    }
    
    // Count metrics for Top Dashboard Widgets
    const totalCount = orders?.length || 0
    const unpaidCount = orders?.filter(o => o.status === "pending").length || 0
    const processingCount = orders?.filter(o => ["paid", "processing", "packing"].includes(o.status)).length || 0
    
    return (
        <div className="flex min-h-screen bg-[#F8FAFC] antialiased text-gray-800">
        
        {/* ── SIDEBAR (tetap 280px) ── */}
        <div className="hidden md:block w-[280px] shrink-0 bg-white border-r border-gray-200 z-10">
            <UserSidebar profile={profile} active="pesanan" />
        </div>
        
        {/* ── KONTEN UTAMA ── */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
            
            {/* TOPBAR */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm h-16 flex items-center justify-between px-6 lg:px-8 shrink-0">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold">
                <Link href="/pesanan" className="text-gray-400 hover:text-[#6EB8BB]">Transaksi</Link>
                <ChevronRight size={14} className="text-gray-300" />
                <span className="text-gray-800">Daftar Pesanan</span>
            </div>
            <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-[#E6F7F8] hover:bg-[#C5EAE9] text-[#6EB8BB] rounded-xl text-xs font-bold transition-all">
                <Home size={15} /> <span className="hidden sm:block">Beranda</span>
                </Link>
                <div className="h-6 w-px bg-gray-200 mx-1" />
                <button className="p-2 text-gray-400 hover:text-[#6EB8BB] hover:bg-gray-50 rounded-xl transition-all relative">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                <Link href="/settings" className="p-2 text-gray-400 hover:text-[#6EB8BB] hover:bg-gray-50 rounded-xl transition-all">
                <Settings size={18} />
                </Link>
            </div>
            </div>

            {/* CONTAINER CONTENT */}
            <div className="p-6 lg:p-10 w-full max-w-7xl mx-auto space-y-6">
            
            {/* Header & Stats Widget */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Pesanan Saya</h1>
                <p className="text-xs text-gray-400 mt-1 font-medium">Pantau status pengiriman dan riwayat belanja Anda di sini.</p>
                </div>
                
                {/* Quick Metrics Bar */}
                <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded-2xl border border-gray-100 shadow-sm text-xs font-bold text-gray-600">
                <div className="px-3 py-1 bg-gray-50 rounded-lg">
                    Total: <span className="text-gray-800 font-black">{totalCount}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                <div className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg">
                    Belum Bayar: <span className="font-black">{unpaidCount}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                <div className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg">
                    Diproses: <span className="font-black">{processingCount}</span>
                </div>
                </div>
            </div>

            {/* ── FILTER & SEARCH BAR ── */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                {/* Search Form */}
                <form method="GET" action="/pesanan" className="flex flex-col sm:flex-row gap-3">
                <input type="hidden" name="status" value={activeTab} />
                
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                    type="text"
                    name="q"
                    placeholder="Cari transaksi berdasarkan No. Pesanan atau Nama Produk..."
                    defaultValue={searchQuery}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/40 focus:border-[#6EB8BB] transition-all font-medium"
                    />
                </div>
                
                <div className="flex gap-2">
                    <button type="submit" className="px-5 py-2.5 bg-[#6EB8BB] hover:bg-[#5ca3a6] text-white text-sm font-bold rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5">
                    Cari Pesanan
                    </button>
                    {(searchQuery || activeTab !== "all") && (
                    <Link href="/pesanan" className="px-4 py-2.5 border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-bold rounded-xl transition-all flex items-center justify-center">
                        Reset
                    </Link>
                    )}
                </div>
                </form>

                {/* Filter Tabs (Horizontal Scrollable) */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-gray-100 pt-4">
                {FILTER_TABS.map((tab) => {
                    const isSelected = activeTab === tab.key
                    const url = searchQuery 
                    ? `/pesanan?status=${tab.key}&q=${encodeURIComponent(searchQuery)}`
                    : `/pesanan?status=${tab.key}`
                    return (
                    <Link
                        key={tab.key}
                        href={url}
                        className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide whitespace-nowrap transition-all border ${
                        isSelected
                            ? "bg-[#6EB8BB] border-[#6EB8BB] text-white shadow-sm"
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100/70 hover:text-gray-800"
                        }`}
                    >
                        {tab.label}
                    </Link>
                    )
                })}
                </div>
            </div>

            {/* ── LIST PESANAN ── */}
            {!filteredOrders || filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-[#6EB8BB]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#6EB8BB]">
                    <ShoppingBag size={36} />
                </div>
                <h3 className="text-base font-black text-gray-900 mb-1">Pesanan tidak ditemukan</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6 font-medium">
                    {searchQuery || activeTab !== "all" 
                    ? "Coba ganti filter status atau kata kunci pencarian Anda."
                    : "Anda belum melakukan transaksi belanja apapun di Barling-GO."}
                </p>
                <Link href="/produk" className="inline-flex px-6 py-3 bg-[#6EB8BB] text-white font-bold rounded-xl text-sm transition-all shadow-sm hover:scale-[1.01] active:scale-[0.98]">
                    Mulai Belanja
                </Link>
                </div>
            ) : (
                <div className="space-y-4">
                {filteredOrders.map((order: any) => {
                    const status = STATUS_LABEL[order.status] ?? { 
                    label: order.status, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", icon: Package 
                    }
                    const StatusIcon = status.icon
                    const itemsCount = order.order_items?.length || 0
                    const firstItem = order.order_items?.[0]
                    
                    return (
                    <div
                        key={order.id}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
                    >
                        {/* Header Card */}
                        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <ShoppingBag size={16} className="text-[#6EB8BB]" />
                            <div>
                            <p className="text-xs font-black text-gray-800">{order.order_number}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-400 font-semibold">
                                <Calendar size={10} />
                                <span>{new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                            </div>
                            </div>
                        </div>
                        
                        {/* Badge status */}
                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${status.bg} ${status.color} ${status.border}`}>
                            <StatusIcon size={12} />
                            {status.label}
                        </span>
                        </div>

                        {/* Body Card */}
                        <div className="p-5 flex gap-4 flex-1">
                        {firstItem?.product_image ? (
                            <img 
                            src={firstItem.product_image} 
                            alt={firstItem.product_name} 
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100 bg-gray-50" 
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0 text-gray-300">
                            <Package size={22} />
                            </div>
                        )}
                        
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#6EB8BB] transition-colors">
                            {firstItem?.product_name || "Produk Tanpa Nama"}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1 font-medium">
                            {firstItem?.qty} barang x Rp {((order.total_amount - (order.shipping_cost || 0)) / (firstItem?.qty || 1)).toLocaleString("id-ID")}
                            </p>
                            {itemsCount > 1 && (
                            <p className="text-[10px] font-bold text-gray-500 mt-1.5 bg-gray-100 inline-block px-2 py-0.5 rounded-md w-fit">
                                +{itemsCount - 1} produk lainnya
                            </p>
                            )}
                        </div>
                        </div>

                        {/* Footer Card */}
                        <div className="px-5 py-4 border-t border-gray-100 bg-white flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Belanja</span>
                            <span className="text-base font-black text-gray-900">
                            Rp {order.total_amount.toLocaleString("id-ID")}
                            </span>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                            {order.status === "pending" ? (
                            <Link 
                                href={`/pembayaran/${order.id}`} 
                                className="px-4 py-2 bg-[#FF6B35] hover:bg-[#e5592a] text-white text-xs font-black rounded-xl transition-all shadow-sm"
                            >
                                Bayar Sekarang
                            </Link>
                            ) : order.status === "delivered" ? (
                            <Link 
                                href="/ulasan" 
                                className="px-4 py-2 border border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50 text-xs font-bold rounded-xl transition-all"
                            >
                                Tulis Ulasan
                            </Link>
                            ) : null}
                            
                            <Link
                            href={`/pesanan/${order.id}`}
                            className="px-4 py-2 border border-[#6EB8BB]/20 hover:border-[#6EB8BB]/40 text-[#6EB8BB] bg-[#6EB8BB]/5 hover:bg-[#6EB8BB]/10 text-xs font-bold rounded-xl transition-all flex items-center gap-1 group-hover:gap-1.5"
                            >
                            Detail Pesanan <ChevronRight size={12} />
                            </Link>
                        </div>
                        </div>
                    </div>
                    )
                })}
                </div>
            )}
            </div>
        </div>
        </div>
    )
    }