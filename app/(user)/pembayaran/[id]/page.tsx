    "use client"

    import { useEffect, useState } from "react"
    import { useSearchParams, useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { Loader2, CheckCircle2, XCircle, Clock, FileText, ArrowLeft } from "lucide-react"
    import Link from "next/link"

    declare global {
    interface Window { snap: any }
    }

    type Order = {
    id: string
    order_number: string
    total_amount: number
    status: string
    payment_status: string
    payment_method: string
    midtrans_token?: string
    invoice_url?: string
    }

    export default function PembayaranPage({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const supabase = createClient()

    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [payLoading, setPayLoading] = useState(false)
    const [invoiceLoading, setInvoiceLoading] = useState(false)
    const [snapReady, setSnapReady] = useState(false)

    const statusParam = searchParams.get("status")

    useEffect(() => {
        // Load Midtrans Snap JS
        const script = document.createElement("script")
        script.src = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js"
        script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "")
        script.onload = () => setSnapReady(true)
        document.head.appendChild(script)
        return () => { document.head.removeChild(script) }
    }, [])

    useEffect(() => {
        fetchOrder()
    }, [params.id])

    // Cek status dari callback Midtrans
    useEffect(() => {
        if (statusParam === "finish" || statusParam === "pending") {
        fetchOrder()
        }
    }, [statusParam])

    async function fetchOrder() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.replace("/login"); return }

        const { data } = await supabase
        .from("orders")
        .select("id, order_number, total_amount, status, payment_status, payment_method, midtrans_token, invoice_url")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single()

        setOrder(data)
        setLoading(false)
    }

    async function handlePay() {
        if (!order) return
        setPayLoading(true)

        // Minta token baru dari server jika belum ada
        let token = order.midtrans_token
        if (!token) {
        const res = await fetch("/api/pembayaran/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: order.id }),
        })
        const data = await res.json()
        token = data.token
        }

        setPayLoading(false)
        if (!token || !snapReady) return

        window.snap.pay(token, {
        onSuccess: () => { fetchOrder(); router.replace(`/pembayaran/${order.id}?status=finish`) },
        onPending: () => { fetchOrder() },
        onError: () => { fetchOrder() },
        onClose: () => { setPayLoading(false) },
        })
    }

    async function handleGenerateInvoice() {
        if (!order) return
        setInvoiceLoading(true)
        const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
        })
        const data = await res.json()
        setInvoiceLoading(false)
        if (data.invoiceUrl) {
        setOrder((prev) => prev ? { ...prev, invoice_url: data.invoiceUrl } : prev)
        window.open(data.invoiceUrl, "_blank")
        }
    }

    if (loading) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-[#6EB8BB]" size={32} />
        </div>
        )
    }

    if (!order) {
        return (
        <div className="min-h-screen flex items-center justify-center text-center px-6">
            <div>
            <p className="text-gray-500">Pesanan tidak ditemukan.</p>
            <Link href="/pesanan" className="mt-4 inline-block text-[#6EB8BB] text-sm hover:underline">Lihat semua pesanan</Link>
            </div>
        </div>
        )
    }

    const isPaid = order.payment_status === "paid"
    const isCancelled = order.status === "cancelled"

    return (
        <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-lg mx-auto px-4 py-10">
            <Link href={`/pesanan/${order.id}`} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 mb-8 transition-colors">
            <ArrowLeft size={14} /> Kembali ke Detail Pesanan
            </Link>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Status banner */}
            <div className={`px-6 py-5 text-center ${isPaid ? "bg-green-50" : isCancelled ? "bg-red-50" : "bg-amber-50"}`}>
                {isPaid ? (
                <CheckCircle2 size={40} className="mx-auto text-green-500 mb-3" />
                ) : isCancelled ? (
                <XCircle size={40} className="mx-auto text-red-400 mb-3" />
                ) : (
                <Clock size={40} className="mx-auto text-amber-500 mb-3" />
                )}
                <h1 className="text-lg font-bold text-gray-900">
                {isPaid ? "Pembayaran Berhasil!" : isCancelled ? "Pesanan Dibatalkan" : "Menunggu Pembayaran"}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                {isPaid
                    ? "Pesananmu sedang diproses oleh penjual."
                    : isCancelled
                    ? "Pesanan ini telah dibatalkan."
                    : "Selesaikan pembayaran sebelum batas waktu."}
                </p>
            </div>

            {/* Order info */}
            <div className="px-6 py-5 space-y-3">
                <div className="flex justify-between text-sm">
                <span className="text-gray-500">No. Pesanan</span>
                <span className="font-semibold text-gray-800">{order.order_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                <span className="text-gray-500">Metode Bayar</span>
                <span className="font-medium text-gray-700 capitalize">{order.payment_method.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-3">
                <span className="text-gray-700">Total Tagihan</span>
                <span className="text-[#6EB8BB] text-base">Rp {order.total_amount.toLocaleString("id-ID")}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 space-y-3">
                {!isPaid && !isCancelled && (
                <button
                    onClick={handlePay}
                    disabled={payLoading || !snapReady}
                    className="w-full py-3.5 bg-[#FF6B35] hover:bg-[#e5592a] disabled:opacity-60 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
                >
                    {payLoading && <Loader2 size={15} className="animate-spin" />}
                    {payLoading ? "Membuka halaman bayar..." : "Bayar Sekarang"}
                </button>
                )}

                {isPaid && (
                <button
                    onClick={handleGenerateInvoice}
                    disabled={invoiceLoading}
                    className="w-full py-3 border border-[#6EB8BB] text-[#6EB8BB] font-semibold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-green-50 transition-all"
                >
                    {invoiceLoading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                    {order.invoice_url ? "Unduh Invoice" : "Generate Invoice"}
                </button>
                )}

                <Link
                href="/pesanan"
                className="block text-center w-full py-3 border border-gray-200 text-gray-600 font-medium rounded-xl text-sm hover:bg-gray-50 transition-all"
                >
                Lihat Semua Pesanan
                </Link>
            </div>
            </div>
        </div>
        </main>
    )
    }
