    import Link from "next/link"
    import { Sparkles, ArrowRight } from "lucide-react"

    export default function CTASection() {
    return (
        <>
        {/* CTA */}
        <section className="py-24 bg-gray-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#6EB8BB]/20 to-transparent opacity-50" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight">
                Sudah Siap Memulai Eksplorasi?
            </h2>
            <p className="text-gray-400 mb-10 text-base sm:text-lg font-medium">
                Tanya AI Assistant kami untuk membuat rute perjalanan otomatis dan temukan hal menarik di sekitarmu sekarang juga.
            </p>
            <Link
                href="/ai-assistant"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#6EB8BB] to-[#87C5C7] hover:from-[#5ca3a6] hover:to-[#7ab3b5] text-white font-black rounded-xl text-base transition-all hover:scale-105 shadow-xl shadow-[#6EB8BB]/30"
            >
                <Sparkles size={20} />
                Buat Itinerary Sekarang <ArrowRight size={18} className="ml-1" />
            </Link>
            </div>
        </section>
        
        {/* Footer */}
        <footer className="py-8 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">Barling-Go</p>
            <p className="text-center text-xs text-gray-400 font-medium">
                © 2026 Barling-Go Yasa!. Rooted in Barlingmascakep.
            </p>
            </div>
        </footer>
        </>
    )
    }