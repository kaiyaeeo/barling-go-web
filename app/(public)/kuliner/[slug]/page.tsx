    import { createClient } from "@/lib/supabase/server"
    import { notFound } from "next/navigation"
    import Link from "next/link"
    import Navbar from "@/components/layout/Navbar"
    import SavePlaceButton from "@/components/wisata/SavePlaceButton"
    import ReviewForm from "@/components/wisata/ReviewForm"
    import { MapPin, Clock, Phone, Star, Share2, Sparkles, ChevronRight } from "lucide-react"

    const PLACEHOLDER = "https://images.unsplash.com/photo-1562802378-063ec186a863?w=1200&q=80"

    export async function generateMetadata({ params }: { params: { slug: string } }) {
    const supabase = await createClient()
    const { data } = await supabase.from("contents").select("title,description").eq("slug", params.slug).single()
    return { title: data ? `${data.title} — Barling-GO` : "Kuliner", description: data?.description ?? "" }
    }

    export default async function KulinerDetailPage({ params }: { params: { slug: string } }) {
    const supabase = await createClient()

    const { data: item } = await supabase
        .from("contents")
        .select("*")
        .eq("slug", params.slug)
        .eq("type", "kuliner")
        .eq("is_published", true)
        .single()

    if (!item) notFound()

    const { data: reviews } = await supabase
        .from("content_reviews")
        .select("id, rating, body, created_at, profiles(full_name, avatar_url)")
        .eq("content_id", item.id)
        .order("created_at", { ascending: false })
        .limit(5)

    const { data: { user } } = await supabase.auth.getUser()
    let isSaved = false
    if (user) {
        const { data: saved } = await supabase
        .from("saved_places").select("id").eq("user_id", user.id).eq("content_id", item.id).single()
        isSaved = !!saved
    }

    // Related kuliner dari kabupaten yang sama
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
        if (days < 30) return `${Math.floor(days/7)} minggu yang lalu`
        return `${Math.floor(days/30)} bulan yang lalu`
    }

    const hasPrice = item.ticket_price_min > 0 || item.ticket_price_max > 0

    return (
        <>
        <Navbar />
        <main className="min-h-screen bg-white pt-16">
            {/* Hero */}
            <div className="relative h-64 sm:h-80 overflow-hidden">
            <img src={imgSrc} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-6">
                <nav className="flex items-center gap-2 text-xs text-white/70 mb-2">
                <Link href="/" className="hover:text-white">Home</Link>
                <ChevronRight size={12} />
                <Link href="/kuliner" className="hover:text-white">Kuliner</Link>
                <ChevronRight size={12} />
                <span className="text-white">{item.title}</span>
                </nav>
                <h1 className="text-3xl font-black text-white">{item.title}</h1>
            </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid lg:grid-cols-3 gap-8">

                {/* Left */}
                <div className="lg:col-span-2 space-y-8">
                <div>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">Kuliner</span>
                    {item.kabupaten && (
                        <span className="px-3 py-1 bg-green-50 text-[#6EB8BB] text-xs font-bold rounded-full">{item.kabupaten}</span>
                    )}
                    </div>
                    {item.rating > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex">
                        {[1,2,3,4,5].map((s) => (
                            <Star key={s} size={16} className={s <= Math.round(item.rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                        ))}
                        </div>
                        <span className="text-sm font-bold text-gray-800">{Number(item.rating).toFixed(1)}</span>
                        <span className="text-sm text-gray-400">({item.review_count ?? 0} ulasan)</span>
                    </div>
                    )}
                    <p className="text-gray-600 text-[15px] leading-relaxed">{item.description}</p>
                    {item.body && (
                    <div className="mt-4 text-gray-600 text-sm leading-relaxed whitespace-pre-line">{item.body}</div>
                    )}
                </div>

                {/* Reviews */}
                <div>
                    <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-gray-900">Ulasan Pengunjung</h2>
                    {user && (
                        <button onClick={() => document.getElementById("review-form")?.scrollIntoView({ behavior:"smooth" })}
                        className="px-4 py-2 text-sm font-semibold text-[#6EB8BB] border border-[#6EB8BB] rounded-xl hover:bg-green-50 transition-all">
                        Tulis Ulasan
                        </button>
                    )}
                    </div>
                    {!reviews || reviews.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4">Belum ada ulasan. Jadilah yang pertama!</p>
                    ) : (
                    <div className="space-y-4">
                        {reviews.map((rev: any) => {
                        const name = rev.profiles?.full_name ?? "Pengunjung"
                        const initials = name.split(" ").map((n: string) => n[0]).slice(0,2).join("").toUpperCase()
                        const colors = ["bg-orange-100 text-orange-700","bg-blue-100 text-blue-700","bg-green-100 text-green-700","bg-purple-100 text-purple-700"]
                        const color = colors[name.charCodeAt(0) % colors.length]
                        return (
                            <div key={rev.id} className="bg-gray-50 rounded-2xl p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center font-bold text-sm shrink-0`}>{initials}</div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">{name}</p>
                                    <p className="text-xs text-gray-400">{timeAgo(rev.created_at)}</p>
                                </div>
                                </div>
                                <div className="flex">
                                {[1,2,3,4,5].map((s) => <Star key={s} size={13} className={s <= rev.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />)}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">"{rev.body}"</p>
                            </div>
                        )
                        })}
                    </div>
                    )}
                    {user && <div id="review-form" className="mt-6"><ReviewForm contentId={item.id} /></div>}
                </div>

                {/* Related */}
                {related && related.length > 0 && (
                    <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Kuliner Lain di {item.kabupaten}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {related.map((r: any) => {
                        const rImg = r.cover_image
                            ? r.cover_image.startsWith("http") ? r.cover_image
                            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content-images/${r.cover_image}`
                            : PLACEHOLDER
                        return (
                            <Link key={r.id} href={`/kuliner/${r.slug}`} className="group block">
                            <div className="aspect-square rounded-2xl overflow-hidden mb-2">
                                <img src={rImg} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-[#6EB8BB]">{r.title}</p>
                            {r.ticket_price_min > 0 && (
                                <p className="text-xs text-[#6EB8BB] font-bold mt-0.5">Rp {r.ticket_price_min.toLocaleString("id-ID")}</p>
                            )}
                            </Link>
                        )
                        })}
                    </div>
                    </div>
                )}
                </div>

                {/* Right sidebar */}
                <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-24">
                    {hasPrice && (
                    <div className="mb-5 pb-5 border-b border-gray-100">
                        <p className="text-xs text-gray-400 mb-1">Kisaran Harga</p>
                        <p className="text-2xl font-black text-gray-900">
                        Rp {item.ticket_price_min.toLocaleString("id-ID")}
                        {item.ticket_price_max > item.ticket_price_min && ` – Rp ${item.ticket_price_max.toLocaleString("id-ID")}`}
                        </p>
                    </div>
                    )}
                    <div className="space-y-3 mb-5">
                    {item.opening_hours && (
                        <div className="flex items-center gap-3">
                        <Clock size={16} className="text-gray-400 shrink-0" />
                        <div>
                            <p className="text-xs text-gray-400">Jam Buka</p>
                            <p className="text-sm font-medium text-gray-700">{item.opening_hours}</p>
                        </div>
                        </div>
                    )}
                    {item.phone && (
                        <div className="flex items-center gap-3">
                        <Phone size={16} className="text-gray-400 shrink-0" />
                        <div>
                            <p className="text-xs text-gray-400">Kontak</p>
                            <p className="text-sm font-medium text-gray-700">{item.phone}</p>
                        </div>
                        </div>
                    )}
                    {item.address && (
                        <div className="flex items-start gap-3">
                        <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-400">Alamat</p>
                            <p className="text-sm font-medium text-gray-700">{item.address}</p>
                        </div>
                        </div>
                    )}
                    </div>
                    <div className="space-y-2.5">
                    {item.phone && (
                        <a href={`https://wa.me/${item.phone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                        className="w-full py-3 bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white font-bold rounded-xl text-sm flex items-center justify-center transition-all">
                        Hubungi via WhatsApp
                        </a>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                        <SavePlaceButton contentId={item.id} isLoggedIn={!!user} initialSaved={isSaved} />
                        <button className="flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                        <Share2 size={14} /> Bagikan
                        </button>
                    </div>
                    </div>
                </div>

                <Link href={`/ai-assistant?q=Rekomendasi kuliner di ${item.kabupaten}`}
                    className="block bg-orange-50 border border-orange-100 rounded-2xl p-4 hover:bg-orange-100 transition-all group">
                    <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
                        <Sparkles size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-orange-700">Tanya AI Assistant</p>
                        <p className="text-xs text-gray-500">Cari kuliner lain di {item.kabupaten}</p>
                    </div>
                    </div>
                </Link>
                </div>
            </div>
            </div>

            <footer className="border-t border-gray-100 mt-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                <p className="font-black text-gray-900">BARLING-GO</p>
                <p className="text-xs text-gray-400 mt-0.5">© 2026 BARLING-GO. All Rights Reserved</p>
                </div>
                <div className="flex gap-6 text-sm text-gray-500">
                {["Terms of Service","Privacy Policy","Contact Us"].map((l) => <a key={l} href="#" className="hover:text-gray-800">{l}</a>)}
                </div>
            </div>
            </footer>
        </main>
        </>
    )
    }
