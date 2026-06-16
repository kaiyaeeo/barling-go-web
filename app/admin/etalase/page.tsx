    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import {
    Search, Filter, Star, MapPin, Package, ShoppingBag,
    Clock, BadgeCheck, ChevronDown, TrendingUp, Share2, Settings,
    ExternalLink, Eye, Crown, LayoutDashboard, ChevronRight, Plus
    } from "lucide-react"
    import Link from "next/link"
    import NotificationBell from "@/components/admin/NotificationBell"

    export default async function AdminEtalasePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const [{ data: profile }, { data: products }, { count: totalProducts }] = await Promise.all([
        supabase.from("profiles")
        .select("full_name, umkm_name, umkm_logo, umkm_description, city, postal_code, promo_package")
        .eq("id", user.id).single(),
        supabase.from("products")
        .select("id, name, slug, price, discount_price, images, rating, total_sold, is_active, is_featured")
        .eq("seller_id", user.id)
        .eq("is_active", true)
        .order("total_sold", { ascending: false })
        .limit(9),
        supabase.from("products")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .eq("is_active", true),
    ])

    const shopName      = profile?.umkm_name ?? profile?.full_name ?? "Toko Saya"
    const initials      = shopName.slice(0, 2).toUpperCase()
    const logoUrl       = profile?.umkm_logo
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.umkm_logo}`
        : null
    const avgRating     = products && products.length
        ? (products.reduce((sum: number, p: any) => sum + (Number(p.rating) || 0), 0) /
        (products.filter((p: any) => p.rating > 0).length || 1))
        : 0
    const totalSold     = products?.reduce((sum: number, p: any) => sum + (p.total_sold || 0), 0) ?? 0
    const featuredCount = products?.filter((p: any) => p.is_featured).length ?? 0

    function getPrice(p: any) {
        const price = p.discount_price ?? p.price
        return `Rp ${Number(price).toLocaleString("id-ID")}`
    }

    const PLACEHOLDER = "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&q=70"
    const isPremium   = (profile?.promo_package || "REGULER").toUpperCase() !== "REGULER"

    const TABS = ["Semua Produk", "Terlaris", "Promo", "Terbaru", "Unggulan"]

    return (
        <main className="min-h-screen bg-[#F5F5F5]">

        {/* ===== STICKY TOP NAV ===== */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                <LayoutDashboard size={13} />
                <Link href="/admin/dashboard" className="hover:text-gray-600 transition-colors">Dashboard</Link>
                <ChevronRight size={13} />
                <span className="text-gray-700 font-semibold">Etalase Toko</span>
                </div>
                <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#6EB8BB]/10 border border-[#6EB8BB]/20 text-[#5AA4A7] rounded-xl text-xs font-semibold">
                    <Eye size={13} />
                    <span>Mode Pratinjau — tampilan ini sama seperti yang dilihat pengunjung</span>
                </div>
                <Link
                    href={`/toko/${user.id}`}
                    target="_blank"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                    <ExternalLink size={12} /> Halaman Publik
                </Link>
                
                {/* Komponen Lonceng Notifikasi Realtime dipasang di sini */}
                <NotificationBell />

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

        {/* ===== STORE IDENTITY (no cover photo) ===== */}
        <div className="bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">

                {/* Logo */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#6EB8BB] flex items-center justify-center text-white font-black text-2xl border border-gray-100 shadow-md shrink-0 overflow-hidden">
                {logoUrl
                    ? <img src={logoUrl} alt={shopName} className="w-full h-full object-cover" />
                    : <span>{initials}</span>
                }
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900">{shopName}</h1>
                    <BadgeCheck size={19} className="text-[#6EB8BB] shrink-0" />
                    {isPremium && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-300 text-gray-900 text-[10px] font-black rounded-full">
                        <Crown size={10} className="fill-gray-900" /> {profile?.promo_package}
                    </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full">Aktif</span>
                </div>
                {profile?.umkm_description && (
                    <p className="text-sm text-gray-500 mt-1 max-w-lg line-clamp-2 leading-relaxed">{profile.umkm_description}</p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#E6F7F8] text-[#6EB8BB] text-[11px] font-semibold rounded-full">
                    <Clock size={10} /> Buka 08:00 – 17:00
                    </span>
                    {profile?.city && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-500 text-[11px] font-semibold rounded-full border border-gray-100">
                        <MapPin size={10} /> {profile.city}
                        {profile?.postal_code && <span className="text-gray-400 ml-0.5">{profile.postal_code}</span>}
                    </span>
                    )}
                </div>
                </div>

                {/* Stats + actions */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                {/* Quick actions */}
                <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 bg-white transition-all">
                    <Share2 size={12} /> Bagikan
                    </button>
                    <Link
                    href="/admin/pengaturan/toko"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 bg-white transition-all"
                    >
                    <Settings size={12} /> Edit Profil
                    </Link>
                </div>

                {/* Stats */}
                <div className="flex items-stretch bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden divide-x divide-gray-100">
                    {[
                    { value: totalProducts ?? 0,                          label: "Produk",   icon: Package,     color: "text-[#6EB8BB]"   },
                    { value: totalSold,                                   label: "Terjual",  icon: ShoppingBag, color: "text-purple-500"  },
                    { value: avgRating > 0 ? avgRating.toFixed(1) : "—",  label: "Rating",   icon: Star,        color: "text-amber-500"   },
                    { value: featuredCount,                               label: "Unggulan", icon: Crown,       color: "text-emerald-500" },
                    ].map(({ value, label, icon: Icon, color }) => (
                    <div key={label} className="flex flex-col items-center justify-center px-4 py-2.5 gap-0.5">
                        <div className="flex items-center gap-1">
                        <Icon size={11} className={`${color} shrink-0`} />
                        <p className="text-sm font-black text-gray-900">{value}</p>
                        </div>
                        <p className="text-[9px] text-gray-400 font-medium">{label}</p>
                    </div>
                    ))}
                </div>
                </div>
            </div>

            {/* Tab bar */}
            <div className="flex items-center justify-between border-t border-gray-100 mt-5">
                <div className="flex items-center overflow-x-auto scrollbar-hide -mb-px">
                {TABS.map((tab, i) => (
                    <button
                    key={tab}
                    className={`shrink-0 px-4 py-3.5 text-sm font-semibold transition-all border-b-2 ${
                        i === 0
                        ? "text-[#6EB8BB] border-[#6EB8BB]"
                        : "text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-200"
                    }`}
                    >
                    {tab}
                    </button>
                ))}
                </div>
                <div className="hidden sm:flex items-center gap-2 shrink-0 pl-4">
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 bg-white transition-all">
                    Urutkan <ChevronDown size={11} />
                </button>
                <Link
                    href="/admin/produk/tambah"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white text-xs font-bold rounded-xl transition-all"
                >
                    <Plus size={12} /> Tambah Produk
                </Link>
                </div>
            </div>
            </div>
        </div>

        {/* ===== PRODUCT SECTION ===== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
                <h2 className="text-base font-bold text-gray-900">Produk Aktif</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                Menampilkan <span className="font-semibold text-gray-600">{products?.length ?? 0}</span> dari{" "}
                <span className="font-semibold text-gray-600">{totalProducts ?? 0}</span> produk
                </p>
            </div>
            <div className="flex items-center gap-2">
                <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    placeholder="Cari di toko ini…"
                    className="pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] w-44 bg-white placeholder:text-gray-400"
                />
                </div>
                <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-white transition-all bg-white">
                <Filter size={13} /> Filter
                </button>
                <Link
                href="/admin/produk/tambah"
                className="sm:hidden inline-flex items-center gap-1.5 px-4 py-2 bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white text-sm font-bold rounded-xl transition-all"
                >
                + Tambah
                </Link>
            </div>
            </div>

            {/* Grid */}
            {products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {products.map((p: any) => {
                const img = p.images?.[0]
                    ? p.images[0].startsWith("http") ? p.images[0]
                    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${p.images[0]}`
                    : PLACEHOLDER
                const isBest      = p.total_sold >= 5
                const hasDiscount = p.discount_price && p.discount_price < p.price
                const discountPct = hasDiscount
                    ? Math.round(((p.price - p.discount_price) / p.price) * 100)
                    : 0

                    return (
                    <div
                    key={p.id}
                    className="group relative bg-white rounded-2xl border border-gray-100 hover:border-[#6EB8BB]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                    >
                    {/* 1. Tautan Utama (Gambar & Info Produk) */}
                    <Link href={`/produk/${p.slug}`} className="block">
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <img
                            src={img} alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {isBest && (
                            <span className="text-[10px] font-bold text-white bg-[#FF6B35] px-2 py-0.5 rounded-full shadow-sm">🔥 Terlaris</span>
                            )}
                            {hasDiscount && (
                            <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full shadow-sm">-{discountPct}%</span>
                            )}
                            {p.is_featured && !isBest && (
                            <span className="text-[10px] font-bold text-white bg-[#6EB8BB] px-2 py-0.5 rounded-full shadow-sm">⭐ Unggulan</span>
                            )}
                        </div>
                        </div>

                        <div className="p-3">
                        <h3 className="text-sm font-semibold text-gray-800 mb-1.5 group-hover:text-[#6EB8BB] transition-colors line-clamp-2 min-h-[2.5rem] leading-snug">
                            {p.name}
                        </h3>
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                            <p className="text-sm font-black text-[#6EB8BB]">{getPrice(p)}</p>
                            {hasDiscount && (
                            <p className="text-[10px] text-gray-400 line-through">Rp {Number(p.price).toLocaleString("id-ID")}</p>
                            )}
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            {p.rating > 0 && (
                                <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                                <Star size={9} className="fill-amber-400" /> {Number(p.rating).toFixed(1)}
                                </span>
                            )}
                            {p.total_sold > 0 && (
                                <span className="flex items-center gap-0.5">
                                <ShoppingBag size={9} /> {p.total_sold}
                                </span>
                            )}
                            </div>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                            Aktif
                            </span>
                        </div>
                        </div>
                    </Link>

                    {/* 2. Tombol Edit (Tautan Terpisah yang muncul saat hover) */}
                    {/* pointer-events-none agar tidak menghalangi hover kartu, tapi pointer-events-auto di tombolnya */}
                    <div className="absolute inset-x-0 top-0 aspect-square bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 pointer-events-none">
                        <Link
                        href={`/admin/produk/${p.id}/edit`}
                        className="px-4 py-1.5 bg-white text-gray-800 text-xs font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-md pointer-events-auto"
                        >
                        ✏️ Edit Produk
                        </Link>
                    </div>
                    </div>
                )

                })}
            </div>
            ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Package size={28} className="text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500">Belum ada produk aktif</p>
                <p className="text-xs text-gray-400 mt-1">Tambahkan produk pertama untuk mulai berjualan</p>
                <Link
                href="/admin/produk/tambah"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#6EB8BB] text-white text-sm font-bold rounded-xl hover:bg-[#5AA4A7] active:scale-95 transition-all"
                >
                <Plus size={15} /> Tambah Produk
                </Link>
            </div>
            )}

            {/* Load more */}
            {products && totalProducts && totalProducts > products.length && (
            <div className="flex justify-center pt-2">
                <Link
                href="/admin/produk"
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-white hover:border-gray-300 bg-white transition-all"
                >
                Lihat Semua Produk ({totalProducts}) <TrendingUp size={14} />
                </Link>
            </div>
            )}
        </div>
        </main>
    )
    }