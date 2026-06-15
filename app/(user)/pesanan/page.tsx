    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import { Package, ChevronRight, ShoppingBag } from "lucide-react"

    const STATUS_LABEL: Record<string, { label: string; color: string }> = {
    pending:    { label: "Menunggu Pembayaran", color: "bg-amber-100 text-amber-700" },
    paid:       { label: "Sudah Dibayar",       color: "bg-blue-100 text-blue-700" },
    processing: { label: "Diproses",            color: "bg-purple-100 text-purple-700" },
    packing:    { label: "Dikemas",             color: "bg-indigo-100 text-indigo-700" },
    shipped:    { label: "Dikirim",             color: "bg-cyan-100 text-cyan-700" },
    delivered:  { label: "Diterima",            color: "bg-green-100 text-green-700" },
    cancelled:  { label: "Dibatalkan",          color: "bg-red-100 text-red-700" },
    refunded:   { label: "Dikembalikan",        color: "bg-gray-100 text-gray-600" },
    }

    export default async function PesananPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: orders } = await supabase
        .from("orders")
        .select(`
        id, order_number, status, total_amount,
        payment_method, payment_status, created_at,
        order_items(product_name, product_image, qty)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    return (
        <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-xl font-bold text-gray-900 mb-8">Pesanan Saya</h1>

            {!orders || orders.length === 0 ? (
            <div className="text-center py-20">
                <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-500 text-sm mb-6">Kamu belum punya pesanan.</p>
                <Link href="/produk" className="px-6 py-3 bg-[#6EB8BB] text-white font-semibold rounded-xl text-sm hover:bg-[#5AA4A7] transition-all">
                Mulai Belanja
                </Link>
            </div>
            ) : (
            <div className="space-y-3">
                {orders.map((order: any) => {
                const status = STATUS_LABEL[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-600" }
                const firstItem = order.order_items?.[0]
                return (
                    <Link
                    key={order.id}
                    href={`/pesanan/${order.id}`}
                    className="block bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all group"
                    >
                    <div className="flex items-start justify-between mb-3">
                        <div>
                        <p className="text-sm font-bold text-gray-800">{order.order_number}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                        {status.label}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                        {firstItem?.product_image && (
                        <img src={firstItem.product_image} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">{firstItem?.product_name}</p>
                        {order.order_items.length > 1 && (
                            <p className="text-xs text-gray-400">+{order.order_items.length - 1} produk lainnya</p>
                        )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div>
                        <span className="text-xs text-gray-400">Total: </span>
                        <span className="text-sm font-bold text-gray-900">
                            Rp {order.total_amount.toLocaleString("id-ID")}
                        </span>
                        </div>
                        <span className="text-xs text-[#6EB8BB] font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Lihat Detail <ChevronRight size={13} />
                        </span>
                    </div>
                    </Link>
                )
                })}
            </div>
            )}
        </div>
        </main>
    )
    }