    import { createClient } from "@/lib/supabase/server"
    import UserRoleManager from "@/components/super-admin/UserRoleManager"
    import Link from "next/link"
    import {
    Users, LayoutDashboard, Settings, ChevronRight,
    ShieldCheck, UserCheck, UserX, Crown, Phone,
    Calendar, Activity
    } from "lucide-react"

    export default async function SuperAdminUsersPage() {
    const supabase = await createClient()

    const { data: users } = await supabase
        .from("profiles")
        .select("id, full_name, phone, role, is_active, created_at")
        .order("created_at", { ascending: false })
        .limit(100)

    const counts = {
        all:         users?.length ?? 0,
        user:        users?.filter((u) => u.role === "user").length ?? 0,
        admin:       users?.filter((u) => u.role === "admin").length ?? 0,
        super_admin: users?.filter((u) => u.role === "super_admin").length ?? 0,
        active:      users?.filter((u) => u.is_active).length ?? 0,
        inactive:    users?.filter((u) => !u.is_active).length ?? 0,
    }

    const ROLE_CONFIG: Record<string, { label: string; textColor: string; bgColor: string; borderColor: string; dotColor: string; icon: any }> = {
        user:        { label: "Pengguna",   textColor: "text-blue-700",   bgColor: "bg-blue-50",   borderColor: "border-blue-100",   dotColor: "bg-blue-400",   icon: Users       },
        admin:       { label: "Merchant",   textColor: "text-emerald-700",bgColor: "bg-emerald-50",borderColor: "border-emerald-100",dotColor: "bg-emerald-400",icon: UserCheck   },
        super_admin: { label: "Super Admin",textColor: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-100", dotColor: "bg-purple-400", icon: Crown       },
    }

    // Group new users (this month)
    const thisMonth = new Date()
    thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0)
    const newThisMonth = users?.filter((u) => new Date(u.created_at) >= thisMonth).length ?? 0

    return (
        <main className="min-h-screen bg-gray-50/60">
        {/* ===== TOP NAV ===== */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                <LayoutDashboard size={13} />
                <Link href="/super-admin/dashboard" className="hover:text-gray-600 transition-colors">Dashboard</Link>
                <ChevronRight size={13} />
                <span className="text-gray-700 font-semibold">Manajemen User</span>
                </div>
                <div className="flex items-center gap-2">
                <Link href="/super-admin/pengaturan" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                    <Settings size={17} />
                </Link>
                <div className="h-5 w-px bg-gray-200 mx-1" />
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6EB8BB] to-[#9FCCCE] flex items-center justify-center text-white text-xs font-black shadow-sm">S</div>
                </div>
            </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-12">
            {/* ===== PAGE HEADER ===== */}
            <div>
            <h1 className="text-2xl font-black text-gray-900">Manajemen User & Role</h1>
            <p className="text-sm text-gray-400 mt-0.5">Kelola akun pengguna, hak akses, dan status aktivasi di platform Barling-GO.</p>
            </div>

            {/* ===== KPI CARDS ===== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                <Users size={18} className="text-gray-600" />
                </div>
                <p className="text-2xl font-black text-gray-900">{counts.all}</p>
                <p className="text-sm text-gray-500 mt-0.5">Total Pengguna</p>
                {newThisMonth > 0 && (
                <p className="text-[11px] text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                    <Activity size={11} /> +{newThisMonth} bulan ini
                </p>
                )}
            </div>
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <Users size={18} className="text-blue-500" />
                </div>
                <p className="text-2xl font-black text-blue-600">{counts.user}</p>
                <p className="text-sm text-gray-500 mt-0.5">Pengguna Biasa</p>
            </div>
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                <UserCheck size={18} className="text-emerald-500" />
                </div>
                <p className="text-2xl font-black text-emerald-600">{counts.admin}</p>
                <p className="text-sm text-gray-500 mt-0.5">Merchant / Admin UMKM</p>
            </div>
            <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
                <Crown size={18} className="text-purple-500" />
                </div>
                <p className="text-2xl font-black text-purple-600">{counts.super_admin}</p>
                <p className="text-sm text-gray-500 mt-0.5">Super Admin</p>
            </div>
            </div>

            {/* ===== STATUS STRIP ===== */}
            <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-emerald-100 rounded-xl shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-gray-600">Akun Aktif</span>
                <span className="text-sm font-black text-emerald-600">{counts.active}</span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-red-100 rounded-xl shadow-sm">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-xs font-semibold text-gray-600">Nonaktif</span>
                <span className="text-sm font-black text-red-500">{counts.inactive}</span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm ml-auto">
                <ShieldCheck size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500">Menampilkan <span className="font-bold text-gray-700">{counts.all}</span> akun terbaru</span>
            </div>
            </div>

            {/* ===== TABLE CARD ===== */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#6EB8BB]/10 flex items-center justify-center">
                    <Users size={15} className="text-[#6EB8BB]" />
                </div>
                <h2 className="text-sm font-bold text-gray-900">Semua Pengguna</h2>
                </div>
                {/* Role legend */}
                <div className="hidden sm:flex items-center gap-3">
                {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
                    <span key={key} className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                    <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                    {cfg.label}
                    </span>
                ))}
                </div>
            </div>

            {/* Table header (PERBAIKAN GRID DI SINI) */}
            <div className="hidden md:grid grid-cols-[1.5fr_1fr_1.2fr_1fr_1.2fr_240px] items-center px-6 py-3 bg-gray-50/80 border-b border-gray-100 gap-4">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pengguna</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Telepon</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Role</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Bergabung</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Kelola</span>
            </div>

            {/* Rows */}
            {(!users || users.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Users size={40} className="opacity-20 mb-3" />
                <p className="text-sm font-medium text-gray-500">Belum ada pengguna terdaftar.</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                {(users ?? []).map((u: any) => {
                    const roleCfg  = ROLE_CONFIG[u.role] ?? ROLE_CONFIG["user"]
                    const RoleIcon = roleCfg.icon
                    const initials = (u.full_name ?? "?").split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()

                    return (
                    <div key={u.id} className="px-6 py-4 hover:bg-gray-50/40 transition-colors group">
                        {/* MOBILE */}
                        <div className="md:hidden space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${roleCfg.bgColor} ${roleCfg.textColor} ${roleCfg.borderColor}`}>
                                {initials}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">{u.full_name ?? "-"}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${roleCfg.bgColor} ${roleCfg.textColor} ${roleCfg.borderColor}`}>
                                    <RoleIcon size={10} /> {roleCfg.label}
                                </span>
                                <span className={`text-[11px] font-bold ${u.is_active ? "text-emerald-600" : "text-red-500"}`}>
                                    {u.is_active ? "Aktif" : "Nonaktif"}
                                </span>
                                </div>
                            </div>
                            </div>
                            <UserRoleManager userId={u.id} currentRole={u.role} isActive={u.is_active} />
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-400 pl-1">
                            {u.phone && <span className="flex items-center gap-1"><Phone size={11} /> {u.phone}</span>}
                            <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                        </div>

                        {/* DESKTOP (PERBAIKAN GRID DI SINI) */}
                        <div className="hidden md:grid grid-cols-[1.5fr_1fr_1.2fr_1fr_1.2fr_240px] items-center gap-4">
                        {/* Pengguna */}
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${roleCfg.bgColor} ${roleCfg.textColor} ${roleCfg.borderColor}`}>
                            {initials}
                            </div>
                            <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate group-hover:text-[#6EB8BB] transition-colors">
                                {u.full_name ?? "-"}
                            </p>
                            <p className="text-[11px] text-gray-400 font-mono truncate">ID: {u.id.slice(0, 12)}...</p>
                            </div>
                        </div>

                        {/* Telepon */}
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Phone size={13} className="text-gray-300 shrink-0" />
                            <span className="text-xs">{u.phone ?? "-"}</span>
                        </div>

                        {/* Role */}
                        <div>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl border ${roleCfg.bgColor} ${roleCfg.textColor} ${roleCfg.borderColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${roleCfg.dotColor}`} />
                            {roleCfg.label}
                            </span>
                        </div>

                        {/* Status */}
                        <div>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl border ${
                            u.is_active
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-red-50 text-red-600 border-red-100"
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-emerald-400" : "bg-red-400"}`} />
                            {u.is_active ? "Aktif" : "Nonaktif"}
                            </span>
                        </div>

                        {/* Bergabung */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 whitespace-nowrap">
                            <Calendar size={12} className="text-gray-300 shrink-0" />
                            {new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </div>

                        {/* Aksi (Diberikan lebar 240px agar tidak menabrak) */}
                        <div className="flex justify-end items-center">
                            <UserRoleManager userId={u.id} currentRole={u.role} isActive={u.is_active} />
                        </div>
                        </div>
                    </div>
                    )
                })}
                </div>
            )}

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs text-gray-400">
                <span className="font-semibold text-gray-700">{counts.all}</span> akun |{" "}
                <span className="text-blue-600 font-semibold">{counts.user} pengguna</span> |{" "}
                <span className="text-emerald-600 font-semibold">{counts.admin} merchant</span> |{" "}
                <span className="text-purple-600 font-semibold">{counts.super_admin} super admin</span>
                </p>
                <p className="text-xs text-gray-400">
                Aktif: <span className="font-semibold text-emerald-600">{counts.active}</span> |{" "}
                Nonaktif: <span className="font-semibold text-red-500">{counts.inactive}</span>
                </p>
            </div>
            </div>
        </div>
        </main>
    )
    }