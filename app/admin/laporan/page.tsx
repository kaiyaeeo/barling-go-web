    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import ExportButton from "@/components/admin/ExportButton"
    import { FileText, BarChart2, Package, DollarSign } from "lucide-react"

    export default async function AdminLaporanPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!["admin", "super_admin"].includes(profile?.role)) redirect("/dashboard")

    const reports = [
        { id: "penjualan", label: "Laporan Penjualan", desc: "Semua transaksi yang sudah dibayar dengan detail produk", icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
        { id: "stok", label: "Laporan Stok", desc: "Kondisi stok terkini semua produk aktif", icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
        { id: "transaksi", label: "Laporan Transaksi", desc: "Semua order dan status pembayaran", icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
        { id: "produk", label: "Performa Produk", desc: "Produk terlaris, rating, dan total pendapatan per produk", icon: BarChart2, color: "text-amber-600", bg: "bg-amber-50" },
    ]

    return (
        <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900">Laporan & Export</h1>
            <p className="text-sm text-gray-400 mt-1">Export data dalam format Excel (.xlsx) atau HTML</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
            {reports.map((r) => {
                const Icon = r.icon
                return (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl ${r.bg} flex items-center justify-center shrink-0`}>
                        <Icon size={20} className={r.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-bold text-gray-900 mb-1">{r.label}</h2>
                        <p className="text-xs text-gray-400 leading-relaxed mb-4">{r.desc}</p>
                        <ExportButton reportId={r.id} label={r.label} />
                    </div>
                    </div>
                </div>
                )
            })}
            </div>
        </div>
        </main>
    )
    }
