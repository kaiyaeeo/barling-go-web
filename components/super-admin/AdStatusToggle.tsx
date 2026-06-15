        "use client"

        import { useState } from "react"
        import { createClient } from "@/lib/supabase/client"
        import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"

        interface AdStatusToggleProps {
        orderId: string
        initialStatus: string
        onStatusChange?: () => void
        }

        export default function AdStatusToggle({ orderId, initialStatus, onStatusChange }: AdStatusToggleProps) {
        const supabase = createClient()
        const [status, setStatus] = useState(initialStatus)
        const [isLoading, setIsLoading] = useState(false)

        const handleUpdateStatus = async (newStatus: string) => {
            setIsLoading(false)
            setIsLoading(true)
            
            // Tentukan waktu mulai dan berakhir jika iklan diaktifkan
            const startedAt = newStatus === "active" ? new Date().toISOString() : null
            let expiredAt = null
            
            if (newStatus === "active") {
            // Ambil durasi paket terlebih dahulu untuk menghitung masa kedaluwarsa
            const { data: orderData } = await supabase
                .from("ad_orders")
                .select("ad_packages(duration_days)")
                .eq("id", orderId)
                .single()
            
            const durationDays = (orderData?.ad_packages as any)?.duration_days || 30
            const expiryDate = new Date()
            expiryDate.setDate(expiryDate.getDate() + durationDays)
            expiredAt = expiryDate.toISOString()
            }

            const { error } = await supabase
            .from("ad_orders")
            .update({ 
                status: newStatus,
                payment_status: newStatus === "active" || newStatus === "paid" ? "paid" : "unpaid",
                started_at: startedAt,
                expired_at: expiredAt
            })
            .eq("id", orderId)

            if (!error) {
            setStatus(newStatus)
            if (onStatusChange) onStatusChange()
            }
            setIsLoading(false)
        }

        if (isLoading) return <Loader2 size={16} className="animate-spin text-[#6EB8BB]" />

        return (
            <div className="flex items-center gap-1.5">
            <select
                value={status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border focus:outline-none bg-white transition-all ${
                status === "active" ? "text-emerald-600 border-emerald-200 bg-emerald-50" :
                status === "pending" ? "text-amber-600 border-amber-200 bg-amber-50" :
                status === "paid" ? "text-blue-600 border-blue-200 bg-blue-50" :
                "text-gray-500 border-gray-200 bg-gray-50"
                }`}
            >
                <option value="pending">⏳ Pending</option>
                <option value="paid">💰 Paid (Verifikasi)</option>
                <option value="active">🟢 Active</option>
                <option value="expired">🔴 Expired</option>
                <option value="cancelled">❌ Cancelled</option>
            </select>
            </div>
        )
        }