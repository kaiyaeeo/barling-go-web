    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import { Search, Filter, Bell, Star, MapPin, Package, ShoppingBag, Clock, BadgeCheck, ChevronDown, TrendingUp, Share2, Settings, ExternalLink } from "lucide-react"
    import Link from "next/link"

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

    const shopName  = profile?.umkm_name ?? profile?.full_name ?? "Toko Saya"
    const initials  = shopName.slice(0, 2).toUpperCase()
    const logoUrl   = profile?.umkm_logo
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.umkm_logo}`
        : null

    const avgRating = products && products.length
        ? (products.reduce((sum: number, p: any) => sum + (Number(p.rating) || 0), 0) /
        (products.filter((p: any) => p.rating > 0).length || 1))
        : 0
    const totalSold = products?.reduce((sum: number, p: any) => sum + (p.total_sold || 0), 0) ?? 0

    function getPrice(p: any) {
        const price = p.discount_price ?? p.price
        return `Rp ${Number(price).toLocaleString("id-ID")}`
    }

    const PLACEHOLDER   = "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&q=70"
    const COVER_URL     = "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1400&q=80"
    const isPremium     = (profile?.promo_package || "REGULER").toUpperCase() !== "REGULER"

    const TABS = ["Semua Produk", "Terlaris", "Promo", "Terbaru", "Unggulan"]

    return (
        <main className="min-h-screen bg-[#F5F5F5]">

        {/* ── Topbar ── */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 bg-white sticky top-0 z-20 shadow-sm">
            <nav className="flex items-center gap-1.5 text-sm text-gray-400">
            <Link href="/admin/dashboard" className="hover:text-gray-600 transition-colors">Dashboard</Link>
            <span className="text-gray-300">›</span>
            <span className="text-gray-700 font-semibold">Etalase Toko</span>
            </nav>
            <div className="flex items-center gap-2">
            <Link
                href={`/toko/${user.id}`}
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all"
            >
                <ExternalLink size={12} /> Lihat Halaman Publik
            </Link>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all relative">
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-400 rounded-full" />
            </button>
            <Link href="/admin/pengaturan"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                <Settings size={16} />
            </Link>
            <Link href="/bantuan"
                className="px-4 py-2 bg-[#6EB8BB] text-white text-xs font-bold rounded-xl hover:bg-[#5AA4A7] active:scale-95 transition-all">
                Bantuan
            </Link>
            </div>
        </div>

        {/* ── Store hero ── */}
        <div className="bg-white border-b border-gray-100">

            {/* Cover photo */}
            <div className="relative h-44 sm:h-60 overflow-hidden">
            <img src={COVER_URL} alt="cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

            {/* Premium badge */}
            {isPremium && (
                <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-300 text-gray-900 text-[11px] font-black uppercase tracking-wider rounded-full shadow-lg">
                <Star size={11} className="fill-gray-900" /> Mitra {profile?.promo_package}
                </span>
            )}

            {/* Quick actions on cover */}
            <div className="absolute bottom-4 right-4 flex gap-2">
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold rounded-xl hover:bg-white/30 transition-all">
                <Share2 size={12} /> Bagikan
                </button>
                <Link href="/admin/pengaturan/toko"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold rounded-xl hover:bg-white/30 transition-all">
                <Settings size={12} /> Edit Profil
                </Link>
            </div>
            </div>

            {/* Store identity + stats */}
            <div className="px-5 sm:px-8 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-14 relative z-10">

                {/* Logo */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#6EB8BB] flex items-center justify-center text-white font-black text-3xl border-4 border-white shadow-xl shrink-0 overflow-hidden">
                {logoUrl
                    ? <img src={logoUrl} alt={shopName} className="w-full h-full object-cover" />
                    : <span>{initials}</span>
                }
                </div>

                {/* Name + meta */}
                <div className="flex-1 sm:pb-1 mt-2 sm:mt-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900">{shopName}</h1>
                    <BadgeCheck size={20} className="text-[#6EB8BB]" />
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full">
                    Aktif
                    </span>
                </div>

                {profile?.umkm_description && (
                    <p className="text-sm text-gray-500 mt-1 max-w-lg line-clamp-2 leading-relaxed">
                    {profile.umkm_description}
                    </p>
                )}

                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#E6F7F8] text-[#6EB8BB] text-[11px] font-semibold rounded-full">
                    <Clock size={10} /> Buka 08:00 – 17:00
                    </span>
                    {profile?.city && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-500 text-[11px] font-semibold rounded-full border border-gray-100">
                        <MapPin size={10} /> {profile.city}
                    </span>
                    )}
                    {profile?.postal_code && (
                    <span className="text-[11px] text-gray-400">{profile.postal_code}</span>
                    )}
                </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-0 bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden shrink-0 self-start sm:self-auto mt-1 sm:mt-0">
                {[
                    { value: totalProducts ?? 0,                   label: "Produk",  icon: Package },
                    { value: totalSold,                            label: "Terjual", icon: TrendingUp },
                    { value: avgRating > 0 ? avgRating.toFixed(1) : "—", label: "Rating", icon: Star },
                ].map(({ value, label, icon: Icon }, i) => (
                    <div key={label} className={`flex flex-col items-center px-5 py-3 ${i > 0 ? "border-l border-gray-200" : ""}`}>
                    <div className="flex items-center gap-1">
                        <p className="text-lg font-black text-gray-900">{value}</p>
                        {label === "Rating" && avgRating > 0 && (
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        )}
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">{label}</p>
                    </div>
                ))}
                </div>
            </div>
            </div>

            {/* Category / sort bar */}
            <div className="border-t border-gray-100 px-5 sm:px-8">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
                {TABS.map((tab, i) => (
                    <button
                    key={tab}
                    className={`shrink-0 px-4 py-3.5 text-sm font-semibold transition-all relative ${
                        i === 0
                        ? "text-[#6EB8BB] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#6EB8BB]"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                    >
                    {tab}
                    </button>
                ))}
                </div>
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 bg-white">
                    Urutkan <ChevronDown size={12} />
                </button>
                </div>
            </div>
            </div>
        </div>

        {/* ── Product section ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">

            {/* Search + filter toolbar */}
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
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6EB8BB] hover:bg-[#5AA4A7] active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-[#6EB8BB]/30"
                >
                + Tambah
                </Link>
            </div>
            </div>

            {/* Product grid */}
            {products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {products.map((p: any) => {
                const img = p.images?.[0]
                    ? p.images[0].startsWith("http")
                    ? p.images[0]
                    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${p.images[0]}`
                    : PLACEHOLDER
                const isBest     = p.total_sold >= 5
                const hasDiscount = p.discount_price && p.discount_price < p.price
                const discountPct = hasDiscount
                    ? Math.round(((p.price - p.discount_price) / p.price) * 100)
                    : 0

                return (
                    <Link
                    key={p.id}
                    href={`/produk/${p.slug}`}
                    className="group block bg-white rounded-2xl border border-gray-100 hover:border-[#6EB8BB]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                    >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <img
                        src={img}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {isBest && (
                            <span className="text-[10px] font-bold text-white bg-[#FF6B35] px-2 py-0.5 rounded-full shadow-sm">
                            🔥 Terlaris
                            </span>
                        )}
                        {hasDiscount && (
                            <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full shadow-sm">
                            -{discountPct}%
                            </span>
                        )}
                        {p.is_featured && !isBest && (
                            <span className="text-[10px] font-bold text-white bg-[#6EB8BB] px-2 py-0.5 rounded-full shadow-sm">
                            ⭐ Unggulan
                            </span>
                        )}
                        </div>

                        {/* Quick edit overlay (DIHAPUS ATRIBUT ONCLICK-NYA DI SINI) */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                        <Link
                            href={`/admin/produk/${p.id}/edit`}
                            className="px-4 py-1.5 bg-white text-gray-800 text-xs font-bold rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            ✏️ Edit Produk
                        </Link>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                        <h3 className="text-sm font-semibold text-gray-800 mb-1.5 group-hover:text-[#6EB8BB] transition-colors line-clamp-2 min-h-[2.5rem] leading-snug">
                        {p.name}
                        </h3>

                        <div className="flex items-baseline gap-1.5 flex-wrap">
                        <p className="text-sm font-black text-[#6EB8BB]">{getPrice(p)}</p>
                        {hasDiscount && (
                            <p className="text-[10px] text-gray-400 line-through">
                            Rp {Number(p.price).toLocaleString("id-ID")}
                            </p>
                        )}
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            {p.rating > 0 && (
                            <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                                <Star size={9} className="fill-amber-400" />
                                {Number(p.rating).toFixed(1)}
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
                )
                })}
            </div>
            ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 text-gray-400">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Package size={28} className="text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500">Belum ada produk aktif</p>
                <p className="text-xs text-gray-400 mt-1">Tambahkan produk pertama untuk mulai berjualan</p>
                <Link
                href="/admin/produk/tambah"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#6EB8BB] text-white text-sm font-bold rounded-xl hover:bg-[#5AA4A7] active:scale-95 transition-all"
                >
                + Tambah Produk
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
                Lihat Semua Produk ({totalProducts})
                </Link>
            </div>
            )}
        </div>

        {/* ── Footer ── */}
        <footer className="border-t border-gray-100 bg-white mt-6">
            <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
            <div>
                <p className="text-sm font-extrabold tracking-tight text-gray-800">BARLING-GO</p>
                <p className="text-xs text-gray-400 mt-0.5">© 2026 Memberdayakan UMKM Barlingmascakep.</p>
            </div>
            <div className="flex gap-5 text-xs text-gray-400">
                {["Tentang Kami", "Pusat Bantuan", "Privasi", "Syarat & Ketentuan"].map((l) => (
                <a key={l} href="#" className="hover:text-gray-600 transition-colors">{l}</a>
                ))}
            </div>
            </div>
        </footer>
        </main>
    )
    }