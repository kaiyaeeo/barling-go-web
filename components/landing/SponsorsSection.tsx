    "use client"

    export default function SponsorsSection() {
    return (
        <section className="py-16 bg-white border-t border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* JUDUL ASLI DARI DESAIN KAMU */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Sponsored and Media Partner
            </h2>

            {/* AREA ANIMASI MARQUEE */}
            <div className="relative w-full flex items-center overflow-hidden h-24">
            
            {/* Efek Gradasi Pudar di Kiri & Kanan */}
            <div className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            {/* Track Animasi Geser */}
            <div className="flex w-fit animate-marquee hover:animation-paused items-center">
                
                {/* Kita gandakan 3 set agar putarannya tidak pernah putus/kosong */}
                {[1, 2, 3].map((set) => (
                <div key={set} className="flex items-center">
                    
                    {/* 1. DESAIN ASLI KAMU: ASTON */}
                    <div className="flex items-center justify-center shrink-0 w-40 sm:w-56 mx-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    <span className="text-3xl font-black text-gray-800 tracking-widest">ASTON</span>
                    </div>

                    {/* 2. DESAIN ASLI KAMU: KAB BANYUMAS */}
                    <div className="flex items-center justify-center shrink-0 w-40 sm:w-56 mx-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-600/20 flex items-center justify-center">
                        <span className="text-[10px] sm:text-xs font-bold text-amber-800">KAB</span>
                        </div>
                    </div>
                    </div>

                    {/* 3. DESAIN ASLI KAMU: BMS */}
                    <div className="flex items-center justify-center shrink-0 w-40 sm:w-56 mx-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-600/20 flex items-center justify-center">
                        <span className="text-[10px] sm:text-xs font-bold text-red-800">BMS</span>
                        </div>
                    </div>
                    </div>

                    {/* 4. LOGO PRODUK LUAR: MICROSOFT */}
                    <div className="flex items-center justify-center shrink-0 w-40 sm:w-56 mx-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    <svg viewBox="0 0 24 24" className="h-7 w-auto shrink-0">
                        <rect x="0" y="0" width="11" height="11" fill="#F25022"/>
                        <rect x="13" y="0" width="11" height="11" fill="#7FBA00"/>
                        <rect x="0" y="13" width="11" height="11" fill="#00A4EF"/>
                        <rect x="13" y="13" width="11" height="11" fill="#FFB900"/>
                    </svg>
                    <span className="ml-2.5 text-xl sm:text-2xl font-semibold text-gray-600 tracking-tight" style={{ fontFamily: 'Segoe UI, system-ui' }}>Microsoft</span>
                    </div>

                    {/* 5. LOGO PRODUK LUAR: SPOTIFY */}
                    <div className="flex items-center justify-center shrink-0 w-40 sm:w-56 mx-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    <svg viewBox="0 0 24 24" className="h-8 w-auto fill-[#1DB954] shrink-0">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.84.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.3z"/>
                    </svg>
                    <span className="ml-2 text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Spotify</span>
                    </div>

                    {/* 6. LOGO PRODUK LUAR: APPLE */}
                    <div className="flex items-center justify-center shrink-0 w-40 sm:w-56 mx-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    <svg viewBox="0 0 24 24" className="h-8 w-auto fill-gray-900 shrink-0">
                        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.873-1.45 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z"/>
                    </svg>
                    <span className="ml-1 text-xl sm:text-2xl font-medium tracking-tight text-gray-900">Apple</span>
                    </div>

                    {/* 7. LOGO PRODUK LUAR: TIKTOK */}
                    <div className="flex items-center justify-center shrink-0 w-40 sm:w-56 mx-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    <svg viewBox="0 0 24 24" className="h-8 w-auto fill-gray-900 shrink-0">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.78-1.15 5.54-3.33 7.39-2.1 1.79-5.18 2.45-7.85 1.71-3.26-.95-5.69-3.92-5.74-7.3-.06-3.8 2.65-7.31 6.38-7.98 1.4-.25 2.85-.2 4.24-.04v4.06c-1.22-.4-2.58-.2-3.66.42-1.39.77-2.16 2.4-1.9 3.98.24 1.52 1.5 2.82 3.01 3.09 1.74.32 3.52-.61 4.13-2.25.32-.86.41-1.8.36-2.73-.08-6.19-.04-12.38-.05-18.57z"/>
                    </svg>
                    <span className="ml-1.5 text-xl sm:text-2xl font-bold tracking-tight text-gray-900">TikTok</span>
                    </div>

                </div>
                ))}
            </div>
            </div>

            {/* TEKS KAKI ASLI KAMU */}
            <p className="text-center text-xs text-gray-400 mt-10">
            Ingin menjadi partner Barling-GO?{" "}
            <a href="/kontak" className="text-[#6EB8BB] hover:underline font-bold">
                Hubungi kami
            </a>
            </p>
        </div>

        {/* CSS UNTUK ANIMASI BERGESER (MARQUEE) */}
        <style>{`
            @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-100% / 3)); }
            }
            .animate-marquee {
            animation: marquee 35s linear infinite;
            }
            .animation-paused {
            animation-play-state: paused;
            }
        `}</style>
        </section>
    )
    }