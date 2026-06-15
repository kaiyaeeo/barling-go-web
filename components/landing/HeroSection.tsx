    import Link from "next/link"
    import { MapPin, Sparkles } from "lucide-react"
    import { getHeroSettings } from "@/lib/queries/landing"

    export default async function HeroSection() {
    // Mengambil data teks dinamis dari database
    const hero = await getHeroSettings()

    return (
        <section className="relative h-[88vh] min-h-[560px] flex items-end overflow-hidden">
        
        {/* VIDEO BACKGROUND */}
        <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover z-0"
        >
            <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* OVERLAY GELAP (Agar teks dan video sama-sama jelas) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-0" />

        {/* FLOATING CARD BANYUMAS */}
        <div className="absolute top-32 right-8 lg:right-16 hidden md:block z-10 animate-in fade-in slide-in-from-right-8 duration-1000">
            <div className="bg-[#4a7c59]/80 backdrop-blur-md text-white rounded-xl px-5 py-4 text-sm font-medium shadow-2xl border border-white/20 space-y-2 min-w-[210px]">
            <p className="text-xs text-green-300 font-bold uppercase tracking-widest mb-3 drop-shadow-md">Selamat Datang di Wisata Alam</p>
            {["Telaga Sunyi", "Hutan Pinus Limpakuwus", "Baturaden"].map((place) => (
                <div key={place} className="flex items-center gap-2">
                <span className="text-green-400">→</span>
                <span className="drop-shadow-sm">{place}</span>
                </div>
            ))}
            </div>
        </div>

        {/* KONTEN UTAMA TEXT & TOMBOL */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-green-400" />
                <span className="text-green-300 text-sm font-semibold tracking-wide drop-shadow-md">Barlingmascakep, Jawa Tengah</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-4 tracking-tight drop-shadow-lg">
                {hero.title}
            </h1>
            
            <p className="text-white/90 text-base lg:text-lg mb-8 leading-relaxed max-w-md drop-shadow-md">
                {hero.subtitle}
            </p>
            
            <div className="flex flex-wrap gap-3">
                <Link href="/ai-assistant" className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#FF6B35] hover:bg-[#e5592a] text-white font-bold rounded-xl text-sm transition-all hover:scale-105 shadow-lg shadow-orange-900/30">
                <Sparkles size={16} /> Plan Your Trip
                </Link>
                <Link href="/wisata" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold rounded-xl text-sm transition-all border border-white/30 hover:-translate-y-1 shadow-lg">
                Explore Destination
                </Link>
            </div>
            </div>
        </div>
        </section>
    )
    }