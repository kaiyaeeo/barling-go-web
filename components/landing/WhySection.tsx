    import { UtensilsCrossed, Map, ShoppingBag, CheckCircle2, ArrowRight } from "lucide-react"
    import { getSiteStats } from "@/lib/queries/landing"
    import Link from "next/link"

    const features = [
    {
        icon: UtensilsCrossed,
        title: "Kuliner Khas",
        desc: "Temukan tempat makan paling hits dan legendaris di seluruh Barlingmascakep.",
        href: "/kuliner",
        color: "bg-orange-50 border-orange-100",
        iconBg: "bg-orange-100",
        iconColor: "text-orange-500",
        tag: "500+ tempat makan",
    },
    {
        icon: Map,
        title: "Destinasi Wisata",
        desc: "Rencanakan petualanganmu berikutnya dengan rute dan panduan terlengkap.",
        href: "/wisata",
        color: "bg-[#E6F7F8] border-[#6EB8BB]/20",
        iconBg: "bg-[#6EB8BB]/15",
        iconColor: "text-[#6EB8BB]",
        tag: "200+ destinasi",
    },
    {
        icon: ShoppingBag,
        title: "Oleh-oleh UMKM",
        desc: "Pusat oleh-oleh khas yang nggak bakal kamu temuin di tempat lain.",
        href: "/oleh-oleh",
        color: "bg-emerald-50 border-emerald-100",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        tag: "1.000+ produk",
    },
    ]

    const perks = [
    "Rekomendasi berbasis AI 24/7",
    "Kurator lokal berpengalaman",
    "Harga terbaik & transparan",
    "Panduan rute terupdate",
    ]

    export default async function WhySection() {
    const stats = await getSiteStats()

    return (
        <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section label */}
            <div className="flex items-center gap-2 mb-3 justify-center lg:justify-start">
            <div className="w-6 h-0.5 bg-[#6EB8BB] rounded-full" />
            <span className="text-xs font-black text-[#6EB8BB] uppercase tracking-widest">Mengapa Kami</span>
            <div className="w-6 h-0.5 bg-[#6EB8BB] rounded-full" />
            </div>

            <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

            {/* Left */}
            <div>
                <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-5 leading-tight">
                Kenapa Ribuan Wisatawan<br />
                <span className="text-[#6EB8BB]">Mengandalkan Barling-GO?</span>
                </h2>
                <p className="text-gray-500 leading-relaxed mb-8 text-[15px] max-w-md">
                Jelajahi keindahan alam, kuliner, dan budaya Barlingmascakep dengan lebih mudah, aman, dan menyenangkan bersama panduan AI terbaik kami.
                </p>

                {/* Perks */}
                <ul className="space-y-3 mb-10">
                {perks.map(p => (
                    <li key={p} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <CheckCircle2 size={16} className="text-[#6EB8BB] shrink-0" />
                    {p}
                    </li>
                ))}
                </ul>

                {/* Stats row */}
                <div className="flex gap-6 flex-wrap">
                {stats.map((s) => (
                    <div key={s.key} className="text-center">
                    <p className="text-2xl font-black text-gray-900">{s.value}</p>
                    <p className="text-[11px] text-gray-400 font-semibold leading-tight mt-0.5">{s.label}</p>
                    {s.sub_label && <p className="text-[10px] text-gray-400 leading-tight">{s.sub_label}</p>}
                    </div>
                ))}
                </div>
            </div>

            {/* Right: feature cards */}
            <div className="space-y-3">
                {features.map((f) => {
                const Icon = f.icon
                return (
                    <Link
                    key={f.title}
                    href={f.href}
                    className={`group flex items-center gap-4 p-5 rounded-2xl border ${f.color} hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
                    >
                    <div className={`shrink-0 w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon size={22} className={f.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-black text-gray-900 text-sm">{f.title}</h3>
                        <span className="text-[9px] font-bold text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{f.tag}</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                    </div>
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-[#6EB8BB] group-hover:translate-x-1 transition-all shrink-0" />
                    </Link>
                )
                })}
            </div>
            </div>
        </div>
        </section>
    )
    }