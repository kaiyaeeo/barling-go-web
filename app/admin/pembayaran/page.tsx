    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import { ChevronRight, CreditCard } from "lucide-react"

    export default async function AdminPembayaranPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!["admin", "super_admin"].includes(profile?.role)) redirect("/dashboard")

    const { data: orders } = await supabase
        .from("orders")
        .select("id, order_number, shipping_name, total_amount, payment_method, payment_status, paid_at, status, created_at")
        .order("created_at", { ascending: false })
        .limit(50)

    const totalPaid = orders?.filter((o) => o.payment_status === "paid").reduce((s, o) => s + o.total_amount, 0) ?? 0
    const totalPending = orders?.filter((o) => o.payment_status === "unpaid").length ?? 0
    const todayPaid = orders?.filter((o) => {
        const today = new Date().toDateString()
        return o.payment_status === "paid" && o.paid_at && new Date(o.paid_at).toDateString() === today
    }).length ?? 0

    return (
        <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-xl font-bold text-gray-900 mb-8">Manajemen Pembayaran</h1>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-xs text-gray-400 mb-1">Total Omzet</p>
                <p className="text-2xl font-black text-[#6EB8BB]">Rp {totalPaid.toLocaleString("id-ID")}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-xs text-gray-400 mb-1">Menunggu Pembayaran</p>
                <p className="text-2xl font-black text-amber-500">{totalPending}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-xs text-gray-400 mb-1">Dibayar Hari Ini</p>
                <p className="text-2xl font-black text-blue-500">{todayPaid}</p>
            </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <CreditCard size={16} className="text-[#6EB8BB]" />
                <h2 className="text-sm font-bold text-gray-800">Daftar Transaksi</h2>
            </div>
            <div className="divide-y divide-gray-50">
                {(orders ?? []).map((order) => (
                <Link
                    key={order.id}
                    href={`/admin/pesanan/${order.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
                >
                    <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">{order.order_number}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {order.shipping_name} · {new Date(order.created_at).toLocaleDateString("id-ID")}
                    </p>
                    </div>
                    <div className="text-center shrink-0">
                    <p className="text-xs text-gray-400 capitalize">{order.payment_method.replace("_", " ")}</p>
                    </div>
                    <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">Rp {order.total_amount.toLocaleString("id-ID")}</p>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        order.payment_status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                        {order.payment_status === "paid" ? "Lunas" : "Belum Bayar"}
                    </span>
                    </div>
                    <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 shrink-0" />
                </Link>
                ))}
            </div>
            </div>
        </div>
        </main>
    )
    }
