    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import { Users } from "lucide-react"

    export default async function AdminPelangganPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!["admin", "super_admin"].includes(profile?.role)) redirect("/dashboard")

    const { data: customers } = await supabase
        .from("customer_stats")
        .select("id, full_name, phone, joined_at, total_orders, total_spent, last_order_at")
        .order("total_spent", { ascending: false })
        .limit(50)

    const totalCustomers = customers?.length ?? 0
    const vipCount = customers?.filter((c) => c.total_orders >= 5 || c.total_spent >= 500000).length ?? 0
    const newCount = customers?.filter((c) => c.total_orders === 0).length ?? 0

    function getSegment(c: any) {
        if (c.total_orders >= 5 || c.total_spent >= 500000) return { label: "VIP", color: "bg-amber-100 text-amber-700" }
        if (c.total_orders >= 1) return { label: "Regular", color: "bg-blue-100 text-blue-700" }
        return { label: "New", color: "bg-gray-100 text-gray-500" }
    }

    return (
        <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-xl font-bold text-gray-900 mb-8">Manajemen Pelanggan</h1>

            <div className="grid grid-cols-3 gap-4 mb-8">
            {[
                { label: "Total Pelanggan", value: totalCustomers, color: "text-gray-900" },
                { label: "VIP", value: vipCount, color: "text-amber-600" },
                { label: "Pelanggan Baru", value: newCount, color: "text-blue-600" },
            ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                </div>
            ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Users size={16} className="text-[#6EB8BB]" />
                <h2 className="text-sm font-bold text-gray-800">Database Pelanggan</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400">Pelanggan</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400">Segmen</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 text-right">Pesanan</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 text-right">Total Belanja</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400">Terakhir Order</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400">Bergabung</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {(customers ?? []).map((c: any) => {
                    const seg = getSegment(c)
                    return (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                            <p className="font-semibold text-gray-800">{c.full_name ?? "—"}</p>
                            <p className="text-xs text-gray-400">{c.phone ?? "—"}</p>
                        </td>
                        <td className="px-5 py-3">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${seg.color}`}>{seg.label}</span>
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-gray-700">{c.total_orders}</td>
                        <td className="px-5 py-3 text-right font-bold text-[#6EB8BB]">
                            Rp {(c.total_spent ?? 0).toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-400">
                            {c.last_order_at ? new Date(c.last_order_at).toLocaleDateString("id-ID") : "—"}
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-400">
                            {new Date(c.joined_at).toLocaleDateString("id-ID")}
                        </td>
                        </tr>
                    )
                    })}
                </tbody>
                </table>
            </div>
            </div>
        </div>
        </main>
    )
    }
