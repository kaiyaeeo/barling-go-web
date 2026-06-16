    "use client"

    import React, { useEffect, useState } from "react"
    import Link from "next/link"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { useCart } from "@/hooks/useCart"
    import { 
    Home, 
    Bell, 
    Settings as SettingsIcon, 
    Heart, 
    MapPin, 
    ChevronRight, 
    ShoppingBag, 
    Compass, 
    Star, 
    Info,
    Loader2,
    ExternalLink,
    Plus,
    Trash2
    } from "lucide-react"
    import UserSidebar from "@/components/user/UserSidebar"

    // ── 1. DEFINISI TIPE DATA ──
    interface Content {
    id: string
    title: string
    slug: string
    cover_image: string | null
    type: "destinasi" | "umkm"
    location: string | null
    rating: number | null
    review_count: number | null
    ticket_price_min: number | null
    ticket_price_max: number | null
    kabupaten: string | null
    }

    interface SavedItem {
    id: string
    content_id: string
    contents: Content
    }

    export default function TersimpanPage() {
    const router = useRouter()
    const supabase = createClient()
    const { addToCart } = useCart()

    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [savedItems, setSavedItems] = useState<SavedItem[]>([])
    const [activeFilter, setActiveFilter] = useState<"all" | "destinasi" | "umkm">("all")

    // ── 2. FETCH DATA PROFIL & WISHLIST ──
    async function loadWishlistData() {
        try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push("/login")
            return
        }

        // Ambil profil untuk Sidebar
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(prof)

        // Ambil item wishlist (saved_places JOIN contents)
        const { data: saved } = await supabase
            .from("saved_places")
            .select(`
            id, content_id,
            contents:content_id (
                id, title, slug, cover_image, type, location, rating, review_count, 
                ticket_price_min, ticket_price_max, kabupaten
            )
            `)
            .eq("user_id", user.id)

        // Memastikan tipe data sesuai dengan interface
        setSavedItems((saved as unknown as SavedItem[]) || [])
        } catch (err) {
        console.error("Gagal memuat data wishlist:", err)
        } finally {
        setLoading(false)
        }
    }

    // Panggil fetch data saat komponen di-mount
    useEffect(() => {
        loadWishlistData()
    }, [])

    // ── 3. HAPUS ITEM DARI WISHLIST ──
    const handleRemoveWishlist = async (savedPlaceId: string) => {
        try {
        const { error } = await supabase.from("saved_places").delete().eq("id", savedPlaceId)
        if (error) throw error
        // Update state UI secara langsung agar terasa instan (Optimistic UI)
        setSavedItems(prev => prev.filter(item => item.id !== savedPlaceId))
        } catch (err) {
        console.error("Gagal menghapus item:", err)
        alert("Gagal menghapus dari tersimpan.")
        }
    }

    // ── 4. FILTERING ITEM ──
    const filteredItems = savedItems.filter(item => {
        if (activeFilter === "all") return true
        return item.contents?.type === activeFilter
    })

    // ── 5. RENDER UI ──
    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
        
        {/* ── SIDEBAR ── */}
        <div className="hidden md:block w-[280px] shrink-0 bg-white border-r border-gray-200 z-10">
            <UserSidebar profile={profile} active="saved" />
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
            
            {/* TOPBAR */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm h-16 flex items-center justify-between px-6 lg:px-10 shrink-0">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold">
                <span className="text-gray-800">Tersimpan</span>
            </div>
            <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-[#E6F7F8] hover:bg-[#C5EAE9] text-[#6EB8BB] rounded-xl text-xs font-bold transition-all shadow-sm">
                <Home size={15} /> <span className="hidden sm:block">Beranda</span>
                </Link>
                <div className="h-6 w-px bg-gray-200 mx-1" />
                <button className="p-2 text-gray-400 hover:text-[#6EB8BB] hover:bg-gray-50 rounded-xl transition-all">
                <Bell size={18} />
                </button>
                <Link href="/settings" className="p-2 text-gray-400 hover:text-[#6EB8BB] hover:bg-gray-50 rounded-xl transition-all">
                <SettingsIcon size={18} />
                </Link>
            </div>
            </div>

            {/* CONTENT AREA */}
            <div className="p-6 lg:p-10 w-full max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-black text-gray-900">Destinasi & Produk Tersimpan</h1>
                
                {/* Filter Tabs */}
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm shrink-0">
                <button 
                    onClick={() => setActiveFilter("all")}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeFilter === "all" ? "bg-[#6EB8BB] text-white" : "text-gray-500 hover:bg-gray-50"}`}
                >
                    Semua
                </button>
                <button 
                    onClick={() => setActiveFilter("destinasi")}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeFilter === "destinasi" ? "bg-[#6EB8BB] text-white" : "text-gray-500 hover:bg-gray-50"}`}
                >
                    Destinasi
                </button>
                <button 
                    onClick={() => setActiveFilter("umkm")}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeFilter === "umkm" ? "bg-[#6EB8BB] text-white" : "text-gray-500 hover:bg-gray-50"}`}
                >
                    UMKM
                </button>
                </div>
            </div>

            {/* Kondisi Loading */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                <Loader2 size={40} className="text-[#6EB8BB] animate-spin mb-4" />
                <p className="text-sm font-medium text-gray-500">Memuat data tersimpan...</p>
                </div>
            ) : filteredItems.length === 0 ? (
                /* Kondisi Kosong (Empty State) */
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                    <Heart size={40} className="text-rose-400" />
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-2">
                    {activeFilter === "all" ? "Belum ada yang tersimpan" : `Belum ada ${activeFilter} tersimpan`}
                </h2>
                <p className="text-sm font-medium text-gray-500 mb-8 max-w-md mx-auto">
                    Jelajahi destinasi wisata dan produk UMKM menarik di Barling-GO, lalu tekan ikon hati untuk menyimpannya di sini.
                </p>
                <Link href="/" className="inline-flex px-8 py-3.5 bg-[#6EB8BB] text-white font-black rounded-xl hover:bg-[#5AA4A7] transition-all shadow-sm active:scale-95">
                    Eksplor Sekarang
                </Link>
                </div>
            ) : (
                /* Grid Data Tersimpan */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => {
                    const content = item.contents;
                    if (!content) return null;

                    const isUMKM = content.type === "umkm"

                    return (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all">
                        {/* Gambar Cover */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                        {content.cover_image ? (
                            <img 
                            src={content.cover_image} 
                            alt={content.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                            {isUMKM ? <ShoppingBag size={40} /> : <Compass size={40} />}
                            </div>
                        )}
                        
                        {/* Badge Kategori */}
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/20 shadow-sm flex items-center gap-1.5">
                            {isUMKM ? <ShoppingBag size={12} className="text-amber-500" /> : <Compass size={12} className="text-blue-500" />}
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-800">
                            {content.type}
                            </span>
                        </div>

                        {/* Tombol Hapus */}
                        <button 
                            onClick={() => handleRemoveWishlist(item.id)}
                            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-sm"
                            title="Hapus dari tersimpan"
                        >
                            <Trash2 size={14} />
                        </button>
                        </div>

                        {/* Info Konten */}
                        <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start gap-2 mb-2">
                            <h3 className="font-black text-gray-900 line-clamp-2 leading-tight">
                            {content.title}
                            </h3>
                            {content.rating && (
                            <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded text-amber-600 shrink-0 mt-0.5">
                                <Star size={10} className="fill-amber-500" />
                                <span className="text-xs font-bold">{content.rating}</span>
                            </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-4">
                            <MapPin size={12} />
                            <span className="truncate">{content.location || content.kabupaten || "Lokasi tidak diketahui"}</span>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                            <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                {isUMKM ? "Harga" : "Mulai dari"}
                            </p>
                            <p className="text-sm font-black text-[#6EB8BB]">
                                {content.ticket_price_min 
                                ? `Rp ${content.ticket_price_min.toLocaleString("id-ID")}` 
                                : "Gratis / Hubungi Pihak"}
                            </p>
                            </div>
                            
                            {/* Tombol Aksi Bawah */}
                            <Link 
                            href={`/${isUMKM ? 'umkm' : 'destinasi'}/${content.slug}`}
                            className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#6EB8BB] hover:text-white hover:border-[#6EB8BB] transition-colors"
                            >
                            <ChevronRight size={16} />
                            </Link>
                        </div>
                        </div>
                    </div>
                    )
                })}
                </div>
            )}

            </div>
        </div>
        </div>
    )
    }