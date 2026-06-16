    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import UserSidebar from "@/components/user/UserSidebar"
    import { 
    Home, 
    Bell, 
    Settings, 
    ShoppingBag, 
    Heart, 
    Sparkles, 
    MapPin, 
    BellRing, 
    ArrowRight,
    ChevronRight,
    Calendar,
    Compass,
    CreditCard,
    CheckCircle2,
    Package
    } from "lucide-react"

    export default async function DashboardPengunjung() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) redirect("/login")

    // Fetch profil lengkap
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    // Fetch data pesanan terbaru untuk dashboard
    const { data: recentOrders } = await supabase
        .from("orders")
        .select(`
        id, order_number, status, total_amount, created_at,
        order_items(product_name, product_image, qty)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)

    const recentOrder = recentOrders?.[0]

    // Fetch data item tersimpan (wishlist) terbaru
    const { data: savedPlaces } = await supabase
        .from("saved_places")
        .select(`
        id, content_id,
        contents:content_id (id, title, slug, cover_image, type, kabupaten)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(2)

    // Hitung jumlah order & ulasan untuk statistik banner
    const { count: orderCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

    const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
        pending:    { label: "Menunggu Bayar", color: "text-amber-600", bg: "bg-amber-50" },
        paid:       { label: "Dibayar",       color: "text-blue-600", bg: "bg-blue-50" },
        processing: { label: "Diproses",      color: "text-purple-600", bg: "bg-purple-50" },
        packing:    { label: "Dikemas",       color: "text-indigo-600", bg: "bg-indigo-50" },
        shipped:    { label: "Dikirim",       color: "text-cyan-600", bg: "bg-cyan-50" },
        delivered:  { label: "Selesai",       color: "text-emerald-600", bg: "bg-emerald-50" },
        cancelled:  { label: "Dibatalkan",    color: "text-rose-600", bg: "bg-rose-50" },
    }

    // Waktu salam dinamis berdasarkan jam lokal
    const currentHour = new Date().getHours()
    const greeting = currentHour < 12 ? "Pagi" : currentHour < 15 ? "Siang" : currentHour < 18 ? "Sore" : "Malam"

    return (
        // ── LAYOUT UTAMA ──
        <div className="flex min-h-screen bg-[#F8FAFC] antialiased text-gray-800">
        
        {/* ── KIRI: SIDEBAR ── */}
        <div className="hidden md:block w-[280px] shrink-0 bg-white border-r border-gray-200 z-10">
            <UserSidebar profile={profile} active="dashboard" />
        </div>

        {/* ── KANAN: KONTEN UTAMA & TOPBAR ── */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

            {/* ── TOPBAR KHUSUS PELANGGAN ── */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm h-16 flex items-center justify-between px-6 lg:px-10 shrink-0">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold">
                <span className="text-gray-800">Dashboard Pengunjung</span>
            </div>
            <div className="flex items-center gap-3">
                <Link 
                href="/" 
                className="flex items-center gap-2 px-4 py-2 bg-[#6EB8BB]/10 hover:bg-[#6EB8BB]/20 text-[#6EB8BB] rounded-xl text-xs font-bold transition-all shadow-sm"
                >
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

            {/* ── ISI DASHBOARD ── */}
            <div className="p-6 lg:p-10 w-full max-w-7xl mx-auto space-y-6">

            {/* 1. Header Banner Premium (Gradasi Warna Brand, NO GREEN) */}
            <div className="bg-gradient-to-r from-[#6EB8BB] via-[#87C5C7] to-[#9FCCCE] rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden transition-all duration-300">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                
                {/* Ornamen Desain */}
                <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-xl" />
                <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-black/10 rounded-full blur-xl" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                    <p className="text-sm text-slate-100 mb-1 font-medium">Selamat {greeting},</p>
                    <h1 className="text-3xl md:text-4xl font-black mb-4">{profile?.full_name ?? "Pengguna"}</h1>
                    <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-sm border border-white/20">
                        <MapPin size={12} className="text-amber-300 fill-amber-300/10" /> 
                        {profile?.membership_tier === 'pro' ? 'Pro Explorer' : profile?.membership_tier === 'explorer' ? 'Explorer' : 'Tourist Explorer'}
                    </span>
                    {profile?.membership_tier === 'free' && (
                        <span className="text-xs text-slate-100 font-medium">· Upgrade untuk mendapatkan benefit eksklusif</span>
                    )}
                    </div>
                </div>
                
                {/* Stats in Banner */}
                <div className="flex items-center gap-6 bg-white/15 px-6 py-4 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner shrink-0">
                    <div className="text-center">
                    <p className="text-2xl font-black">{profile?.destinations_visited ?? 0}</p>
                    <p className="text-[10px] text-slate-100 uppercase tracking-widest mt-1">Destinasi</p>
                    </div>
                    <div className="w-px h-10 bg-white/20" />
                    <div className="text-center">
                    <p className="text-2xl font-black">{profile?.explorer_points ?? 0}</p>
                    <p className="text-[10px] text-slate-100 uppercase tracking-widest mt-1">Poin</p>
                    </div>
                    <div className="w-px h-10 bg-white/20" />
                    <div className="text-center">
                    <p className="text-2xl font-black">{orderCount ?? 0}</p>
                    <p className="text-[10px] text-slate-100 uppercase tracking-widest mt-1">Pesanan</p>
                    </div>
                </div>
                </div>

                {/* Progress bar */}
                {profile?.membership_tier !== 'pro' && (
                <div className="mt-8 relative z-10 bg-black/10 p-4 rounded-2xl border border-white/10 backdrop-blur-xs">
                    <div className="flex justify-between text-xs text-slate-50 font-bold mb-2.5">
                    <span>Progress ke tier berikutnya — {profile?.explorer_points ?? 0} / 500 poin</span>
                    <span>{Math.min(Math.round(((profile?.explorer_points ?? 0) / 500) * 100), 100)}%</span>
                    </div>
                    <div className="h-2.5 bg-black/30 rounded-full overflow-hidden shadow-inner">
                    <div 
                        className="h-full bg-gradient-to-r from-white/60 to-white rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${Math.min(Math.round(((profile?.explorer_points ?? 0) / 500) * 100), 100)}%` }}
                    />
                    </div>
                    <p className="text-[10px] text-slate-100 mt-2 font-medium">Kumpulkan {500 - (profile?.explorer_points ?? 0)} poin lagi untuk naik ke tingkat Explorer</p>
                </div>
                )}
            </div>

            {/* 2. Quick Actions (Corrected Wishlist Link) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                { icon: ShoppingBag, label: "Pesanan", color: "text-[#6EB8BB]", bg: "bg-[#6EB8BB]/10 border-[#6EB8BB]/20", link: "/pesanan" },
                { icon: Heart, label: "Tersimpan", color: "text-rose-500", bg: "bg-rose-50 border-rose-100", link: "/wishlist" },
                { icon: BellRing, label: "Notifikasi", color: "text-amber-500", bg: "bg-amber-50 border-amber-100", link: "#" },
                { icon: Sparkles, label: "AI Travel", color: "text-purple-600", bg: "bg-purple-50 border-purple-150", link: "#" },
                ].map((item) => (
                <Link href={item.link} key={item.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col items-center justify-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95 group">
                    <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center border group-hover:scale-110 transition-transform`}>
                    <item.icon size={20} className={item.color} />
                    </div>
                    <span className="text-xs font-black text-gray-700 uppercase tracking-wide">{item.label}</span>
                </Link>
                ))}
            </div>

            {/* 3. AI Banner (Brand Gradients, NO GREEN) */}
            <div className="bg-white border border-gray-150 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between shadow-xs hover:border-[#6EB8BB] transition-colors cursor-pointer group gap-4">
                <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6EB8BB] to-[#9FCCCE] flex items-center justify-center text-white shrink-0 shadow-md">
                    <Sparkles size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-gray-900 group-hover:text-[#6EB8BB] transition-colors">Rencanakan Perjalanan dengan AI</h3>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Buat itinerary liburan otomatis & tanyakan rekomendasi kuliner lokal terbaik di Banyumas Raya.</p>
                </div>
                </div>
                <span className="w-full sm:w-auto text-center px-6 py-3 bg-gray-50 group-hover:bg-[#6EB8BB]/10 text-gray-700 group-hover:text-[#6EB8BB] rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all">
                Coba Sekarang <ArrowRight size={16} />
                </span>
            </div>

            {/* 4. Two Columns Content (Supabase Dynamic Data Integration) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Pesanan Terbaru Card */}
                <div className="bg-white border border-gray-150 rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[300px]">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-[#6EB8BB]/10 rounded-lg"><ShoppingBag size={16} className="text-[#6EB8BB]" /></div>
                    <h3 className="text-sm font-black text-gray-900">Pesanan Terbaru</h3>
                    </div>
                    <Link href="/pesanan" className="text-xs font-bold text-gray-500 hover:text-[#6EB8BB] transition-colors">Semua &rsaquo;</Link>
                </div>
                
                <div className="flex-1 p-6 flex flex-col justify-center">
                    {recentOrder ? (
                    // Jika Ada data pesanan dari Supabase
                    <Link href={`/pesanan/${recentOrder.id}`} className="block group/item">
                        <div className="flex items-start gap-4 mb-4">
                        {recentOrder.order_items?.[0]?.product_image ? (
                            <img 
                            src={recentOrder.order_items[0].product_image} 
                            alt="" 
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100" 
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-350 shrink-0">
                            <Package size={22} />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            (STATUS_LABEL[recentOrder.status] ?? STATUS_LABEL.pending).bg
                            } ${(STATUS_LABEL[recentOrder.status] ?? STATUS_LABEL.pending).color}`}>
                            {(STATUS_LABEL[recentOrder.status] ?? STATUS_LABEL.pending).label}
                            </span>
                            
                            <h4 className="text-sm font-bold text-slate-800 truncate mt-2 group-hover/item:text-[#6EB8BB] transition-colors">
                            {recentOrder.order_items?.[0]?.product_name || "Produk Pembelian"}
                            </h4>
                            
                            {recentOrder.order_items.length > 1 && (
                            <p className="text-[10px] text-slate-400 font-semibold mt-1">
                                +{recentOrder.order_items.length - 1} produk lainnya
                            </p>
                            )}
                        </div>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                        <div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Total Transaksi</span>
                            <span className="text-sm font-black text-slate-900">Rp {recentOrder.total_amount.toLocaleString("id-ID")}</span>
                        </div>
                        <span className="text-[#6EB8BB] flex items-center gap-1">
                            Detail Pesanan <ChevronRight size={14} />
                        </span>
                        </div>
                    </Link>
                    ) : (
                    // Empty State jika data kosong
                    <div className="text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-300">
                        <ShoppingBag size={28} />
                        </div>
                        <p className="text-sm font-bold text-gray-700">Belum ada pesanan</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto leading-normal">Transaksi tiket wisata atau belanja produk kuliner Anda akan muncul di sini.</p>
                    </div>
                    )}
                </div>
                </div>

                {/* Tersimpan Card */}
                <div className="bg-white border border-gray-150 rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[300px]">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-rose-50 rounded-lg"><Heart size={16} className="text-rose-500" /></div>
                    <h3 className="text-sm font-black text-gray-900">Tersimpan</h3>
                    </div>
                    <Link href="/wishlist" className="text-xs font-bold text-gray-500 hover:text-[#6EB8BB] transition-colors">Semua &rsaquo;</Link>
                </div>
                
                <div className="flex-1 p-6 flex flex-col justify-center">
                    {savedPlaces && savedPlaces.length > 0 ? (
                    // Jika Ada data wishlist di Supabase
                    <div className="space-y-3.5">
                        {savedPlaces.map((item: any) => {
                        const content = item.contents
                        if (!content) return null
                        return (
                            <Link 
                            key={item.id} 
                            href={`/${content.type}/${content.slug}`} 
                            className="flex items-center justify-between gap-3 group/wish"
                            >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                                {content.cover_image ? (
                                    <img src={content.cover_image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                                    <Compass size={18} />
                                    </div>
                                )}
                                </div>
                                <div className="min-w-0">
                                <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                                    {content.type}
                                </span>
                                <h4 className="text-xs font-bold text-slate-800 truncate mt-1 group-hover/wish:text-[#6EB8BB] transition-colors">
                                    {content.title}
                                </h4>
                                </div>
                            </div>
                            <ChevronRight size={14} className="text-slate-300 group-hover/wish:text-slate-500 transition-colors" />
                            </Link>
                        )
                        })}
                    </div>
                    ) : (
                    // Empty State jika data kosong
                    <div className="text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-300">
                        <Heart size={28} />
                        </div>
                        <p className="text-sm font-bold text-gray-700">Belum ada destinasi tersimpan</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto leading-normal font-medium">Jelajahi keindahan Barling-GO dan simpan destinasi favorit Anda!</p>
                    </div>
                    )}
                </div>
                </div>

            </div>

            </div>
        </div>
        </div>
    )
    }
