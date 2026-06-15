    "use client"

    import { useState } from "react"
    import Link from "next/link"
    import { createClient } from "@/lib/supabase/client"
    import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react"

    export default function ForgotPasswordPage() {
    const supabase = createClient()
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/callback?next=/profil`,
        })

        if (error) { setError(error.message); setLoading(false); return }
        setSent(true)
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors">
            <ArrowLeft size={15} /> Kembali ke Login
            </Link>

            {sent ? (
            <div className="text-center">
                <CheckCircle2 size={48} className="text-[#6EB8BB] mx-auto mb-4" />
                <h1 className="text-xl font-bold text-gray-900 mb-2">Email terkirim!</h1>
                <p className="text-sm text-gray-500">Cek inbox <strong>{email}</strong> untuk link reset password.</p>
            </div>
            ) : (
            <>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Lupa password?</h1>
                <p className="text-sm text-gray-500 mb-8">Masukkan email dan kami akan kirim link untuk reset password.</p>

                {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
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
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#6EB8BB] hover:bg-[#5AA4A7] disabled:opacity-60 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? "Mengirim..." : "Kirim Link Reset"}
                </button>
                </form>
            </>
            )}
        </div>
        </div>
    )
    }