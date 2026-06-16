    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import { Truck, ChevronRight } from "lucide-react"

    export default async function AdminPengirimanPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!["admin", "super_admin"].includes(profile?.role)) redirect("/dashboard")

    // Order yang sudah dibayar dan belum selesai
    const { data: orders } = await supabase
        .from("orders")
        .select("id, order_number, shipping_name, shipping_city, courier, courier_service, tracking_number, status, paid_at")
        .in("status", ["paid", "processing", "packing", "shipped"])
        .order("paid_at", { ascending: true })

    const STATUS_COLOR: Record<string, string> = {
        paid:       "bg-blue-100 text-blue-700",
        processing: "bg-purple-100 text-purple-700",
        packing:    "bg-indigo-100 text-indigo-700",
        shipped:    "bg-cyan-100 text-cyan-700",
    }
    const STATUS_LABEL: Record<string, string> = {
        paid: "Dibayar", processing: "Diproses", packing: "Dikemas", shipped: "Dikirim",
    }

    return (
        <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-xl font-bold text-gray-900 mb-8">Manajemen Pengiriman</h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {["paid","processing","packing","shipped"].map((s) => (
                <div key={s} className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-2xl font-black text-gray-900">
                    {orders?.filter((o) => o.status === s).length ?? 0}
                </p>
                <p className="text-xs text-gray-400 mt-1">{STATUS_LABEL[s]}</p>
                </div>
            ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Truck size={16} className="text-[#6EB8BB]" />
                <h2 className="text-sm font-bold text-gray-800">Pesanan Perlu Diproses</h2>
            </div>
            {!orders || orders.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm">Tidak ada pesanan yang perlu diproses.</div>
            ) : (
                <div className="divide-y divide-gray-50">
                {orders.map((order) => (
                    <Link
                    key={order.id}
                    href={`/admin/pesanan/${order.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
                    >
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold text-gray-800">{order.order_number}</p>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status] ?? ""}`}>
                            {STATUS_LABEL[order.status] ?? order.status}
                        </span>
                        </div>
                        <p className="text-xs text-gray-400">
                        {order.shipping_name} · {order.shipping_city}
                        </p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-gray-700">{order.courier?.toUpperCase()} {order.courier_service}</p>
                        {order.tracking_number ? (
                        <p className="text-xs text-[#6EB8BB] font-mono">{order.tracking_number}</p>
                        ) : (
                        <p className="text-xs text-amber-500">Resi belum diisi</p>
                        )}
                    </div>
                    <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 shrink-0" />
                    </Link>
                ))}
                </div>
            )}
            </div>
        </div>
        </main>
    )
    }
