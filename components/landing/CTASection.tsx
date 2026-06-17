    import Link from "next/link"
    import { Sparkles, MapPin, ArrowRight, Compass, ShoppingBag, UtensilsCrossed } from "lucide-react"

    const quickLinks = [
    { icon: Compass,         label: "Destinasi Wisata", href: "/wisata",    bg: "bg-white/10 hover:bg-white/20" },
    { icon: UtensilsCrossed, label: "Kuliner Khas",     href: "/kuliner",   bg: "bg-white/10 hover:bg-white/20" },
    { icon: ShoppingBag,     label: "Oleh-oleh UMKM",  href: "/oleh-oleh", bg: "bg-white/10 hover:bg-white/20" },
    ]

    export default function CTASection() {
    return (
        <>
        {/* CTA section */}
        <section className="relative py-24 bg-[#6EB8BB] overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-[#9FCCCE]/30 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#5AA4A7]/40 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

            {/* Label */}
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
                <MapPin size={12} />
                Barlingmascakep, Jawa Tengah
            </div>

            <h2 className="text-3xl lg:text-5xl font-black text-white leading-tight mb-4">
                Siap Mulai Petualangan<br />
                <span className="text-white/80">di Barlingmascakep?</span>
            </h2>
            <p className="text-white/75 text-base max-w-xl mx-auto mb-10 leading-relaxed">
                Rencanakan perjalanan impianmu sekarang dengan bantuan AI kami. Gratis, cepat, dan personal.
            </p>

            {/* Primary CTA */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
                <Link
                href="/ai-assistant"
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#FF6B35] hover:bg-[#e5592a] text-white font-black rounded-2xl text-base transition-all hover:scale-105 active:scale-95 shadow-xl shadow-orange-900/30"
                >
                <Sparkles size={18} /> Coba Asisten AI Sekarang
                </Link>
                <Link
                href="/wisata"
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-[#6EB8BB] font-black rounded-2xl text-base transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl"
                >
                Explore Destinasi <ArrowRight size={18} />
                </Link>
            </div>

            {/* Quick nav pills */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
                {quickLinks.map(({ icon: Icon, label, href, bg }) => (
                <Link
                    key={label}
                    href={href}
                    className={`inline-flex items-center gap-2 px-4 py-2 ${bg} border border-white/20 text-white text-sm font-semibold rounded-xl transition-all backdrop-blur-sm hover:-translate-y-0.5`}
                >
                    <Icon size={14} /> {label}
                </Link>
                ))}
            </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

                {/* Brand */}
                <div className="md:col-span-1">
                <div className="flex items-center gap-2 mb-3">
                    <img src="/logo.png" alt="Barling-GO" className="h-8 w-auto object-contain brightness-0 invert opacity-90" />
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                    Platform wisata digital untuk menjelajahi keindahan Barlingmascakep — kuliner, destinasi, dan UMKM lokal.
                </p>
                </div>

                {/* Links */}
                {[
                { title: "Jelajahi", links: [{ l: "Destinasi Wisata", h: "/wisata" }, { l: "Kuliner", h: "/kuliner" }, { l: "Oleh-oleh", h: "/oleh-oleh" }, { l: "UMKM", h: "/umkm" }] },
                { title: "Akun",     links: [{ l: "Dashboard", h: "/dashboard" }, { l: "Pesanan Saya", h: "/pesanan" }, { l: "Wishlist", h: "/wishlist" }, { l: "Pengaturan", h: "/settings" }] },
                { title: "Info",     links: [{ l: "Tentang Kami", h: "/tentang" }, { l: "Kontak", h: "/kontak" }, { l: "Privasi", h: "/privasi" }, { l: "Syarat & Ketentuan", h: "/syarat" }] },
                ].map(({ title, links }) => (
                <div key={title}>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">{title}</p>
                    <ul className="space-y-2.5">
                    {links.map(({ l, h }) => (
                        <li key={l}>
                        <Link href={h} className="text-gray-400 hover:text-white text-sm transition-colors font-medium">
                            {l}
                        </Link>
                        </li>
                    ))}
                    </ul>
                </div>
                ))}
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-gray-500">© 2026 Barling-GO Yasa! · Rooted in Barlingmascakep</p>
                <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#6EB8BB] animate-pulse" />
                <p className="text-xs text-gray-500">Powered by <span className="text-[#6EB8BB] font-bold">Barling-GO AI</span></p>
                </div>
            </div>
            </div>
        </footer>
        </>
    )
    }