    "use client"

    import React, { useEffect, useState } from "react"
    import Link from "next/link"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { 
    Bell, Package, CreditCard, Info, CheckCircle2, 
    ChevronLeft, ChevronRight, Home, Clock, CheckCheck
    } from "lucide-react"

    // Struktur Data Notifikasi
    interface Notification {
    id: string
    user_id: string
    title: string
    message: string
    type: "pesanan" | "pembayaran" | "promo" | "sistem"
    reference_id: string | null
    is_read: boolean
    created_at: string
    }

    export default function NotifikasiPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        async function fetchNotifications() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push("/login?redirect=/notifikasi")
            return
        }
        setUser(user)

        try {
            const { data, error } = await supabase
            .from("user_notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

            if (error) throw error
            if (data) setNotifications(data as Notification[])
        } catch (err) {
            console.error("Gagal memuat notifikasi:", err)
        } finally {
            setLoading(false)
        }
        }

        fetchNotifications()
    }, [router, supabase])

    useEffect(() => {
        if (!user) return

        const channel = supabase.channel('realtime_user_notif')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'user_notifications', 
            filter: `user_id=eq.${user.id}` 
        }, (payload) => {
            setNotifications(prev => [payload.new as Notification, ...prev])
        })
        .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [user, supabase])

    const handleReadAndNavigate = async (notif: Notification) => {
        if (!notif.is_read) {
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
        await supabase.from("user_notifications").update({ is_read: true }).eq("id", notif.id)
        }

        if ((notif.type === "pesanan" || notif.type === "pembayaran") && notif.reference_id) {
        router.push(`/pesanan/${notif.reference_id}`)
        }
    }

    const handleMarkAllRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
        if (unreadIds.length === 0) return

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        await supabase.from("user_notifications").update({ is_read: true }).in("id", unreadIds)
    }

    const getIcon = (type: string) => {
        switch (type) {
        case "pembayaran": return <CreditCard size={18} className="text-amber-500" />
        case "pesanan":    return <Package size={18} className="text-[#6EB8BB]" />
        case "promo":      return <CheckCircle2 size={18} className="text-emerald-500" />
        default:           return <Info size={18} className="text-blue-500" />
        }
    }

    const getIconBg = (type: string) => {
        switch (type) {
        case "pembayaran": return "bg-amber-100 border-amber-200"
        case "pesanan":    return "bg-[#E6F7F8] border-[#6EB8BB]/20"
        case "promo":      return "bg-emerald-100 border-emerald-200"
        default:           return "bg-blue-100 border-blue-200"
        }
    }

    if (loading) {
        return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
            <Bell className="animate-bounce text-[#6EB8BB] mb-3" size={32} />
            <p className="text-sm font-bold text-gray-500">Memuat notifikasi...</p>
        </div>
        )
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    return (
        <div className="min-h-screen bg-[#F8FAFC] antialiased text-gray-800 pb-12">
        
        {/* ── TOPBAR NAVIGATION ── */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm h-16 flex items-center justify-between px-6 lg:px-12">
            <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-gray-400 hover:text-[#6EB8BB] transition-colors">
                <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-bold">
                <button onClick={() => router.back()} className="text-gray-800 hover:text-[#6EB8BB]">Kembali</button>
                <ChevronRight size={14} className="text-gray-300" />
                <span className="text-gray-400 font-semibold">Notifikasi</span>
            </div>
            </div>
            <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-[#E6F7F8] hover:bg-[#C5EAE9] text-[#6EB8BB] rounded-xl text-xs font-bold transition-all">
            <Home size={14} /> <span className="hidden sm:block">Beranda</span>
            </Link>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="max-w-3xl mx-auto px-4 md:px-6 mt-8">
            <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                Notifikasi {unreadCount > 0 && <span className="text-xs font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">{unreadCount} Baru</span>}
            </h1>
            {unreadCount > 0 && (
                <button 
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-[#6EB8BB] hover:text-[#5ca3a6] flex items-center gap-1 transition-colors"
                >
                <CheckCheck size={14} /> Tandai Semua Dibaca
                </button>
            )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {notifications.length === 0 ? (
                <div className="text-center py-20 px-6">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <Bell size={28} className="text-gray-300" />
                </div>
                <h3 className="text-base font-black text-gray-800 mb-1">Belum Ada Notifikasi</h3>
                <p className="text-xs text-gray-500 font-medium">Informasi pesanan dan promo terbaru akan muncul di sini.</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                {notifications.map((notif) => (
                    <div 
                    key={notif.id} 
                    onClick={() => handleReadAndNavigate(notif)}
                    className={`p-5 flex items-start gap-4 cursor-pointer transition-all hover:bg-gray-50 ${!notif.is_read ? "bg-[#E6F7F8]/30" : "bg-white"}`}
                    >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${getIconBg(notif.type)}`}>
                        {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className={`text-sm truncate ${!notif.is_read ? "font-black text-gray-900" : "font-bold text-gray-700"}`}>
                            {notif.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 shrink-0">
                            <Clock size={10} /> 
                            {new Date(notif.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                        </span>
                        </div>
                        <p className={`text-xs leading-relaxed line-clamp-2 ${!notif.is_read ? "text-gray-700 font-medium" : "text-gray-500"}`}>
                        {notif.message}
                        </p>
                    </div>
                    {!notif.is_read && (
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 mt-1.5 shadow-sm" />
                    )}
                    </div>
                ))}
                </div>
            )}
            </div>

        </div>
        </div>
    )
    }