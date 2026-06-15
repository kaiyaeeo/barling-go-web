    import { UtensilsCrossed, Map, ShoppingBag } from "lucide-react"
    import { getSiteStats } from "@/lib/queries/landing"

    const features = [
    { icon: UtensilsCrossed, title: "Kuliner", desc: "Cari tempat makan paling hits dan legendaris di sekitamu.", color: "bg-orange-50", iconColor: "text-orange-500", iconBg: "bg-orange-100" },
    { icon: Map, title: "Wisata", desc: "Rencanakan petualanganmu berikutnya dengan rute terbaik.", color: "bg-blue-50", iconColor: "text-blue-500", iconBg: "bg-blue-100" },
    { icon: ShoppingBag, title: "Oleh-oleh", desc: "Pusat oleh-oleh khas yang nggak bakal kamu temuin di tempat lain.", color: "bg-green-50", iconColor: "text-green-600", iconBg: "bg-green-100" },
    ]

    export default async function WhySection() {
    const stats = await getSiteStats()

    return (
        <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-5 leading-tight">
                Kenapa Ribuan Wisatawan<br />Mengandalkan Barling-GO?
                </h2>
                <p className="text-gray-500 leading-relaxed mb-10 text-[15px]">
                Jelajahi keindahan pantai hingga wisata budaya di Barlingmascakep dengan lebih mudah, aman, dan menyenangkan. Kami menyediakan itinerary terbaik buatan para ahli dan layanan dukungan 24 jam penuh untuk menemani petualangan cerdasmu.
                </p>
                <div className="flex gap-8">
                {stats.map((s) => (
                    <div key={s.key} className="text-center">
                    <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-3">
                        <span className="text-teal-700 font-bold text-sm">{s.value}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-tight">{s.label}</p>
                    <p className="text-xs text-gray-500 leading-tight">{s.sub_label}</p>
                    </div>
                ))}
                </div>
            </div>

            <div className="space-y-3">
                {features.map((f) => {
                const Icon = f.icon
                return (
                    <div key={f.title} className={`flex items-center gap-4 p-4 rounded-2xl ${f.color} border border-gray-100 hover:shadow-md transition-all cursor-pointer group`}>
                    <div className={`shrink-0 w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon size={22} className={f.iconColor} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-0.5">{f.title}</h3>
                        <p className="text-sm text-gray-500">{f.desc}</p>
                    </div>
                    </div>
                )
                })}
            </div>
            </div>
        </div>
        </section>
    )
    }