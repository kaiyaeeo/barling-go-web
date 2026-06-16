    import { createClient } from "@/lib/supabase/server"
    import UMKMVerifyButton from "@/components/super-admin/UMKMVerifyButton"
    import Link from "next/link"
    import {
    Store, CheckCircle2, Clock, XCircle, ArrowLeft,
    LayoutDashboard, Settings, Bell, ChevronRight,
    MapPin, Phone, User, Calendar, Briefcase, AlertCircle
    } from "lucide-react"

    export default async function SuperAdminUMKMPage() {
    const supabase = await createClient()

    const { data: verifications } = await supabase
        .from("umkm_verifications")
        .select("*, profiles(full_name, phone)")
        .order("created_at", { ascending: false })

    const pending  = verifications?.filter((v) => v.status === "pending").length  ?? 0
    const approved = verifications?.filter((v) => v.status === "approved").length ?? 0
    const rejected = verifications?.filter((v) => v.status === "rejected").length ?? 0
    const total    = verifications?.length ?? 0

    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0

    const STATUS_CONFIG: Record<string, { label: string; textColor: string; bgColor: string; borderColor: string; dotColor: string; icon: any }> = {
        pending:  { label: "Menunggu",  textColor: "text-amber-700",   bgColor: "bg-amber-50",   borderColor: "border-amber-200",   dotColor: "bg-amber-400",   icon: Clock        },
        approved: { label: "Disetujui", textColor: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", dotColor: "bg-emerald-400", icon: CheckCircle2 },
        rejected: { label: "Ditolak",   textColor: "text-red-700",     bgColor: "bg-red-50",     borderColor: "border-red-200",     dotColor: "bg-red-400",     icon: XCircle      },
    }

    // Group for tab-style filter (all shown, but data is ready for future client filter)
    const tabs = [
        { key: "all",      label: "Semua",    count: total    },
        { key: "pending",  label: "Pending",  count: pending  },
        { key: "approved", label: "Disetujui", count: approved },
        { key: "rejected", label: "Ditolak",  count: rejected },
    ]

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
                <span className="text-gray-700 font-semibold">Kelola Mitra UMKM</span>
                </div>
                <div className="flex items-center gap-2">
                {pending > 0 && (
                    <span className="relative p-2 text-amber-500">
                    <Bell size={17} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </span>
                )}
                <Link href="/super-admin/pengaturan" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                    <Settings size={17} />
                </Link>
                <div className="h-5 w-px bg-gray-200 mx-1" />
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6EB8BB] to-[#9FCCCE] flex items-center justify-center text-white text-xs font-black">S</div>
                </div>
            </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-12">

            {/* ===== PAGE HEADER ===== */}
            <div className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Kelola Mitra UMKM</h1>
                <p className="text-sm text-gray-400 mt-0.5">Tinjau dan verifikasi pengajuan kemitraan UMKM di platform Barling-GO.</p>
            </div>
            {pending > 0 && (
                <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle size={15} className="text-amber-500" />
                <span className="text-sm font-bold text-amber-700">{pending} perlu ditinjau</span>
                </div>
            )}
            </div>

            {/* ===== KPI CARDS ===== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                <Store size={18} className="text-gray-600" />
                </div>
                <p className="text-2xl font-black text-gray-900">{total}</p>
                <p className="text-sm text-gray-500 mt-0.5">Total Pengajuan</p>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
                <Clock size={18} className="text-amber-500" />
                </div>
                <p className="text-2xl font-black text-amber-600">{pending}</p>
                <p className="text-sm text-gray-500 mt-0.5">Menunggu Review</p>
            </div>

            {/* Approved */}
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                <CheckCircle2 size={18} className="text-emerald-500" />
                </div>
                <p className="text-2xl font-black text-emerald-600">{approved}</p>
                <p className="text-sm text-gray-500 mt-0.5">Disetujui</p>
            </div>

            {/* Approval Rate */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <CheckCircle2 size={18} className="text-blue-500" />
                </div>
                <p className="text-2xl font-black text-gray-900">{approvalRate}%</p>
                <p className="text-sm text-gray-500 mt-0.5">Tingkat Persetujuan</p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                    style={{ width: `${approvalRate}%` }}
                />
                </div>
            </div>
            </div>

            {/* ===== TABLE CARD ===== */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Card header with tab strip */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#6EB8BB]/10 flex items-center justify-center">
                    <Store size={15} className="text-[#6EB8BB]" />
                </div>
                <h2 className="text-sm font-bold text-gray-900">Semua Pengajuan Verifikasi</h2>
                </div>
                {/* Status legend */}
                <div className="flex items-center gap-3">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <span key={key} className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                    {cfg.label}
                    </span>
                ))}
                </div>
            </div>

            {/* Table header */}
            <div className="hidden md:grid grid-cols-[2fr_1.5fr_1.2fr_1fr_120px] items-center px-6 py-3 bg-gray-50/80 border-b border-gray-100">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nama Bisnis</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Penanggung Jawab</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Jenis Usaha</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</span>
            </div>

            {/* Rows */}
            {(!verifications || verifications.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Store size={40} className="opacity-20 mb-3" />
                <p className="text-sm font-medium text-gray-500">Belum ada pengajuan verifikasi.</p>
                <p className="text-xs text-gray-400 mt-1">Pengajuan baru akan muncul di sini.</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                {(verifications ?? []).map((v: any) => {
                    const cfg = STATUS_CONFIG[v.status] ?? STATUS_CONFIG["pending"]
                    const Icon = cfg.icon
                    const profile = v.profiles as any

                    return (
                    <div key={v.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors group">

                        {/* MOBILE layout */}
                        <div className="md:hidden space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${cfg.bgColor} ${cfg.textColor}`}>
                                {v.business_name?.[0]?.toUpperCase() ?? "?"}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">{v.business_name}</p>
                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor}`}>
                                <Icon size={10} /> {cfg.label}
                                </span>
                            </div>
                            </div>
                            {v.status === "pending" && <UMKMVerifyButton verificationId={v.id} userId={v.user_id} />}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 pl-1">
                            <span className="flex items-center gap-1"><User size={11} className="text-gray-400" /> {profile?.full_name ?? "—"}</span>
                            <span className="flex items-center gap-1"><Phone size={11} className="text-gray-400" /> {profile?.phone ?? "—"}</span>
                            <span className="flex items-center gap-1"><Briefcase size={11} className="text-gray-400" /> {v.business_type ?? "—"}</span>
                            <span className="flex items-center gap-1"><Calendar size={11} className="text-gray-400" /> {new Date(v.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                            {v.address && <span className="flex items-center gap-1 col-span-2"><MapPin size={11} className="text-gray-400" /> {v.address}</span>}
                        </div>
                        {v.rejection_reason && (
                            <div className="flex items-start gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
                            <XCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-600">{v.rejection_reason}</p>
                            </div>
                        )}
                        </div>

                        {/* DESKTOP layout */}
                        <div className="hidden md:grid grid-cols-[2fr_1.5fr_1.2fr_1fr_120px] items-center gap-3">
                        {/* Nama bisnis */}
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor}`}>
                            {v.business_name?.[0]?.toUpperCase() ?? "?"}
                            </div>
                            <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">{v.business_name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                {v.address && (
                                <span className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
                                    <MapPin size={10} /> {v.address}
                                </span>
                                )}
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                                <Calendar size={10} /> {new Date(v.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                            </div>
                        </div>

                        {/* Penanggung jawab */}
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-700 truncate flex items-center gap-1.5">
                            <User size={13} className="text-gray-400 shrink-0" /> {profile?.full_name ?? "—"}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5 truncate">
                            <Phone size={11} className="shrink-0" /> {profile?.phone ?? "—"}
                            </p>
                        </div>

                        {/* Jenis usaha */}
                        <div>
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
                            <Briefcase size={11} className="text-gray-400" />
                            {v.business_type ?? "—"}
                            </span>
                        </div>

                        {/* Status */}
                        <div>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl border ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                            {cfg.label}
                            </span>
                            {v.rejection_reason && (
                            <p className="text-[11px] text-red-500 mt-1.5 flex items-start gap-1">
                                <XCircle size={10} className="shrink-0 mt-0.5" /> {v.rejection_reason}
                            </p>
                            )}
                        </div>

                        {/* Aksi */}
                        <div className="flex justify-end">
                            {v.status === "pending" ? (
                            <UMKMVerifyButton verificationId={v.id} userId={v.user_id} />
                            ) : (
                            <span className="text-xs text-gray-300 italic">Selesai</span>
                            )}
                        </div>
                        </div>

                    </div>
                    )
                })}
                </div>
            )}

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                Total <span className="font-semibold text-gray-700">{total}</span> pengajuan ·{" "}
                <span className="text-amber-600 font-semibold">{pending} pending</span> ·{" "}
                <span className="text-emerald-600 font-semibold">{approved} disetujui</span> ·{" "}
                <span className="text-red-500 font-semibold">{rejected} ditolak</span>
                </p>
                <Link href="/super-admin/dashboard" className="text-xs font-semibold text-[#6EB8BB] hover:underline flex items-center gap-1">
                <ArrowLeft size={11} /> Kembali ke Dashboard
                </Link>
            </div>
            </div>

        </div>
        </main>
    )
    }