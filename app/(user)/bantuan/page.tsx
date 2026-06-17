    "use client"

    import { useState, useEffect } from "react"
    import Link from "next/link"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import {
    Search,
    HelpCircle,
    ChevronRight,
    ChevronDown,
    Mail,
    Phone,
    MessageCircle,
    Shield,
    User,
    CreditCard,
    MapPin,
    Star,
    Award,
    Sparkles,
    Loader2,
    Headphones,
    BookOpen,
    Home
    } from "lucide-react"
    import UserSidebar from "@/components/user/UserSidebar"

    // ── Data FAQ ──
    const faqCategories = [
    {
        id: "umum",
        name: "Umum",
        icon: HelpCircle,
        color: "text-blue-500",
        bg: "bg-blue-50",
        questions: [
        { q: "Apa itu Barling-Go?", a: "Barling-Go adalah platform wisata yang menghubungkan traveler dengan berbagai destinasi menarik di Indonesia. Kami menyediakan rekomendasi, pemesanan tiket, dan panduan perjalanan lengkap." },
        { q: "Bagaimana cara mendaftar?", a: "Kamu bisa mendaftar melalui email atau akun Google. Cukup klik tombol 'Daftar' di halaman utama, isi data diri, dan verifikasi email." },
        { q: "Apakah Barling-Go gratis?", a: "Ya, pendaftaran dan penggunaan dasar Barling-Go gratis. Kami juga menyediakan paket berlangganan premium dengan fitur tambahan." },
        ]
    },
    {
        id: "akun",
        name: "Akun & Profil",
        icon: User,
        color: "text-purple-500",
        bg: "bg-purple-50",
        questions: [
        { q: "Bagaimana cara mengubah profil saya?", a: "Kamu bisa mengubah profil melalui menu 'Profil Saya' di sidebar. Di sana kamu bisa mengupdate foto, nama, dan informasi lainnya." },
        { q: "Lupa kata sandi, bagaimana?", a: "Klik 'Lupa Kata Sandi' pada halaman login. Kami akan mengirimkan email reset ke alamat terdaftar." },
        { q: "Bagaimana cara mengaktifkan 2FA?", a: "Buka menu 'Pengaturan' → 'Privasi & Keamanan', lalu aktifkan toggle Two-Factor Authentication." },
        ]
    },
    {
        id: "pembayaran",
        name: "Pembayaran",
        icon: CreditCard,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
        questions: [
        { q: "Metode pembayaran apa saja yang tersedia?", a: "Kami menerima pembayaran melalui transfer bank (BCA, Mandiri, BNI, BRI), kartu kredit/debit, dan dompet digital (OVO, GoPay, ShopeePay)." },
        { q: "Bagaimana cara menambahkan metode pembayaran?", a: "Buka 'Pengaturan' → 'Metode Pembayaran' → klik 'Tambah', lalu pilih bank/dompet dan isi data yang diperlukan." },
        { q: "Apakah data kartu saya aman?", a: "Ya, semua data kartu dienkripsi dengan standar keamanan tertinggi dan kami tidak menyimpan CVV." },
        ]
    },
    {
        id: "destinasi",
        name: "Destinasi & Wisata",
        icon: MapPin,
        color: "text-orange-500",
        bg: "bg-orange-50",
        questions: [
        { q: "Bagaimana cara mencari destinasi?", a: "Kamu bisa menggunakan fitur pencarian di halaman utama atau filter berdasarkan kategori, lokasi, dan rating." },
        { q: "Bagaimana cara memesan tiket?", a: "Pilih destinasi → pilih tanggal → pilih tiket → isi data pemesan → bayar. Tiket akan dikirim ke email." },
        { q: "Apakah bisa membatalkan pesanan?", a: "Ya, pembatalan dapat dilakukan melalui halaman 'Pesanan'. Syarat dan ketentuan berlaku." },
        ]
    },
    {
        id: "keamanan",
        name: "Keamanan & Privasi",
        icon: Shield,
        color: "text-red-500",
        bg: "bg-red-50",
        questions: [
        { q: "Bagaimana data saya dilindungi?", a: "Kami menggunakan enkripsi SSL dan protokol keamanan terbaik. Data pribadi tidak akan dibagikan ke pihak ketiga tanpa izin." },
        { q: "Bagaimana cara menghapus akun?", a: "Kamu bisa meminta penghapusan akun melalui menu 'Pengaturan' → 'Akun & Keanggotaan'. Proses ini permanen." },
        ]
    },
    {
        id: "promo",
        name: "Promo & Poin",
        icon: Sparkles,
        color: "text-amber-500",
        bg: "bg-amber-50",
        questions: [
        { q: "Apa itu Explorer Points?", a: "Poin yang didapat dari setiap transaksi dan aktivitas di Barling-Go. Poin bisa ditukar dengan diskon dan hadiah menarik." },
        { q: "Bagaimana cara mendapatkan poin?", a: "Poin didapat dari pemesanan tiket, memberikan ulasan, dan menyelesaikan misi harian." },
        { q: "Apa keuntungan menjadi member premium?", a: "Poin 2x lipat, diskon eksklusif, akses fitur AI Trip Planner, dan dukungan prioritas." },
        ]
    },
    ]

    const popularFAQs = [
    {
        id: "pop1",
        q: "Bagaimana cara memesan tiket wisata?",
        a: "Pilih destinasi di halaman utama atau hasil pencarian, klik 'Pesan Sekarang', pilih tanggal dan jumlah tiket, isi data pemesan, lalu selesaikan pembayaran. Tiket akan dikirim ke email Anda."
    },
    {
        id: "pop2",
        q: "Metode pembayaran apa yang tersedia?",
        a: "Kami menerima transfer bank (BCA, Mandiri, BNI, BRI), kartu kredit/debit (VISA, Mastercard), dan dompet digital (OVO, GoPay, ShopeePay, DANA)."
    },
    {
        id: "pop3",
        q: "Bagaimana cara menghubungi customer support?",
        a: "Anda bisa menghubungi kami melalui email support@barling-go.com, WhatsApp +62 812-3456-7890, atau live chat yang tersedia 24/7."
    },
    ]

    // ── Komponen Accordion FAQ ──
    function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border-b border-gray-100 last:border-0">
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between py-4 px-1 text-left hover:bg-gray-50/50 rounded-lg transition-colors group"
        >
            <span className="text-sm font-semibold text-gray-800 group-hover:text-[#6EB8BB] transition-colors">
            {question}
            </span>
            <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            />
        </button>
        <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-96 pb-4" : "max-h-0"
            }`}
        >
            <p className="text-sm text-gray-600 leading-relaxed pl-1 pr-4">{answer}</p>
        </div>
        </div>
    )
    }

    // ── Halaman Utama ──
    export default function BantuanPage() {
    const router = useRouter()
    const supabase = createClient()

    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)

    // ── Load user & profile ──
    useEffect(() => {
        async function loadData() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push("/login")
            return
        }
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(prof)
        setLoading(false)
        }
        loadData()
    }, [])

    // ── Filter FAQ ──
    const filteredFAQs = searchQuery
        ? faqCategories.map(cat => ({
            ...cat,
            questions: cat.questions.filter(q =>
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.a.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(cat => cat.questions.length > 0)
        : selectedCategory
        ? faqCategories.filter(cat => cat.id === selectedCategory)
        : faqCategories

    if (loading) {
        return (
        <div className="flex min-h-screen bg-[#F5F7FA]">
            <div className="hidden md:block w-[280px] shrink-0 bg-white border-r border-gray-200/80" />
            <div className="flex-1 flex items-center justify-center flex-col gap-3">
            <Loader2 size={32} className="text-[#6EB8BB] animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Memuat pusat bantuan…</p>
            </div>
        </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-[#F5F7FA]">
        {/* ── SIDEBAR ── */}
        <div className="hidden md:block w-[280px] shrink-0 bg-white border-r border-gray-200/80 z-10">
            <UserSidebar profile={profile} active="bantuan" />
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
            {/* ── TOPBAR ── */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-20 shadow-sm h-16 flex items-center justify-between px-6 lg:px-10 shrink-0">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Link href="/" className="hover:text-teal-600 transition-colors">Beranda</Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-800 font-bold">Pusat Bantuan</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1.5 bg-teal-50 px-3 py-1.5 rounded-full text-xs font-medium text-teal-700 border border-teal-200/50">
                <Headphones size={12} /> Support 24/7
                </div>
                <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-xs font-bold transition-all border border-teal-200/50">
                <Home size={15} /> <span className="hidden sm:inline">Beranda</span>
                </Link>
            </div>
            </div>

            {/* ── CONTENT ── */}
            <div className="flex-1 p-6 lg:p-10">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* ── HERO SECTION ── */}
                <div className="relative bg-gradient-to-br from-teal-600 via-emerald-600 to-green-500 rounded-3xl overflow-hidden p-8 lg:p-12 text-white shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />

                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl border border-white/20">
                        <HelpCircle size={24} />
                    </div>
                    <span className="text-xs font-black bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 uppercase tracking-wider">
                        Pusat Bantuan
                    </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                    Ada yang bisa kami bantu?
                    </h1>
                    <p className="text-white/80 text-sm md:text-base mt-2 font-medium">
                    Temukan jawaban cepat untuk pertanyaan Anda, atau hubungi tim support kami.
                    </p>

                    {/* ── Search Bar ── */}
                    <div className="mt-6 relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari pertanyaan, topik, atau kata kunci..."
                        className="w-full bg-white text-gray-800 placeholder:text-gray-400 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
                    />
                    {searchQuery && (
                        <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                        ✕
                        </button>
                    )}
                    </div>

                    {/* Quick tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                    {["Pemesanan", "Pembayaran", "Akun", "Promo", "Destinasi", "Keamanan"].map((tag) => (
                        <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="text-xs font-medium bg-white/20 backdrop-blur-sm hover:bg-white/30 px-3 py-1.5 rounded-full border border-white/20 transition-all"
                        >
                        {tag}
                        </button>
                    ))}
                    </div>
                </div>
                </div>

                {/* ── STATS / QUICK LINKS ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: BookOpen, label: "Panduan", sub: "Panduan lengkap", color: "bg-blue-50 text-blue-600 border-blue-200" },
                    { icon: MessageCircle, label: "Live Chat", sub: "Chat dengan kami", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
                    { icon: Phone, label: "Call Center", sub: "021-1234-5678", color: "bg-amber-50 text-amber-600 border-amber-200" },
                    { icon: Mail, label: "Email Support", sub: "support@barling-go.com", color: "bg-purple-50 text-purple-600 border-purple-200" },
                ].map((item) => (
                    <div
                    key={item.label}
                    className={`bg-white border ${item.color} rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer`}
                    >
                    <div className={`w-10 h-10 rounded-xl ${item.color.split(" ").slice(0,2).join(" ")} flex items-center justify-center mx-auto mb-2`}>
                        <item.icon size={18} />
                    </div>
                    <p className="text-sm font-bold text-gray-800">{item.label}</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">{item.sub}</p>
                    </div>
                ))}
                </div>

                {/* ── POPULAR FAQ ── */}
                <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                    <Star size={18} className="text-amber-400 fill-amber-400" />
                    <h2 className="text-lg font-black text-gray-800">Pertanyaan Populer</h2>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Yang paling sering ditanyakan</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {popularFAQs.map((faq) => (
                    <div key={faq.id} className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-5 hover:shadow-md transition-all hover:border-teal-200 group">
                        <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-teal-100 transition-colors">
                            <HelpCircle size={14} className="text-teal-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800 group-hover:text-teal-600 transition-colors">
                            {faq.q}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{faq.a}</p>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                </div>

                {/* ── CATEGORIES WITH QUESTIONS ── */}
                <div>
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen size={18} className="text-teal-600" />
                    <h2 className="text-lg font-black text-gray-800">Kategori Bantuan</h2>
                </div>

                {/* Category tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        selectedCategory === null
                        ? "bg-teal-600 text-white shadow-md"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-teal-200 hover:text-teal-600"
                    }`}
                    >
                    Semua
                    </button>
                    {faqCategories.map((cat) => {
                    const Icon = cat.icon
                    return (
                        <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            selectedCategory === cat.id
                            ? "bg-teal-600 text-white shadow-md"
                            : "bg-white text-gray-600 border border-gray-200 hover:border-teal-200 hover:text-teal-600"
                        }`}
                        >
                        <Icon size={14} />
                        {cat.name}
                        </button>
                    )
                    })}
                </div>

                {/* FAQ accordion list */}
                <div className="space-y-4">
                    {filteredFAQs.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Search size={24} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-semibold">Tidak ada hasil untuk "{searchQuery}"</p>
                        <p className="text-sm text-gray-400 mt-1">Coba gunakan kata kunci lain atau lihat kategori di atas.</p>
                        <button
                        onClick={() => setSearchQuery("")}
                        className="mt-4 text-sm font-bold text-teal-600 hover:underline"
                        >
                        Hapus filter
                        </button>
                    </div>
                    ) : (
                    filteredFAQs.map((category) => (
                        <div key={category.id} className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className={`p-2 rounded-xl ${category.bg}`}>
                            <category.icon size={16} className={category.color} />
                            </div>
                            <div>
                            <h3 className="text-sm font-black text-gray-800">{category.name}</h3>
                            <p className="text-[10px] text-gray-400 font-medium">
                                {category.questions.length} pertanyaan
                            </p>
                            </div>
                        </div>
                        <div className="px-6 divide-y divide-gray-100">
                            {category.questions.map((faq, idx) => (
                            <FAQItem key={idx} question={faq.q} answer={faq.a} />
                            ))}
                        </div>
                        </div>
                    ))
                    )}
                </div>
                </div>

                {/* ── CONTACT SUPPORT ── */}
                <div className="bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 rounded-3xl border border-teal-100/60 p-8 shadow-sm">
                <div className="text-center max-w-2xl mx-auto">
                    <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center mx-auto mb-4">
                    <Headphones size={24} className="text-teal-600" />
                    </div>
                    <h3 className="text-xl font-black text-gray-800">Masih butuh bantuan?</h3>
                    <p className="text-sm text-gray-500 mt-2 font-medium">
                    Tim support kami siap membantu Anda 24/7. Pilih metode kontak di bawah ini.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 max-w-3xl mx-auto">
                    <a
                    href="mailto:support@barling-go.com"
                    className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md hover:border-teal-200 transition-all group"
                    >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Mail size={18} className="text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800">Email</p>
                        <p className="text-[10px] text-gray-400">support@barling-go.com</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 ml-auto group-hover:text-teal-600 transition-colors" />
                    </a>

                    <a
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md hover:border-teal-200 transition-all group"
                    >
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                        <MessageCircle size={18} className="text-green-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800">WhatsApp</p>
                        <p className="text-[10px] text-gray-400">+62 812-3456-7890</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 ml-auto group-hover:text-teal-600 transition-colors" />
                    </a>

                    <a
                    href="#"
                    className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md hover:border-teal-200 transition-all group"
                    >
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                        <Phone size={18} className="text-amber-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800">Telepon</p>
                        <p className="text-[10px] text-gray-400">021-1234-5678</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 ml-auto group-hover:text-teal-600 transition-colors" />
                    </a>
                </div>
                </div>

                {/* ── FOOTER ── */}
                <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-200/60">
                <p>© 2026 Barling-Go. Pusat Bantuan resmi untuk semua traveler.</p>
                <div className="flex items-center justify-center gap-4 mt-2">
                    <Link href="/syarat" className="hover:text-teal-600 transition-colors">Syarat & Ketentuan</Link>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <Link href="/privasi" className="hover:text-teal-600 transition-colors">Kebijakan Privasi</Link>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <Link href="/" className="hover:text-teal-600 transition-colors">Kembali ke Beranda</Link>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
    )
    }