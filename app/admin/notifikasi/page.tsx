    "use client"

    import { useEffect, useState, useCallback, useRef } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import {
    Bell, ShoppingCart, Package, AlertTriangle, XCircle,
    CreditCard, Star, MessageCircle, CheckCheck, Trash2,
    RefreshCw, LayoutDashboard, ChevronRight, Settings,
    Search, MoreHorizontal, Eye, ArrowRight, Loader2, ArrowLeft
    } from "lucide-react"
    import Link from "next/link"

    type NotifType =
    | "order_new" | "order_paid" | "order_cancelled"
    | "stock_low" | "stock_empty"
    | "payment_success" | "payment_failed"
    | "review_new" | "chat_new"

    type Notification = {
    id: string
    type: NotifType
    title: string
    message: string 
    link: string | null
    metadata: Record<string, any> | null 
    is_read: boolean
    created_at: string
    }

    type FilterTab = "semua" | "pesanan" | "stok" | "pembayaran" | "ulasan" | "chat"

    const TYPE_CONFIG: Record<string, {
    icon: React.ElementType; bg: string; iconColor: string;
    badge: string; category: FilterTab; ctaLabel?: string; fallbackHref: string
    }> = {
    order_new:        { icon: ShoppingCart,  bg: "bg-blue-50",    iconColor: "text-blue-500",    badge: "bg-blue-50 text-blue-600 border-blue-100",      category: "pesanan",    ctaLabel: "Proses Pesanan",  fallbackHref: "/admin/pesanan" },
    order_paid:       { icon: ShoppingCart,  bg: "bg-blue-50",    iconColor: "text-blue-500",    badge: "bg-blue-50 text-blue-600 border-blue-100",      category: "pesanan",    ctaLabel: "Lihat Pesanan",   fallbackHref: "/admin/pesanan" },
    order_cancelled:  { icon: XCircle,       bg: "bg-red-50",     iconColor: "text-red-500",     badge: "bg-red-50 text-red-500 border-red-100",         category: "pesanan",    ctaLabel: "Lihat Pesanan",   fallbackHref: "/admin/pesanan" },
    stock_low:        { icon: AlertTriangle, bg: "bg-amber-50",   iconColor: "text-amber-500",   badge: "bg-amber-50 text-amber-600 border-amber-100",   category: "stok",       ctaLabel: "Tambah Stok",     fallbackHref: "/admin/produk" },
    stock_empty:      { icon: Package,       bg: "bg-red-50",     iconColor: "text-red-500",     badge: "bg-red-50 text-red-500 border-red-100",         category: "stok",       ctaLabel: "Tambah Stok",     fallbackHref: "/admin/produk" },
    payment_success:  { icon: CreditCard,    bg: "bg-emerald-50", iconColor: "text-emerald-500", badge: "bg-emerald-50 text-emerald-600 border-emerald-100", category: "pembayaran", ctaLabel: "Lihat Pesanan",   fallbackHref: "/admin/pesanan" },
    payment_failed:   { icon: CreditCard,    bg: "bg-red-50",     iconColor: "text-red-500",     badge: "bg-red-50 text-red-500 border-red-100",         category: "pembayaran", ctaLabel: "Lihat Detail",    fallbackHref: "/admin/pesanan" },
    review_new:       { icon: Star,          bg: "bg-yellow-50",  iconColor: "text-yellow-500",  badge: "bg-yellow-50 text-yellow-600 border-yellow-100", category: "ulasan",    ctaLabel: "Balas Ulasan",    fallbackHref: "/admin/ulasan" },
    chat_new:         { icon: MessageCircle, bg: "bg-purple-50",  iconColor: "text-purple-500",  badge: "bg-purple-50 text-purple-600 border-purple-100", category: "chat",      ctaLabel: "Balas Chat",      fallbackHref: "/admin/chat" },
    }

    const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: "semua",      label: "Semua"      },
    { key: "pesanan",    label: "Pesanan"    },
    { key: "stok",       label: "Stok"       },
    { key: "pembayaran", label: "Pembayaran" },
    { key: "ulasan",     label: "Ulasan"     },
    { key: "chat",       label: "Chat"       },
    ]

    function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1)  return "Baru saja"
    if (m < 60) return `${m} menit lalu`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h} jam lalu`
    const d = Math.floor(h / 24)
    if (d < 7)  return `${d} hari lalu`
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    }

    export default function AdminNotifikasiPage() {
    const router  = useRouter()
    const supabase = createClient()

    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading,        setLoading]        = useState(true)
    const [refreshing,     setRefreshing]     = useState(false)
    const [activeTab,      setActiveTab]      = useState<FilterTab>("semua")
    const [search,         setSearch]         = useState("")
    const [openMenu,       setOpenMenu]       = useState<string | null>(null)
    const pollingRef = useRef<NodeJS.Timeout | null>(null)

    // ── Fetch notifications ──
    const fetchNotifications = useCallback(async (silent = false) => {
        if (!silent) setLoading(true)
        else         setRefreshing(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push("/login"); return }

        const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100)

        setNotifications((data as Notification[]) ?? [])
        setLoading(false)
        setRefreshing(false)
    }, [router, supabase])

    // ── Realtime subscription ──
    useEffect(() => {
        fetchNotifications()

        const channel = supabase
        .channel("notifications-realtime")
        .on("postgres_changes", {
            event: "INSERT",
            schema: "public",
            table: "notifications",
        }, (payload) => {
            setNotifications(prev => [payload.new as Notification, ...prev])
        })
        .subscribe()

        pollingRef.current = setInterval(() => fetchNotifications(true), 30000)

        return () => {
        supabase.removeChannel(channel)
        if (pollingRef.current) clearInterval(pollingRef.current)
        }
    }, [fetchNotifications, supabase])

    // ── Mark as read ──
    const markRead = async (id: string) => {
        await supabase.from("notifications").update({ is_read: true }).eq("id", id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    }

    // ── Mark all read ──
    const markAllRead = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false)
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    }

    // ── Delete notification ──
    const deleteNotif = async (id: string) => {
        await supabase.from("notifications").delete().eq("id", id)
        setNotifications(prev => prev.filter(n => n.id !== id))
        setOpenMenu(null)
    }

    // ── Filtering ──
    const filtered = notifications.filter(n => {
        const cfg = TYPE_CONFIG[n.type]
        const matchTab    = activeTab === "semua" || cfg?.category === activeTab
        const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase())
        return matchTab && matchSearch
    })

    const unreadCount = notifications.filter(n => !n.is_read).length
    const tabCounts: Record<FilterTab, number> = {
        semua:      notifications.length,
        pesanan:    notifications.filter(n => TYPE_CONFIG[n.type]?.category === "pesanan").length,
        stok:       notifications.filter(n => TYPE_CONFIG[n.type]?.category === "stok").length,
        pembayaran: notifications.filter(n => TYPE_CONFIG[n.type]?.category === "pembayaran").length,
        ulasan:     notifications.filter(n => TYPE_CONFIG[n.type]?.category === "ulasan").length,
        chat:       notifications.filter(n => TYPE_CONFIG[n.type]?.category === "chat").length,
    }

    return (
        <main className="min-h-screen bg-[#F5F5F5] pb-20">
        {/* ── Topbar ── */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                
                {/* Tombol Kembali (Back Button) di Kiri Atas */}
                <button
                    onClick={() => router.back()}
                    className="p-1.5 mr-1 hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-lg transition-all"
                    title="Kembali ke halaman sebelumnya"
                >
                    <ArrowLeft size={16} />
                </button>

                <LayoutDashboard size={13} />
                <Link href="/admin/dashboard" className="hover:text-gray-600 transition-colors">Dashboard</Link>
                <ChevronRight size={13} />
                <span className="text-gray-700 font-semibold">Notifikasi</span>
                </div>
                <div className="flex items-center gap-2">
                <button
                    onClick={() => fetchNotifications(true)}
                    disabled={refreshing}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                    title="Refresh"
                >
                    <RefreshCw size={15} className={refreshing ? "animate-spin text-[#6EB8BB]" : ""} />
                </button>
                <Link href="/admin/pengaturan" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                    <Settings size={15} />
                </Link>
                </div>
            </div>
            </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-5">
            {/* ── Header ── */}
            <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
                <p className="text-xs font-semibold text-[#6EB8BB] uppercase tracking-widest mb-1">Pusat Aktivitas</p>
                <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
                {unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-red-500 text-white text-[11px] font-black rounded-full shadow-sm">
                    {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
                </div>
            </div>
            {unreadCount > 0 && (
                <button
                onClick={markAllRead}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
                >
                <CheckCheck size={14} /> Tandai Semua Dibaca
                </button>
            )}
            </div>

            {/* ── Summary cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
                { icon: ShoppingCart,  label: "Pesanan",    value: tabCounts.pesanan,    color: "text-blue-500",    bg: "bg-blue-50"    },
                { icon: Package,       label: "Stok",       value: tabCounts.stok,       color: "text-amber-500",   bg: "bg-amber-50"   },
                { icon: CreditCard,    label: "Pembayaran", value: tabCounts.pembayaran, color: "text-emerald-500", bg: "bg-emerald-50" },
                { icon: MessageCircle, label: "Chat & Ulasan", value: tabCounts.chat + tabCounts.ulasan, color: "text-purple-500", bg: "bg-purple-50" },
            ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon size={18} className={color} />
                </div>
                <div>
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                    <p className="text-xl font-black text-gray-900">{value}</p>
                </div>
                </div>
            ))}
            </div>

            {/* ── Main card ── */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Filter tabs */}
            <div className="flex items-center px-2 pt-3 border-b border-gray-100 overflow-x-auto scrollbar-none">
                {FILTER_TABS.map(t => (
                <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                    activeTab === t.key
                        ? "text-[#6EB8BB] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#6EB8BB] after:rounded-t-full"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                    {t.label}
                    {tabCounts[t.key] > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        activeTab === t.key ? "bg-[#E6F7F8] text-[#6EB8BB]" : "bg-gray-100 text-gray-400"
                    }`}>
                        {tabCounts[t.key]}
                    </span>
                    )}
                </button>
                ))}
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="relative max-w-sm">
                <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Cari notifikasi…"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] bg-white placeholder:text-gray-400"
                />
                {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <XCircle size={14} />
                    </button>
                )}
                </div>
            </div>

            {/* Notification list */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 size={28} className="animate-spin text-[#6EB8BB]" />
                <p className="text-sm text-gray-400">Memuat notifikasi…</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <Bell size={28} className="text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500">Tidak ada notifikasi</p>
                <p className="text-xs text-gray-400 mt-1">
                    {search ? `Tidak ada hasil untuk "${search}"` : "Semua aktivitas toko akan muncul di sini"}
                </p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                {filtered.map(n => {
                    const cfg  = TYPE_CONFIG[n.type] ?? TYPE_CONFIG["order_new"]
                    const Icon = cfg.icon
                    const destinationHref = n.link || cfg.fallbackHref

                    return (
                    <div
                        key={n.id}
                        onClick={() => !n.is_read && markRead(n.id)}
                        className={`relative flex items-start gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors cursor-pointer group ${
                        !n.is_read ? "bg-[#F0FAFB]" : ""
                        }`}
                    >
                        {/* Unread dot */}
                        {!n.is_read && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#6EB8BB]" />
                        )}

                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon size={18} className={cfg.iconColor} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-bold ${n.is_read ? "text-gray-700" : "text-gray-900"}`}>
                                {n.title}
                            </p>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${cfg.badge}`}>
                                {cfg.category.toUpperCase()}
                            </span>
                            </div>
                            <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{timeAgo(n.created_at)}</span>
                        </div>

                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>

                        {/* Metadata chips */}
                        {n.metadata && Object.keys(n.metadata).length > 0 && (
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {n.metadata.order_number && (
                                <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                #{n.metadata.order_number}
                                </span>
                            )}
                            {n.metadata.total_amount && (
                                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                Rp {Number(n.metadata.total_amount).toLocaleString("id-ID")}
                                </span>
                            )}
                            {n.metadata.stock !== undefined && (
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                n.metadata.stock === 0 ? "text-red-500 bg-red-50" : "text-amber-600 bg-amber-50"
                                }`}>
                                Sisa {n.metadata.stock} unit
                                </span>
                            )}
                            {n.metadata.rating && (
                                <span className="text-[10px] font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-md">
                                ★ {n.metadata.rating}/5
                                </span>
                            )}
                            {n.metadata.payment_method && (
                                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md capitalize">
                                {n.metadata.payment_method}
                                </span>
                            )}
                            </div>
                        )}

                        {/* CTA */}
                        {cfg.ctaLabel && (
                            <Link
                            href={destinationHref}
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1 mt-2.5 text-[11px] font-bold text-[#6EB8BB] hover:text-[#5AA4A7] hover:underline transition-colors"
                            >
                            {cfg.ctaLabel} <ArrowRight size={10} />
                            </Link>
                        )}
                        </div>

                        {/* Context menu */}
                        <div className="relative shrink-0">
                        <button
                            onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === n.id ? null : n.id) }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <MoreHorizontal size={15} />
                        </button>
                        {openMenu === n.id && (
                            <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-lg z-10 py-1 min-w-[160px]">
                            {!n.is_read && (
                                <button
                                onClick={e => { e.stopPropagation(); markRead(n.id); setOpenMenu(null) }}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                <Eye size={13} /> Tandai Dibaca
                                </button>
                            )}
                            <button
                                onClick={e => { e.stopPropagation(); deleteNotif(n.id) }}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 size={13} /> Hapus
                            </button>
                            </div>
                        )}
                        </div>
                    </div>
                    )
                })}
                </div>
            )}

            {/* Footer info */}
            {filtered.length > 0 && (
                <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                    Menampilkan <span className="font-semibold text-gray-600">{filtered.length}</span> notifikasi
                    {unreadCount > 0 && <> · <span className="font-semibold text-[#6EB8BB]">{unreadCount} belum dibaca</span></>}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Realtime aktif
                </div>
                </div>
            )}
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-100 bg-white rounded-2xl">
            <div className="px-6 py-5 flex items-center justify-between">
                <div>
                <p className="text-sm font-extrabold tracking-tight text-gray-800">BARLING-GO</p>
                <p className="text-xs text-gray-400 mt-0.5">© 2026 Memberdayakan UMKM Barlingmascakep.</p>
                </div>
                <div className="flex gap-5 text-xs text-gray-400">
                {["Tentang Kami", "Pusat Bantuan", "Privasi", "Syarat & Ketentuan"].map(l => (
                    <a key={l} href="#" className="hover:text-gray-600 transition-colors">{l}</a>
                ))}
                </div>
            </div>
            </footer>
        </div>
        </main>
    )
    }