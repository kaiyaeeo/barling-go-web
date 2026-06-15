    "use client"

    import { useState } from "react"
    import Link from "next/link"
    import { useSearchParams } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { Eye, EyeOff, Loader2, CheckCircle2, Store, User } from "lucide-react"

    type Mode = "pengunjung" | "seller"

    export default function RegisterPage() {
    const supabase = createClient()
    const searchParams = useSearchParams()
    const initialMode = (searchParams.get("mode") === "seller" ? "seller" : "pengunjung") as Mode

    const [mode, setMode] = useState<Mode>(initialMode)
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPass, setShowPass] = useState(false)
    // Seller-only fields
    const [shopName, setShopName] = useState("")
    const [shopType, setShopType] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const isSeller = mode === "seller"

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault()
        if (password.length < 6) { setError("Password minimal 6 karakter."); return }
        if (isSeller && !shopName.trim()) { setError("Nama toko wajib diisi."); return }
        setLoading(true); setError(null)

        const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
            full_name: fullName,
            umkm_name: isSeller ? shopName : null,
            },
            emailRedirectTo: `${location.origin}/auth/callback`,
        },
        })

        if (error) {
        setError(
            error.message.includes("already registered")
            ? "Email sudah terdaftar. Silakan login."
            : error.message
        )
        setLoading(false)
        return
        }

        // Jika seller, langsung buat verification request
        if (isSeller && data.user) {
        await supabase.from("umkm_verifications").insert({
            user_id: data.user.id,
            business_name: shopName,
            business_type: shopType || null,
            status: "pending",
        })
        }

        setSuccess(true)
        setLoading(false)
    }

    if (success) {
        return (
        <div className="min-h-screen flex items-center justify-center bg-white px-6">
            <div className="max-w-md w-full text-center">
            <CheckCircle2 size={56} className="text-[#6EB8BB] mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {isSeller ? "Pendaftaran Seller Berhasil!" : "Cek email kamu!"}
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Kami telah mengirim link konfirmasi ke{" "}
                <strong className="text-gray-800">{email}</strong>.
            </p>
            {isSeller && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left">
                <p className="text-sm font-semibold text-amber-800 mb-1">⏳ Proses Verifikasi Toko</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                    Setelah email dikonfirmasi, tim kami akan memverifikasi toko <strong>{shopName}</strong> dalam 1×24 jam.
                    Kamu akan mendapat notifikasi setelah disetujui.
                </p>
                </div>
            )}
            <Link
                href="/login"
                className="inline-block px-8 py-3 bg-[#6EB8BB] text-white font-semibold rounded-xl text-sm hover:bg-[#5AA4A7] transition-all"
            >
                Kembali ke Login
            </Link>
            </div>
        </div>
        )
    }

    return (
        <div className="min-h-screen flex">
        {/* Left branding panel */}
        <div className={`hidden lg:flex lg:w-5/12 flex-col justify-between p-12 transition-colors duration-300 ${
            isSeller ? "bg-[#1a3a2a]" : "bg-[#6EB8BB]"
        }`}>
            <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-black text-white">BARLING</span>
            <span className="text-2xl font-black text-green-300">-GO</span>
            </Link>
            <div>
            {isSeller ? (
                <>
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
                    <Store size={28} className="text-white" />
                </div>
                <h2 className="text-4xl font-black text-white leading-tight mb-4">
                    Bergabung<br />sebagai Mitra<br />UMKM!
                </h2>
                <p className="text-green-200/80 text-base leading-relaxed max-w-sm">
                    Daftarkan toko UMKM-mu dan jangkau lebih banyak pelanggan dari seluruh Indonesia.
                </p>
                </>
            ) : (
                <>
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
                    <User size={28} className="text-white" />
                </div>
                <h2 className="text-4xl font-black text-white leading-tight mb-4">
                    Mulai<br />petualanganmu!
                </h2>
                <p className="text-green-100/80 text-base leading-relaxed max-w-sm">
                    Bergabung dengan ribuan wisatawan yang sudah menjelajahi keindahan Barlingmascakep.
                </p>
                </>
            )}
            </div>
            <p className="text-green-100/40 text-sm">© 2026 Barling-GO</p>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
            <div className="w-full max-w-md">
            <Link href="/" className="flex items-center gap-1 mb-8 lg:hidden">
                <span className="text-xl font-black text-gray-900">BARLING</span>
                <span className="text-xl font-black text-[#6EB8BB]">-GO</span>
            </Link>

            {/* Mode toggle */}
            <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
                <button
                onClick={() => { setMode("pengunjung"); setError(null) }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    !isSeller ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
                >
                <User size={15} /> Pengunjung
                </button>
                <button
                onClick={() => { setMode("seller"); setError(null) }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isSeller ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
                >
                <Store size={15} /> Seller / UMKM
                </button>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {isSeller ? "Daftar sebagai Seller" : "Buat akun baru"}
            </h1>
            <p className="text-sm text-gray-500 mb-8">
                Sudah punya akun?{" "}
                <Link href={`/login${isSeller ? "?mode=seller" : ""}`} className="text-[#6EB8BB] font-semibold hover:underline">
                Masuk di sini
                </Link>
            </p>

            {error && (
                <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama lengkap kamu"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all"
                />
                </div>

                {/* Seller-only fields */}
                {isSeller && (
                <>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Toko / UMKM *</label>
                    <input
                        type="text"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="Contoh: Batik Banyumas Bu Siti"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis Usaha</label>
                    <select
                        value={shopType}
                        onChange={(e) => setShopType(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] bg-white"
                    >
                        <option value="">Pilih jenis usaha</option>
                        <option value="kuliner">Kuliner & Makanan</option>
                        <option value="kerajinan">Kerajinan Tangan</option>
                        <option value="fashion">Fashion & Batik</option>
                        <option value="wisata">Jasa Wisata</option>
                        <option value="oleh-oleh">Oleh-Oleh Khas</option>
                        <option value="lainnya">Lainnya</option>
                    </select>
                    </div>
                </>
                )}

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all"
                />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                    <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                </div>
                {/* Password strength */}
                {password.length > 0 && (
                    <div className="mt-2 flex gap-1">
                    {[1,2,3].map((level) => (
                        <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${
                        password.length >= level * 4
                            ? level === 1 ? "bg-red-400" : level === 2 ? "bg-amber-400" : "bg-green-500"
                            : "bg-gray-200"
                        }`} />
                    ))}
                    </div>
                )}
                </div>

                <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 font-bold rounded-xl text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 ${
                    isSeller ? "bg-[#1a3a2a] hover:bg-[#0f2619]" : "bg-[#6EB8BB] hover:bg-[#5AA4A7]"
                }`}
                >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Mendaftarkan..." : isSeller ? "Daftar sebagai Seller" : "Daftar Sekarang"}
                </button>
            </form>

            <p className="mt-6 text-xs text-gray-400 text-center leading-relaxed">
                Dengan mendaftar, kamu menyetujui{" "}
                <Link href="/syarat" className="underline">Syarat & Ketentuan</Link>
                {" "}dan{" "}
                <Link href="/privasi" className="underline">Kebijakan Privasi</Link> kami.
            </p>
            </div>
        </div>
        </div>
    )
    }