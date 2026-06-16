    import { createClient } from "@/lib/supabase/server"
    import { notFound } from "next/navigation"
    import Link from "next/link"
    import Navbar from "@/components/layout/Navbar"
    import { MapPin, Phone, Star, Share2, Sparkles, ChevronRight, ShoppingCart } from "lucide-react"
    import AddToCartButton from "@/components/produk/AddToCartButton"

    const PLACEHOLDER = "https://images.unsplash.com/photo-1606914501449-5a96b6ce24ca?w=1200&q=80"

    export async function generateMetadata({ params }: { params: { slug: string } }) {
    const supabase = await createClient()
    const { data } = await supabase.from("contents").select("title,description").eq("slug", params.slug).single()
    return { title: data ? `${data.title} — Barling-GO` : "Oleh-Oleh" }
    }

    export default async function OlehOlehDetailPage({ params }: { params: { slug: string } }) {
    const supabase = await createClient()

    const { data: item } = await supabase
        .from("contents")
        .select("*")
        .eq("slug", params.slug)
        .eq("type", "oleh-oleh")
        .eq("is_published", true)
        .single()

    if (!item) notFound()

    const { data: reviews } = await supabase
        .from("content_reviews")
        .select("id, rating, body, created_at, profiles(full_name)")
        .eq("content_id", item.id)
        .order("created_at", { ascending: false })
        .limit(5)

    const { data: { user } } = await supabase.auth.getUser()

    const imgSrc = item.cover_image
        ? item.cover_image.startsWith("http") ? item.cover_image
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content-images/${item.cover_image}`
        : PLACEHOLDER

    return (
        <>
        <Navbar />
        <main className="min-h-screen bg-white pt-16">
            <div className="relative h-64 sm:h-80 overflow-hidden">
            <img src={imgSrc} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-6">
                <nav className="flex items-center gap-2 text-xs text-white/70 mb-2">
                <Link href="/" className="hover:text-white">Home</Link><ChevronRight size={12} />
                <Link href="/oleh-oleh" className="hover:text-white">Oleh-Oleh</Link><ChevronRight size={12} />
                <span className="text-white">{item.title}</span>
                </nav>
                <h1 className="text-3xl font-black text-white">{item.title}</h1>
            </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                <div>
                    <div className="flex gap-2 mb-3">
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Oleh-Oleh</span>
                    {item.kabupaten && <span className="px-3 py-1 bg-green-50 text-[#6EB8BB] text-xs font-bold rounded-full">{item.kabupaten}</span>}
                    </div>
                    {item.rating > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex">
                        {[1,2,3,4,5].map((s) => <Star key={s} size={15} className={s <= Math.round(item.rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />)}
                        </div>
                        <span className="text-sm font-bold text-gray-800">{Number(item.rating).toFixed(1)}</span>
                        <span className="text-sm text-gray-400">({item.review_count ?? 0} ulasan)</span>
                    </div>
                    )}
                    <p className="text-gray-600 text-[15px] leading-relaxed">{item.description}</p>
                    {item.body && <p className="mt-3 text-gray-500 text-sm leading-relaxed">{item.body}</p>}
                </div>

                {/* Reviews */}
                {reviews && reviews.length > 0 && (
                    <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Ulasan Pembeli</h2>
                    <div className="space-y-3">
                        {reviews.map((rev: any) => {
                        const name = rev.profiles?.full_name ?? "Pembeli"
                        const initials = name.split(" ").map((n: string) => n[0]).slice(0,2).join("").toUpperCase()
                        return (
                            <div key={rev.id} className="bg-gray-50 rounded-2xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">{initials}</div>
                                <p className="text-sm font-semibold text-gray-800">{name}</p>
                                <div className="flex ml-auto">
                                {[1,2,3,4,5].map((s) => <Star key={s} size={12} className={s <= rev.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />)}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">"{rev.body}"</p>
                            </div>
                        )
                        })}
                    </div>
                    </div>
                )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-24">
                    {(item.ticket_price_min > 0 || item.ticket_price_max > 0) && (
                    <div className="mb-5 pb-5 border-b border-gray-100">
                        <p className="text-xs text-gray-400 mb-1">Harga</p>
                        <p className="text-2xl font-black text-gray-900">
                        Rp {item.ticket_price_min.toLocaleString("id-ID")}
                        {item.ticket_price_max > item.ticket_price_min && ` – Rp ${item.ticket_price_max.toLocaleString("id-ID")}`}
                        </p>
                    </div>
                    )}
                    <div className="space-y-3 mb-5">
                    {item.phone && (
                        <div className="flex items-center gap-3">
                        <Phone size={15} className="text-gray-400 shrink-0" />
                        <div>
                            <p className="text-xs text-gray-400">Kontak Penjual</p>
                            <p className="text-sm font-medium text-gray-700">{item.phone}</p>
                        </div>
                        </div>
                    )}
                    {item.address && (
                        <div className="flex items-start gap-3">
                        <MapPin size={15} className="text-gray-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-400">Lokasi</p>
                            <p className="text-sm font-medium text-gray-700">{item.address}</p>
                        </div>
                        </div>
                    )}
                    </div>
                    <div className="space-y-2.5">
                    {item.phone && (
                        <a href={`https://wa.me/${item.phone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                        className="w-full py-3 bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
                        <ShoppingCart size={15} /> Pesan via WhatsApp
                        </a>
                    )}
                    <button className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                        <Share2 size={14} /> Bagikan
                    </button>
                    </div>
                </div>
                <Link href={`/ai-assistant?q=Rekomendasikan oleh-oleh dari ${item.kabupaten}`}
                    className="block bg-amber-50 border border-amber-100 rounded-2xl p-4 hover:bg-amber-100 transition-all">
                    <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
                        <Sparkles size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-amber-700">Tanya AI Assistant</p>
                        <p className="text-xs text-gray-500">Cari oleh-oleh lain dari {item.kabupaten}</p>
                    </div>
                    </div>
                </Link>
                </div>
            </div>
            </div>

            <footer className="border-t border-gray-100 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-between gap-4">
                <div>
                <p className="font-black text-gray-900">BARLING-GO</p>
                <p className="text-xs text-gray-400">© 2026 BARLING-GO. All Rights Reserved</p>
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
