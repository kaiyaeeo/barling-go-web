    import { createClient } from "@/lib/supabase/server"
    import { redirect, notFound } from "next/navigation"
    import Link from "next/link"
    import { ArrowLeft } from "lucide-react"
    import OrderStatusUpdater from "@/components/pesanan/OrderStatusUpdater"

    export default async function AdminPesananDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!["admin", "super_admin"].includes(profile?.role)) redirect("/dashboard")

    const { data: order } = await supabase
        .from("orders")
        .select("*, order_items(id, product_name, product_image, price, qty, subtotal)")
        .eq("id", params.id)
        .single()

    if (!order) notFound()

    return (
        <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-3 mb-8">
            <Link href="/admin/pesanan" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                <ArrowLeft size={18} />
            </Link>
            <div>
                <h1 className="text-xl font-bold text-gray-900">{order.order_number}</h1>
                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString("id-ID")}</p>
            </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
                {/* Status updater */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Update Status & Resi</h2>
                <OrderStatusUpdater orderId={order.id} currentStatus={order.status} trackingNumber={order.tracking_number ?? ""} />
                </div>

                {/* Items */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Produk ({order.order_items.length})</h2>
                <div className="space-y-3">
                    {order.order_items.map((item: any) => (
                    <div key={item.id} className="flex gap-3 items-center">
                        {item.product_image && (
                        <img src={item.product_image} alt={item.product_name} className="w-12 h-12 rounded-xl object-cover" />
                        )}
                        <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                        <p className="text-xs text-gray-400">{item.qty}x · Rp {item.price.toLocaleString("id-ID")}</p>
                        </div>
                        <p className="text-sm font-bold">Rp {item.subtotal.toLocaleString("id-ID")}</p>
                    </div>
                    ))}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-sm">
                    <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span><span>Rp {order.subtotal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                    <span>Ongkos Kirim</span><span>Rp {order.shipping_cost.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 pt-2 border-t">
                    <span>Total</span><span className="text-[#6EB8BB]">Rp {order.total_amount.toLocaleString("id-ID")}</span>
                    </div>
                </div>
                </div>
            </div>

            <div className="space-y-4">
                {/* Customer info */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="text-sm font-bold text-gray-900 mb-3">Info Penerima</h2>
                <p className="text-sm font-semibold text-gray-800">{order.shipping_name}</p>
                <p className="text-sm text-gray-500">{order.shipping_phone}</p>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed text-xs">
                    {order.shipping_address},<br />{order.shipping_city}, {order.shipping_province} {order.shipping_postal_code}
                </p>
                </div>

                {/* Payment */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="text-sm font-bold text-gray-900 mb-3">Pembayaran</h2>
                <p className="text-sm text-gray-700 capitalize">{order.payment_method?.replace("_", " ")}</p>
                <span className={`inline-block mt-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    order.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}>
                    {order.payment_status === "paid" ? "✓ Lunas" : "Belum Bayar"}
                </span>
                {order.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">Catatan</p>
                    <p className="text-sm text-gray-600">{order.notes}</p>
                    </div>
                )}
                </div>
            </div>
            </div>
        </div>
        </main>
    )
    }