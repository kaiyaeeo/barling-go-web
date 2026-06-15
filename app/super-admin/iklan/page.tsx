    "use client"

    import { useState, useEffect } from "react"
    import { createClient } from "@/lib/supabase/client"
    import { Megaphone, LayoutGrid, Receipt, ShieldAlert, Loader2, RefreshCw } from "lucide-react"
    import AdStatusToggle from "@/components/super-admin/AdStatusToggle"

    export default function SuperAdminIklanPage() {
    const supabase = createClient()
    const [orders, setOrders] = useState<any[]>([])
    const [packages, setPackages] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<"transaksi" | "paket">("transaksi")

    const fetchData = async () => {
        setIsLoading(true)
        const { data: ordersData } = await supabase
        .from("ad_orders")
        .select(`
            *,
            profiles (umkm_name, full_name),
            ad_packages (name, duration_days)
        `)
        .order("created_at", { ascending: false })

        const { data: packagesData } = await supabase
        .from("ad_packages")
        .select("*")
        .order("price", { ascending: true })

        if (ordersData) setOrders(ordersData)
        if (packagesData) setPackages(packagesData)
        setIsLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <main className="min-h-screen bg-gray-50/60 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Pusat Iklan & Promosi</h1>
                <p className="text-sm text-gray-400 mt-0.5">Kelola penawaran paket komersial dan tinjau performa promosi UMKM.</p>
            </div>
            <button onClick={fetchData} className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-100 rounded-xl shadow-sm">
                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-200">
            <button
                onClick={() => setActiveTab("transaksi")}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
                activeTab === "transaksi" ? "border-[#6EB8BB] text-[#6EB8BB]" : "border-transparent text-gray-400"
                }`}
            >
                <Receipt size={16} /> Daftar Transaksi & Pengajuan
            </button>
            <button
                onClick={() => setActiveTab("paket")}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
                activeTab === "paket" ? "border-[#6EB8BB] text-[#6EB8BB]" : "border-transparent text-gray-400"
                }`}
            >
                <LayoutGrid size={16} /> Konfigurasi Paket Iklan
            </button>
            </div>

            {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#6EB8BB]" /></div>
            ) : activeTab === "transaksi" ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-3">Nama Mitra</th>
                    <th className="px-6 py-3">Paket</th>
                    <th className="px-6 py-3">Nominal</th>
                    <th className="px-6 py-3">Tanggal Pengajuan</th>
                    <th className="px-6 py-3 text-right">Aksi Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                    {orders.length > 0 ? (
                    orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">
                            {order.profiles?.umkm_name || order.profiles?.full_name || "Mitra Lama"}
                        </td>
                        <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">
                            {order.ad_packages?.name}
                            </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800">
                            Rp {Number(order.amount).toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                            {new Date(order.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 flex justify-end">
                            <AdStatusToggle orderId={order.id} initialStatus={order.status} onStatusChange={fetchData} />
                        </td>
                        </tr>
                    ))
                    ) : (
                    <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-400">Belum ada pengajuan transaksi iklan.</td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {packages.map((pkg) => (
                <div key={pkg.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                    <h3 className="text-lg font-black text-gray-900">{pkg.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pkg.is_active ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-gray-50 text-gray-400 border border-gray-200"}`}>
                        {pkg.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                    </div>
                    <div>
                    <p className="text-2xl font-black text-[#6EB8BB]">Rp {Number(pkg.price).toLocaleString("id-ID")}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Masa aktif: {pkg.duration_days} Hari</p>
                    </div>
                    <div className="border-t border-gray-50 pt-3 text-xs text-gray-500 space-y-1.5">
                    <p>• Batas Promosi: <span className="font-bold text-gray-700">{pkg.max_products} Produk</span></p>
                    <p>• Penempatan: <span className="font-bold text-gray-700">{pkg.placement?.join(", ")}</span></p>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
        </main>
    )
    }