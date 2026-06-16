    "use client"

    import React, { useEffect, useState } from "react"
    import Link from "next/link"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { 
    Home, 
    Bell, 
    Settings as SettingsIcon, 
    Star, 
    ChevronRight, 
    MessageSquare, 
    PenTool, 
    CheckCircle2, 
    ThumbsUp, 
    Calendar, 
    Award,
    Loader2,
    X,
    AlertCircle,
    Package,
    Sparkles,
    Info,
    ChevronLeft
    } from "lucide-react"
    import UserSidebar from "@/components/user/UserSidebar"

    interface ReviewItem {
    id: string
    rating: number
    body: string
    created_at: string
    content_id: string
    contents: {
        title: string
        cover_image: string | null
        type: string
    } | null
    }

    interface PendingReviewItem {
    id: string
    name: string
    image: string | null
    type: string
    }

    export default function UlasanPage() {
    const router = useRouter()
    const supabase = createClient()
    
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<"pending" | "history">("pending")
    const [profile, setProfile] = useState<any>(null)
    const [reviews, setReviews] = useState<ReviewItem[]>([])
    const [pendingReviews, setPendingReviews] = useState<PendingReviewItem[]>([])
    
    // State Modal Tulis Ulasan
    const [selectedItem, setSelectedItem] = useState<PendingReviewItem | null>(null)
    const [ratingInput, setRatingInput] = useState(5)
    const [ratingHover, setRatingHover] = useState<number | null>(null)
    const [reviewTextInput, setReviewTextInput] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)

    // Load Data User, Profil, Ulasan & Pending Ulasan dari Supabase
    async function loadReviewData() {
        try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push("/login")
            return
        }

        const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()
        setProfile(prof)

        const { data: writtenReviews } = await supabase
            .from("content_reviews")
            .select(`
            id, rating, body, created_at, content_id,
            contents:content_id (title, cover_image, type)
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
        
        setReviews(writtenReviews as any[] || [])

        // Filter item pesanan selesai yang belum diulas
        const { data: completedOrders } = await supabase
            .from("orders")
            .select(`
            id, status,
            order_items (product_id, product_name, product_image)
            `)
            .eq("user_id", user.id)
            .eq("status", "delivered")

        const reviewedIds = new Set(writtenReviews?.map(r => r.content_id) || [])
        const pendingList: PendingReviewItem[] = []
        
        completedOrders?.forEach((order: any) => {
            order.order_items?.forEach((item: any) => {
            if (!reviewedIds.has(item.product_id)) {
                if (!pendingList.some(p => p.id === item.product_id)) {
                pendingList.push({
                    id: item.product_id,
                    name: item.product_name,
                    image: item.product_image,
                    type: "produk"
                })
                }
            }
            })
        })

        // Jika kosong, sediakan dummy produk rekomendasi dari DB sebagai fallback interaktif
        if (pendingList.length === 0) {
            const { data: sampleProducts } = await supabase
            .from("products")
            .select("id, name, images")
            .limit(3)
            
            sampleProducts?.forEach((prod: any) => {
            if (!reviewedIds.has(prod.id)) {
                pendingList.push({
                id: prod.id,
                name: prod.name,
                image: prod.images?.[0] || null,
                type: "oleh-oleh"
                })
            }
            })
        }

        setPendingReviews(pendingList)
        } catch (err) {
        console.error(err)
        } finally {
        setLoading(false)
        }
    }

    useEffect(() => {
        loadReviewData()
    }, [])

    // Mengirim ulasan ke Supabase
    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedItem || !reviewTextInput.trim()) return

        setSubmitting(true)
        try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from("content_reviews")
            .insert({
            user_id: user.id,
            content_id: selectedItem.id,
            rating: ratingInput,
            body: reviewTextInput,
            created_at: new Date().toISOString()
            })

        if (error) throw error

        setSubmitSuccess(true)
        setReviewTextInput("")
        setRatingInput(5)
        
        await loadReviewData()
        
        setTimeout(() => {
            setSubmitSuccess(false)
            setSelectedItem(null)
        }, 1500)

        } catch (err) {
        console.error(err)
        alert("Terjadi kesalahan saat mengirim ulasan.")
        } finally {
        setSubmitting(false)
        }
    }

    const totalReviews = reviews.length
    const averageRating = totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : "0.0"

    // Hitung jumlah distribusi rating bintang untuk chart
    const ratingDistribution = [0, 0, 0, 0, 0] // index 0 = bintang 5, index 4 = bintang 1
    reviews.forEach(r => {
        const starIdx = 5 - Math.round(r.rating)
        if (starIdx >= 0 && starIdx < 5) {
        ratingDistribution[starIdx]++
        }
    })

    // Render Skeleton Loading
    if (loading) {
        return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <div className="hidden md:block w-[280px] shrink-0 bg-white border-r border-gray-200 z-10"></div>
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto items-center justify-center">
            <Loader2 size={40} className="text-[#6EB8BB] animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Memuat data ulasan...</p>
            </div>
        </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] antialiased text-gray-800">
        
        {/* ── SIDEBAR ── */}
        <div className="hidden md:block w-[280px] shrink-0 bg-white border-r border-gray-200 z-10">
            <UserSidebar profile={profile} active="ulasan" />
        </div>

        {/* ── KONTEN UTAMA ── */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
            
            {/* TOPBAR */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm h-16 flex items-center justify-between px-6 lg:px-10 shrink-0">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold">
                <Link href="/ulasan" className="text-slate-400 hover:text-[#6EB8BB]">Profil</Link>
                <ChevronRight size={14} className="text-slate-300" />
                <span className="text-gray-800">Ulasan Saya</span>
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

            {/* CONTENT AREA: Lebar diubah menjadi max-w-6xl agar selaras dengan profil */}
            <div className="p-6 lg:p-10 w-full max-w-6xl mx-auto space-y-6">
            
            {/* Header & Dashboard Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                <h1 className="text-2xl font-black text-gray-900">Ulasan & Penilaian</h1>
                <p className="text-xs text-gray-400 mt-1">Kelola masukan Anda untuk meningkatkan kualitas produk UMKM lokal.</p>
                </div>
                
                {/* Promo / Loyalitas Badge */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-[#6EB8BB]/10 to-[#9FCCCE]/10 border border-[#6EB8BB]/20 px-4 py-2.5 rounded-2xl shadow-xs">
                <Sparkles size={16} className="text-[#6EB8BB]" />
                <div className="text-[11px] font-bold text-slate-700">
                    Ulas & Dapatkan Poin
                    <span className="block text-[9px] text-[#6EB8BB] font-semibold mt-0.5">+10 Poin per ulasan produk</span>
                </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left Column: Tabs Navigation and Item list */}
                <div className="lg:col-span-2 space-y-6">
                
                {/* TABS NAVIGASI */}
                <div className="flex items-center border-b border-gray-200 w-full bg-white px-4 pt-1 rounded-t-2xl border-x border-t border-gray-100 shadow-2xs">
                    <button 
                    onClick={() => setActiveTab("pending")}
                    className={`px-5 py-3.5 text-xs font-bold border-b-2 transition-all relative -mb-px ${
                        activeTab === "pending" 
                        ? "border-[#6EB8BB] text-[#6EB8BB]" 
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    >
                    <div className="flex items-center gap-2">
                        Menunggu Ulasan
                        {pendingReviews.length > 0 && (
                        <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black min-w-[16px]">
                            {pendingReviews.length}
                        </span>
                        )}
                    </div>
                    </button>
                    
                    <button 
                    onClick={() => setActiveTab("history")}
                    className={`px-5 py-3.5 text-xs font-bold border-b-2 transition-all -mb-px ${
                        activeTab === "history" 
                        ? "border-[#6EB8BB] text-[#6EB8BB]" 
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    >
                    Riwayat Ulasan ({reviews.length})
                    </button>
                </div>

                {/* TAB CONTENT: MENUNGGU ULASAN */}
                {activeTab === "pending" && (
                    <div className="space-y-4">
                    {pendingReviews.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-xs flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-[#6EB8BB]/10 rounded-full flex items-center justify-center mb-4 text-[#6EB8BB]">
                            <CheckCircle2 size={36} />
                        </div>
                        <h2 className="text-base font-extrabold text-gray-900 mb-1">Semua pesanan telah diulas!</h2>
                        <p className="text-xs text-gray-400 mb-6 max-w-xs mx-auto font-medium">
                            Terima kasih banyak atas partisipasi aktif Anda dalam memberikan masukan belanja.
                        </p>
                        <Link href="/pesanan" className="inline-flex px-6 py-2.5 bg-gradient-to-r from-[#6EB8BB] to-[#87C5C7] text-white font-extrabold rounded-xl text-xs transition-all shadow-xs hover:scale-[1.01] active:scale-[0.98]">
                            Lihat Pesanan Saya
                        </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {pendingReviews.map((item) => (
                            <div 
                            key={item.id} 
                            className="bg-white rounded-2xl border border-gray-150 p-4 shadow-xs flex items-center gap-4 hover:shadow-md transition-all duration-300 group"
                            >
                            <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                                {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Package size={22} />
                                </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-[9px] font-black text-[#6EB8BB] bg-[#6EB8BB]/10 border border-[#6EB8BB]/10 px-2 py-0.5 rounded-md uppercase tracking-wider mb-1.5 inline-block">
                                Belum Diulas
                                </span>
                                <h3 className="text-xs font-bold text-gray-800 truncate mb-2.5 group-hover:text-[#6EB8BB] transition-colors" title={item.name}>{item.name}</h3>
                                <button 
                                onClick={() => setSelectedItem(item)}
                                className="w-full py-2 bg-[#6EB8BB]/10 hover:bg-[#6EB8BB]/20 text-[#6EB8BB] font-extrabold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1.5 active:scale-95"
                                >
                                <PenTool size={11} /> Tulis Ulasan
                                </button>
                            </div>
                            </div>
                        ))}
                        </div>
                    )}
                    </div>
                )}

                {/* TAB CONTENT: RIWAYAT ULASAN */}
                {activeTab === "history" && (
                    <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-xs flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4 text-amber-500">
                            <MessageSquare size={36} />
                        </div>
                        <h2 className="text-base font-extrabold text-gray-900 mb-1">Belum ada riwayat ulasan</h2>
                        <p className="text-xs text-gray-400 max-w-xs mx-auto font-medium">Anda belum pernah mengirimkan penilaian untuk produk/destinasi.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                        {reviews.map((review) => (
                            <div 
                            key={review.id} 
                            className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs space-y-4 hover:shadow-md transition-all duration-300"
                            >
                            <div className="flex items-start justify-between gap-4 pb-3 border-b border-gray-100">
                                <div className="flex items-center gap-3 min-w-0">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                                    {review.contents?.cover_image ? (
                                    <img src={review.contents.cover_image} alt={review.contents?.title} className="w-full h-full object-cover" />
                                    ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Package size={20} />
                                    </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200/60 px-2 py-0.5 rounded">
                                    {review.contents?.type || "Produk"}
                                    </span>
                                    <h3 className="text-xs font-bold text-gray-800 truncate mt-1 leading-snug">{review.contents?.title || "Produk/Destinasi Pilihan"}</h3>
                                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-semibold">
                                    <Calendar size={10} />
                                    <span>Diulas {new Date(review.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                                    </div>
                                </div>
                                </div>
                                
                                {/* Stars badge */}
                                <div className="flex items-center gap-0.5 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100 shrink-0">
                                <Star size={12} className="text-amber-500 fill-amber-500" />
                                <span className="text-xs font-extrabold text-amber-600">{review.rating}</span>
                                </div>
                            </div>
                            
                            {/* Bubble review */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 relative pl-6">
                                <div className="absolute top-2 left-2 text-3xl text-slate-350/30 font-serif leading-none select-none">"</div>
                                <p className="text-xs text-slate-600 relative z-10 leading-relaxed font-medium">
                                {review.body}
                                </p>
                            </div>
                            
                            {/* Helpful Counter (E-commerce Style) */}
                            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 pt-1">
                                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50/60 px-2 py-0.5 rounded-md border border-emerald-100">
                                <ThumbsUp size={10} /> +10 Poin Kontribusi
                                </div>
                                <span>0 orang menganggap ulasan ini membantu</span>
                            </div>

                            </div>
                        ))}
                        </div>
                    )}
                    </div>
                )}

                </div>

                {/* Right Column: Distribution stats & guidelines */}
                <div className="space-y-6">
                
                {/* Rating Distribution Panel */}
                <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs space-y-4">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100">
                    Statistik Rating Saya
                    </h3>
                    
                    <div className="flex items-center gap-4">
                    <div className="text-center shrink-0">
                        <p className="text-4xl font-black text-slate-800">{averageRating}</p>
                        <div className="flex items-center justify-center gap-0.5 mt-1.5 text-amber-500">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                            key={star} 
                            size={12} 
                            className={star <= Math.round(parseFloat(averageRating)) ? "fill-amber-500 text-amber-500" : "text-slate-200 fill-slate-200"} 
                            />
                        ))}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">{totalReviews} Ulasan</p>
                    </div>
                    
                    {/* Progress lines */}
                    <div className="flex-1 space-y-1.5">
                        {ratingDistribution.map((count, idx) => {
                        const starNum = 5 - idx
                        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                        return (
                            <div key={starNum} className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                            <span className="w-3 text-right">{starNum}</span>
                            <Star size={10} className="text-amber-500 fill-amber-500 shrink-0" />
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                className="h-full bg-gradient-to-r from-[#6EB8BB] to-[#9FCCCE] rounded-full" 
                                style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="w-6 text-right text-slate-400 font-semibold">{count}</span>
                            </div>
                        )
                        })}
                    </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs space-y-3.5">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-1.5">
                    <Info size={14} className="text-[#6EB8BB]" /> Tips Menulis Ulasan
                    </h3>
                    <ul className="space-y-2.5 text-[11px] text-slate-500 leading-relaxed font-semibold">
                    <li className="flex items-start gap-1.5">
                        <span className="text-[#6EB8BB] mt-0.5">✔</span>
                        <span>Tulis ulasan yang jujur mengenai rasa kuliner, keramahan destinasi, atau kualitas produk.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                        <span className="text-[#6EB8BB] mt-0.5">✔</span>
                        <span>Sampaikan saran konstruktif yang membangun agar para pengrajin UMKM dapat terus berinovasi.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                        <span className="text-[#6EB8BB] mt-0.5">✔</span>
                        <span>Hindari menulis kata-kata kasar, sara, atau spam link luar demi kenyamanan bersama.</span>
                    </li>
                    </ul>
                </div>

                </div>

            </div>

            </div>
        </div>

        {/* ── MODAL POP-UP TULIS ULASAN (Premium Redesign) ── */}
        {selectedItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs transition-opacity">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in duration-200">
                
                {/* Header Modal */}
                <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between bg-slate-50">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <PenTool size={14} className="text-[#6EB8BB]" /> Tulis Ulasan Belanja
                </h3>
                <button 
                    onClick={() => setSelectedItem(null)}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-200 transition-colors"
                >
                    <X size={16} />
                </button>
                </div>

                {/* Jika Berhasil */}
                {submitSuccess ? (
                <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-2 border border-emerald-100">
                    <CheckCircle2 size={28} className="animate-bounce" />
                    </div>
                    <h2 className="text-sm font-extrabold text-slate-800">Ulasan Berhasil Terkirim!</h2>
                    <p className="text-xs text-slate-400 font-semibold">Kontribusi ulasan Anda telah kami terima.</p>
                </div>
                ) : (
                /* Form Ulasan */
                <form onSubmit={handleSubmitReview} className="p-6 space-y-5">
                    
                    {/* Info Produk yg diulas */}
                    <div className="flex items-center gap-3.5 bg-slate-50 p-3 rounded-2xl border border-slate-150">
                    <div className="w-12 h-12 rounded-xl bg-white overflow-hidden border border-slate-200 shrink-0">
                        {selectedItem.image ? (
                        <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package size={16} />
                        </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Menilai Produk</p>
                        <p className="text-xs font-bold text-slate-700 line-clamp-1">{selectedItem.name}</p>
                    </div>
                    </div>

                    {/* Input Rating Bintang */}
                    <div className="text-center space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Bagaimana kepuasan Anda?</p>
                    <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRatingInput(star)}
                            onMouseEnter={() => setRatingHover(star)}
                            onMouseLeave={() => setRatingHover(null)}
                            className="p-1 hover:scale-110 transition-transform focus:outline-none"
                        >
                            <Star 
                            size={32} 
                            className={`transition-colors duration-100 ${
                                star <= (ratingHover ?? ratingInput) 
                                ? "text-amber-400 fill-amber-400" 
                                : "text-slate-200 fill-slate-200"
                            }`} 
                            />
                        </button>
                        ))}
                    </div>
                    <p className="text-[10px] font-bold text-amber-500 bg-amber-50 py-1 px-3 w-fit mx-auto rounded-md border border-amber-100">
                        {ratingInput === 1 && "Sangat Buruk 😞"}
                        {ratingInput === 2 && "Buruk 😕"}
                        {ratingInput === 3 && "Cukup 😐"}
                        {ratingInput === 4 && "Baik 🙂"}
                        {ratingInput === 5 && "Sangat Bagus! 🤩"}
                    </p>
                    </div>

                    {/* Input Teks Ulasan */}
                    <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Bagikan pengalaman Anda</label>
                    <textarea
                        required
                        value={reviewTextInput}
                        onChange={(e) => setReviewTextInput(e.target.value)}
                        placeholder="Ceritakan kualitas produk/destinasi, pelayanan, atau hal lain yang berkesan..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-750 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/40 focus:border-[#6EB8BB] transition-all resize-none h-32 leading-relaxed font-semibold"
                    ></textarea>
                    </div>

                    {/* Tombol Submit */}
                    <button
                    type="submit"
                    disabled={submitting || !reviewTextInput.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-[#6EB8BB] to-[#87C5C7] text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
                    >
                    {submitting ? (
                        <><Loader2 size={14} className="animate-spin" /> Mengirim...</>
                    ) : (
                        <><CheckCircle2 size={14} /> Kirim Ulasan</>
                    )}
                    </button>

                </form>
                )}
            </div>
            </div>
        )}

        </div>
    )
    }