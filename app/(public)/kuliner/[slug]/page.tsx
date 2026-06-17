    import { createClient } from "@/lib/supabase/server"
    import { notFound } from "next/navigation"
    import Link from "next/link"
    import Navbar from "@/components/layout/navbar"
    import SavePlaceButton from "@/components/wisata/SavePlaceButton"
    import ReviewForm from "@/components/wisata/ReviewForm"
    import {
    MapPin, Clock, Phone, Star, Share2, Sparkles, ChevronRight,
    MessageSquare, BadgeCheck, UtensilsCrossed, Eye, ThumbsUp
    } from "lucide-react"

    const PLACEHOLDER = "https://images.unsplash.com/photo-1562802378-063ec186a863?w=1200&q=80"

    export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase  = await createClient()
    const { data }  = await supabase.from("contents").select("title,description").eq("slug", slug).single()
    return { title: data ? `${data.title} — Barling-GO` : "Kuliner", description: data?.description ?? "" }
    }

    export default async function KulinerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase  = await createClient()

    const { data: item } = await supabase
        .from("contents")
        .select("*")
        .eq("slug", slug)
        .eq("type", "kuliner")
        .eq("is_published", true)
        .single()

    if (!item) notFound()

    const { data: reviews } = await supabase
        .from("content_reviews")
        .select("id, rating, body, created_at, profiles(full_name, avatar_url)")
        .eq("content_id", item.id)
        .order("created_at", { ascending: false })
        .limit(10)

    const { data: { user } } = await supabase.auth.getUser()
    let isSaved = false
    if (user) {
        const { data: saved } = await supabase
        .from("saved_places").select("id").eq("user_id", user.id).eq("content_id", item.id).single()
        isSaved = !!saved
    }

    const { data: related } = await supabase
        .from("contents")
        .select("id,title,slug,cover_image,kabupaten,ticket_price_min,ticket_price_max,rating")
        .eq("type", "kuliner").eq("is_published", true)
        .eq("kabupaten", item.kabupaten ?? "")
        .neq("id", item.id)
        .limit(4)

    const imgSrc = item.cover_image
        ? item.cover_image.startsWith("http") ? item.cover_image
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content-images/${item.cover_image}`
        : PLACEHOLDER

    function timeAgo(dateStr: string) {
        const diff = Date.now() - new Date(dateStr).getTime()
        const days = Math.floor(diff / 86400000)
        if (days === 0) return "Hari ini"
        if (days < 7) return `${days} hari yang lalu`
        if (days < 30) return `${Math.floor(days / 7)} minggu yang lalu`
        return `${Math.floor(days / 30)} bulan yang lalu`
    }

    const hasPrice  = item.ticket_price_min > 0 || item.ticket_price_max > 0
    const avgRating = reviews?.length
        ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1)
        : item.rating > 0 ? Number(item.rating).toFixed(1) : null

    // Rating distribution
    const ratingDist = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews?.filter((r: any) => r.rating === star).length ?? 0,
    }))

    const AVATAR_COLORS = [
        "bg-orange-100 text-orange-700",
        "bg-blue-100 text-blue-700",
        "bg-[#E6F7F8] text-[#6EB8BB]",
        "bg-purple-100 text-purple-700",
        "bg-rose-100 text-rose-700",
    ]

    return (
        <>
        <Navbar />
        <main className="min-h-screen bg-gray-50/60 pt-16">

            {/* ===== HERO ===== */}
            <div className="relative h-72 sm:h-96 overflow-hidden">
            <img src={imgSrc} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/5" />

            {/* Breadcrumb + title overlay */}
            <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-8 max-w-7xl mx-auto">
                <nav className="flex items-center gap-1.5 text-xs text-white/60 mb-3 flex-wrap">
                <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
                <ChevronRight size={11} />
                <Link href="/kuliner" className="hover:text-white transition-colors">Kuliner</Link>
                <ChevronRight size={11} />
                <span className="text-white/90">{item.title}</span>
                </nav>
                <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight drop-shadow-lg">{item.title}</h1>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/80 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                    <UtensilsCrossed size={11} /> Kuliner
                </span>
                {item.kabupaten && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-white/20">
                    <MapPin size={11} /> {item.kabupaten}
                    </span>
                )}
                {avgRating && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/80 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                    <Star size={11} className="fill-white" /> {avgRating} ({item.review_count ?? 0} ulasan)
                    </span>
                )}
                {item.view_count > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 backdrop-blur-sm text-white/80 text-xs font-semibold rounded-full">
                    <Eye size={11} /> {item.view_count.toLocaleString("id-ID")} dilihat
                    </span>
                )}
                </div>
            </div>
            </div>

            {/* ===== CONTENT ===== */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid lg:grid-cols-3 gap-7">

                {/* ── LEFT ── */}
                <div className="lg:col-span-2 space-y-6">

                {/* Description card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                        <UtensilsCrossed size={15} className="text-orange-500" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900">Tentang Tempat Ini</h2>
                    </div>
                    <p className="text-gray-600 text-[15px] leading-relaxed">{item.description}</p>
                    {item.body && (
                    <div className="pt-3 border-t border-gray-100 text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                        {item.body}
                    </div>
                    )}

                    {/* Tags */}
                    {item.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                        {item.tags.map((tag: string) => (
                        <span key={tag} className="text-xs font-semibold text-[#6EB8BB] bg-[#E6F7F8] border border-[#C5EAE9] px-2.5 py-1 rounded-full capitalize">
                            #{tag}
                        </span>
                        ))}
                    </div>
                    )}
                </div>

                {/* Reviews card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                        <MessageSquare size={15} className="text-amber-500" />
                        </div>
                        <div>
                        <h2 className="text-sm font-bold text-gray-900">Ulasan Pengunjung</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">{reviews?.length ?? 0} ulasan · rata-rata {avgRating ?? "—"}/5</p>
                        </div>
                    </div>
                    {user && (
                        <a href="#review-form" className="text-xs font-bold text-[#6EB8BB] border border-[#6EB8BB]/30 px-3.5 py-2 rounded-xl hover:bg-[#E6F7F8] transition-all">
                        + Tulis Ulasan
                        </a>
                    )}
                    </div>

                    {/* Rating summary */}
                    {avgRating && reviews && reviews.length > 0 && (
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-6 flex-wrap">
                        <div className="text-center">
                        <p className="text-4xl font-black text-gray-900">{avgRating}</p>
                        <div className="flex items-center gap-0.5 justify-center my-1">
                            {[1,2,3,4,5].map(s => (
                            <Star key={s} size={13} className={parseFloat(avgRating) >= s ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                            ))}
                        </div>
                        <p className="text-[11px] text-gray-400">{reviews.length} ulasan</p>
                        </div>
                        <div className="flex-1 space-y-1.5 min-w-[160px]">
                        {ratingDist.map(({ star, count }) => {
                            const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0
                            return (
                            <div key={star} className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-gray-400 w-3">{star}</span>
                                <Star size={10} className="fill-amber-400 text-amber-400 shrink-0" />
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-[11px] text-gray-400 w-5 text-right">{count}</span>
                            </div>
                            )
                        })}
                        </div>
                    </div>
                    )}

                    {/* Review list */}
                    {!reviews || reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                        <MessageSquare size={32} className="opacity-20 mb-3" />
                        <p className="text-sm font-medium text-gray-500">Belum ada ulasan.</p>
                        <p className="text-xs text-gray-400 mt-1">Jadilah yang pertama memberikan ulasan!</p>
                    </div>
                    ) : (
                    <div className="divide-y divide-gray-50">
                        {reviews.map((rev: any) => {
                        const name     = rev.profiles?.full_name ?? "Pengunjung"
                        const initials = name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
                        const color    = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
                        return (
                            <div key={rev.id} className="px-6 py-5 hover:bg-gray-50/40 transition-colors">
                            <div className="flex items-start gap-3">
                                {rev.profiles?.avatar_url ? (
                                <img src={rev.profiles.avatar_url} alt={name} className="w-9 h-9 rounded-xl object-cover shrink-0 ring-1 ring-gray-100" />
                                ) : (
                                <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center font-bold text-sm shrink-0`}>{initials}</div>
                                )}
                                <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                                    <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-bold text-gray-800">{name}</p>
                                    <BadgeCheck size={13} className="text-[#6EB8BB]" />
                                    </div>
                                    <p className="text-[11px] text-gray-400">{timeAgo(rev.created_at)}</p>
                                </div>
                                <div className="flex items-center gap-0.5 mb-2">
                                    {[1,2,3,4,5].map(s => (
                                    <Star key={s} size={12} className={s <= rev.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">"{rev.body}"</p>
                                </div>
                            </div>
                            </div>
                        )
                        })}
                    </div>
                    )}

                    {/* Review form */}
                    {user && (
                    <div id="review-form" className="px-6 py-5 border-t border-gray-100 bg-gray-50/50">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Tulis Ulasan Anda</h3>
                        <ReviewForm contentId={item.id} />
                    </div>
                    )}

                    {!user && (
                    <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50 text-center">
                        <p className="text-sm text-gray-500 mb-3">Login untuk menulis ulasan</p>
                        <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6EB8BB] text-white text-sm font-bold rounded-xl hover:bg-[#5AA4A7] transition-all">
                        Login Sekarang
                        </Link>
                    </div>
                    )}
                </div>

                {/* Related */}
                {related && related.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-gray-900">Kuliner Lain di {item.kabupaten}</h2>
                        <Link href={`/kuliner?kabupaten=${item.kabupaten}`} className="text-xs font-semibold text-[#6EB8BB] hover:underline flex items-center gap-1">
                        Lihat semua <ChevronRight size={12} />
                        </Link>
                    </div>
                    <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {related.map((r: any) => {
                        const rImg = r.cover_image
                            ? r.cover_image.startsWith("http") ? r.cover_image
                            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content-images/${r.cover_image}`
                            : PLACEHOLDER
                        return (
                            <Link key={r.id} href={`/kuliner/${r.slug}`} className="group block">
                            <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-gray-100">
                                <img src={rImg} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-[#6EB8BB] transition-colors">{r.title}</p>
                            {r.rating > 0 && (
                                <span className="text-[10px] text-amber-500 flex items-center gap-0.5 mt-0.5">
                                <Star size={10} className="fill-amber-400" /> {Number(r.rating).toFixed(1)}
                                </span>
                            )}
                            </Link>
                        )
                        })}
                    </div>
                    </div>
                )}
                </div>

                {/* ── RIGHT SIDEBAR ── */}
                <div className="space-y-4">

                {/* Info + CTA sticky card */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden sticky top-24">
                    {/* Price header */}
                    {hasPrice && (
                    <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-br from-orange-50 to-white">
                        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Kisaran Harga</p>
                        <p className="text-2xl font-black text-gray-900">
                        Rp {item.ticket_price_min.toLocaleString("id-ID")}
                        {item.ticket_price_max > item.ticket_price_min && (
                            <span className="text-base font-semibold text-gray-500"> – Rp {item.ticket_price_max.toLocaleString("id-ID")}</span>
                        )}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">Estimasi per orang / porsi</p>
                    </div>
                    )}

                    {/* Info fields */}
                    <div className="px-5 py-4 space-y-3.5">
                    {item.opening_hours && (
                        <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#E6F7F8] flex items-center justify-center shrink-0">
                            <Clock size={14} className="text-[#6EB8BB]" />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Jam Buka</p>
                            <p className="text-sm font-semibold text-gray-700">{item.opening_hours}</p>
                        </div>
                        </div>
                    )}
                    {item.phone && (
                        <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                            <Phone size={14} className="text-green-500" />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Kontak</p>
                            <p className="text-sm font-semibold text-gray-700">{item.phone}</p>
                        </div>
                        </div>
                    )}
                    {item.address && (
                        <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <MapPin size={14} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Alamat</p>
                            <p className="text-sm font-semibold text-gray-700 leading-relaxed">{item.address}</p>
                        </div>
                        </div>
                    )}
                    </div>

                    {/* CTA buttons */}
                    <div className="px-5 pb-5 space-y-2.5 border-t border-gray-100 pt-4">
                    {item.phone && (
                        <a
                        href={`https://wa.me/${item.phone.replace(/\D/g, "")}`}
                        target="_blank" rel="noopener noreferrer"
                        className="w-full py-3 bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                        >
                        <Phone size={15} /> Hubungi via WhatsApp
                        </a>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                        <SavePlaceButton contentId={item.id} isLoggedIn={!!user} initialSaved={isSaved} />
                        <button className="flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                        <Share2 size={14} /> Bagikan
                        </button>
                    </div>
                    </div>
                </div>

                {/* AI banner */}
                <Link
                    href={`/ai-assistant?q=Rekomendasi kuliner di ${item.kabupaten}`}
                    className="block bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-4 hover:shadow-md transition-all group"
                >
                    <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Sparkles size={18} className="text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-orange-700">Tanya AI Assistant</p>
                        <p className="text-xs text-gray-500 mt-0.5">Cari kuliner lain di {item.kabupaten}</p>
                    </div>
                    <ChevronRight size={14} className="text-orange-400 ml-auto group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                {/* Quick stats */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Statistik</p>
                    <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: "Ulasan",   value: reviews?.length ?? 0,     icon: MessageSquare, color: "text-blue-500",   bg: "bg-blue-50"   },
                        { label: "Dilihat",  value: item.view_count ?? 0,      icon: Eye,           color: "text-purple-500", bg: "bg-purple-50" },
                        { label: "Rating",   value: avgRating ? `${avgRating}★` : "—", icon: Star, color: "text-amber-500", bg: "bg-amber-50"  },
                        { label: "Simpan",   value: "—",                       icon: ThumbsUp,      color: "text-rose-500",   bg: "bg-rose-50"   },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                        <div key={label} className={`${bg} rounded-xl p-3 flex items-center gap-2`}>
                        <Icon size={14} className={`${color} shrink-0`} />
                        <div>
                            <p className="text-[10px] text-gray-400 font-medium">{label}</p>
                            <p className={`text-sm font-black ${color}`}>{value}</p>
                        </div>
                        </div>
                    ))}
                    </div>
                </div>
                </div>
            </div>
            </div>
        </main>
        </>
    )
    }