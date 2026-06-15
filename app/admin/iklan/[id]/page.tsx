    "use client"

    import { useState, useEffect } from "react"
    import { useParams, useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { ChevronLeft, Eye, MousePointerClick, Calendar, Loader2, ArrowLeft } from "lucide-react"
    import Link from "next/link"
    import MidtransPayButton from "@/components/admin/MidtransPayButton"

    export default function DetailIklanPage() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()
    const [ad, setAd] = useState<any>(null)
    const [stats, setStats] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const loadDetail = async () => {
        const { data: adData } = await supabase
        .from("ad_orders")
        .select("*, ad_packages(*)")
        .eq("id", id)
        .single()

        const { data: statsData } = await supabase
        .from("ad_stats")
        .select("*")
        .eq("ad_order_id", id)
        .order("date", { ascending: true })

        if (adData) setAd(adData)
        if (statsData) setStats(statsData)
        setIsLoading(false)
    }

    useEffect(() => {
        if (id) loadDetail()
    }, [id])

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#6EB8BB]" /></div>
    if (!ad) return <div className="p-12 text-center">Data iklan tidak ditemukan.</div>

    const totalImpressions = stats.reduce((acc, curr) => acc + (curr.impressions || 0), 0)
    const totalClicks = stats.reduce((acc, curr) => acc + (curr.clicks || 0), 0)

    return (
        <main className="min-h-screen bg-gray-50/60 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Navigation */}
            <Link href="/admin/iklan" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={14} /> Kembali ke Promosi
            </Link>

            {/* Info Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
                <span className="px-2 py-0.5 bg-[#6EB8BB]/10 text-[#6EB8BB] text-[10px] font-black rounded-md uppercase">Paket {ad.ad_packages?.name}</span>
                <h1 className="text-xl font-black text-gray-900">Invoice: {ad.midtrans_order_id || ad.id.slice(0, 12)}</h1>
                <p className="text-xs text-gray-400">Dibuat pada: {new Date(ad.created_at).toLocaleDateString("id-ID", { dateStyle: "long" })}</p>
            </div>
            <div className="flex flex-col justify-center items-end">
                {ad.status === "pending" && ad.midtrans_token && (
                <MidtransPayButton snapToken={ad.midtrans_token} orderId={ad.id} onSuccess={loadDetail} onPending={loadDetail} />
                )}
                {ad.status === "active" && (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold rounded-xl">🟢 Iklan Sedang Tayang</span>
                )}
                {ad.status === "expired" && (
                <span className="px-3 py-1 bg-gray-100 text-gray-400 text-xs font-bold rounded-xl">🔴 Sudah Berakhir</span>
                )}
            </div>
            </div>

            {/* Performa Analitik (Hanya muncul jika status aktif/expired) */}
            {ad.status !== "pending" && (
            <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-900">Metrik Insight Promosi</h2>
                <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center"><Eye size={20} /></div>
                    <div>
                    <p className="text-xl font-black text-gray-900">{totalImpressions}</p>
                    <p className="text-xs text-gray-400">Total Dilihat (Impressions)</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center"><MousePointerClick size={20} /></div>
                    <div>
                    <p className="text-xl font-black text-gray-900">{totalClicks}</p>
                    <p className="text-xs text-gray-400">Total Klik Produk</p>
                    </div>
                </div>
                </div>
            </div>
            )}
        </div>
        </main>
    )
    }