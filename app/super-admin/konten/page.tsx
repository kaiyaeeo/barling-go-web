    import { createClient } from "@/lib/supabase/server"
    import Link from "next/link"
    import ContentPublishToggle from "@/components/super-admin/ContentPublishToggle"
    import {
    FileText, Plus, Eye, EyeOff, LayoutDashboard, Settings,
    Bell, ChevronRight, TrendingUp, Globe, Utensils,
    ShoppingBag, BookOpen, Map, PenSquare
    } from "lucide-react"

    export default async function SuperAdminKontenPage() {
    const supabase = await createClient()

    const { data: contents } = await supabase
        .from("contents")
        .select("id, type, title, slug, is_published, view_count, created_at")
        .order("created_at", { ascending: false })

    const tabs = ["semua", "destinasi", "kuliner", "oleh-oleh", "artikel"]
    const counts = tabs.reduce((acc, t) => {
        acc[t] = t === "semua"
        ? contents?.length ?? 0
        : contents?.filter((c) => c.type === t).length ?? 0
        return acc
    }, {} as Record<string, number>)

    const publishedCount = contents?.filter((c) => c.is_published).length ?? 0
    const draftCount     = contents?.filter((c) => !c.is_published).length ?? 0
    const totalViews     = contents?.reduce((s, c) => s + (c.view_count ?? 0), 0) ?? 0

    const TYPE_CONFIG: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
        destinasi:   { color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-100",   icon: Map,        label: "Destinasi"   },
        kuliner:     { color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-100", icon: Utensils,   label: "Kuliner"     },
        "oleh-oleh": { color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-100",  icon: ShoppingBag,label: "Oleh-oleh"  },
        artikel:     { color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-100", icon: BookOpen,   label: "Artikel"     },
    }

    const TAB_ICONS: Record<string, any> = {
        semua: Globe, destinasi: Map, kuliner: Utensils, "oleh-oleh": ShoppingBag, artikel: BookOpen,
    }

    return (
        <main className="min-h-screen bg-gray-50/60">

        {/* ===== TOP NAV ===== */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                <LayoutDashboard size={13} />
                <Link href="/super-admin/dashboard" className="hover:text-gray-600 transition-colors">Dashboard</Link>
                <ChevronRight size={13} />
                <span className="text-gray-700 font-semibold">Kelola Konten</span>
                </div>
                <div className="flex items-center gap-2">
                <Link href="/super-admin/pengaturan" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                    <Settings size={17} />
                </Link>
                <div className="h-5 w-px bg-gray-200 mx-1" />
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6EB8BB] to-[#9FCCCE] flex items-center justify-center text-white text-xs font-black">S</div>
                </div>
            </div>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-12">

            {/* ===== PAGE HEADER ===== */}
            <div className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Kelola Konten</h1>
                <p className="text-sm text-gray-400 mt-0.5">Publikasikan dan kelola seluruh konten informatif platform Barling-GO.</p>
            </div>
            <Link
                href="/super-admin/konten/tambah"
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
            >
                <Plus size={16} /> Tambah Konten
            </Link>
            </div>

            {/* ===== KPI CARDS ===== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                <FileText size={18} className="text-gray-600" />
                </div>
                <p className="text-2xl font-black text-gray-900">{counts["semua"]}</p>
                <p className="text-sm text-gray-500 mt-0.5">Total Konten</p>
            </div>
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                <Eye size={18} className="text-emerald-500" />
                </div>
                <p className="text-2xl font-black text-emerald-600">{publishedCount}</p>
                <p className="text-sm text-gray-500 mt-0.5">Dipublikasikan</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                <EyeOff size={18} className="text-gray-400" />
                </div>
                <p className="text-2xl font-black text-gray-500">{draftCount}</p>
                <p className="text-sm text-gray-500 mt-0.5">Draft</p>
            </div>
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <TrendingUp size={18} className="text-blue-500" />
                </div>
                <p className="text-2xl font-black text-gray-900">{totalViews.toLocaleString("id-ID")}</p>
                <p className="text-sm text-gray-500 mt-0.5">Total Views</p>
            </div>
            </div>

            {/* ===== TYPE SUMMARY PILLS ===== */}
            <div className="flex gap-3 flex-wrap">
            {tabs.filter(t => t !== "semua").map((t) => {
                const cfg = TYPE_CONFIG[t]
                const Icon = cfg?.icon ?? FileText
                return (
                <div key={t} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${cfg?.bg ?? "bg-gray-50"} ${cfg?.border ?? "border-gray-100"}`}>
                    <Icon size={14} className={cfg?.color ?? "text-gray-500"} />
                    <span className={`text-xs font-bold capitalize ${cfg?.color ?? "text-gray-600"}`}>{cfg?.label ?? t}</span>
                    <span className={`text-sm font-black ${cfg?.color ?? "text-gray-700"}`}>{counts[t]}</span>
                </div>
                )
            })}
            </div>

            {/* ===== TABLE CARD ===== */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Card header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#6EB8BB]/10 flex items-center justify-center">
                    <FileText size={15} className="text-[#6EB8BB]" />
                </div>
                <h2 className="text-sm font-bold text-gray-900">Semua Konten</h2>
                </div>
                <span className="text-xs text-gray-400">{counts["semua"]} konten total</span>
            </div>

            {/* Table header (desktop) */}
            <div className="hidden md:grid grid-cols-[2fr_130px_100px_90px_160px] items-center px-6 py-3 bg-gray-50/80 border-b border-gray-100">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Judul Konten</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tipe</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Views</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</span>
            </div>

            {/* Rows */}
            {(!contents || contents.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <FileText size={40} className="opacity-20 mb-3" />
                <p className="text-sm font-medium text-gray-500">Belum ada konten yang ditambahkan.</p>
                <Link
                    href="/super-admin/konten/tambah"
                    className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-[#6EB8BB] text-white text-sm font-semibold rounded-xl hover:bg-[#5AA4A7] transition-all"
                >
                    <Plus size={15} /> Tambah Konten Pertama
                </Link>
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                {(contents ?? []).map((c) => {
                    const cfg = TYPE_CONFIG[c.type]
                    const Icon = cfg?.icon ?? FileText
                    const editHref = c.type === "destinasi"
                    ? `/super-admin/kelola-wisata/${c.id}/edit`
                    : `/super-admin/konten/${c.id}/edit`

                    return (
                    <div key={c.id} className="px-6 py-4 hover:bg-gray-50/40 transition-colors group">

                        {/* MOBILE */}
                        <div className="md:hidden space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                            <div className="flex items-center gap-2 mb-1">
                                {cfg && (
                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                    <Icon size={10} /> {cfg.label}
                                </span>
                                )}
                                <span className={`flex items-center gap-1 text-[11px] font-semibold ${c.is_published ? "text-emerald-600" : "text-gray-400"}`}>
                                {c.is_published ? <Eye size={11} /> : <EyeOff size={11} />}
                                {c.is_published ? "Publik" : "Draft"}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-gray-800">{c.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{(c.view_count ?? 0).toLocaleString("id-ID")} views · {new Date(c.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                            <ContentPublishToggle contentId={c.id} isPublished={c.is_published} />
                            <Link href={editHref} className="p-1.5 text-gray-400 hover:text-[#6EB8BB] hover:bg-green-50 rounded-lg transition-all">
                                <PenSquare size={15} />
                            </Link>
                            </div>
                        </div>
                        </div>

                        {/* DESKTOP */}
                        <div className="hidden md:grid grid-cols-[2fr_130px_100px_90px_160px] items-center gap-3">
                        {/* Judul */}
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate group-hover:text-[#6EB8BB] transition-colors">{c.title}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                            {new Date(c.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                        </div>

                        {/* Tipe */}
                        {cfg ? (
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border w-fit ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                            <Icon size={12} /> {cfg.label}
                            </span>
                        ) : (
                            <span className="text-xs text-gray-400 capitalize">{c.type}</span>
                        )}

                        {/* Views */}
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600">
                            <TrendingUp size={13} className="text-gray-400" />
                            {(c.view_count ?? 0).toLocaleString("id-ID")}
                        </div>

                        {/* Status */}
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-xl w-fit ${
                            c.is_published
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-gray-50 text-gray-500 border border-gray-200"
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${c.is_published ? "bg-emerald-400" : "bg-gray-400"}`} />
                            {c.is_published ? "Publik" : "Draft"}
                        </span>

                        {/* Aksi */}
                        <div className="flex items-center justify-end gap-2">
                            <ContentPublishToggle contentId={c.id} isPublished={c.is_published} />
                            <Link
                            href={editHref}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 border border-gray-200 rounded-xl text-gray-600 hover:text-[#6EB8BB] hover:bg-green-50 hover:border-green-200 transition-all"
                            >
                            <PenSquare size={13} /> Edit
                            </Link>
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
                <span className="font-semibold text-gray-700">{counts["semua"]}</span> total ·{" "}
                <span className="text-emerald-600 font-semibold">{publishedCount} publik</span> ·{" "}
                <span className="text-gray-500 font-semibold">{draftCount} draft</span>
                </p>
                <p className="text-xs text-gray-400">
                Total views: <span className="font-semibold text-gray-700">{totalViews.toLocaleString("id-ID")}</span>
                </p>
            </div>
            </div>

        </div>
        </main>
    )
    }