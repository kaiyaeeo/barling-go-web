    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import StockAdjustButton from "@/components/produk/StockAdjustButton"
    import { Package, AlertTriangle } from "lucide-react"

    export default async function AdminInventoriPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!["admin", "super_admin"].includes(profile?.role)) redirect("/dashboard")

    const [{ data: products }, { data: logs }] = await Promise.all([
        supabase.from("products")
        .select("id, name, sku, stock, is_active, categories(name)")
        .eq("is_active", true)
        .order("stock", { ascending: true })
        .limit(50),
        supabase.from("inventory_log")
        .select("id, type, qty, stock_before, stock_after, reason, created_at, products(name)")
        .order("created_at", { ascending: false })
        .limit(20),
    ])

    return (
        <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-xl font-bold text-gray-900 mb-8">Inventori</h1>

            <div className="grid lg:grid-cols-3 gap-5">
            {/* Stock table */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <Package size={16} className="text-[#6EB8BB]" />
                    <h2 className="text-sm font-bold text-gray-800">Stok Produk</h2>
                </div>
                <div className="divide-y divide-gray-50">
                    {(products ?? []).map((p: any) => (
                    <div key={p.id} className="flex items-center gap-4 px-5 py-3">
                        <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.sku ?? "No SKU"} · {p.categories?.name}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                            <p className={`text-sm font-bold ${p.stock === 0 ? "text-red-500" : p.stock <= 5 ? "text-amber-500" : "text-gray-800"}`}>
                            {p.stock}
                            </p>
                            <p className="text-[11px] text-gray-400">unit</p>
                        </div>
                        {p.stock <= 5 && (
                            <AlertTriangle size={14} className={p.stock === 0 ? "text-red-400" : "text-amber-400"} />
                        )}
                        <StockAdjustButton productId={p.id} productName={p.name} currentStock={p.stock} />
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            </div>

            {/* Inventory log */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-800">Log Pergerakan Stok</h2>
                </div>
                <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                {(logs ?? []).map((log: any) => (
                    <div key={log.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        log.type === "in" ? "bg-green-100 text-green-700"
                        : log.type === "out" ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                        }`}>
                        {log.type === "in" ? "▲ Masuk" : log.type === "out" ? "▼ Keluar" : "⚙ Adj"}
                        </span>
                        <span className="text-[11px] text-gray-400">
                        {new Date(log.created_at).toLocaleDateString("id-ID")}
                        </span>
                    </div>
                    <p className="text-xs font-medium text-gray-700 truncate">{log.products?.name}</p>
                    <p className="text-[11px] text-gray-400">
                        {log.stock_before} → {log.stock_after} · {log.reason}
                    </p>
                    </div>
                ))}
                </div>
            </div>
            </div>
        </div>
        </main>
    )
    }
