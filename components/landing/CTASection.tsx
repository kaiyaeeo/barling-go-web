    import Link from "next/link"
    import { Sparkles } from "lucide-react"

    export default function CTASection() {
    return (
        <>
        {/* CTA */}
        <section className="py-20 bg-[#3d6b52]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Siap Petualangan di Barlingmascakep?
            </h2>
            <Link
                href="/ai-assistant"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#FF6B35] hover:bg-[#e5592a] text-white font-semibold rounded-xl text-base transition-all hover:scale-105 shadow-lg shadow-orange-900/20"
            >
                <Sparkles size={18} />
                Coba Asisten AI Sekarang
            </Link>
            </div>
        </section>

        {/* Footer */}
        <footer className="py-6 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs text-gray-400">
                © 2026 Barling-Go Yasa!. Rooted in Barlingmascakep
            </p>
            </div>
        </footer>
        </>
    )
    }