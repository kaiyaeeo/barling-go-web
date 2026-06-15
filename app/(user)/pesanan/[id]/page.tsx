    import { createClient } from "@/lib/supabase/server"
    import { redirect, notFound } from "next/navigation"
    import Link from "next/link"
    import { ArrowLeft, Package, MapPin, CreditCard, Truck } from "lucide-react"

    const STATUS_STEPS = [
    { key: "pending",    label: "Pesanan Dibuat",      icon: "📋" },
    { key: "paid",       label: "Pembayaran Diterima", icon: "💳" },
    { key: "processing", label: "Sedang Diproses",     icon: "⚙️" },
    { key: "packing",   label: "Dikemas",              icon: "📦" },
    { key: "shipped",   label: "Dalam Pengiriman",     icon: "🚚" },
    { key: "delivered", label: "Diterima",              icon: "✅" },
    ]

    const STATUS_ORDER = ["pending", "paid", "processing", "packing", "shipped", "delivered"]

    export default async function PesananDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: order } = await supabase
        .from("orders")
        .select(`
        *, order_items(id, product_name, product_image, price, qty, subtotal)
        `)
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single()

    if (!order) notFound()

    const currentStep = STATUS_ORDER.indexOf(order.status)

    return (
        <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
            <Link href="/pesanan" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                <ArrowLeft size={18} />
            </Link>
            <div>
                <h1 className="text-xl font-bold text-gray-900">{order.order_number}</h1>
                <p className="text-xs text-gray-400 mt-0.5">
                {new Date(order.created_at).toLocaleDateString("id-ID", { dateStyle: "full" })}
                </p>
            </div>
            </div>

            <div className="space-y-4">
            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="text-sm font-bold text-gray-900 mb-5">Status Pesanan</h2>
                <div className="relative">
                {/* Progress line */}
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100" />
                <div
                    className="absolute left-4 top-4 w-0.5 bg-[#6EB8BB] transition-all"
                    style={{ height: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
                <div className="space-y-5">
                    {STATUS_STEPS.map((step, i) => {
                    const done = i <= currentStep
                    const active = i === currentStep
                    return (
                        <div key={step.key} className="flex items-center gap-4 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 z-10 border-2 transition-all ${
                            done ? "bg-[#6EB8BB] border-[#6EB8BB]" : "bg-white border-gray-200"
                        }`}>
                            {done ? <span className="text-white text-xs">✓</span> : <span className="text-gray-400 text-xs">{i + 1}</span>}
                        </div>
                        <div>
                            <p className={`text-sm font-medium ${active ? "text-[#6EB8BB]" : done ? "text-gray-700" : "text-gray-400"}`}>
                            {step.icon} {step.label}
                            </p>
                            {active && order.status !== "delivered" && (
                            <p className="text-xs text-gray-400 mt-0.5">Status saat ini</p>
                            )}
                        </div>
                        </div>
                    )
                    })}
                </div>
                </div>

                {/* Tracking number */}
                {order.tracking_number && (
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-3">
                    <Truck size={16} className="text-[#6EB8BB]" />
                    <div>
                    <p className="text-xs text-gray-400">No. Resi {order.courier?.toUpperCase()}</p>
                    <p className="text-sm font-bold text-gray-800">{order.tracking_number}</p>
                    </div>
                </div>
                )}
            </div>

            {/* Order items */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                <Package size={16} className="text-[#6EB8BB]" />
                <h2 className="text-sm font-bold text-gray-900">Produk Dipesan</h2>
                </div>
                <div className="space-y-3">
                {order.order_items.map((item: any) => (
                    <div key={item.id} className="flex gap-3">
                    {item.product_image && (
                        <img src={item.product_image} alt={item.product_name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    )}
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                        <p className="text-xs text-gray-400">{item.qty}x Rp {item.price.toLocaleString("id-ID")}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-700">Rp {item.subtotal.toLocaleString("id-ID")}</p>
                    </div>
                ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span><span>Rp {order.subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                    <span>Ongkos Kirim ({order.courier?.toUpperCase()} {order.courier_service})</span>
                    <span>Rp {order.shipping_cost.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-[#6EB8BB]">Rp {order.total_amount.toLocaleString("id-ID")}</span>
                </div>
                </div>
            </div>

            {/* Alamat */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-[#6EB8BB]" />
                <h2 className="text-sm font-bold text-gray-900">Alamat Pengiriman</h2>
                </div>
                <p className="text-sm font-semibold text-gray-800">{order.shipping_name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{order.shipping_phone}</p>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                {order.shipping_address}, {order.shipping_city}, {order.shipping_province} {order.shipping_postal_code}
                </p>
            </div>

            {/* Pembayaran */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                <CreditCard size={16} className="text-[#6EB8BB]" />
                <h2 className="text-sm font-bold text-gray-900">Pembayaran</h2>
                </div>
                <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-700 capitalize">{order.payment_method?.replace("_", " ")}</p>
                    <p className={`text-xs mt-0.5 font-medium ${order.payment_status === "paid" ? "text-green-600" : "text-amber-600"}`}>
                    {order.payment_status === "paid" ? "✓ Sudah dibayar" : "⏳ Menunggu pembayaran"}
                    </p>
                </div>
                {order.status === "pending" && (
                    <Link
                    href={`/pembayaran/${order.id}`}
                    className="px-4 py-2 bg-[#FF6B35] text-white text-xs font-bold rounded-xl hover:bg-[#e5592a] transition-all"
                    >
                    Bayar Sekarang
                    </Link>
                )}
                </div>
            </div>
            </div>
        </div>
        </main>
    )
    }