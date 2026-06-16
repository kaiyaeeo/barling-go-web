    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import UserSidebar from "@/components/user/UserSidebar"
    import SavePlaceButton from "@/components/wisata/SavePlaceButton"
    import { Heart, MapPin, Search } from "lucide-react"

    const PLACEHOLDER = "https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=400&q=70"

    const TYPE_COLOR: Record<string, string> = {
    destinasi:  "bg-green-100 text-[#6EB8BB]",
    kuliner:    "bg-orange-100 text-orange-700",
    "oleh-oleh": "bg-amber-100 text-amber-700",
    artikel:    "bg-purple-100 text-purple-700",
    }

    const TYPE_HREF: Record<string, string> = {
    destinasi:  "/wisata",
    kuliner:    "/kuliner",
    "oleh-oleh": "/oleh-oleh",
    }

    export default async function SavedPlacesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, membership_tier")
        .eq("id", user.id)
        .single()

    const { data: savedPlaces } = await supabase
        .from("saved_places")
        .select(`
        id, created_at,
        contents(id, title, slug, cover_image, kabupaten, type,
            ticket_price_min, ticket_price_max, rating, review_count)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    return (
        <div className="min-h-screen bg-gray-50">
        <div className="h-16" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-6">
            <UserSidebar profile={profile} />

            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Heart size={20} className="text-rose-500 fill-rose-500" />
                    Saved Places
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                    {savedPlaces?.length ?? 0} tempat tersimpan
                    </p>
                </div>
                </div>

                {!savedPlaces || savedPlaces.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                    <Heart size={48} className="mx-auto text-gray-200 mb-4" />
                    <h2 className="text-base font-semibold text-gray-700 mb-2">Belum ada tempat tersimpan</h2>
                    <p className="text-sm text-gray-400 mb-6">Jelajahi destinasi dan kuliner, lalu simpan favoritmu!</p>
                    <div className="flex gap-3 justify-center">
                    <Link href="/wisata"
                        className="px-5 py-2.5 bg-[#6EB8BB] text-white text-sm font-semibold rounded-xl hover:bg-[#5AA4A7] transition-all">
                        Jelajahi Wisata
                    </Link>
                    <Link href="/kuliner"
                        className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all">
                        Cari Kuliner
                    </Link>
                    </div>
                </div>
                ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedPlaces.map((sp: any) => {
                    const dest = sp.contents
                    if (!dest) return null
                    const imgSrc = dest.cover_image
                        ? dest.cover_image.startsWith("http") ? dest.cover_image
                        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content-images/${dest.cover_image}`
                        : PLACEHOLDER
                    const typeHref = TYPE_HREF[dest.type] ?? "/wisata"

                    return (
                        <div key={sp.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <img src={imgSrc} alt={dest.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            {/* Remove saved button */}
                            <div className="absolute top-2.5 right-2.5">
                            <SavePlaceButton contentId={dest.id} isLoggedIn={true} initialSaved={true} />
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${TYPE_COLOR[dest.type] ?? "bg-gray-100 text-gray-600"}`}>
                                {dest.type}
                            </span>
                            {dest.rating > 0 && (
                                <span className="text-xs text-amber-500 font-semibold flex items-center gap-0.5">
                                ★ {Number(dest.rating).toFixed(1)}
                                </span>
                            )}
                            </div>
                            <Link href={`${typeHref}/${dest.slug}`}>
                            <h3 className="text-sm font-bold text-gray-900 hover:text-[#6EB8BB] transition-colors mb-1">
                                {dest.title}
                            </h3>
                            </Link>
                            {dest.kabupaten && (
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                <MapPin size={10} /> {dest.kabupaten}
                            </p>
                            )}
                            {dest.ticket_price_min > 0 && (
                            <p className="text-sm font-bold text-[#6EB8BB] mt-1.5">
                                Rp {dest.ticket_price_min.toLocaleString("id-ID")}
                                {dest.ticket_price_max > dest.ticket_price_min && ` – Rp ${dest.ticket_price_max.toLocaleString("id-ID")}`}
                            </p>
                            )}
                            <p className="text-[11px] text-gray-400 mt-2">
                            Disimpan {new Date(sp.created_at).toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" })}
                            </p>
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
