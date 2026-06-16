    "use client"

    import { useState } from "react"
    import Link from "next/link"
    import { useRouter, useSearchParams } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { Eye, EyeOff, Loader2, Store, User } from "lucide-react"

    type Mode = "pengunjung" | "seller"

    export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    const initialMode = (searchParams.get("mode") === "seller" ? "seller" : "pengunjung") as Mode
    const nextUrl = searchParams.get("next") ?? ""

    const [mode, setMode] = useState<Mode>(initialMode)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // 1. Sign In
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

        if (signInError) {
        setError(signInError.message === "Invalid login credentials" ? "Email atau password salah." : signInError.message)
        setLoading(false)
        return
        }

        // 2. Ambil Role dari Database
        const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()

        // 3. LOGIKA REDIRECT (Diperbaiki)
        // Jika RLS memblokir, profile akan null. Kita log errornya agar tahu.
        if (profileError) {
        console.error("Supabase Error (RLS mungkin aktif):", profileError)
        }

        const role = profile?.role

        if (role === "super_admin") {
        router.replace("/super-admin/dashboard")
        } else if (role === "admin") {
        router.replace("/admin/dashboard")
        } else {
        // Jika user biasa atau role gagal didapat, lempar ke dashboard biasa/nextUrl
        router.replace(nextUrl || "/dashboard")
        }
    }

    async function handleGoogleLogin() {
        await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${location.origin}/auth/callback`,
            queryParams: { mode },
        },
        })
    }

    const isSeller = mode === "seller"

    return (
        <div className="min-h-screen flex">
        {/* Left branding panel */}
        <div className={`hidden lg:flex lg:w-5/12 flex-col justify-between p-12 transition-colors duration-300 ${isSeller ? "bg-[#9FCCCE]" : "bg-[#6EB8BB]"}`}>
            <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-black text-white tracking-tight">BARLING</span>
            <span className="text-2xl font-black text-green-300 tracking-tight">-GO</span>
            </Link>
            <div>
            {isSeller ? (
                <>
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
                    <Store size={28} className="text-white" />
                </div>
                <h2 className="text-4xl font-black text-white leading-tight mb-4">Kelola toko<br />UMKM-mu<br />dengan mudah.</h2>
                <p className="text-green-200/80 text-base leading-relaxed max-w-sm">Dashboard lengkap untuk mengelola produk, pesanan, dan analitik penjualan toko UMKM Barlingmascakep-mu.</p>
                </>
            ) : (
                <>
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
                    <User size={28} className="text-white" />
                </div>
                <h2 className="text-4xl font-black text-white leading-tight mb-4">Selamat datang<br />kembali,<br />Penjelajah!</h2>
                <p className="text-green-100/80 text-base leading-relaxed max-w-sm">Temukan destinasi wisata, kuliner, dan oleh-oleh khas 5 kabupaten Barlingmascakep favoritmu.</p>
                </>
            )}
            </div>
            <p className="text-green-100/40 text-sm">© 2026 Barling-GO · Rooted in Barlingmascakep</p>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
            <div className="w-full max-w-md">
            <Link href="/" className="flex items-center gap-1 mb-8 lg:hidden">
                <span className="text-xl font-black text-gray-900">BARLING</span>
                <span className="text-xl font-black text-[#6EB8BB]">-GO</span>
            </Link>

            <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
                <button onClick={() => { setMode("pengunjung"); setError(null) }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${!isSeller ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}><User size={15} /> Pengunjung</button>
                <button onClick={() => { setMode("seller"); setError(null) }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${isSeller ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}><Store size={15} /> Seller / UMKM</button>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">{isSeller ? "Masuk ke Dashboard Seller" : "Masuk ke akun"}</h1>
            <p className="text-sm text-gray-500 mb-8">
                {isSeller ? <>Belum punya akun seller? <Link href="/register?mode=seller" className="text-[#6EB8BB] font-semibold hover:underline">Daftar sebagai Seller</Link></> : <>Belum punya akun? <Link href="/register" className="text-[#6EB8BB] font-semibold hover:underline">Daftar sekarang</Link></>}
            </p>

            {error && <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl leading-relaxed">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" required className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all" />
                </div>

                <div>
                <div className="flex justify-between mb-1.5">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <Link href="/forgot-password" className="text-xs text-[#6EB8BB] hover:underline">Lupa password?</Link>
                </div>
                <div className="relative">
                    <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" required className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB] transition-all" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPass ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
                </div>

                <button type="submit" disabled={loading} className={`w-full py-3 font-bold rounded-xl text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 ${isSeller ? "bg-[#9FCCCE] hover:bg-[#8AB8BA]" : "bg-[#6EB8BB] hover:bg-[#5AA4A7]"}`}>
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Memproses..." : isSeller ? "Masuk sebagai Seller" : "Masuk"}
                </button>
            </form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">atau</div>
            </div>

            <button onClick={handleGoogleLogin} className="w-full py-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-medium text-gray-700 flex items-center justify-center gap-3 transition-all">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isSeller ? "Lanjutkan dengan Google (Seller)" : "Masuk dengan Google"}
            </button>
            </div>
        </div>
        </div>
    )
    }