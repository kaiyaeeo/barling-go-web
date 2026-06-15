    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import { TrendingUp, Download, ArrowUpRight, ArrowDownRight } from "lucide-react"

    export default async function AdminKeuanganPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login?mode=seller")

    const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name, umkm_name")
        .eq("id", user.id)
        .single()
    if (!["admin","super_admin"].includes(profile?.role ?? "")) redirect("/dashboard")

    const today      = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
    const lastMonthS = new Date(today.getFullYear(), today.getMonth()-1, 1).toISOString()
    const lastMonthE = monthStart

    const [
        { data: thisMonthOrders },
        { data: lastMonthOrders },
        { data: allOrders },
        { data: pendingOrders },
    ] = await Promise.all([
        supabase.from("orders").select("total_amount, created_at, order_number, shipping_name, status")
        .eq("payment_status","paid").gte("created_at", monthStart),
        supabase.from("orders").select("total_amount")
        .eq("payment_status","paid").gte("created_at",lastMonthS).lt("created_at",lastMonthE),
        supabase.from("orders")
        .select("id, order_number, shipping_name, total_amount, status, payment_status, created_at")
        .order("created_at",{ascending:false}).limit(10),
        supabase.from("orders").select("total_amount")
        .eq("payment_status","unpaid").not("status","in",'("cancelled","refunded")'),
    ])

    const revenueThis  = thisMonthOrders?.reduce((s,o) => s+o.total_amount,0) ?? 0
    const revenueLast  = lastMonthOrders?.reduce((s,o) => s+o.total_amount,0) ?? 0
    const revGrowth    = revenueLast > 0 ? ((revenueThis-revenueLast)/revenueLast*100).toFixed(1) : "0"
    const pendingTotal = pendingOrders?.reduce((s,o) => s+o.total_amount,0) ?? 0
    const txCount      = thisMonthOrders?.length ?? 0
    const avgOrder     = txCount > 0 ? Math.round(revenueThis/txCount) : 0

    const STATUS_COLOR: Record<string,string> = {
        paid:"bg-blue-100 text-blue-700", processing:"bg-purple-100 text-purple-700",
        shipped:"bg-cyan-100 text-cyan-700", delivered:"bg-green-100 text-green-700",
        cancelled:"bg-red-100 text-red-600", pending:"bg-amber-100 text-amber-700",
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-16">
        <div className="max-w-5xl mx-auto px-6 py-8">

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
            <div>
                <h1 className="text-xl font-bold text-gray-900">Keuangan</h1>
                <p className="text-sm text-gray-400 mt-0.5">Ringkasan pendapatan toko {profile?.umkm_name ?? profile?.full_name}</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                <Download size={14} /> Export Laporan
            </button>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
                {
                label:    "Pendapatan Bulan Ini",
                value:    `Rp ${revenueThis >= 1_000_000 ? (revenueThis/1_000_000).toFixed(1)+"jt" : (revenueThis/1_000).toFixed(0)+"rb"}`,
                sub:      `${Number(revGrowth) >= 0 ? "↑" : "↓"}${Math.abs(Number(revGrowth))}% vs bulan lalu`,
                subColor: Number(revGrowth) >= 0 ? "text-green-600" : "text-red-500",
                icon:     Number(revGrowth) >= 0 ? ArrowUpRight : ArrowDownRight,
                iconColor: Number(revGrowth) >= 0 ? "text-green-500" : "text-red-400",
                },
                {
                label: "Transaksi Bulan Ini",
                value: txCount.toLocaleString("id-ID"),
                sub:   "Pesanan terbayar",
                subColor: "text-gray-400",
                icon: TrendingUp,
                iconColor: "text-blue-400",
                },
                {
                label: "Rata-rata per Order",
                value: `Rp ${avgOrder >= 1_000 ? (avgOrder/1_000).toFixed(0)+"rb" : avgOrder}`,
                sub:   "Bulan ini",
                subColor: "text-gray-400",
                icon: TrendingUp,
                iconColor: "text-purple-400",
                },
                {
                label: "Menunggu Pembayaran",
                value: `Rp ${pendingTotal >= 1_000_000 ? (pendingTotal/1_000_000).toFixed(1)+"jt" : (pendingTotal/1_000).toFixed(0)+"rb"}`,
                sub:   `${pendingOrders?.length ?? 0} pesanan`,
                subColor: "text-amber-500",
                icon: TrendingUp,
                iconColor: "text-amber-400",
                },
            ].map((kpi) => {
                const Icon = kpi.icon
                return (
                <div key={kpi.label} className="bg-white border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-400">{kpi.label}</p>
                    <Icon size={15} className={kpi.iconColor} />
                    </div>
                    <p className="text-2xl font-black text-gray-900 mb-1">{kpi.value}</p>
                    <p className={`text-xs font-medium ${kpi.subColor}`}>{kpi.sub}</p>
                </div>
                )
            })}
            </div>

            {/* Transaksi terbaru */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900">Riwayat Transaksi</h2>
                <Link href="/admin/pesanan" className="text-xs text-[#6EB8BB] hover:underline">
                Lihat semua pesanan →
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400">NO. PESANAN</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400">PEMBELI</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400">TANGGAL</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 text-right">TOTAL</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400">STATUS</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400">PEMBAYARAN</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {(allOrders ?? []).map((order: any) => (
                    <Link key={order.id} href={`/admin/pesanan/${order.id}`} legacyBehavior>
                        <tr className="hover:bg-gray-50 transition-colors cursor-pointer">
                        <td className="px-5 py-3.5 font-bold text-gray-800">{order.order_number}</td>
                        <td className="px-5 py-3.5 text-gray-600">{order.shipping_name}</td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs">
                            {new Date(order.created_at).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-gray-900 text-right">
                            Rp {order.total_amount.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-3.5">
                            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                            {order.status}
                            </span>
                        </td>
                        <td className="px-5 py-3.5">
                            <span className={`text-[11px] font-semibold ${order.payment_status === "paid" ? "text-green-600" : "text-amber-500"}`}>
                            {order.payment_status === "paid" ? "✓ Lunas" : "⏳ Pending"}
                            </span>
                        </td>
                        </tr>
                    </Link>
                    ))}
                </tbody>
                </table>
            </div>

            {(!allOrders || allOrders.length === 0) && (
                <div className="text-center py-12 text-gray-400">
                <p className="text-sm">Belum ada transaksi.</p>
                </div>
            )}
            </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-100 mt-4">
            <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
            <div>
                <p className="text-sm font-bold text-gray-700">BARLING-GO</p>
                <p className="text-xs text-gray-400">© 2026 Memberdayakan UMKM Barlingmascakep.</p>
            </div>
            <div className="flex gap-5 text-xs text-gray-400">
                {["Tentang Kami","Pusat Bantuan","Privasi","Syarat & Ketentuan"].map((l) => (
                <a key={l} href="#" className="hover:text-gray-600">{l}</a>
                ))}
            </div>
            </div>
        </footer>
        </main>
    )
    }
