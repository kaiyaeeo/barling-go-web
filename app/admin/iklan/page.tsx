    "use client"

    import { useState, useEffect } from "react"
    import { createClient } from "@/lib/supabase/client"
    import { Megaphone, CheckCircle, ArrowUpRight, Loader2, Sparkles } from "lucide-react"
    import Link from "next/link"

    export default function AdminIklanPage() {
    const supabase = createClient()
    const [packages, setPackages] = useState<any[]>([])
    const [myAds, setMyAds] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadIklanData() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: pkgData } = await supabase.from("ad_packages").select("*").eq("is_active", true)
        const { data: adsData } = await supabase
            .from("ad_orders")
            .select("*, ad_packages(name)")
            .eq("seller_id", user.id)
            .order("created_at", { ascending: false })

        if (pkgData) setPackages(pkgData)
        if (adsData) setMyAds(adsData)
        setIsLoading(false)
        }
        loadIklanData()
    }, [])

    const handleBeliPaket = async (pkg: any) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return alert("Silakan login kembali")

        // PANGGIL BACKEND ACTION / ENDPOINT API INTERNAL UNTUK PEMBUATAN MIDTRANS TRANSACTION
        // Di sini kita contohkan simulasi response sukses pembuatan order awal di DB
        alert(`Memproses pembuatan invoice untuk paket ${pkg.name}. Integrasikan dengan endpoint API router Midtrans Anda di sini.`)
    }

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#6EB8BB]" /></div>

    return (
        <main className="min-h-screen bg-gray-50/60 p-6 space-y-8">
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
            <h1 className="text-2xl font-black text-gray-900">Pusat Promosi Toko</h1>
            <p className="text-sm text-gray-400 mt-0.5">Naikkan visibilitas produk Anda di platform Barling-GO dengan paket iklan strategis.</p>
            </div>

            {/* Pilihan Paket */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
                <div key={pkg.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-[#6EB8BB]/40 transition-all">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#6EB8BB]/10 flex items-center justify-center text-[#6EB8BB]"><Sparkles size={16} /></div>
                    <h3 className="text-base font-black text-gray-900">{pkg.name}</h3>
                    </div>
                    <div>
                    <p className="text-2xl font-black text-gray-900">Rp {Number(pkg.price).toLocaleString("id-ID")}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Durasi aktif {pkg.duration_days} hari</p>
                    </div>
                    <ul className="text-xs text-gray-500 space-y-2 border-t border-gray-50 pt-4">
                    <li className="flex items-center gap-2"><CheckCircle size={12} className="text-[#6EB8BB]" /> Maks {pkg.max_products} Produk</li>
                    <li className="flex items-center gap-2"><CheckCircle size={12} className="text-[#6EB8BB]" /> Penempatan: {pkg.placement?.join(", ")}</li>
                    </ul>
                </div>
                <button onClick={() => handleBeliPaket(pkg)} className="w-full mt-6 py-2.5 bg-gray-900 text-white font-bold text-xs rounded-xl group-hover:bg-[#6EB8BB] transition-colors">
                    Pilih Paket
                </button>
                </div>
            ))}
            </div>

            {/* Riwayat Kuota Promosi */}
            <div className="space-y-3">
            <h2 className="text-base font-bold text-gray-900">Riwayat Pengajuan Iklan Saya</h2>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                {myAds.length > 0 ? (
                <div className="divide-y divide-gray-50">
                    {myAds.map((ad) => (
                    <div key={ad.id} className="p-4 flex items-center justify-between hover:bg-gray-50/40 transition-all">
                        <div>
                        <p className="text-sm font-bold text-gray-800">Paket {ad.ad_packages?.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Order ID: {ad.midtrans_order_id || ad.id.slice(0,8)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            ad.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>{ad.status.toUpperCase()}</span>
                        <Link href={`/admin/iklan/${ad.id}`} className="p-1.5 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-lg"><ArrowUpRight size={16} /></Link>
                        </div>
                    </div>
                    ))}
                </div>
                ) : (
                <div className="p-12 text-center text-sm text-gray-400 flex flex-col items-center justify-center gap-2">
                    <Megaphone size={24} className="text-gray-300" />
                    Anda belum memiliki riwayat promosi aktif.
                </div>
                )}
            </div>
            </div>
        </div>
        </main>
    )
    }