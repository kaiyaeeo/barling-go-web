    "use client"

    import { useState, useEffect } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import UserSidebar from "@/components/user/UserSidebar"
    import { Bell, Lock, Trash2, Loader2, Check, Eye, EyeOff } from "lucide-react"

    export default function SettingsPage() {
    const router   = useRouter()
    const supabase = createClient()

    const [profile, setProfile] = useState<any>(null)
    const [notif, setNotif]     = useState({
        order_updates: true,
        promo_emails:  false,
        new_content:   true,
    })
    const [pwForm, setPwForm]   = useState({ current: "", new: "", confirm: "" })
    const [showPw, setShowPw]   = useState(false)
    const [saving, setSaving]   = useState(false)
    const [pwSaving, setPwSaving] = useState(false)
    const [saved, setSaved]     = useState(false)
    const [pwError, setPwError] = useState<string | null>(null)
    const [pwSuccess, setPwSuccess] = useState(false)

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) { router.replace("/login"); return }
        supabase.from("profiles").select("full_name, avatar_url, membership_tier").eq("id", user.id).single()
            .then(({ data }) => setProfile(data))
        })
    }, [])

    async function handleSaveNotif() {
        setSaving(true)
        // Simpan preferensi notifikasi ke localStorage (atau tabel preferences jika ada)
        localStorage.setItem("barlinggo-notif-prefs", JSON.stringify(notif))
        await new Promise((r) => setTimeout(r, 500))
        setSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault()
        setPwError(null)
        if (pwForm.new.length < 6) { setPwError("Password baru minimal 6 karakter."); return }
        if (pwForm.new !== pwForm.confirm) { setPwError("Konfirmasi password tidak cocok."); return }
        setPwSaving(true)

        const { error } = await supabase.auth.updateUser({ password: pwForm.new })
        setPwSaving(false)
        if (error) { setPwError(error.message); return }
        setPwSuccess(true)
        setPwForm({ current: "", new: "", confirm: "" })
        setTimeout(() => setPwSuccess(false), 3000)
    }

    async function handleDeleteAccount() {
        if (!confirm("Apakah kamu yakin ingin menghapus akun? Tindakan ini tidak bisa dibatalkan.")) return
        await supabase.auth.signOut()
        router.replace("/")
    }

    return (
        <div className="min-h-screen bg-gray-50">
        <div className="h-16" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-6">
            <UserSidebar profile={profile} />

            <div className="flex-1 min-w-0 space-y-5">
                <h1 className="text-xl font-bold text-gray-900">Pengaturan Akun</h1>

                {/* Notifikasi */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-5">
                    <Bell size={17} className="text-[#6EB8BB]" />
                    <h2 className="text-base font-bold text-gray-900">Preferensi Notifikasi</h2>
                </div>
                <div className="space-y-4">
                    {[
                    { key:"order_updates", label:"Update Pesanan",   desc:"Status pesanan, konfirmasi pembayaran, pengiriman" },
                    { key:"promo_emails",  label:"Email Promosi",    desc:"Diskon, voucher, dan penawaran spesial" },
                    { key:"new_content",   label:"Konten Baru",      desc:"Destinasi wisata dan kuliner terbaru" },
                    ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <div>
                        <p className="text-sm font-medium text-gray-800">{item.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                        </div>
                        <div
                        onClick={() => setNotif((p) => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                            notif[item.key as keyof typeof notif] ? "bg-[#6EB8BB]" : "bg-gray-300"
                        }`}
                        >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            notif[item.key as keyof typeof notif] ? "translate-x-5" : "translate-x-0"
                        }`} />
                        </div>
                    </label>
                    ))}
                </div>
                <button
                    onClick={handleSaveNotif}
                    disabled={saving || saved}
                    className={`mt-4 px-6 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all ${
                    saved ? "bg-green-500 text-white" : "bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white disabled:opacity-60"
                    }`}
                >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    {saved && <Check size={14} />}
                    {saved ? "Tersimpan!" : saving ? "Menyimpan..." : "Simpan Preferensi"}
                </button>
                </div>

                {/* Ubah Password */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-5">
                    <Lock size={17} className="text-[#6EB8BB]" />
                    <h2 className="text-base font-bold text-gray-900">Ubah Kata Sandi</h2>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    {pwError && (
                    <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{pwError}</div>
                    )}
                    {pwSuccess && (
                    <div className="px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-center gap-2">
                        <Check size={15} /> Password berhasil diubah!
                    </div>
                    )}
                    {[
                    { name:"new",     label:"Password Baru",          placeholder:"Minimal 6 karakter" },
                    { name:"confirm", label:"Konfirmasi Password Baru", placeholder:"Ulangi password baru" },
                    ].map((f) => (
                    <div key={f.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                        <div className="relative">
                        <input
                            type={showPw ? "text" : "password"}
                            value={pwForm[f.name as keyof typeof pwForm]}
                            onChange={(e) => setPwForm((p) => ({ ...p, [f.name]: e.target.value }))}
                            placeholder={f.placeholder}
                            required
                            className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/30 focus:border-[#6EB8BB]"
                        />
                        {f.name === "new" && (
                            <button type="button" onClick={() => setShowPw(!showPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        )}
                        </div>
                    </div>
                    ))}
                    <button type="submit" disabled={pwSaving}
                    className="px-6 py-2.5 bg-[#6EB8BB] hover:bg-[#5AA4A7] disabled:opacity-60 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-all">
                    {pwSaving && <Loader2 size={14} className="animate-spin" />}
                    {pwSaving ? "Memproses..." : "Ubah Password"}
                    </button>
                </form>
                </div>

                {/* Hapus Akun */}
                <div className="bg-white rounded-2xl border border-red-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                    <Trash2 size={17} className="text-red-400" />
                    <h2 className="text-base font-bold text-gray-900">Hapus Akun</h2>
                </div>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                    Menghapus akun akan menghapus semua data profilmu secara permanen termasuk histori pesanan, ulasan, dan tempat tersimpan. Tindakan ini tidak bisa dibatalkan.
                </p>
                <button onClick={handleDeleteAccount}
                    className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 text-sm font-semibold rounded-xl border border-red-200 transition-all">
                    Hapus Akun Saya
                </button>
                </div>
            </div>
            </div>
        </div>
        </div>
    )
    }
