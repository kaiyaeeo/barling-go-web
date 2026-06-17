    import Link from "next/link"
    import { MapPin, Sparkles, Star, Compass } from "lucide-react"
    import { getHeroSettings } from "@/lib/queries/landing"

    export default async function HeroSection() {
    const hero = await getHeroSettings()

    return (
        <section className="relative h-[88vh] min-h-[560px] flex items-end overflow-hidden">

        {/* VIDEO BACKGROUND */}
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
            <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* OVERLAY GELAP */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-0" />

        {/* FLOATING CARD — sama persis dengan original, hanya desain dipoles */}
        <div className="absolute top-32 right-8 lg:right-16 hidden md:block z-10 animate-in fade-in slide-in-from-right-8 duration-1000">
            <div className="bg-[#4a7c59]/80 backdrop-blur-md text-white rounded-2xl px-5 py-4 text-sm font-medium shadow-2xl border border-white/20 space-y-2 min-w-[220px]">
            <p className="text-xs text-green-300 font-black uppercase tracking-widest mb-3">Selamat Datang di Wisata Alam</p>
            {[
                { name: "Telaga Sunyi",            rating: "4.9" },
                { name: "Hutan Pinus Limpakuwus", rating: "4.8" },
                { name: "Baturaden",               rating: "4.7" },
            ].map(({ name, rating }) => (
                <div key={name} className="flex items-center justify-between gap-3 py-1">
                <div className="flex items-center gap-2">
                    <Compass size={12} className="text-green-400 shrink-0" />
                    <span className="text-sm font-semibold drop-shadow-sm">{name}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    <span className="text-[11px] font-black text-white/80">{rating}</span>
                </div>
                </div>
            ))}
            </div>
        </div>

        {/* KONTEN UTAMA — struktur sama dengan original */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="max-w-xl">

            {/* Location pill */}
            <div className="inline-flex items-center gap-2 mb-5 bg-white/10 backdrop-blur-sm border border-white/20 px-3.5 py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-[#9FCCCE] animate-pulse" />
                <MapPin size={12} className="text-[#9FCCCE]" />
                <span className="text-white/90 text-xs font-semibold tracking-wide">Barlingmascakep, Jawa Tengah</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-4 tracking-tight drop-shadow-lg">
                {hero.title}
            </h1>

            <p className="text-white/80 text-base lg:text-lg mb-8 leading-relaxed max-w-md drop-shadow-md">
                {hero.subtitle}
            </p>

            {/* CTAs — sama dengan original */}
            <div className="flex flex-wrap gap-3 mb-10">
                <Link
                href="/ai-assistant"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#FF6B35] hover:bg-[#e5592a] text-white font-bold rounded-2xl text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-orange-900/30"
                >
                <Sparkles size={16} /> Plan Your Trip
                </Link>
                <Link
                href="/wisata"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold rounded-2xl text-sm transition-all border border-white/25 hover:-translate-y-1 shadow-lg"
                >
                <Compass size={16} /> Explore Destination
                </Link>
            </div>

            {/* Social proof strip */}
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex -space-x-2">
                {["bg-[#6EB8BB]", "bg-amber-500", "bg-purple-500", "bg-rose-500"].map((c, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white/30 flex items-center justify-center text-[10px] font-black text-white`}>
                    {["AR","BS","CK","+"][i]}
                    </div>
                ))}
                </div>
                <div>
                <div className="flex items-center gap-0.5 mb-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} size={11} className="fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-white/60 text-xs">Dipercaya <span className="text-white font-bold">10.000+</span> wisatawan</p>
                </div>
            </div>
            </div>
        </div>
        </section>
    )
    }