    import { createClient } from "@/lib/supabase/server"
    import { redirect, notFound } from "next/navigation"
    import Link from "next/link"
    import { 
    ArrowLeft, Package, MapPin, CreditCard, Truck, Home, Bell, 
    Settings, CheckCircle, AlertCircle, Calendar, DollarSign, 
    Printer, Copy, MessageSquare, HelpCircle, ChevronRight
    } from "lucide-react"
    import UserSidebar from "@/components/user/UserSidebar"

    const STATUS_STEPS = [
    { key: "pending",    label: "Pesanan Dibuat",      desc: "Menunggu pembayaran dari pembeli", icon: "📝" },
    { key: "paid",       label: "Pembayaran Diterima", desc: "Pembayaran terverifikasi otomatis oleh sistem", icon: "💳" },
    { key: "processing", label: "Sedang Diproses",     desc: "Pesanan diteruskan ke penjual/UMKM", icon: "⏳" },
    { key: "packing",    label: "Dikemas",             desc: "Barang sedang dikemas dan siap diserahkan ke kurir", icon: "📦" },
    { key: "shipped",    label: "Dalam Pengiriman",    desc: "Pesanan sedang dalam perjalanan oleh kurir", icon: "🚚" },
    { key: "delivered",  label: "Diterima",            desc: "Pesanan telah sampai di alamat tujuan", icon: "✅" },
    ]

    const STATUS_ORDER = ["pending", "paid", "processing", "packing", "shipped", "delivered"]

    const STATUS_HEADER_INFO: Record<string, { title: string; desc: string; bg: string; text: string; border: string }> = {
    pending: {
        title: "Menunggu Pembayaran",
        desc: "Segera lakukan pembayaran sebelum batas waktu berakhir untuk menghindari pembatalan otomatis.",
        bg: "bg-amber-50",
        text: "text-amber-800",
        border: "border-amber-200/60"
    },
    paid: {
        title: "Pembayaran Berhasil",
        desc: "Terima kasih! Pembayaran Anda telah kami terima. Kami akan segera meneruskannya ke pihak penjual.",
        bg: "bg-blue-50/80",
        text: "text-blue-800",
        border: "border-blue-200/50"
    },
    processing: {
        title: "Pesanan Diproses",
        desc: "UMKM mitra kami sedang memproses dan menyiapkan pesanan Anda dengan penuh cinta.",
        bg: "bg-purple-50/80",
        text: "text-purple-800",
        border: "border-purple-200/50"
    },
    packing: {
        title: "Pesanan Sedang Dikemas",
        desc: "Produk Anda sedang dalam tahap pengemasan akhir dan akan segera diserahkan ke kurir pengiriman.",
        bg: "bg-indigo-50/80",
        text: "text-indigo-800",
        border: "border-indigo-200/50"
    },
    shipped: {
        title: "Pesanan Sedang Dikirim",
        desc: "Kabar gembira! Pesanan Anda telah diserahkan ke kurir dan sedang dalam perjalanan ke lokasi Anda.",
        bg: "bg-cyan-50/80",
        text: "text-cyan-800",
        border: "border-cyan-200/50"
    },
    delivered: {
        title: "Pesanan Selesai",
        desc: "Hore! Pesanan Anda telah tiba dengan selamat. Silakan konfirmasi ulasan dan bagikan pengalaman Anda.",
        bg: "bg-emerald-50/80",
        text: "text-emerald-800",
        border: "border-emerald-200/50"
    },
    cancelled: {
        title: "Pesanan Dibatalkan",
        desc: "Transaksi ini telah dibatalkan. Hubungi Customer Service jika ada pertanyaan lebih lanjut.",
        bg: "bg-rose-50/80",
        text: "text-rose-800",
        border: "border-rose-200/50"
    }
    }

    export default async function PesananDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")
    
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    
    const { data: order } = await supabase
        .from("orders")
        .select(`*, order_items(id, product_name, product_image, price, qty, subtotal)`)
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single()
        
    if (!order) notFound()
    const currentStep = STATUS_ORDER.indexOf(order.status)
    
    const headerInfo = STATUS_HEADER_INFO[order.status] ?? {
        title: "Status Transaksi",
        desc: "Detail informasi status transaksi pesanan Anda saat ini.",
        bg: "bg-gray-50",
        text: "text-gray-800",
        border: "border-gray-200"
    }
    
    const formattedDate = new Date(order.created_at).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    })

    return (
        <div className="flex min-h-screen bg-[#F5F5F5] antialiased text-gray-800">
        
        {/* ── SIDEBAR (tetap 280px) ── */}
        <div className="hidden md:block w-[280px] shrink-0 bg-white border-r border-gray-200 z-10">
            <UserSidebar profile={profile} active="pesanan" />
        </div>

        {/* ── KONTEN UTAMA ── */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
            
            {/* TOPBAR */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm h-16 flex items-center justify-between px-6 lg:px-8 shrink-0">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold">
                <Link href="/pesanan" className="text-gray-400 hover:text-[#6EB8BB]">Transaksi</Link>
                <ChevronRight size={14} className="text-gray-300" />
                <span className="text-gray-800">{order.order_number}</span>
            </div>
            <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-[#E6F7F8] hover:bg-[#C5EAE9] text-[#6EB8BB] rounded-xl text-xs font-bold transition-all">
                <Home size={15} /> <span className="hidden sm:block">Beranda</span>
                </Link>
                <div className="h-6 w-px bg-gray-200 mx-1" />
                <button className="p-2 text-gray-400 hover:text-[#6EB8BB] hover:bg-gray-50 rounded-xl transition-all relative">
                <Bell size={18} />
                </button>
                <Link href="/settings" className="p-2 text-gray-400 hover:text-[#6EB8BB] hover:bg-gray-50 rounded-xl transition-all">
                <Settings size={18} />
                </Link>
            </div>
            </div>

            {/* CONTAINER CONTENT */}
            <div className="p-6 lg:p-10 w-full max-w-5xl mx-auto space-y-6">
            
            {/* Header & Print Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                <Link href="/pesanan" className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-500 transition-colors shadow-sm">
                    <ArrowLeft size={16} />
                </Link>
                <div>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">{order.order_number}</h1>
                    <p className="text-xs text-gray-400 mt-0.5 font-semibold">Dibuat pada {formattedDate} WIB</p>
                </div>
                </div>
                
                <div className="flex items-center gap-2">
                <button 
                    onClick={() => {}} // placeholder untuk cetak invoice
                    className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                    <Printer size={14} className="text-gray-400" /> Cetak Invoice
                </button>
                </div>
            </div>

            {/* ── STATUS BANNER ── */}
            <div className={`rounded-2xl border ${headerInfo.border} ${headerInfo.bg} p-5 shadow-sm flex items-start gap-4`}>
                <div className="bg-white/80 p-2.5 rounded-xl border border-gray-200/40 text-[#6EB8BB] shrink-0 shadow-sm">
                <Package size={22} className="stroke-[2.5]" />
                </div>
                <div>
                <h3 className={`text-base font-black ${headerInfo.text}`}>{headerInfo.title}</h3>
                <p className="text-xs text-gray-600 mt-1 font-medium leading-relaxed">{headerInfo.desc}</p>
                </div>
            </div>

            {/* ── DETAIL PESANAN GRID ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Kolom Kiri: Produk & Status Tracker */}
                <div className="lg:col-span-2 space-y-6">
                
                {/* Daftar Produk */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
                    <Package size={18} className="text-[#6EB8BB]" />
                    <h2 className="text-sm font-black text-gray-900">Daftar Produk</h2>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                    {order.order_items.map((item: any) => (
                        <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                        {item.product_image ? (
                            <img 
                            src={item.product_image} 
                            alt={item.product_name} 
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100 bg-gray-50" 
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0 text-gray-300">
                            <Package size={22} />
                            </div>
                        )}
                        
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p className="text-sm font-bold text-gray-800 leading-tight mb-1">{item.product_name}</p>
                            <p className="text-xs font-semibold text-gray-500">
                            {item.qty} barang x Rp {item.price.toLocaleString("id-ID")}
                            </p>
                        </div>
                        
                        <div className="text-right flex flex-col justify-center shrink-0">
                            <p className="text-sm font-black text-gray-900">Rp {item.subtotal.toLocaleString("id-ID")}</p>
                            {order.status === "delivered" && (
                            <Link href="/ulasan" className="text-[10px] font-bold text-[#6EB8BB] hover:underline mt-1 bg-[#E6F7F8] px-2.5 py-0.5 rounded-full inline-block">
                                Tulis Ulasan
                            </Link>
                            )}
                        </div>
                        </div>
                    ))}
                    </div>

                    {/* Subtotal & Ringkasan Biaya */}
                    <div className="mt-6 pt-5 border-t border-gray-100 space-y-3 text-xs font-bold text-gray-500">
                    <div className="flex justify-between">
                        <span>Total Harga ({order.order_items.length} barang)</span>
                        <span className="text-gray-800">Rp {order.subtotal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Total Ongkos Kirim ({order.courier?.toUpperCase()} {order.courier_service})</span>
                        <span className="text-gray-800">Rp {order.shipping_cost.toLocaleString("id-ID")}</span>
                    </div>
                    {order.discount_amount > 0 && (
                        <div className="flex justify-between text-rose-500">
                        <span>Diskon Voucher ({order.voucher_code || "KUPON"})</span>
                        <span>- Rp {order.discount_amount.toLocaleString("id-ID")}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-black text-base text-gray-900 pt-4 mt-2 border-t border-gray-100">
                        <span>Total Belanja</span>
                        <span className="text-[#6EB8BB] text-lg">Rp {order.total_amount.toLocaleString("id-ID")}</span>
                    </div>
                    </div>
                </div>

                {/* Status Tracker Timeline */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                    <h2 className="text-sm font-black text-gray-900">Alur Perjalanan Pesanan</h2>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Metode Pengiriman: {order.courier?.toUpperCase()}</span>
                    </div>
                    
                    <div className="relative pl-3">
                    {/* Track line (gray background) */}
                    <div className="absolute left-[29px] top-6 bottom-6 w-0.5 bg-gray-100" />
                    {/* Filled line (active color progress) */}
                    <div
                        className="absolute left-[29px] top-6 w-0.5 bg-[#6EB8BB] transition-all duration-500 ease-out"
                        style={{ height: `${(Math.max(0, currentStep) / (STATUS_STEPS.length - 1)) * 92}%` }}
                    />
                    
                    <div className="space-y-6">
                        {STATUS_STEPS.map((step, i) => {
                        const done = i <= currentStep
                        const active = i === currentStep
                        return (
                            <div key={step.key} className="flex gap-4 relative items-start group">
                            {/* Circle bullet */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 z-10 border-2 transition-all shadow-sm ${
                                done 
                                ? "bg-[#6EB8BB] border-[#6EB8BB] text-white" 
                                : "bg-white border-gray-200 text-gray-300"
                            }`}>
                                {done ? "✓" : i + 1}
                            </div>
                            
                            <div className="pt-0.5">
                                <p className={`text-sm font-black ${active ? "text-[#6EB8BB]" : done ? "text-gray-900" : "text-gray-400"}`}>
                                <span className="mr-1.5">{step.icon}</span>
                                {step.label}
                                </p>
                                <p className={`text-xs mt-0.5 leading-relaxed ${active ? "text-gray-600 font-medium" : "text-gray-400"}`}>
                                {step.desc}
                                </p>
                                
                                {active && order.status !== "delivered" && (
                                <span className="text-[9px] font-black text-[#6EB8BB] uppercase tracking-widest mt-1.5 bg-[#E6F7F8] border border-[#6EB8BB]/15 inline-block px-2.5 py-0.5 rounded-full">
                                    Sedang Berjalan
                                </span>
                                )}
                            </div>
                            </div>
                        )
                        })}
                    </div>
                    </div>

                    {order.tracking_number && (
                    <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200/60">
                        <div className="flex items-center gap-3">
                        <div className="bg-[#E6F7F8] p-2 rounded-lg text-[#6EB8BB]">
                            <Truck size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">No. Resi Pengiriman</p>
                            <p className="text-sm font-black text-gray-900 mt-0.5">{order.tracking_number}</p>
                        </div>
                        </div>
                        
                        <button className="px-3.5 py-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 active:scale-95 transition-all">
                        <Copy size={12} /> Salin
                        </button>
                    </div>
                    )}
                </div>
                </div>

                {/* Kolom Kanan: Pembayaran & Pengiriman */}
                <div className="space-y-6">
                
                {/* Card Pembayaran */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <CreditCard size={18} className="text-[#6EB8BB]" />
                    <h2 className="text-sm font-black text-gray-900">Pembayaran</h2>
                    </div>
                    
                    <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Metode Pembayaran</p>
                    <p className="text-sm font-black text-gray-800 capitalize mb-4">{order.payment_method?.replace("_", " ")}</p>
                    
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Status Verifikasi</p>
                    <span className={`inline-flex px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${
                        order.payment_status === "paid" 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200/60" 
                        : "bg-amber-50 text-amber-600 border-amber-200/60"
                    }`}>
                        {order.payment_status === "paid" ? "Sukses" : "Menunggu Pembayaran"}
                    </span>
                    </div>
                    
                    {order.status === "pending" && (
                    <Link
                        href={`/pembayaran/${order.id}`}
                        className="flex items-center justify-center w-full py-3 bg-[#FF6B35] hover:bg-[#e5592a] text-white text-xs font-black rounded-xl hover:shadow-md transition-all text-center"
                    >
                        Bayar Sekarang
                    </Link>
                    )}
                </div>

                {/* Card Alamat Pengiriman */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <MapPin size={18} className="text-[#6EB8BB]" />
                    <h2 className="text-sm font-black text-gray-900">Alamat Pengiriman</h2>
                    </div>
                    
                    <div>
                    <p className="text-sm font-black text-gray-800 leading-tight">{order.shipping_name}</p>
                    <p className="text-xs font-bold text-gray-500 mt-1">{order.shipping_phone}</p>
                    <p className="text-xs text-gray-600 mt-3 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-200/60">
                        {order.shipping_address}, {order.shipping_city}, {order.shipping_province} {order.shipping_postal_code}
                    </p>
                    </div>
                </div>

                {/* Customer Service / Help Widget */}
                <div className="bg-gray-50 border border-gray-200/60 rounded-2xl p-5 shadow-sm space-y-3">
                    <h3 className="text-xs font-black text-gray-700 flex items-center gap-1.5">
                    <HelpCircle size={14} className="text-gray-400" /> Butuh Bantuan?
                    </h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                    Jika ada kendala terkait pembayaran, resi pengiriman, atau kerusakan produk, laporkan kepada customer service kami.
                    </p>
                    <button className="w-full py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 text-[11px] font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all">
                    <MessageSquare size={12} /> Hubungi CS Barling-GO
                    </button>
                </div>

                </div>
            </div>
            </div>
        </div>
        </div>
    )
    }