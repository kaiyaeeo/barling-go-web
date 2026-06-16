    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import UserSidebar from "@/components/user/UserSidebar"
    import { Star, Edit2, Trash2 } from "lucide-react"

    export default async function UlasanPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, membership_tier")
        .eq("id", user.id)
        .single()

    const { data: reviews } = await supabase
        .from("content_reviews")
        .select(`
        id, rating, body, created_at,
        contents(id, title, slug, cover_image, type, kabupaten)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    const PLACEHOLDER = "https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=200&q=60"

    const TYPE_HREF: Record<string, string> = {
        destinasi: "/wisata", kuliner: "/kuliner", "oleh-oleh": "/oleh-oleh",
    }

    return (
        <div className="min-h-screen bg-gray-50">
        <div className="h-16" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-6">
            <UserSidebar profile={profile} />

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Star size={20} className="text-amber-500 fill-amber-500" /> Reviews
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">{reviews?.length ?? 0} ulasan ditulis</p>
                </div>
                </div>

                {!reviews || reviews.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                    <Star size={48} className="mx-auto text-gray-200 mb-4" />
                    <h2 className="text-base font-semibold text-gray-700 mb-2">Belum pernah menulis ulasan</h2>
                    <p className="text-sm text-gray-400 mb-6">Kunjungi destinasi atau kuliner dan tulis pengalamanmu!</p>
                    <Link href="/wisata"
                    className="px-5 py-2.5 bg-[#6EB8BB] text-white text-sm font-semibold rounded-xl hover:bg-[#5AA4A7] transition-all">
                    Jelajahi Destinasi
                    </Link>
                </div>
                ) : (
                <div className="space-y-4">
                    {reviews.map((rev: any) => {
                    const dest = rev.contents
                    if (!dest) return null
                    const imgSrc = dest.cover_image
                        ? dest.cover_image.startsWith("http") ? dest.cover_image
                        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content-images/${dest.cover_image}`
                        : PLACEHOLDER
                    const typeHref = TYPE_HREF[dest.type] ?? "/wisata"

                    return (
                        <div key={rev.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 hover:shadow-sm transition-all">
                        {/* Thumbnail */}
                        <Link href={`${typeHref}/${dest.slug}`} className="shrink-0">
                            <div className="w-20 h-20 rounded-xl overflow-hidden">
                            <img src={imgSrc} alt={dest.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                            </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <Link href={`${typeHref}/${dest.slug}`}>
                                <h3 className="text-sm font-bold text-gray-900 hover:text-[#6EB8BB] transition-colors truncate">
                                    {dest.title}
                                </h3>
                                </Link>
                                {dest.kabupaten && (
                                <p className="text-xs text-gray-400 mt-0.5">{dest.kabupaten}</p>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 shrink-0">
                                {new Date(rev.created_at).toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" })}
                            </p>
                            </div>

                            {/* Stars */}
                            <div className="flex items-center gap-1 my-2">
                            {[1,2,3,4,5].map((s) => (
                                <Star key={s} size={14}
                                className={s <= rev.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                            ))}
                            <span className="text-xs font-semibold text-gray-600 ml-1">{rev.rating}/5</span>
                            </div>

                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">"{rev.body}"</p>
                        </div>
                        </div>
                    )
                    })}
                </div>
                )}
            </div>
            </div>
        </div>
        </div>
    )
    }
