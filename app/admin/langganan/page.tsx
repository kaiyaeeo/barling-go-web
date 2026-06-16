    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import { ArrowLeft, Star, Crown, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react"
    import Link from "next/link"
    import { createClient } from "@/lib/supabase/client" // <-- WAJIB IMPORT INI

    export default function HalamanLangganan() {
    const router = useRouter()
    const [selectedPlan, setSelectedPlan] = useState<"premium" | "vip" | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const supabase = createClient() // <-- Inisialisasi Supabase

    // Fungsi untuk menyimpan status paket ke Supabase
    const updateSubscriptionStatus = async (plan: string) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
        .from("profiles")
        .update({ 
            promo_package: plan,
            updated_at: new Date().toISOString()
        })
        .eq("id", user.id)

        if (error) {
        console.error("Gagal sinkronisasi data ke database:", error.message)
        }
    }

    const handlePayment = async () => {
        if (!selectedPlan) return
        setIsProcessing(true)

        try {
        // 1. Panggil API Route Checkout
        const response = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            orderId: `PROMO-${Date.now()}`,
            grossAmount: selectedPlan === "premium" ? 55500 : 166500,
            customerDetails: {
                first_name: "Merchant Barling-GO",
                email: "merchant@barlinggo.com"
            },
            itemDetails: [{
                id: selectedPlan,
                price: selectedPlan === "premium" ? 55500 : 166500,
                quantity: 1,
                name: `Paket Langganan ${selectedPlan.toUpperCase()}`
            }]
            })
        })

        const txData = await response.json()

        if (txData.token) {
            // 2. Buka popup Midtrans Snap
            (window as any).snap.pay(txData.token, {
            onSuccess: async function (result: any) {
                // Panggil fungsi untuk update status ke Supabase
                await updateSubscriptionStatus(selectedPlan)
                alert("Pembayaran sukses! Akun Anda telah ditingkatkan.")
                router.push("/admin/toko")
                router.refresh()
            },
            onPending: function (result: any) {
                alert("Menunggu pembayaran Anda.");
            },
            onError: function (result: any) {
                alert("Pembayaran gagal, silakan coba lagi.");
            },
            onClose: function () {
                alert("Anda menutup halaman pembayaran sebelum selesai.");
            }
            })
        } else {
            alert("Gagal mendapatkan token transaksi Midtrans.")
        }
        } catch (err) {
        alert("Terjadi kesalahan sistem pembayaran.")
        } finally {
        setIsProcessing(false)
        }
    }

    return (
        <main className="min-h-screen bg-gray-50/50 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="mb-8">
            <Link href="/admin/toko" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                <ArrowLeft size={16} /> Kembali ke Profil
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Upgrade Mitra Promosi</h1>
            <p className="text-sm text-gray-500 mt-1">Pilih paket langganan bulanan untuk mendongkrak penjualan produk UMKM Anda.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
            
            {/* Kolom Kiri: Pilihan Paket */}
            <div className="space-y-6">
                
                {/* Paket Premium */}
                <label className={`block relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedPlan === "premium" ? "border-yellow-400 bg-yellow-50/30" : "border-gray-200 bg-white hover:border-yellow-200"}`}>
                <input type="radio" name="plan" className="absolute top-6 right-6 w-5 h-5 accent-yellow-500" onChange={() => setSelectedPlan("premium")} />
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center"><Star size={24} /></div>
                    <div>
                    <h2 className="text-lg font-bold text-gray-900">Premium Partner</h2>
                    <p className="text-sm text-gray-500">Rp 55.500 <span className="text-xs">/ bulan (Inc. PPN)</span></p>
                    </div>
                </div>
                <ul className="space-y-3 mt-4 border-t border-gray-100 pt-4">
                    {["Tampil di katalog rekomendasi", "Badge 'Mitra Terverifikasi'", "Prioritas pencarian tingkat menengah"].map((fitur, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 size={16} className="text-green-500 shrink-0" /> {fitur}
                    </li>
                    ))}
                </ul>
                </label>

                {/* Paket VIP */}
                <label className={`block relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedPlan === "vip" ? "border-yellow-400 bg-yellow-50/30 shadow-md" : "border-gray-200 bg-white hover:border-yellow-200"}`}>
                <input type="radio" name="plan" className="absolute top-6 right-6 w-5 h-5 accent-yellow-500" onChange={() => setSelectedPlan("vip")} />
                <div className="absolute -top-3 left-6 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
                    Paling Laris
                </div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-900 text-yellow-400 rounded-xl flex items-center justify-center"><Crown size={24} /></div>
                    <div>
                    <h2 className="text-lg font-bold text-gray-900">VIP Prioritas</h2>
                    <p className="text-sm text-gray-500">Rp 166.500 <span className="text-xs">/ bulan (Inc. PPN)</span></p>
                    </div>
                </div>
                <ul className="space-y-3 mt-4 border-t border-gray-100 pt-4">
                    {["Posisi #1 di semua hasil pencarian", "Banner Iklan Web Eksklusif di Beranda", "Tampil di katalog rekomendasi & Badge khusus", "Laporan analitik penjualan mingguan"].map((fitur, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 size={16} className="text-green-500 shrink-0" /> {fitur}
                    </li>
                    ))}
                </ul>
                </label>
            </div>

            {/* Kolom Kanan: Ringkasan Pembayaran */}
            <div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
                <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-4 mb-4">Ringkasan Pembayaran</h2>
                
                {!selectedPlan ? (
                    <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">Silakan pilih paket langganan di sebelah kiri terlebih dahulu.</p>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Paket Terpilih</span>
                        <span className="font-bold text-gray-900 capitalize">{selectedPlan}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Durasi</span>
                        <span className="font-semibold text-gray-900">1 Bulan</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Biaya PPN (11%)</span>
                        <span className="font-semibold text-gray-900">
                        Rp {selectedPlan === "premium" ? "5.500" : "16.500"}
                        </span>
                    </div>
                    
                    <div className="border-t border-dashed border-gray-200 pt-4 mt-2">
                        <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-900">Total Tagihan</span>
                        <span className="text-xl font-black text-[#6EB8BB]">
                            Rp {selectedPlan === "premium" ? "55.500" : "166.500"}
                        </span>
                        </div>
                    </div>

                    <button 
                        onClick={handlePayment} 
                        disabled={isProcessing}
                        className="w-full mt-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-70"
                    >
                        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                        {isProcessing ? "Membuka Midtrans..." : "Lanjutkan Pembayaran"}
                    </button>
                    
                    <div className="flex items-center justify-center gap-2 mt-4 opacity-50 grayscale">
                        <span className="text-xs font-bold font-mono border px-2 py-1 rounded">MIDTRANS</span>
                        <span className="text-xs font-bold font-mono border px-2 py-1 rounded">QRIS</span>
                        <span className="text-xs font-bold font-mono border px-2 py-1 rounded">GOPAY</span>
                    </div>
                    </div>
                )}
                </div>
            </div>

            </div>
        </div>
        </main>
    )
    }