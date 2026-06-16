    import { createClient } from "@/lib/supabase/server"
    import { notFound } from "next/navigation"
    import Link from "next/link"
    import {
    Star, MapPin, Clock, Phone, ChevronRight, Share2,
    Eye, Tag, TrendingUp, MessageCircle, Navigation,
    Ticket, Users, Info, Camera, Calendar
    } from "lucide-react"
    import WishlistButton from "@/components/ui/WishlistButton"

    export default async function DestinasiDetailPage({ params }: { params: { slug: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: content } = await supabase
        .from("contents")
        .select(`
        id, type, title, slug, description, body, cover_image,
        location, address, latitude, longitude, tags,
        view_count, ticket_price_min, ticket_price_max,
        opening_hours, phone, kabupaten, rating, review_count,
        created_at, updated_at,
        profiles!created_by(full_name, avatar_url)
        `)
        .eq("slug", params.slug)
        .eq("is_published", true)
        .single()

    if (!content) notFound()

    // Reviews
    const { data: reviews } = await supabase
        .from("content_reviews")
        .select(`
        id, rating, body, created_at,
        profiles!user_id(full_name, avatar_url)
        `)
        .eq("content_id", content.id)
        .order("created_at", { ascending: false })
        .limit(8)

    // Wishlist status
    let inWishlist = false
    if (user) {
        const { data: w } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("content_id", content.id)
        .single()
        inWishlist = !!w
    }

    // Konten terkait (kabupaten atau tipe sama)
    const { data: related } = await supabase
        .from("contents")
        .select("id, title, slug, cover_image, type, kabupaten, rating, view_count")
        .eq("is_published", true)
        .eq("type", content.type)
        .neq("id", content.id)
        .limit(4)

    const coverUrl = content.cover_image?.startsWith("http")
        ? content.cover_image
        : content.cover_image
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/covers/${content.cover_image}`
        : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80"

    const isFree  = !content.ticket_price_min || content.ticket_price_min === 0
    const typeLabel: Record<string, string> = {
        destinasi: "Destinasi Wisata",
        kuliner:   "Kuliner",
        artikel:   "Artikel",
        "oleh-oleh": "Oleh-oleh",
    }

    const avgRating = reviews?.length
        ? reviews.reduce((s: number, r: any) => s + (r.rating ?? 0), 0) / reviews.length
        : content.rating ?? 0

    return (
        <main className="min-h-screen bg-[#F5F5F5] antialiased text-gray-800">

        {/* ── BREADCRUMB ── */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center">
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <Link href="/" className="hover:text-[#6EB8BB] transition-colors flex items-center gap-1">Beranda</Link>
                <ChevronRight size={11} className="text-gray-300" />
                <Link href={`/${content.type}`} className="hover:text-[#6EB8BB] capitalize transition-colors">{typeLabel[content.type] ?? content.type}</Link>
                {content.kabupaten && <>
                <ChevronRight size={11} className="text-gray-300" />
                <span className="text-gray-500 hover:text-[#6EB8BB] cursor-pointer transition-colors">{content.kabupaten}</span>
                </>}
                <ChevronRight size={11} className="text-gray-300" />
                <span className="text-gray-900 font-bold truncate max-w-[160px] sm:max-w-xs">{content.title}</span>
            </nav>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">

            {/* ── HERO IMAGE + INFO ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

            {/* KIRI: Image + Description */}
            <div className="space-y-5">
                {/* Hero image */}
                <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-50 relative shadow-sm border border-gray-100 group">
                <img src={coverUrl} alt={content.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                
                {content.kabupaten && (
                    <span className="absolute bottom-5 left-5 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/90 backdrop-blur-md text-gray-900 text-xs font-black rounded-full shadow-sm">
                    <MapPin size={12} className="text-[#6EB8BB]" /> {content.kabupaten}
                    </span>
                )}
                <span className="absolute top-5 left-5 inline-flex items-center gap-1.5 px-3 py-1 bg-[#6EB8BB] text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
                    <Tag size={10} /> {typeLabel[content.type]}
                </span>
                </div>

                {/* Title + actions */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-snug tracking-tight flex-1">
                    {content.title}
                    </h1>
                    <div className="flex items-center gap-2 shrink-0 mt-1">
                    <WishlistButton contentId={content.id} isLoggedIn={!!user} initialSaved={inWishlist} />
                    <button className="w-12 h-12 rounded-xl flex items-center justify-center border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-[#6EB8BB] hover:bg-gray-50 transition-all bg-white shadow-sm active:scale-95">
                        <Share2 size={16} />
                    </button>
                    </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 flex-wrap pb-4 border-b border-gray-100">
                    {avgRating > 0 && (
                    <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(s => (
                        <Star key={s} size={14} className={s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                        ))}
                        <span className="text-sm font-black text-gray-800 ml-1">{avgRating.toFixed(1)}</span>
                        <span className="text-xs font-medium text-gray-400">({reviews?.length ?? 0} ulasan)</span>
                    </div>
                    )}
                    
                    {avgRating > 0 && content.view_count > 0 && <span className="w-1 h-1 rounded-full bg-gray-300" />}
                    
                    {content.view_count > 0 && (
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                        <Eye size={14} className="text-[#6EB8BB]" /> <span className="font-bold text-gray-800">{content.view_count.toLocaleString("id-ID")}</span> dilihat
                    </span>
                    )}
                </div>

                {/* Tags */}
                {content.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                    {content.tags.map((tag: string) => (
                        <span key={tag} className="text-[10px] font-black uppercase tracking-wider text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer border border-gray-200/60">
                        #{tag}
                        </span>
                    ))}
                    </div>
                )}

                {/* Description */}
                <div className="pt-2">
                    {content.description && (
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">{content.description}</p>
                    )}
                    {content.body && (
                    <div className="text-sm text-gray-700 leading-loose whitespace-pre-line mt-4">
                        {content.body}
                    </div>
                    )}
                </div>
                </div>
            </div>

            {/* KANAN: Info Card (Sticky) */}
            <div className="space-y-5 sticky top-24">

                {/* Tiket & Harga */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 shadow-sm">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <Ticket size={18} className="text-[#6EB8BB]" />
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Info Tiket Masuk</h2>
                </div>

                {isFree ? (
                    <div className="flex flex-col items-center text-center gap-1 p-5 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <span className="text-3xl font-black text-emerald-600">GRATIS</span>
                    <span className="text-xs text-emerald-600 font-bold">Terbuka Untuk Umum</span>
                    </div>
                ) : (
                    <div className="space-y-1.5 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Harga Tiket Mulai Dari</p>
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <p className="text-3xl font-black text-[#6EB8BB]">
                        Rp {Number(content.ticket_price_min).toLocaleString("id-ID")}
                        </p>
                        {content.ticket_price_max && content.ticket_price_max > content.ticket_price_min && (
                        <p className="text-sm font-bold text-gray-400">
                            – Rp {Number(content.ticket_price_max).toLocaleString("id-ID")}
                        </p>
                        )}
                    </div>
                    <p className="text-[10px] font-medium text-gray-400 pt-1">Per orang · Harga dapat berubah sewaktu-waktu</p>
                    </div>
                )}

                {/* Action CTA block */}
                <div className="flex flex-col gap-2.5 pt-2">
                    <button className="w-full py-3.5 rounded-xl text-sm font-black bg-gradient-to-r from-[#6EB8BB] to-[#87C5C7] hover:from-[#5ca3a6] hover:to-[#7ab3b5] text-white shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                    <Navigation size={16} /> Petunjuk Arah
                    </button>
                    <button className="w-full py-3.5 rounded-xl text-sm font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 bg-white transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                    <MessageCircle size={16} /> Tanya Informasi
                    </button>
                </div>
                </div>

                {/* Detail Info List */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <Info size={16} className="text-[#6EB8BB]" />
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Informasi Detail</h2>
                </div>

                <div className="space-y-4">
                    {content.address && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                        <MapPin size={14} className="text-gray-400" />
                        </div>
                        <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Alamat Lengkap</p>
                        <p className="text-xs font-semibold text-gray-700 mt-0.5 leading-relaxed">{content.address}</p>
                        </div>
                    </div>
                    )}
                    {content.opening_hours && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                        <Clock size={14} className="text-gray-400" />
                        </div>
                        <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Jam Buka</p>
                        <p className="text-xs font-semibold text-gray-700 mt-0.5">{content.opening_hours}</p>
                        </div>
                    </div>
                    )}
                    {content.phone && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#E6F7F8] flex items-center justify-center shrink-0 border border-[#6EB8BB]/20">
                        <Phone size={14} className="text-[#6EB8BB]" />
                        </div>
                        <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Kontak</p>
                        <a href={`tel:${content.phone}`} className="text-xs font-black text-[#6EB8BB] hover:underline mt-0.5 block">
                            {content.phone}
                        </a>
                        </div>
                    </div>
                    )}
                </div>
                </div>

            </div>
            </div>

            {/* ── ULASAN PENGUNJUNG ── */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mt-4">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2.5">
                <Star size={18} className="text-amber-400 fill-amber-400" />
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Ulasan Pengunjung</h2>
                {reviews?.length ? (
                    <span className="text-[10px] font-black px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
                    {reviews.length} ulasan
                    </span>
                ) : null}
                </div>
                {avgRating > 0 && (
                <div className="flex items-center gap-2 text-right">
                    <div>
                    <div className="flex items-center gap-0.5 justify-end">
                        {[1,2,3,4,5].map(s => (
                        <Star key={s} size={12} className={s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                        ))}
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wide">dari 5 bintang</p>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{avgRating.toFixed(1)}</p>
                </div>
                )}
            </div>

            {/* Write review prompt */}
            {user && (
                <div className="px-6 py-4 border-b border-gray-100 bg-white">
                <Link href={`/destinasi/${content.slug}/tulis-ulasan`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-[#6EB8BB] hover:text-[#6EB8BB] hover:bg-[#E6F7F8] transition-all active:scale-95">
                    <MessageCircle size={16} /> Tulis Pengalamanmu
                </Link>
                </div>
            )}

            {reviews && reviews.length > 0 ? (
                <div className="divide-y divide-gray-100">
                {reviews.map((r: any) => {
                    const reviewer = r.profiles as any
                    const initials = reviewer?.full_name?.slice(0,2).toUpperCase() ?? "?"
                    return (
                    <div key={r.id} className="px-6 py-6 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#E6F7F8] flex items-center justify-center text-sm font-black text-[#6EB8BB] shrink-0 border border-[#6EB8BB]/20">
                            {reviewer?.avatar_url
                            ? <img src={reviewer.avatar_url} alt={reviewer.full_name} className="w-full h-full object-cover rounded-full" />
                            : initials
                            }
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                            <p className="text-sm font-bold text-gray-900">{reviewer?.full_name ?? "Pengguna Anonim"}</p>
                            <p className="text-[10px] font-bold text-gray-400">
                                {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                            </div>
                            <div className="flex gap-0.5 mb-2.5">
                            {[1,2,3,4,5].map(s => (
                                <Star key={s} size={12} className={s <= r.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                            ))}
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed font-medium">{r.body}</p>
                        </div>
                        </div>
                    </div>
                    )
                })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Camera size={32} className="text-gray-200 mb-3" />
                <p className="text-sm font-bold text-gray-500">Belum ada ulasan</p>
                <p className="text-xs text-gray-400 mt-1 font-medium">Bagikan pengalaman kamu mengunjungi tempat ini!</p>
                </div>
            )}
            </div>

            {/* ── KONTEN TERKAIT LAINNYA ── */}
            {related && related.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mt-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Tempat Menarik Lainnya</h2>
                <Link href={`/${content.type}`} className="text-[10px] font-bold text-[#6EB8BB] hover:underline flex items-center gap-1 uppercase tracking-wider">
                    Lihat Semua <ChevronRight size={12} />
                </Link>
                </div>
                <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {related.map((c: any) => {
                    const rImg = c.cover_image?.startsWith("http") ? c.cover_image
                    : c.cover_image
                        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/covers/${c.cover_image}`
                        : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=70"
                    return (
                    <Link key={c.id} href={`/${c.type}/${c.slug}`}
                        className="group block rounded-2xl border border-gray-100 overflow-hidden hover:border-[#6EB8BB]/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-white">
                        <div className="aspect-[4/3] overflow-hidden bg-gray-50 border-b border-gray-100">
                        <img src={rImg} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-3.5">
                        <p className="text-xs font-bold text-gray-800 line-clamp-2 group-hover:text-[#6EB8BB] transition-colors mb-1.5">{c.title}</p>
                        {c.kabupaten && (
                            <p className="text-[10px] text-gray-500 font-semibold flex items-center gap-1 mb-1">
                            <MapPin size={10} className="text-gray-400" /> {c.kabupaten}
                            </p>
                        )}
                        {c.rating > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                            <Star size={10} className="fill-amber-400 text-amber-400" />
                            <span className="text-[10px] font-black text-gray-700">{Number(c.rating).toFixed(1)}</span>
                            </div>
                        )}
                        </div>
                    </Link>
                    )
                })}
                </div>
            </div>
            )}

        </div>
        </main>
    )
    }