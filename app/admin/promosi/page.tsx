    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import PromotionForm from "@/components/admin/PromotionForm"
    import { Tag } from "lucide-react"

    export default async function AdminPromosiPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!["admin", "super_admin"].includes(profile?.role)) redirect("/dashboard")

    const { data: promos } = await supabase
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: false })

    return (
        <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-xl font-bold text-gray-900 mb-8">Manajemen Promosi</h1>
            <div className="grid lg:grid-cols-2 gap-6">
            {/* Form tambah promosi */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Buat Voucher Baru</h2>
                <PromotionForm />
            </div>

            {/* Daftar promosi */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Tag size={15} className="text-[#6EB8BB]" />
                <h2 className="text-sm font-bold text-gray-800">Voucher Aktif</h2>
                </div>
                <div className="divide-y divide-gray-50">
                {(promos ?? []).map((p: any) => (
                    <div key={p.id} className="px-5 py-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-gray-800 font-mono">{p.code}</p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {p.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                        </div>
                        <p className="text-xs text-gray-500">{p.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                        {p.type === "percentage" ? `${p.value}% off` : `Rp ${p.value.toLocaleString("id-ID")} off`}
                        {p.quota && ` · ${p.used_count}/${p.quota} dipakai`}
                        </p>
                    </div>
                    </div>
                ))}
                {(!promos || promos.length === 0) && (
                    <p className="text-center text-sm text-gray-300 py-8">Belum ada voucher.</p>
                )}
                </div>
            </div>
            </div>
        </div>
        </main>
    )
    }
