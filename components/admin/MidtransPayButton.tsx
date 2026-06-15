    "use client"

    import { useState } from "react"
    import { CreditCard, Loader2 } from "lucide-react"

    interface MidtransPayButtonProps {
    snapToken: string
    orderId: string
    onSuccess: () => void
    onPending: () => void
    }

    export default function MidtransPayButton({ snapToken, orderId, onSuccess, onPending }: MidtransPayButtonProps) {
    const [isProcessing, setIsProcessing] = useState(false)

    const handlePayment = () => {
        if (!snapToken) return
        setIsProcessing(true)

        // Memanggil library global Midtrans Snap
        if (typeof window !== "undefined" && (window as any).snap) {
        (window as any).snap.pay(snapToken, {
            onSuccess: function (result: any) {
            setIsProcessing(false)
            onSuccess()
            },
            onPending: function (result: any) {
            setIsProcessing(false)
            onPending()
            },
            onError: function (result: any) {
            setIsProcessing(false)
            alert("Pembayaran gagal, silakan coba lagi.")
            },
            onClose: function () {
            setIsProcessing(false)
            },
        })
        } else {
        setIsProcessing(false)
        alert("Midtrans SDK gagal dimuat. Periksa koneksi Anda.")
        }
    }

    return (
        <button
        onClick={handlePayment}
        disabled={isProcessing || !snapToken}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6EB8BB] hover:bg-[#5aa5a8] text-white text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
        >
        {isProcessing ? (
            <Loader2 size={16} className="animate-spin" />
        ) : (
            <CreditCard size={16} />
        )}
        Bayar Sekarang
        </button>
    )
    }