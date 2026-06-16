    "use client"

    import { useState } from "react"
    import { createClient } from "@/lib/supabase/client"
    import { useRouter } from "next/navigation"
    import { Loader2, PackageCheck, Truck, CheckCircle2 } from "lucide-react"

    type OrderActionProps = {
    orderId: string;
    status: string;
    }

    export default function OrderActionButton({ orderId, status }: OrderActionProps) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    // Fungsi untuk update status pesanan di Database
    const updateStatus = async (newStatus: string, confirmMessage: string) => {
        if (!confirm(confirmMessage)) return;

        setLoading(true)
        const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId)

        if (error) {
        alert("Gagal memproses pesanan: " + error.message)
        } else {
        router.refresh() // Refresh agar halaman Admin & Pembeli tersinkron
        }
        setLoading(false)
    }

    // Tampilkan tombol yang berbeda berdasarkan status pesanan saat ini
    if (status === "paid") {
        return (
        <button
            onClick={() => updateStatus("processing", "Terima dan proses pesanan ini?")}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <PackageCheck size={16} />}
            Terima Pesanan
        </button>
        )
    }

    if (status === "processing" || status === "packing") {
        return (
        <button
            onClick={() => updateStatus("shipped", "Tandai pesanan ini sudah diserahkan ke kurir?")}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Truck size={16} />}
            Kirim Pesanan
        </button>
        )
    }

    if (status === "shipped") {
        return (
        <button
            onClick={() => updateStatus("delivered", "Pesanan sudah sampai ke pembeli?")}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Tandai Selesai
        </button>
        )
    }

    // Jika pesanan sudah selesai/batal, tidak perlu aksi lanjutan.
    return null;
    }