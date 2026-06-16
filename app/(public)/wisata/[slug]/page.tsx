    import { createClient } from "@/lib/supabase/server"
    import { headers } from "next/headers"
    import { notFound } from "next/navigation"
    import Link from "next/link"
    import Navbar from "@/components/layout/navbar"
    import SavePlaceButton from "@/components/wisata/SavePlaceButton"
    import ReviewForm from "@/components/wisata/ReviewForm"
    import { MapPin, Clock, Phone, Star, Share2, Sparkles, ExternalLink, ChevronRight, ArrowLeft, MessageSquare } from "lucide-react"

    const PLACEHOLDER = "https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=1200&q=80"

    type Params = Promise<{ slug: string }>

    export async function generateMetadata({ params }: { params: Params }) {
    const resolvedParams = await params
    const supabase = await createClient()
    const { data } = await supabase.from("contents").select("title, description").eq("slug", resolvedParams.slug).single()
    return {
        title: data ? `${data.title} — Barling-GO` : "Destinasi Wisata",
        description: data?.description ?? "",
    }
    }

    export default async function WisataDetailPage({ params }: { params: Params }) {
    const resolvedParams = await params
    const supabase = await createClient()

    // 1. KODE PINTAR: Mendeteksi user datang dari mana
    const headersList = await headers()
    const referer = headersList.get("referer") || ""
    // Jika URL asal mengandung kata "super-admin", kembalikan ke super admin. Jika tidak, ke wisata publik.
    const backUrl = referer.includes("/super-admin") ? "/super-admin/kelola-wisata" : "/wisata"

    const { data: dest } = await supabase
        .from("contents")
        .select("*")
        .eq("slug", resolvedParams.slug)
        .eq("is_published", true)
        .single()

    if (!dest) notFound()

    const { data: reviews } = await supabase
        .from("content_reviews")
        .select("id, rating, body, created_at, profiles(full_name, avatar_url)")
        .eq("content_id", dest.id)
        .order("created_at", { ascending: false })
        .limit(5)

    const { data: { user } } = await supabase.auth.getUser()

    let isSaved = false
    if (user) {
        const { data: saved } = await supabase
        .from("saved_places")
        .select("id")
        .eq("user_id", user.id)
        .eq("content_id", dest.id)
        .single()
        isSaved = !!saved
    }

    const imgSrc = dest.cover_image
        ? dest.cover_image.startsWith("http") ? dest.cover_image
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content-images/${dest.cover_image}`
        : PLACEHOLDER

    const hasPrice = dest.ticket_price_min > 0 || dest.ticket_price_max > 0
    const mapsUrl  = dest.latitude && dest.longitude
        ? `https://www.google.com/maps?q=${dest.latitude},${dest.longitude}`
        : `https://www.google.com/maps/search/${encodeURIComponent(dest.title + " " + (dest.location ?? ""))}`

    function timeAgo(dateStr: string) {
        const diff = Date.now() - new Date(dateStr).getTime()
        const days = Math.floor(diff / 86400000)
        if (days === 0) return "Hari ini"
        if (days === 1) return "1 hari yang lalu"
        if (days < 7)  return `${days} hari yang lalu`
        if (days < 30) return `${Math.floor(days / 7)} minggu yang lalu`
        return `${Math.floor(days / 30)} bulan yang lalu`
    }

    return (
        <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 pt-16 pb-20">

            {/* ===== HERO GALLERY ===== */}
            <div className="relative h-[45vh] md:h-[55vh] w-full bg-gray-900 overflow-hidden">
            <img src={imgSrc} alt={dest.title} className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* 2. TOMBOL KEMBALI DINAMIS */}
            <div className="absolute top-6 left-4 sm:left-8 z-10">
                <Link href={backUrl} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-sm font-bold text-white shadow-lg hover:bg-white hover:text-gray-900 transition-all">
                <ArrowLeft size={16} /> Kembali
                </Link>
            </div>

            <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-8 max-w-7xl mx-auto">
                <nav className="flex items-center gap-2 text-xs text-white/70 mb-3 drop-shadow-md">
                <Link href="/" className="hover:text-white">Home</Link>
                <ChevronRight size={12} />
                <Link href="/wisata" className="hover:text-white">Wisata</Link>
                <ChevronRight size={12} />
                <span className="text-white font-medium">{dest.title}</span>
                </nav>
                <h1 className="text-3xl sm:text-5xl font-black text-white drop-shadow-lg leading-tight">
                {dest.title}
                </h1>
            </div>
            </div>

            {/* ===== MAIN CONTENT CONTAINER ===== */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

                <div className="space-y-6">

                {/* Card Badges & Rating */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="px-3 py-1 bg-green-50 text-[#6EB8BB] text-xs font-bold uppercase tracking-wider rounded-md">Destinasi Wisata</span>
                    {dest.kabupaten && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-md">📍 Kab. {dest.kabupaten}</span>
                    )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-t border-gray-50 pt-4">
                    {dest.rating > 0 ? (
                        <div className="flex items-center gap-1.5">
                        <Star className="fill-amber-400 text-amber-400" size={18} />
                        <span className="font-black text-gray-800 text-base">{Number(dest.rating).toFixed(1)}</span>
                        <span>({dest.review_count ?? 0} Ulasan)</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5">
                        <Star className="text-gray-300" size={18} />
                        <span>Belum ada ulasan</span>
                        </div>
                    )}
                    
                    {dest.location && (
                        <div className="flex items-center gap-1.5 font-medium border-l border-gray-200 pl-4">
                        <MapPin size={16} className="text-gray-400" />
                        <span>{dest.location}</span>
                        </div>
                    )}
                    </div>
                </div>

                {/* Card Deskripsi */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">Tentang Destinasi</h2>
                    <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
                    {dest.description}
                    </p>
                    {dest.body && (
                    <div className="text-[15px] text-gray-500 leading-relaxed pt-3 border-t border-dashed border-gray-100 whitespace-pre-line">
                        {dest.body}
                    </div>
                    )}
                </div>

                {/* Card Gallery */}
                {(dest.tags?.length > 0) && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Galeri Foto</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[imgSrc, imgSrc, imgSrc, imgSrc].map((img, i) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden border border-gray-100">
                            <img src={img} alt={`${dest.title} ${i + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer" />
                        </div>
                        ))}
                    </div>
                    </div>
                )}

                {/* Card Map / Lokasi */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Lokasi Peta</h2>
                    <div className="rounded-xl overflow-hidden border border-gray-100 grid sm:grid-cols-2">
                    <div className="h-48 sm:h-auto bg-gray-100 relative overflow-hidden">
                        <img
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=60"
                        alt="Ilustrasi Peta Lokasi"
                        className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-[#6EB8BB] rounded-full flex items-center justify-center shadow-xl ring-4 ring-[#6EB8BB]/30">
                            <MapPin size={20} className="text-white" />
                        </div>
                        </div>
                    </div>

                    <div className="p-6 flex flex-col justify-center gap-4 bg-gray-50/50">
                        <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Alamat Lengkap</p>
                        <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                            {dest.address ?? dest.location ?? `${dest.kabupaten}, Jawa Tengah`}
                        </p>
                        </div>
                        <a
                        href={mapsUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:border-[#6EB8BB] hover:text-[#6EB8BB] transition-all shadow-sm"
                        >
                        Buka di Google Maps <ExternalLink size={14} />
                        </a>
                    </div>
                    </div>
                </div>

                {/* Card Ulasan & Review Form */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="text-[#6EB8BB]" size={20} />
                        <h2 className="text-lg font-bold text-gray-900">Ulasan Pengunjung</h2>
                    </div>
                    {user && (
                        <button
                        className="px-4 py-2 text-sm font-bold text-[#6EB8BB] bg-green-50 rounded-xl hover:bg-[#6EB8BB] hover:text-white transition-all"
                        >
                        Tulis Ulasan
                        </button>
                    )}
                    </div>

                    {!reviews || reviews.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">Belum ada ulasan. Jadilah yang pertama membagikan pengalamanmu!</p>
                    ) : (
                    <div className="space-y-4">
                        {reviews.map((rev: any) => {
                        const name = rev.profiles?.full_name ?? "Pengunjung"
                        const initials = name.split(" ").map((n: string) => n[0]).slice(0,2).join("").toUpperCase()
                        const colors = ["bg-teal-100 text-teal-700", "bg-blue-100 text-blue-700", "bg-orange-100 text-orange-700", "bg-purple-100 text-purple-700"]
                        const color = colors[name.charCodeAt(0) % colors.length]
                        
                        return (
                            <div key={rev.id} className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center font-black text-sm shrink-0 shadow-sm`}>
                                    {initials}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{name}</p>
                                    <p className="text-[11px] text-gray-400 font-medium">{timeAgo(rev.created_at)}</p>
                                </div>
                                </div>
                                <div className="flex items-center gap-0.5 bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">
                                <span className="text-xs font-bold text-gray-700 mr-1">{rev.rating}</span>
                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">"{rev.body}"</p>
                            </div>
                        )
                        })}
                    </div>
                    )}

                    {user && (
                    <div id="review-form" className="mt-8 pt-6 border-t border-dashed border-gray-200">
                        <h3 className="text-base font-bold text-gray-900 mb-4">Bagikan Pengalamanmu</h3>
                        <ReviewForm contentId={dest.id} />
                    </div>
                    )}
                </div>

                </div>

                {/* ===== KOLOM KANAN (Harga dan Info) ===== */}
                <div className="space-y-4">
                
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    
                    {hasPrice ? (
                    <div className="mb-6 pb-6 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tiket Masuk</p>
                        <p className="text-3xl font-black text-[#6EB8BB]">
                        Rp {dest.ticket_price_min.toLocaleString("id-ID")}
                        </p>
                        {dest.ticket_price_max > dest.ticket_price_min && (
                        <p className="text-sm font-bold text-gray-500 mt-1">
                            Hingga Rp {dest.ticket_price_max.toLocaleString("id-ID")}
                        </p>
                        )}
                        <p className="text-[11px] text-gray-400 mt-2 font-medium">*Harga dapat berubah saat hari libur/weekend</p>
                    </div>
                    ) : (
                    <div className="mb-6 pb-6 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tiket Masuk</p>
                        <p className="text-2xl font-black text-[#6EB8BB]">Gratis / Belum Diatur</p>
                    </div>
                    )}

                    <div className="space-y-4 mb-6">
                    {dest.opening_hours && (
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                            <Clock size={15} className="text-gray-500" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Jam Operasional</p>
                            <p className="text-sm font-bold text-gray-800">{dest.opening_hours}</p>
                        </div>
                        </div>
                    )}
                    {dest.phone && (
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                            <Phone size={15} className="text-gray-500" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Kontak Pengelola</p>
                            <p className="text-sm font-bold text-gray-800">{dest.phone}</p>
                        </div>
                        </div>
                    )}
                    </div>

                    <div className="space-y-3">
                    <a
                        href={`https://wa.me/${dest.phone?.replace(/\D/g, "")}`}
                        target="_blank" rel="noopener noreferrer"
                        className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                    >
                        <Phone size={16} /> Hubungi Pengelola
                    </a>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <SavePlaceButton contentId={dest.id} isLoggedIn={!!user} initialSaved={isSaved} />
                        <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
                        <Share2 size={16} /> Bagikan
                        </button>
                    </div>
                    </div>
                </div>

                <Link
                    href={`/ai-assistant?q=Rencanakan kunjungan ke ${dest.title}`}
                    className="block bg-gradient-to-br from-[#6EB8BB] to-[#1e5a31] rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all group"
                >
                    <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-white mb-1">Tanya AI Assistant</p>
                        <p className="text-xs text-white/80 leading-relaxed">Buat itinerary dan rencanakan kunjunganmu ke {dest.title} secara otomatis.</p>
                    </div>
                    </div>
                </Link>

                </div>
            </div>
            </div>

            {/* ===== FOOTER ===== */}
            <footer className="border-t border-gray-100 mt-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                <p className="font-black text-gray-900 tracking-tight">BARLING-GO</p>
                <p className="text-xs text-gray-400 mt-1">© 2026 BARLING-GO. All Rights Reserved</p>
                </div>
                <div className="flex gap-6 text-sm font-medium text-gray-500">
                {["Syarat & Ketentuan", "Kebijakan Privasi", "Hubungi Kami"].map((l) => (
                    <a key={l} href="#" className="hover:text-gray-900 transition-colors">{l}</a>
                ))}
                </div>
            </div>
            </footer>
        </main>
        </>
    )
    }