    import { createClient } from "@/lib/supabase/server"
    import Link from "next/link"
    import {
    Users, Store, ShoppingBag, TrendingUp, ArrowRight, Clock,
    CheckCircle2, Bell, Settings, LayoutDashboard, ChevronUp,
    Activity, Globe, BadgeCheck, AlertCircle, Package
    } from "lucide-react"

    export default async function SuperAdminDashboardPage() {
    const supabase = await createClient()

    const [
        { count: totalUsers },
        { count: totalUMKM },
        { count: totalOrders },
        { data: revenueData },
        { data: pendingVerif },
        { data: recentUsers },
        { data: platformStats },
        { count: activeProducts },
        { count: pendingOrders },
    ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "user"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
        supabase.from("orders").select("*", { count: "exact", head: true }).not("status", "in", '("cancelled","refunded")'),
        supabase.from("orders").select("total_amount").eq("payment_status", "paid"),
        supabase.from("umkm_verifications").select("id, business_name, created_at, profiles(full_name)").eq("status", "pending").limit(5),
        supabase.from("profiles").select("id, full_name, role, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("site_stats").select("key, value, label"),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ])

    const totalRevenue = revenueData?.reduce((s, o) => s + o.total_amount, 0) ?? 0

    const kpis = [
        {
        label: "Total User",
        value: totalUsers?.toLocaleString("id-ID") ?? "0",
        sub: "+8% bulan ini",
        trend: "up",
        icon: Users,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100",
        href: "/super-admin/users",
        },
        {
        label: "UMKM Terdaftar",
        value: totalUMKM?.toLocaleString("id-ID") ?? "0",
        sub: `${pendingVerif?.length ?? 0} menunggu verifikasi`,
        trend: "neutral",
        icon: Store,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        href: "/super-admin/umkm",
        },
        {
        label: "Total Transaksi",
        value: totalOrders?.toLocaleString("id-ID") ?? "0",
        sub: `${pendingOrders ?? 0} sedang diproses`,
        trend: "up",
        icon: ShoppingBag,
        color: "text-purple-600",
        bg: "bg-purple-50",
        border: "border-purple-100",
        href: "/super-admin/laporan-platform",
        },
        {
        label: "Total Omzet Platform",
        value: `Rp ${(totalRevenue / 1_000_000).toFixed(1)}jt`,
        sub: "Akumulasi semua transaksi",
        trend: "up",
        icon: TrendingUp,
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
        href: "/super-admin/laporan-platform",
        },
    ]

    const ROLE_COLOR: Record<string, string> = {
        user: "bg-blue-50 text-blue-700 border-blue-100",
        admin: "bg-emerald-50 text-emerald-700 border-emerald-100",
        super_admin: "bg-purple-50 text-purple-700 border-purple-100",
    }

    const ROLE_LABEL: Record<string, string> = {
        user: "User",
        admin: "Merchant",
        super_admin: "Super Admin",
    }

    const quickLinks = [
        { label: "Kelola Wisata", href: "/super-admin/kelola-wisata", icon: Globe, color: "text-teal-600", bg: "bg-teal-50" },
        { label: "Kelola UMKM", href: "/super-admin/umkm", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Laporan Platform", href: "/super-admin/laporan-platform", icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Manajemen User", href: "/super-admin/users", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Semua Produk", href: "/super-admin/produk", icon: Package, color: "text-orange-600", bg: "bg-orange-50" },
        { label: "Pengaturan", href: "/super-admin/pengaturan", icon: Settings, color: "text-gray-600", bg: "bg-gray-100" },
    ]

    const now = new Date()
    const hour = now.getHours()
    const greeting = hour < 11 ? "Selamat Pagi" : hour < 15 ? "Selamat Siang" : hour < 18 ? "Selamat Sore" : "Selamat Malam"

    return (
        <main className="min-h-screen bg-gray-50/60">

        {/* ===== TOP NAV ===== */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                <LayoutDashboard size={14} />
                <span>Super Admin</span>
                <span>›</span>
                <span className="text-gray-700 font-semibold">Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                {(pendingVerif?.length ?? 0) > 0 && (
                    <Link href="/super-admin/umkm" className="relative p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all">
                    <Bell size={17} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </Link>
                )}
                <Link href="/super-admin/pengaturan" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                    <Settings size={17} />
                </Link>
                <div className="h-5 w-px bg-gray-200 mx-1" />
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6EB8BB] to-[#9FCCCE] flex items-center justify-center text-white text-xs font-black">S</div>
                    <span className="text-sm font-semibold text-gray-700 hidden sm:block">Super Admin</span>
                </div>
                </div>
            </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-12">

            {/* ===== GREETING HERO ===== */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#9FCCCE] via-[#6EB8BB] to-[#9FCCCE] p-6 md:p-8 text-white">
            <div className="absolute right-0 top-0 w-64 h-64 opacity-5 translate-x-1/4 -translate-y-1/4 pointer-events-none">
                <Activity size={256} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                <p className="text-green-300 text-sm font-medium mb-1">{greeting}, Super Admin 👋</p>
                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">Platform Barling-GO</h1>
                <p className="text-green-200 text-sm mt-1.5">
                    {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
                </div>
                <div className="flex flex-wrap gap-3 shrink-0">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-center min-w-[90px]">
                    <p className="text-xl font-black text-white">{activeProducts ?? 0}</p>
                    <p className="text-[11px] text-green-200 mt-0.5">Produk Aktif</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-center min-w-[90px]">
                    <p className="text-xl font-black text-white">{pendingOrders ?? 0}</p>
                    <p className="text-[11px] text-green-200 mt-0.5">Order Proses</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-center min-w-[90px]">
                    <p className="text-xl font-black text-amber-300">{pendingVerif?.length ?? 0}</p>
                    <p className="text-[11px] text-green-200 mt-0.5">Perlu Aksi</p>
                </div>
                </div>
            </div>
            </div>

            {/* ===== KPI GRID ===== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => {
                const Icon = kpi.icon
                return (
                <Link
                    key={kpi.label} href={kpi.href}
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all group"
                >
                    <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                        <Icon size={18} className={kpi.color} />
                    </div>
                    {kpi.trend === "up" && (
                        <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <ChevronUp size={12} /> naik
                        </span>
                    )}
                    </div>
                    <p className="text-2xl font-black text-gray-900 leading-none">{kpi.value}</p>
                    <p className="text-sm text-gray-500 mt-1.5 leading-snug">{kpi.label}</p>
                    <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                    {kpi.sub}
                    <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                    </p>
                </Link>
                )
            })}
            </div>

            {/* ===== QUICK LINKS ===== */}
            <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-0.5">Menu Cepat</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {quickLinks.map((ql) => {
                const Icon = ql.icon
                return (
                    <Link
                    key={ql.label} href={ql.href}
                    className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-2.5 text-center hover:shadow-md hover:border-gray-200 transition-all group"
                    >
                    <div className={`w-10 h-10 rounded-xl ${ql.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon size={18} className={ql.color} />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 leading-tight">{ql.label}</span>
                    </Link>
                )
                })}
            </div>
            </div>

            {/* ===== BOTTOM 2-COL ===== */}
            <div className="grid lg:grid-cols-2 gap-5">

            {/* Pending UMKM Verifications */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Clock size={15} className="text-amber-500" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900">Verifikasi UMKM</h2>
                </div>
                {(pendingVerif?.length ?? 0) > 0 ? (
                    <span className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full">
                    {pendingVerif?.length} pending
                    </span>
                ) : (
                    <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={11} /> Bersih
                    </span>
                )}
                </div>

                {!pendingVerif || pendingVerif.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-400">
                    <CheckCircle2 size={28} className="text-emerald-400" />
                    <p className="text-sm font-medium text-gray-500">Semua UMKM sudah diverifikasi</p>
                    <p className="text-xs text-gray-400">Tidak ada pengajuan yang menunggu</p>
                </div>
                ) : (
                <div className="divide-y divide-gray-50">
                    {pendingVerif.map((v: any) => (
                    <Link
                        key={v.id} href="/super-admin/umkm"
                        className="flex items-center justify-between px-5 py-3.5 hover:bg-amber-50/40 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-black text-sm shrink-0">
                            {v.business_name?.[0] ?? "?"}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{v.business_name}</p>
                            <p className="text-xs text-gray-400">
                            {(v.profiles as any)?.full_name} · {new Date(v.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                            </p>
                        </div>
                        </div>
                        <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full">Pending</span>
                        <ArrowRight size={14} className="text-gray-300 group-hover:text-amber-500 transition-colors" />
                        </div>
                    </Link>
                    ))}
                </div>
                )}

                <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/40">
                <Link href="/super-admin/umkm" className="text-xs font-semibold text-[#6EB8BB] hover:underline flex items-center gap-1">
                    Lihat semua UMKM <ArrowRight size={11} />
                </Link>
                </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Users size={15} className="text-blue-500" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900">User Terbaru</h2>
                </div>
                <span className="text-xs text-gray-400 font-medium">5 terakhir</span>
                </div>

                <div className="divide-y divide-gray-50">
                {(recentUsers ?? []).map((u: any, i: number) => (
                    <div key={u.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6EB8BB]/20 to-[#6EB8BB]/5 flex items-center justify-center text-[#6EB8BB] font-black text-sm shrink-0 border border-[#6EB8BB]/10">
                        {u.full_name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                        <p className="text-sm font-semibold text-gray-800">{u.full_name ?? "—"}</p>
                        <p className="text-xs text-gray-400">
                            {new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${ROLE_COLOR[u.role] ?? "bg-gray-50 text-gray-600 border-gray-100"}`}>
                        {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                    </div>
                ))}
                </div>

                <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/40">
                <Link href="/super-admin/users" className="text-xs font-semibold text-[#6EB8BB] hover:underline flex items-center gap-1">
                    Kelola semua user <ArrowRight size={11} />
                </Link>
                </div>
            </div>
            </div>

            {/* ===== PLATFORM HEALTH STRIP ===== */}
            <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Status Platform</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                { label: "API Status", status: "Operasional", ok: true },
                { label: "Database", status: "Operasional", ok: true },
                { label: "Storage", status: "Operasional", ok: true },
                { label: "Pembayaran", status: (pendingOrders ?? 0) > 20 ? "Perhatian" : "Operasional", ok: (pendingOrders ?? 0) <= 20 },
                ].map((s) => (
                <div key={s.label} className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${s.ok ? "bg-emerald-400" : "bg-amber-400"}`} />
                    <div>
                    <p className="text-xs font-semibold text-gray-700">{s.label}</p>
                    <p className={`text-[11px] font-medium ${s.ok ? "text-emerald-600" : "text-amber-600"}`}>{s.status}</p>
                    </div>
                </div>
                ))}
            </div>
            </div>

        </div>
        </main>
    )
    }