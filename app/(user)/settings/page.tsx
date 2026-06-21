    "use client"

    import React, { useEffect, useState } from "react"
    import Link from "next/link"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import {
    Home, Bell, Settings as SettingsIcon, ShieldCheck, Mail, Smartphone,
    User, Lock, CreditCard, Globe, HelpCircle, ChevronRight,
    Award, Sparkles, Clock, AlertCircle, Loader2, X, Plus, Trash2,
    CheckCircle2, Eye, EyeOff, AlertTriangle, Info
    } from "lucide-react"
    import UserSidebar from "@/components/user/UserSidebar"

    export default function SettingsPage() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)

    const [emailPromo, setEmailPromo] = useState(true)
    const [orderUpdates, setOrderUpdates] = useState(true)
    const [activityReminders, setActivityReminders] = useState(false)
    const [visibility, setVisibility] = useState("Publik")
    const [twoFactor, setTwoFactor] = useState(false)
    const [membershipTier, setMembershipTier] = useState("free")
    const [paymentMethods, setPaymentMethods] = useState<any[]>([])

    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false)
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false)
    const [newCardNumber, setNewCardNumber] = useState("")
    const [cardName, setCardName] = useState("")
    const [cardExp, setCardExp] = useState("")
    const [cardCvv, setCardCvv] = useState("")
    const [selectedBank, setSelectedBank] = useState<string>("")

    const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState(false)

    const banks = [
        { id: "bca", name: "BCA", color: "bg-blue-600", textColor: "text-blue-600", bg: "bg-blue-50" },
        { id: "mandiri", name: "Mandiri", color: "bg-red-600", textColor: "text-red-600", bg: "bg-red-50" },
        { id: "bni", name: "BNI", color: "bg-indigo-700", textColor: "text-indigo-700", bg: "bg-indigo-50" },
        { id: "bri", name: "BRI", color: "bg-green-600", textColor: "text-green-600", bg: "bg-green-50" },
        { id: "cimb", name: "CIMB", color: "bg-amber-700", textColor: "text-amber-700", bg: "bg-amber-50" },
        { id: "danamon", name: "Danamon", color: "bg-cyan-600", textColor: "text-cyan-600", bg: "bg-cyan-50" },
        { id: "permata", name: "Permata", color: "bg-purple-600", textColor: "text-purple-600", bg: "bg-purple-50" },
        { id: "other", name: "Lainnya", color: "bg-gray-600", textColor: "text-gray-600", bg: "bg-gray-50" },
    ]

    useEffect(() => {
        async function loadSettings() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push("/login"); return }
        setUser(user)
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        if (prof) {
            setProfile(prof)
            setTwoFactor(prof.two_factor_enabled ?? false)
            setMembershipTier(prof.membership_tier ?? "free")
            setEmailPromo(prof.email_promotions ?? true)
            setOrderUpdates(prof.order_updates ?? true)
            setActivityReminders(prof.activity_reminders ?? false)
            setVisibility(prof.profile_visibility ?? "Publik")
            if (prof.payment_methods && Array.isArray(prof.payment_methods)) {
            setPaymentMethods(prof.payment_methods)
            } else {
            setPaymentMethods([{ id: "1", type: "VISA", last4: "4242", exp: "12/26", isDefault: true }])
            }
        }
        setLoading(false)
        }
        loadSettings()
    }, [])

    const updateProfileDB = async (field: string, value: any) => {
        if (!user) return
        await supabase.from("profiles").update({ [field]: value }).eq("id", user.id)
    }

    const handleToggleTwoFactor = () => { const v = !twoFactor; setTwoFactor(v); updateProfileDB("two_factor_enabled", v) }
    const handleToggleEmail = () => { const v = !emailPromo; setEmailPromo(v); updateProfileDB("email_promotions", v) }
    const handleToggleOrder = () => { const v = !orderUpdates; setOrderUpdates(v); updateProfileDB("order_updates", v) }
    const handleToggleActivity = () => { const v = !activityReminders; setActivityReminders(v); updateProfileDB("activity_reminders", v) }
    const handleVisibility = (e: React.ChangeEvent<HTMLSelectElement>) => { setVisibility(e.target.value); updateProfileDB("profile_visibility", e.target.value) }

    const passwordStrength = () => {
        if (!newPassword) return null
        if (newPassword.length < 6) return { label: "Terlalu pendek", color: "bg-red-400", text: "text-red-500", w: "30%" }
        if (newPassword.length < 10) return { label: "Sedang", color: "bg-amber-400", text: "text-amber-500", w: "60%" }
        return { label: "Kuat", color: "bg-emerald-400", text: "text-emerald-500", w: "100%" }
    }
    const strength = passwordStrength()

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword.length < 6) { setPasswordMsg({ type: "error", text: "Minimal 6 karakter." }); return }
        if (newPassword !== confirmPassword) { setPasswordMsg({ type: "error", text: "Konfirmasi tidak cocok." }); return }
        setIsSubmitting(true)
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        setIsSubmitting(false)
        if (error) {
        setPasswordMsg({ type: "error", text: error.message })
        } else {
        setPasswordMsg({ type: "success", text: "Kata sandi berhasil diubah!" })
        setTimeout(() => { setPasswordModalOpen(false); setNewPassword(""); setConfirmPassword(""); setPasswordMsg(null) }, 1500)
        }
    }

    const handleAddPayment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newCardNumber.replace(/\s/g, "").length < 16) return
        const last4 = newCardNumber.replace(/\s/g, "").slice(-4)
        const newMethod = {
        id: Date.now().toString(),
        type: selectedBank ? banks.find(b => b.id === selectedBank)?.name || "Kartu" : (newCardNumber.replace(/\s/g, "").startsWith("4") ? "VISA" : "Mastercard"),
        last4, exp: cardExp || "12/28", isDefault: paymentMethods.length === 0,
        name: cardName,
        bank: selectedBank
        }
        const updated = [...paymentMethods, newMethod]
        setPaymentMethods(updated)
        await updateProfileDB("payment_methods", updated)
        setPaymentModalOpen(false)
        setNewCardNumber(""); setCardName(""); setCardExp(""); setCardCvv(""); setSelectedBank("")
    }

    const handleDeletePayment = async (id: string) => {
        const updated = paymentMethods.filter(p => p.id !== id)
        if (updated.length > 0 && !updated.some(p => p.isDefault)) updated[0].isDefault = true
        setPaymentMethods(updated)
        await updateProfileDB("payment_methods", updated)
    }

    const handleUpgrade = async (tier: string) => {
        setIsSubmitting(true)
        setMembershipTier(tier)
        await updateProfileDB("membership_tier", tier)
        setIsSubmitting(false)
        setUpgradeModalOpen(false)
        setSelectedPlan(null)
    }

    const formatCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim()

    const TOGGLE_CLASS = (on: boolean) =>
        `w-11 h-6 rounded-full relative cursor-pointer transition-colors shrink-0 ${on ? "bg-[#6EB8BB]" : "bg-gray-200"}`
    const THUMB_CLASS = (on: boolean) =>
        `absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-md transition-transform ${on ? "translate-x-[23px]" : "translate-x-[3px]"}`

    const INPUT = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] bg-gray-50 placeholder:text-gray-300 transition-all"
    const LABEL = "text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block"

    if (loading) {
        return (
        <div className="flex min-h-screen bg-[#F5F7FA]">
            <div className="hidden md:block w-[280px] shrink-0 bg-white border-r border-gray-200/80" />
            <div className="flex-1 flex items-center justify-center flex-col gap-3">
            <Loader2 size={32} className="text-[#6EB8BB] animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Memuat pengaturan…</p>
            </div>
        </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-[#F5F7FA]">

        {/* Sidebar */}
        <div className="hidden md:block w-[280px] shrink-0 bg-white border-r border-gray-200/80 z-10">
            <UserSidebar profile={profile} active="settings" />
        </div>

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

            {/* Topbar */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-20 shadow-sm h-16 flex items-center justify-between px-6 lg:px-10 shrink-0">
            <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                <Link href="/" className="hover:text-[#6EB8BB] transition-colors">Beranda</Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-800 font-bold">Pengaturan</span>
            </div>
            <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-1.5 px-4 py-2 bg-[#6EB8BB]/10 hover:bg-[#6EB8BB]/20 text-[#6EB8BB] rounded-xl text-xs font-bold transition-all border border-[#6EB8BB]/20">
                <Home size={14} /> <span className="hidden sm:block">Beranda</span>
                </Link>
                <div className="h-5 w-px bg-gray-100 mx-0.5" />
                <button className="p-2 text-[#6EB8BB] bg-[#6EB8BB]/10 border border-[#6EB8BB]/20 rounded-xl">
                <SettingsIcon size={16} />
                </button>
            </div>
            </div>

            {/* Content Area */}
            <div className="p-6 lg:p-10 w-full max-w-5xl mx-auto space-y-8 pb-20">

            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900">Pengaturan Akun</h1>
                <p className="text-sm text-gray-500 mt-1">Kelola preferensi, keamanan, dan privasi akun kamu.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-gray-200 shadow-sm shrink-0">
                <div className={`w-2 h-2 rounded-full ${membershipTier !== "free" ? "bg-emerald-400" : "bg-amber-400"}`} />
                <span className="text-xs font-black text-gray-700 capitalize">{membershipTier === "free" ? "Explorer" : membershipTier}</span>
                <span className="text-gray-200">·</span>
                <span className="text-[11px] text-gray-400 truncate max-w-[140px]">{profile?.email ?? user?.email}</span>
                </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

                {/* ── Notifikasi ── */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-50 bg-gray-50/30">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100"><Bell size={18} className="text-purple-500" /></div>
                    <div>
                    <p className="text-sm font-black text-gray-900">Pemberitahuan</p>
                    <p className="text-[11px] text-gray-400 font-medium">Atur notifikasi yang ingin diterima</p>
                    </div>
                </div>
                <div className="divide-y divide-gray-50 flex-1">
                    {[
                    { icon: Mail, label: "Email Promosi", sub: "Diskon & penawaran eksklusif.", on: emailPromo, toggle: handleToggleEmail },
                    { icon: Smartphone, label: "Update Pesanan", sub: "Update pesanan via WhatsApp/Push.", on: orderUpdates, toggle: handleToggleOrder },
                    { icon: Clock, label: "Pengingat Aktivitas", sub: "Update event harian terbaru.", on: activityReminders, toggle: handleToggleActivity },
                    ].map(({ icon: Icon, label, sub, on, toggle }) => (
                    <div key={label} onClick={toggle} className="flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-gray-50/50 transition-colors group">
                        <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-[#E6F7F8] transition-colors">
                            <Icon size={14} className="text-gray-400 group-hover:text-[#6EB8BB] transition-colors" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">{label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                        </div>
                        </div>
                        <div className={TOGGLE_CLASS(on)}>
                        <div className={THUMB_CLASS(on)} />
                        </div>
                    </div>
                    ))}
                </div>
                </div>

                {/* ── Privasi & Keamanan ── */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-50 bg-gray-50/30">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100"><ShieldCheck size={18} className="text-emerald-500" /></div>
                    <div>
                    <p className="text-sm font-black text-gray-900">Keamanan Akun</p>
                    <p className="text-[11px] text-gray-400 font-medium">Kelola proteksi dan visibilitas</p>
                    </div>
                </div>
                <div className="divide-y divide-gray-50 flex-1">
                    {/* Kata sandi */}
                    <div className="flex items-center justify-between px-6 py-5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        <Lock size={14} className="text-gray-400" />
                        </div>
                        <div>
                        <p className="text-sm font-bold text-gray-800">Kata Sandi</p>
                        <p className="text-xs text-gray-400 mt-0.5">Ubah untuk keamanan ekstra.</p>
                        </div>
                    </div>
                    <button onClick={() => setPasswordModalOpen(true)}
                        className="text-xs font-bold text-[#6EB8BB] bg-[#6EB8BB]/10 px-4 py-2 rounded-xl hover:bg-[#6EB8BB]/20 transition-colors border border-[#6EB8BB]/20">
                        Ubah
                    </button>
                    </div>

                    {/* 2FA */}
                    <div onClick={handleToggleTwoFactor} className="flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-gray-50/50 transition-colors group">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-[#E6F7F8] transition-colors">
                        <ShieldCheck size={14} className="text-gray-400 group-hover:text-[#6EB8BB] transition-colors" />
                        </div>
                        <div>
                        <p className="text-sm font-bold text-gray-800">Two-Factor Auth</p>
                        <p className="text-xs text-gray-400 mt-0.5">Proteksi login via OTP.</p>
                        </div>
                    </div>
                    <div className={TOGGLE_CLASS(twoFactor)}><div className={THUMB_CLASS(twoFactor)} /></div>
                    </div>

                    {/* Visibilitas */}
                    <div className="flex items-center justify-between px-6 py-5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        <Globe size={14} className="text-gray-400" />
                        </div>
                        <div>
                        <p className="text-sm font-bold text-gray-800">Visibilitas</p>
                        <p className="text-xs text-gray-400 mt-0.5">Siapa yang melihat profilmu.</p>
                        </div>
                    </div>
                    <select value={visibility} onChange={handleVisibility}
                        className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 cursor-pointer">
                        <option>Publik</option>
                        <option>Privasi</option>
                    </select>
                    </div>
                </div>
                </div>

                {/* ── Metode Pembayaran ── */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 bg-gray-50/30">
                    <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100"><CreditCard size={18} className="text-blue-500" /></div>
                    <div>
                        <p className="text-sm font-black text-gray-900">Pembayaran</p>
                        <p className="text-[11px] text-gray-400 font-medium">Kelola kartu & dompet digital</p>
                    </div>
                    </div>
                    <button onClick={() => setPaymentModalOpen(true)}
                    className="text-xs font-bold text-[#6EB8BB] bg-[#6EB8BB]/10 px-4 py-2 rounded-xl hover:bg-[#6EB8BB]/20 transition-colors border border-[#6EB8BB]/20">
                    <Plus size={14} className="inline mr-1" /> Tambah
                    </button>
                </div>
                <div className="p-6 space-y-3 flex-1">
                    {paymentMethods.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                        <CreditCard size={32} className="opacity-20 mb-2" />
                        <p className="text-xs font-medium text-gray-400 text-center px-4">Belum ada metode pembayaran tersimpan.</p>
                    </div>
                    ) : (
                    paymentMethods.map((pm) => (
                        <div key={pm.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-8 rounded-lg flex items-center justify-center text-white text-[9px] font-black shadow-sm ${pm.type === "VISA" ? "bg-gradient-to-br from-blue-600 to-blue-800" : "bg-gradient-to-br from-red-500 to-orange-500"}`}>
                            {pm.type}
                            </div>
                            <div>
                            <p className="text-sm font-bold text-gray-800">•••• {pm.last4}</p>
                            <p className="text-[10px] text-gray-400 font-medium">Exp {pm.exp}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {pm.isDefault && <span className="text-[9px] font-black text-[#6EB8BB] bg-white border border-[#6EB8BB]/20 px-2 py-1 rounded-lg">Utama</span>}
                            <button onClick={() => handleDeletePayment(pm.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 size={14} />
                            </button>
                        </div>
                        </div>
                    ))
                    )}
                </div>
                </div>

                {/* ── Akun & Keanggotaan ── */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-50 bg-gray-50/30">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100"><Award size={18} className="text-amber-500" /></div>
                    <div>
                    <p className="text-sm font-black text-gray-900">Keanggotaan</p>
                    <p className="text-[11px] text-gray-400 font-medium">Status akun & langganan</p>
                    </div>
                </div>
                <div className="p-6 space-y-4 flex-1">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E6F7F8] flex items-center justify-center border border-[#6EB8BB]/20">
                        <User size={16} className="text-[#6EB8BB]" />
                        </div>
                        <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tipe Member</p>
                        <p className="text-sm font-black text-gray-900 capitalize">{membershipTier === "free" ? "Explorer" : membershipTier}</p>
                        </div>
                    </div>
                    <Link href="/profil" className="text-xs font-bold text-[#6EB8BB] hover:underline flex items-center gap-1">
                        Profil <ChevronRight size={14} />
                    </Link>
                    </div>

                    {membershipTier === "free" ? (
                    <button onClick={() => setUpgradeModalOpen(true)}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-sm">
                            <Sparkles size={18} className="text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-black text-gray-900">Upgrade Premium</p>
                            <p className="text-[10px] text-amber-700 font-semibold">Dapatkan poin 2x lebih banyak!</p>
                        </div>
                        </div>
                        <ChevronRight size={16} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                    ) : (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                        <div>
                        <p className="text-xs font-bold text-emerald-700">Akun Premium Aktif</p>
                        <p className="text-[10px] text-emerald-600">Terima kasih atas kontribusi Anda!</p>
                        </div>
                    </div>
                    )}
                    
                    <button onClick={() => setDeleteConfirm(true)} className="w-full py-3 text-xs font-bold text-red-400 hover:text-red-600 transition-colors">
                    Minta Penghapusan Akun
                    </button>
                </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="p-6 bg-gradient-to-br from-[#E6F7F8] to-white rounded-3xl border border-[#6EB8BB]/20 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#6EB8BB]/20 flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck size={24} className="text-[#6EB8BB]" />
                </div>
                <div>
                    <p className="text-base font-bold text-gray-900">Data Anda Terproteksi</p>
                    <p className="text-sm text-gray-500 mt-0.5">Privasi data Anda adalah prioritas utama kami di Barling-GO.</p>
                </div>
                </div>
                <Link href="/bantuan" className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:border-[#6EB8BB] hover:text-[#6EB8BB] transition-all shadow-sm">
                Hubungi Support
                </Link>
            </div>
            </div>

            {/* MODAL: UBAH KATA SANDI */}
            {isPasswordModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E6F7F8] flex items-center justify-center border border-[#6EB8BB]/20">
                        <Lock size={18} className="text-[#6EB8BB]" />
                    </div>
                    <p className="text-lg font-black text-gray-900">Ubah Kata Sandi</p>
                    </div>
                    <button onClick={() => { setPasswordModalOpen(false); setPasswordMsg(null) }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                    <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleChangePassword} className="p-6 space-y-5">
                    {passwordMsg && (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold ${passwordMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                        {passwordMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                        {passwordMsg.text}
                    </div>
                    )}

                    <div>
                    <label className={LABEL}>Kata Sandi Baru</label>
                    <div className="relative">
                        <input type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        placeholder="Minimal 8 karakter" className={INPUT + " pr-12 py-3 rounded-2xl"} required />
                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {strength && (
                        <div className="mt-2 space-y-1 px-1">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${strength.color} rounded-full transition-all`} style={{ width: strength.w }} />
                        </div>
                        <p className={`text-[10px] font-bold ${strength.text}`}>{strength.label}</p>
                        </div>
                    )}
                    </div>

                    <div>
                    <label className={LABEL}>Konfirmasi Password</label>
                    <div className="relative">
                        <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Ketik ulang" required
                        className={INPUT + " pr-12 py-3 rounded-2xl " + (confirmPassword && confirmPassword !== newPassword ? "border-red-300 focus:border-red-400" : "")} />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    </div>

                    <button type="submit" disabled={isSubmitting}
                    className="w-full py-4 bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white font-black rounded-2xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-[#6EB8BB]/20">
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                    {isSubmitting ? "Memproses…" : "Simpan Kata Sandi"}
                    </button>
                </form>
                </div>
            </div>
            )}

            {/* MODAL: TAMBAH PEMBAYARAN */}
            {isPaymentModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                        <CreditCard size={18} className="text-blue-500" />
                    </div>
                    <p className="text-lg font-black text-gray-900">Kartu Baru</p>
                    </div>
                    <button onClick={() => { setPaymentModalOpen(false); setSelectedBank("") }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                    <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className={`rounded-3xl p-6 text-white shadow-xl transition-all h-48 flex flex-col justify-between ${selectedBank ? "bg-gradient-to-br from-slate-700 to-slate-900" : newCardNumber.startsWith("4") ? "bg-gradient-to-br from-blue-600 to-blue-800" : "bg-gradient-to-br from-slate-700 to-slate-900"}`}>
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-8 bg-white/20 rounded-lg backdrop-blur-sm" />
                        <p className="text-xs font-black tracking-widest opacity-80 uppercase">
                        {selectedBank ? banks.find(b => b.id === selectedBank)?.name : "BARLING CARD"}
                        </p>
                    </div>
                    <p className="text-xl font-mono tracking-[0.2em] font-bold">
                        {newCardNumber || "•••• •••• •••• ••••"}
                    </p>
                    <div className="flex justify-between items-end">
                        <div>
                        <p className="text-[8px] opacity-60 uppercase mb-1">Card Holder</p>
                        <p className="text-sm font-bold tracking-wide uppercase truncate max-w-[150px]">{cardName || "NAMA LENGKAP"}</p>
                        </div>
                        <div className="text-right">
                        <p className="text-[8px] opacity-60 uppercase mb-1">Expires</p>
                        <p className="text-sm font-bold">{cardExp || "MM/YY"}</p>
                        </div>
                    </div>
                    </div>

                    <form onSubmit={handleAddPayment} className="space-y-4">
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {banks.slice(0, 4).map((bank) => (
                        <button key={bank.id} type="button" onClick={() => setSelectedBank(bank.id)}
                            className={`p-2 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${selectedBank === bank.id ? "border-[#6EB8BB] bg-[#E6F7F8]" : "border-gray-50 bg-gray-50"}`}>
                            <div className={`w-6 h-6 rounded-full ${bank.color} flex items-center justify-center text-[8px] font-black text-white`}>{bank.name[0]}</div>
                            <span className="text-[8px] font-bold text-gray-500">{bank.name}</span>
                        </button>
                        ))}
                    </div>
                    <input type="text" value={newCardNumber} onChange={e => setNewCardNumber(formatCard(e.target.value))}
                        placeholder="Nomor Kartu" className={INPUT + " py-3 rounded-2xl font-mono"} required />
                    <input type="text" value={cardName} onChange={e => setCardName(e.target.value)}
                        placeholder="Nama di Kartu" className={INPUT + " py-3 rounded-2xl"} required />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" value={cardExp} onChange={e => setCardExp(e.target.value)}
                        placeholder="MM/YY" className={INPUT + " py-3 rounded-2xl"} required />
                        <input type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value)}
                        placeholder="CVV" className={INPUT + " py-3 rounded-2xl"} required />
                    </div>
                    <button type="submit" className="w-full py-4 bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white font-black rounded-2xl text-sm transition-all shadow-lg shadow-[#6EB8BB]/20 mt-2">
                        Tambah Kartu
                    </button>
                    </form>
                </div>
                </div>
            </div>
            )}
            
            {/* UPGRADE MODAL - DIBAWAH INI TETAP SAMA KARENA SUDAH BAGUS */}
            {isUpgradeModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
                    {/* Header Upgrade */}
                    <div className="relative bg-gradient-to-br from-[#6EB8BB] to-[#3d6b52] px-8 py-10 text-white">
                    <button onClick={() => { setUpgradeModalOpen(false); setSelectedPlan(null) }} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                        <X size={20} />
                    </button>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-yellow-400/20 flex items-center justify-center border border-yellow-400/30">
                            <Sparkles size={20} className="text-yellow-400" />
                        </div>
                        <span className="text-xs font-black bg-yellow-400 text-gray-900 px-3 py-1 rounded-full uppercase tracking-widest">Premium</span>
                        </div>
                        <h2 className="text-3xl font-black mb-2 leading-tight">Buka Potensi Wisata Tanpa Batas</h2>
                        <p className="text-white/80 text-sm max-w-md">Dapatkan akses ke Intelligent Planner AI, diskon tiket, dan poin eksklusif setiap hari.</p>
                    </div>
                    </div>

                    <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                        { key: "explorer", name: "Explorer", price: "Gratis", period: "Forever", features: ["Wishlist Item", "Basic Search", "Review Ads"], color: "border-gray-200" },
                        { key: "adventurer", name: "Adventurer", price: "Rp 29k", period: "/mo", popular: true, features: ["AI Planner", "5% Discount", "Badge Auth"], color: "border-[#6EB8BB]" },
                        { key: "pro", name: "Pro Explorer", price: "Rp 79k", period: "/mo", features: ["10% Discount", "Priority Support", "No Ads"], color: "border-amber-400" },
                        ].map((plan) => (
                        <div key={plan.key} onClick={() => setSelectedPlan(plan.key)} 
                            className={`relative p-5 rounded-[24px] border-2 cursor-pointer transition-all ${selectedPlan === plan.key ? plan.popular ? "border-[#6EB8BB] bg-[#E6F7F8]" : "border-amber-400 bg-amber-50" : "border-gray-100 bg-white hover:border-gray-200"}`}>
                            {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6EB8BB] text-white text-[8px] font-black px-3 py-1 rounded-full">POPULER</span>}
                            <p className="text-center font-black text-gray-900 text-sm mb-1">{plan.name}</p>
                            <p className="text-center text-lg font-black text-gray-900">{plan.price}<span className="text-[10px] text-gray-400">{plan.period}</span></p>
                            <div className="mt-4 space-y-2">
                            {plan.features.map(f => (
                                <div key={f} className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold">
                                <CheckCircle2 size={12} className="text-[#6EB8BB]" /> {f}
                                </div>
                            ))}
                            </div>
                        </div>
                        ))}
                    </div>
                    <button onClick={() => selectedPlan && handleUpgrade(selectedPlan)} disabled={!selectedPlan || isSubmitting}
                        className="w-full py-4 bg-gradient-to-r from-[#6EB8BB] to-[#5AA4A7] text-white font-black rounded-2xl shadow-xl shadow-[#6EB8BB]/20 disabled:opacity-50">
                        {isSubmitting ? "Memproses..." : "Konfirmasi Berlangganan"}
                    </button>
                    </div>
                </div>
            </div>
            )}

        </div>
        </div>
    )
    }