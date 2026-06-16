    "use client"

    import { useState, useEffect } from "react"
    import { useRouter } from "next/navigation"
    import { useCartStore } from "@/store/cartStore"
    import { createClient } from "@/lib/supabase/client"
    import { Loader2, MapPin, Truck, CreditCard, ChevronRight } from "lucide-react"

    const PAYMENT_METHODS = [
    { value: "transfer_bank", label: "Transfer Bank", desc: "BCA, Mandiri, BRI, BNI" },
    { value: "virtual_account", label: "Virtual Account", desc: "Bayar via VA bank manapun" },
    { value: "qris", label: "QRIS", desc: "GoPay, OVO, Dana, dll" },
    { value: "cod", label: "COD", desc: "Bayar saat barang tiba" },
    ]

    const COURIERS = [
    { value: "jne", label: "JNE", services: ["REG", "YES", "OKE"] },
    { value: "sicepat", label: "SiCepat", services: ["REG", "BEST"] },
    { value: "jnt", label: "J&T", services: ["EZ"] },
    ]

    export default function CheckoutPage() {
    const router = useRouter()
    const supabase = createClient()
    const { items, totalPrice, clearCart } = useCartStore()

    const [profile, setProfile] = useState<any>(null)
    const [form, setForm] = useState({
        shipping_name: "",
        shipping_phone: "",
        shipping_address: "",
        shipping_city: "",
        shipping_province: "",
        shipping_postal_code: "",
        courier: "jne",
        courier_service: "REG",
        payment_method: "transfer_bank",
        notes: "",
    })
    const [shippingCost, setShippingCost] = useState(15000) // default, nanti dari API
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) { router.replace("/login"); return }
        supabase.from("profiles").select("full_name, phone").eq("id", user.id).single().then(({ data }) => {
            if (data) {
            setProfile(data)
            setForm((prev) => ({
                ...prev,
                shipping_name: data.full_name ?? "",
                shipping_phone: data.phone ?? "",
            }))
            }
        })
        })
    }, [])

    useEffect(() => {
        if (items.length === 0) router.replace("/keranjang")
    }, [items])

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.replace("/login"); return }

        const subtotal = totalPrice()
        const total = subtotal + shippingCost

        const res = await fetch("/api/pesanan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...form,
            shipping_cost: shippingCost,
            subtotal,
            total_amount: total,
            items: items.map((i) => ({
            product_id: i.id,
            product_name: i.name,
            product_image: i.image,
            price: i.price,
            qty: i.qty,
            subtotal: i.price * i.qty,
            })),
        }),
        })

        const data = await res.json()
        if (!res.ok) {
        setError(data.error ?? "Gagal membuat pesanan.")
        setLoading(false)
        return
        }

        clearCart()
        router.push(`/pesanan/${data.id}`)
    }

    const subtotal = totalPrice()
    const total = subtotal + shippingCost

    return (
        <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-xl font-bold text-gray-900 mb-8">Checkout</h1>

            <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">

                {/* Alamat Pengiriman */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-5">
                    <MapPin size={17} className="text-[#6EB8BB]" />
                    <h2 className="text-base font-bold text-gray-900">Alamat Pengiriman</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    {[
                        { name: "shipping_name", label: "Nama Penerima", col: "col-span-2", placeholder: "Nama lengkap" },
                        { name: "shipping_phone", label: "No. Telepon", col: "", placeholder: "08xxxxxxxxxx" },
                        { name: "shipping_city", label: "Kota/Kabupaten", col: "", placeholder: "Purwokerto" },
                        { name: "shipping_province", label: "Provinsi", col: "", placeholder: "Jawa Tengah" },
                        { name: "shipping_postal_code", label: "Kode Pos", col: "", placeholder: "53111" },
                    ].map((f) => (
                        <div key={f.name} className={f.col}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                        <input
                            name={f.name}
                            value={form[f.name as keyof typeof form]}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]"
                        />
                        </div>
                    ))}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Lengkap</label>
                        <textarea
                        name="shipping_address"
                        value={form.shipping_address}
                        onChange={handleChange}
                        placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                        required
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] resize-none"
                        />
                    </div>
                    </div>
                </div>

                {/* Kurir */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-5">
                    <Truck size={17} className="text-[#6EB8BB]" />
                    <h2 className="text-base font-bold text-gray-900">Pengiriman</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                    {COURIERS.map((c) => (
                        <label
                        key={c.value}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            form.courier === c.value ? "border-[#6EB8BB] bg-green-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                        >
                        <input
                            type="radio"
                            name="courier"
                            value={c.value}
                            checked={form.courier === c.value}
                            onChange={handleChange}
                            className="accent-[#6EB8BB]"
                        />
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{c.label}</p>
                            <p className="text-xs text-gray-400">{c.services.join(", ")}</p>
                        </div>
                        </label>
                    ))}
                    </div>
                    <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Layanan</label>
                    <select
                        name="courier_service"
                        value={form.courier_service}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] bg-white"
                    >
                        {COURIERS.find((c) => c.value === form.courier)?.services.map((s) => (
                        <option key={s} value={s}>{s} — Rp {shippingCost.toLocaleString("id-ID")}</option>
                        ))}
                    </select>
                    </div>
                </div>

                {/* Pembayaran */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-5">
                    <CreditCard size={17} className="text-[#6EB8BB]" />
                    <h2 className="text-base font-bold text-gray-900">Metode Pembayaran</h2>
                    </div>
                    <div className="space-y-2">
                    {PAYMENT_METHODS.map((pm) => (
                        <label
                        key={pm.value}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                            form.payment_method === pm.value ? "border-[#6EB8BB] bg-green-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                        >
                        <input
                            type="radio"
                            name="payment_method"
                            value={pm.value}
                            checked={form.payment_method === pm.value}
                            onChange={handleChange}
                            className="accent-[#6EB8BB]"
                        />
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{pm.label}</p>
                            <p className="text-xs text-gray-400">{pm.desc}</p>
                        </div>
                        </label>
                    ))}
                    </div>
                </div>

                {/* Catatan */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan untuk Penjual (opsional)</label>
                    <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Contoh: Tolong dikemas dengan rapi"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] resize-none"
                    />
                </div>
                </div>

                {/* Order summary */}
                <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
                    <h2 className="text-base font-bold text-gray-900 mb-4">Ringkasan Pesanan</h2>

                    <div className="space-y-2.5 mb-4 pb-4 border-b border-gray-100">
                    {items.map((item) => (
                        <div key={item.id} className="flex gap-2.5">
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 truncate">{item.name}</p>
                            <p className="text-xs text-gray-400">{item.qty}x Rp {item.price.toLocaleString("id-ID")}</p>
                        </div>
                        <p className="text-xs font-semibold text-gray-700 shrink-0">
                            Rp {(item.price * item.qty).toLocaleString("id-ID")}
                        </p>
                        </div>
                    ))}
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal</span>
                        <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Ongkos kirim</span>
                        <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
                    </div>
                    </div>

                    <div className="flex justify-between font-bold text-base pt-3 border-t border-gray-100 mb-5">
                    <span>Total</span>
                    <span className="text-[#6EB8BB]">Rp {total.toLocaleString("id-ID")}</span>
                    </div>

                    {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

                    <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#6EB8BB] hover:bg-[#5AA4A7] disabled:opacity-60 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
                    >
                    {loading && <Loader2 size={15} className="animate-spin" />}
                    {loading ? "Memproses..." : "Buat Pesanan"}
                    {!loading && <ChevronRight size={15} />}
                    </button>
                </div>
                </div>
            </div>
            </form>
        </div>
        </main>
    )
    }