    "use client"

    import { useState, useEffect } from "react"
    import Link from "next/link"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import {
    Star,
    Home,
    Loader2,
    Calendar,
    MapPin,
    ShoppingBag,
    MessageSquare,
    Camera,
    ThumbsUp,
    MoreVertical,
    Coffee,
    Sparkles,
    Filter
    } from "lucide-react"
    import UserSidebar from "@/components/user/UserSidebar"

    // ── DATA DUMMY UNTUK PRESENTASI ──
    // Jika database kosong, data ini yang akan tampil agar demo tetap memukau
    const dummyReviews = [
    {
        id: "1",
        title: "Baturraden Adventure Forest",
        category: "Wisata",
        rating: 5,
        date: "15 Jun 2026",
        comment: "Tempat yang luar biasa untuk melepas penat! Pemandangannya sangat asri, udaranya sejuk, dan fasilitas outbond-nya sangat terawat. Sangat merekomendasikan paket canyoning-nya untuk yang suka adrenalin.",
        photos: ["https://placehold.co/400x300/e2e8f0/64748b?text=Baturraden+1", "https://placehold.co/400x300/e2e8f0/64748b?text=Baturraden+2"],
        likes: 12
    },
    {
        id: "2",
        title: "Soto Sokaraja Kecik",
        category: "Kuliner",
        rating: 4,
        date: "12 Jun 2026",
        comment: "Bumbu kacangnya otentik banget! Dagingnya empuk dan porsinya pas. Sayangnya kalau weekend antriannya lumayan panjang. Tips: datang sebelum jam 11 siang.",
        photos: ["https://placehold.co/400x300/f8fafc/94a3b8?text=Soto+Kecik"],
        likes: 5
    },
    {
        id: "3",
        title: "Kripik Tempe Niti",
        category: "Oleh-oleh",
        rating: 5,
        date: "10 Jun 2026",
        comment: "Oleh-oleh wajib kalau ke Purwokerto. Renyahnya awet, bumbunya pas nggak terlalu asin. Pesan lewat Barling-GO pengirimannya cepat dan aman, nggak banyak yang hancur.",
        photos: [],
        likes: 8
    }
    ]

    export default function UlasanPage() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [reviews, setReviews] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState("Semua")

    useEffect(() => {
        async function loadData() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push("/login")
            return
        }
        
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(prof)
        
        // Ambil data ulasan dari database
        try {
            const { data: userReviews, error } = await supabase
            .from("reviews")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            
            // DEMO MODE: Jika DB kosong, pakai data dummy agar presentasi terlihat bagus
            if (!error && userReviews && userReviews.length > 0) {
            setReviews(userReviews)
            } else {
            setReviews(dummyReviews) 
            }
        } catch (err) {
            console.error("Gagal memuat ulasan", err)
            setReviews(dummyReviews) // Fallback demo
        }
        
        setLoading(false)
        }
        loadData()
    }, [])

    // Filter logic
    const filteredReviews = activeTab === "Semua" 
        ? reviews 
        : reviews.filter(r => r.category === activeTab)

    if (loading) {
        return (
        <div className="flex min-h-screen bg-[#F5F7FA]">
            <div className="hidden md:block w-[280px] shrink-0 bg-white border-r border-gray-200/80" />
            <div className="flex-1 flex items-center justify-center flex-col gap-3">
            <Loader2 size={32} className="text-[#6EB8BB] animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Memuat ulasan Anda…</p>
            </div>
        </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-[#F5F7FA]">
        {/* ── SIDEBAR ── */}
        <div className="hidden md:block w-[280px] shrink-0 bg-white border-r border-gray-200/80 z-10">
            <UserSidebar profile={profile} active="ulasan" />
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
            
            {/* ── TOPBAR ── */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-20 shadow-sm h-16 flex items-center justify-between px-6 lg:px-10 shrink-0">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Link href="/" className="hover:text-[#6EB8BB] transition-colors">Beranda</Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-800 font-bold">Ulasan Saya</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-[#6EB8BB]/10 hover:bg-[#6EB8BB]/20 text-[#6EB8BB] rounded-xl text-xs font-bold transition-all border border-[#6EB8BB]/20">
                <Home size={15} /> <span className="hidden sm:inline">Beranda</span>
                </Link>
            </div>
            </div>

            {/* ── CONTENT ── */}
            <div className="flex-1 p-6 lg:p-10">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* ── HERO BANNER ── */}
                <div className="relative bg-gradient-to-r from-[#5AA4A7] to-[#6EB8BB] rounded-3xl overflow-hidden p-8 text-white shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/20">
                        <Star size={24} className="text-amber-300 fill-amber-300" />
                        </div>
                        <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                        Kontribusi Anda
                        </span>
                    </div>
                    <h1 className="text-3xl font-black mb-2">Ulasan Saya</h1>
                    <p className="text-white/80 text-sm max-w-md leading-relaxed">
                        Setiap ulasan Anda membantu ribuan traveler lainnya untuk menemukan pengalaman terbaik di Barlingmascakep.
                    </p>
                    </div>
                    
                    {/* Stats Cards in Banner */}
                    <div className="flex gap-3">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[100px]">
                        <p className="text-3xl font-black text-white">{reviews.length}</p>
                        <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider mt-1">Ulasan</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[100px]">
                        <p className="text-3xl font-black text-white">
                        {reviews.reduce((acc, curr) => acc + (curr.photos?.length || 0), 0)}
                        </p>
                        <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider mt-1">Foto</p>
                    </div>
                    </div>
                </div>
                </div>

                {/* ── TABS & FILTER ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex p-1 bg-white border border-gray-200/60 rounded-2xl shadow-sm w-fit">
                    {["Semua", "Wisata", "Kuliner", "Oleh-oleh"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ${
                        activeTab === tab 
                            ? "bg-[#6EB8BB] text-white shadow-md" 
                            : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                        }`}
                    >
                        {tab}
                    </button>
                    ))}
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm">
                    <Filter size={16} /> Urutkan Terbaru
                </button>
                </div>

                {/* ── REVIEW LIST ── */}
                {filteredReviews.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                    <div className="w-20 h-20 rounded-full bg-[#E6F7F8] flex items-center justify-center mx-auto mb-6">
                    <MessageSquare size={32} className="text-[#6EB8BB]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Belum ada ulasan {activeTab !== "Semua" && activeTab}</h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
                    Anda belum memberikan ulasan di kategori ini. Bagikan pengalaman Anda untuk membantu traveler lain!
                    </p>
                    <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#6EB8BB] text-white font-bold rounded-xl text-sm hover:bg-[#5AA4A7] transition-all shadow-md shadow-[#6EB8BB]/20">
                    <MapPin size={18} /> Jelajahi Barlingmascakep
                    </Link>
                </div>
                ) : (
                <div className="grid gap-5">
                    {filteredReviews.map((review) => {
                    
                    // Tentukan Ikon berdasarkan kategori
                    let CatIcon = MapPin
                    let catColor = "text-blue-500 bg-blue-50 border-blue-100"
                    if (review.category === "Kuliner") { CatIcon = Coffee; catColor = "text-orange-500 bg-orange-50 border-orange-100" }
                    if (review.category === "Oleh-oleh") { CatIcon = ShoppingBag; catColor = "text-purple-500 bg-purple-50 border-purple-100" }

                    return (
                        <div key={review.id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group">
                        
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${catColor}`}>
                                <CatIcon size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 group-hover:text-[#6EB8BB] transition-colors">{review.title}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                                    <Calendar size={12} className="text-gray-400" /> {review.date}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{review.category}</span>
                                </div>
                            </div>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical size={18} />
                            </button>
                        </div>

                        {/* Rating Stars */}
                        <div className="flex items-center gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                                key={star} 
                                size={16} 
                                className={star <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} 
                            />
                            ))}
                            <span className="ml-2 text-sm font-bold text-gray-700">{review.rating}.0</span>
                        </div>

                        {/* Review Text */}
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            {review.comment}
                        </p>

                        {/* Photos (if any) */}
                        {review.photos && review.photos.length > 0 && (
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                            {review.photos.map((photo: string, i: number) => (
                                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-gray-200 cursor-pointer hover:opacity-90">
                                <img src={photo} alt="Review" className="w-full h-full object-cover" />
                                </div>
                            ))}
                            </div>
                        )}

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 hover:text-[#6EB8BB] transition-colors">
                                <ThumbsUp size={14} /> Membantu ({review.likes})
                            </button>
                            </div>
                            <div className="flex items-center gap-2">
                            <button className="text-xs font-bold text-[#6EB8BB] hover:underline px-2">Edit</button>
                            <span className="text-gray-300">|</span>
                            <button className="text-xs font-bold text-red-500 hover:underline px-2">Hapus</button>
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
        </div>
    )
    }