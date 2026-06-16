    "use client"

    import { useEffect, useState } from "react"
    import { createClient } from "@/lib/supabase/client"
    import { Bell } from "lucide-react"
    import Link from "next/link"

    export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        const fetchUnreadCount = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { count } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("is_read", false)

        setUnreadCount(count || 0)
        }

        fetchUnreadCount()

        // 1. Buat nama channel menjadi unik dengan Date.now() agar tidak bentrok saat hot-reload
        const channelName = `bell-indicator-${Date.now()}`
        
        const channel = supabase
        .channel(channelName)
        // 2. Gunakan event: "*" untuk meringkas fungsi INSERT dan UPDATE menjadi satu baris
        .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => {
            fetchUnreadCount()
        })
        .subscribe()

        return () => {
        supabase.removeChannel(channel)
        }
    }, [supabase])

    return (
        <Link 
        href="/admin/notifikasi" 
        className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all flex items-center justify-center"
        title="Lihat Notifikasi"
        >
        <Bell size={18} />
        
        {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
        )}
        </Link>
    )
    }