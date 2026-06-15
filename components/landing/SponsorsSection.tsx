    export default function SponsorsSection() {
    return (
        <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Sponsored and Media Partner
            </h2>

            <div className="flex flex-wrap items-center justify-center gap-12 lg:gap-20">
            {/* Aston */}
            <div className="flex items-center">
                <span className="text-3xl font-black text-gray-800 tracking-widest">ASTON</span>
            </div>

            {/* Banyumas logo placeholder */}
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-amber-600/20 flex items-center justify-center mx-auto">
                    <span className="text-xs font-bold text-amber-800">KAB</span>
                </div>
                </div>
            </div>

            {/* Banyumas 2 placeholder */}
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center mx-auto">
                    <span className="text-xs font-bold text-red-800">BMS</span>
                </div>
                </div>
            </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-8">
            Ingin menjadi partner Barling-GO?{" "}
            <a href="/kontak" className="text-green-600 hover:underline font-medium">
                Hubungi kami
            </a>
            </p>
        </div>
        </section>
    )
    }