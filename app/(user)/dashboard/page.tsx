    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import UserSidebar from "@/components/user/UserSidebar"
    import {
    ShoppingBag, Bell, MapPin, Star, Heart,
    Sparkles, ArrowRight, ChevronRight, Package, Clock
    } from "lucide-react"

    const STATUS_COLOR: Record<string, string> = {
    pending:    "bg-amber-100 text-amber-700",
    paid:       "bg-blue-100 text-blue-700",
    processing: "bg-purple-100 text-purple-700",
    shipped:    "bg-cyan-100 text-cyan-700",
    delivered:  "bg-green-100 text-green-700",
    cancelled:  "bg-red-100 text-red-600",
    }
    const STATUS_LABEL: Record<string, string> = {
    pending: "Menunggu Bayar", paid: "Dibayar",
    processing: "Diproses", shipped: "Dikirim",
    delivered: "Selesai", cancelled: "Dibatalkan",
    }

    export default async function UserDashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, membership_tier, explorer_points, destinations_visited, role, preferences")
        .eq("id", user.id)
        .single()

    // Redirect seller/admin ke dashboard mereka
    if (profile?.role === "admin") redirect("/admin/dashboard")
    if (profile?.role === "super_admin") redirect("/super-admin/dashboard")

    const [
        { data: orders },
        { data: notifications },
        { count: unreadCount },
        { data: savedPlaces },
        { data: recentReviews },
    ] = await Promise.all([
        supabase.from("orders")
        .select("id, order_number, status, total_amount, created_at, order_items(product_name, product_image)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(4),
        supabase.from("notifications")
        .select("id, type, title, message, link, is_read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(4),
        supabase.from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false),
        supabase.from("saved_places")
        .select("id, created_at, contents(id, title, slug, cover_image, kabupaten, type)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3),
        supabase.from("content_reviews")
        .select("id, rating, body, created_at, contents(title, slug)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3),
    ])

    const firstName = profile?.full_name?.split(" ")[0] ?? "Penjelajah"
    const tier = profile?.membership_tier ?? "free"
    const tierConfig: Record<string, { label: string; color: string; bg: string }> = {
        free:     { label: "Tourist Explorer", color: "text-gray-600",  bg: "bg-gray-100" },
        explorer: { label: "Explorer",          color: "text-blue-600",  bg: "bg-blue-50" },
        pro:      { label: "Pro Explorer",      color: "text-amber-600", bg: "bg-amber-50" },
    }
    const tierInfo = tierConfig[tier]

    // Mark notifications as read (background)
    if (unreadCount && unreadCount > 0) {
        supabase.from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false)
        .then(() => {})
    }

    const PLACEHOLDER = "https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=300&q=70"

    return (
        <div className="min-h-screen bg-gray-50">
        <div className="h-16" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-6">
            <UserSidebar profile={profile} active="dashboard" />

            <div className="flex-1 min-w-0 space-y-5">

                {/* Greeting */}
                <div className="bg-gradient-to-r from-[#6EB8BB] to-[#4CAF50] rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
                <div className="absolute -right-4 -bottom-10 w-28 h-28 rounded-full bg-white/10" />
                <div className="relative z-10">
                    <p className="text-green-200 text-sm mb-1">Selamat datang kembali 👋</p>
                    <h1 className="text-2xl font-black text-white mb-1">{firstName}!</h1>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${tierInfo.bg} ${tierInfo.color}`}>
                    <Star size={11} className="fill-current" /> {tierInfo.label}
                    </span>
                </div>
                <div className="relative z-10 flex items-center gap-6 mt-5 pt-5 border-t border-white/20">
                    <div className="text-center">
                    <p className="text-2xl font-black text-white">{profile?.destinations_visited ?? 0}</p>
                    <p className="text-xs text-green-200">Destinasi</p>
                    </div>
                    <div className="w-px h-8 bg-white/20" />
                    <div className="text-center">
                    <p className="text-2xl font-black text-white">{(profile?.explorer_points ?? 0).toLocaleString("id-ID")}</p>
                    <p className="text-xs text-green-200">Poin</p>
                    </div>
                    <div className="w-px h-8 bg-white/20" />
                    <div className="text-center">
                    <p className="text-2xl font-black text-white">{orders?.length ?? 0}</p>
                    <p className="text-xs text-green-200">Pesanan</p>
                    </div>
                </div>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-4 gap-3">
                {[
                    { label: "Pesanan",     href: "/pesanan",       icon: ShoppingBag, color: "text-blue-600",   bg: "bg-blue-50" },
                    { label: "Tersimpan",   href: "/profil/saved",  icon: Heart,       color: "text-rose-500",   bg: "bg-rose-50" },
                    { label: "Notifikasi",  href: "#notif",         icon: Bell,        color: "text-amber-600",  bg: "bg-amber-50", badge: unreadCount },
                    { label: "AI Travel",   href: "/ai-assistant",  icon: Sparkles,    color: "text-green-600",  bg: "bg-green-50" },
                ].map((item) => {
                    const Icon = item.icon
                    return (
                    <Link key={item.label} href={item.href}
                        className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all relative group">
                        <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon size={18} className={item.color} />
                        </div>
                        <p className="text-xs font-semibold text-gray-700">{item.label}</p>
                        {(item as any).badge > 0 && (
                        <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {(item as any).badge}
                        </span>
                        )}
                    </Link>
                    )
                })}
                </div>

                {/* AI Travel Plan banner */}
                <Link href="/ai-assistant"
                className="flex items-center gap-4 bg-white border border-green-100 rounded-2xl p-4 hover:bg-green-50/50 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#6EB8BB] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Sparkles size={22} className="text-white" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">Rencanakan perjalanan dengan AI</p>
                    <p className="text-xs text-gray-400 mt-0.5">Tanyakan destinasi, kuliner, atau buat itinerary otomatis</p>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-[#6EB8BB] group-hover:translate-x-1 transition-all" />
                </Link>

                <div className="grid sm:grid-cols-2 gap-5">
                {/* Recent orders */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                        <Package size={15} className="text-[#6EB8BB]" />
                        <h2 className="text-sm font-bold text-gray-900">Pesanan Terbaru</h2>
                    </div>
                    <Link href="/pesanan" className="text-xs text-[#6EB8BB] hover:underline flex items-center gap-1">
                        Lihat semua <ChevronRight size={11} />
                    </Link>
                    </div>
                    {!orders || orders.length === 0 ? (
                    <div className="text-center py-10">
                        <ShoppingBag size={32} className="mx-auto text-gray-200 mb-3" />
                        <p className="text-sm text-gray-400 mb-3">Belum ada pesanan</p>
                        <Link href="/produk" className="text-xs font-semibold text-[#6EB8BB] hover:underline">Mulai Belanja →</Link>
                    </div>
                    ) : (
                    <div className="divide-y divide-gray-50">
                        {orders.map((order: any) => (
                        <Link key={order.id} href={`/pesanan/${order.id}`}
                            className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                            {order.order_items?.[0]?.product_image ? (
                            <img src={order.order_items[0].product_image} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                            ) : (
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                <Package size={14} className="text-gray-400" />
                            </div>
                            )}
                            <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{order.order_number}</p>
                            <p className="text-[11px] text-gray-400">{new Date(order.created_at).toLocaleDateString("id-ID")}</p>
                            </div>
                            <div className="text-right shrink-0">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                                {STATUS_LABEL[order.status] ?? order.status}
                            </span>
                            <p className="text-xs font-bold text-gray-800 mt-0.5">Rp {order.total_amount.toLocaleString("id-ID")}</p>
                            </div>
                        </Link>
                        ))}
                    </div>
                    )}
                </div>

                {/* Saved places */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                        <Heart size={15} className="text-rose-500" />
                        <h2 className="text-sm font-bold text-gray-900">Destinasi Tersimpan</h2>
                    </div>
                    <Link href="/profil/saved" className="text-xs text-[#6EB8BB] hover:underline flex items-center gap-1">
                        Lihat semua <ChevronRight size={11} />
                    </Link>
                    </div>
                    {!savedPlaces || savedPlaces.length === 0 ? (
                    <div className="text-center py-10">
                        <Heart size={32} className="mx-auto text-gray-200 mb-3" />
                        <p className="text-sm text-gray-400 mb-3">Belum ada destinasi tersimpan</p>
                        <Link href="/wisata" className="text-xs font-semibold text-[#6EB8BB] hover:underline">Jelajahi Wisata →</Link>
                    </div>
                    ) : (
                    <div className="divide-y divide-gray-50">
                        {savedPlaces.map((sp: any) => {
                        const dest = sp.contents
                        if (!dest) return null
                        const img = dest.cover_image
                            ? dest.cover_image.startsWith("http") ? dest.cover_image
                            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content-images/${dest.cover_image}`
                            : PLACEHOLDER
                        return (
                            <Link key={sp.id} href={`/wisata/${dest.slug}`}
                            className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                            <img src={img} alt={dest.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-800 truncate">{dest.title}</p>
                                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                <MapPin size={9} /> {dest.kabupaten}
                                </p>
                            </div>
                            <span className="text-[10px] font-semibold bg-green-50 text-[#6EB8BB] px-2 py-0.5 rounded-full capitalize">
                                {dest.type}
                            </span>
                            </Link>
                        )
                        })}
                    </div>
                    )}
                </div>
                </div>

                {/* Notifications */}
                <div id="notif" className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                    <Bell size={15} className="text-amber-500" />
                    <h2 className="text-sm font-bold text-gray-900">Notifikasi</h2>
                    </div>
                    {(unreadCount ?? 0) > 0 && (
                    <span className="text-xs font-bold bg-red-100 text-red-500 px-2.5 py-0.5 rounded-full">{unreadCount} baru</span>
                    )}
                </div>
                {!notifications || notifications.length === 0 ? (
                    <div className="text-center py-10">
                    <Bell size={32} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-sm text-gray-400">Belum ada notifikasi</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                    {notifications.map((n: any) => (
                        <Link key={n.id} href={n.link ?? "#"}
                        className={`flex gap-3 px-5 py-4 hover:bg-gray-50 transition-colors ${!n.is_read ? "bg-green-50/30" : ""}`}>
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.is_read ? "bg-[#6EB8BB]" : "bg-transparent"}`} />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                            <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                            <Clock size={10} /> {new Date(n.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                        </div>
                        </Link>
                    ))}
                    </div>
                )}
                </div>

                {/* Recent reviews */}
                {recentReviews && recentReviews.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                        <Star size={15} className="text-amber-500" />
                        <h2 className="text-sm font-bold text-gray-900">Ulasan Terakhirmu</h2>
                    </div>
                    <Link href="/profil/ulasan" className="text-xs text-[#6EB8BB] hover:underline flex items-center gap-1">
                        Lihat semua <ChevronRight size={11} />
                    </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                    {recentReviews.map((rev: any) => (
                        <Link key={rev.id} href={`/wisata/${rev.contents?.slug}`}
                        className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{rev.contents?.title}</p>
                            <div className="flex items-center gap-1 my-1">
                            {[1,2,3,4,5].map((s) => (
                                <Star key={s} size={11} className={s <= rev.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                            ))}
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1">{rev.body}</p>
                        </div>
                        <p className="text-[11px] text-gray-400 shrink-0">
                            {new Date(rev.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </p>
                        </Link>
                    ))}
                    </div>
                </div>
                )}

                {/* Upgrade banner */}
                {tier === "free" && (
                <div className="bg-gradient-to-r from-orange-500 to-[#FF6B35] rounded-2xl p-5 flex items-center justify-between gap-4">
                    <div>
                    <p className="text-sm font-bold text-white mb-0.5">Upgrade ke Pro Explorer</p>
                    <p className="text-xs text-orange-100">Dapatkan akses eksklusif, diskon lebih banyak, dan fitur premium</p>
                    </div>
                    <button className="shrink-0 px-5 py-2.5 bg-white text-orange-600 font-bold text-xs rounded-xl hover:bg-orange-50 transition-all">
                    Upgrade Sekarang
                    </button>
                </div>
                )}

            </div>
            </div>
        </div>
        </div>
    )
    }
