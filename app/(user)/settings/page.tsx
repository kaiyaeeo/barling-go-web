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
    const router   = useRouter()
    const supabase = createClient()

    const [loading,  setLoading]  = useState(true)
    const [user,     setUser]     = useState<any>(null)
    const [profile,  setProfile]  = useState<any>(null)

    const [emailPromo,           setEmailPromo]           = useState(true)
    const [orderUpdates,         setOrderUpdates]         = useState(true)
    const [activityReminders,    setActivityReminders]    = useState(false)
    const [visibility,           setVisibility]           = useState("Publik")
    const [twoFactor,            setTwoFactor]            = useState(false)
    const [membershipTier,       setMembershipTier]       = useState("free")
    const [paymentMethods,       setPaymentMethods]       = useState<any[]>([])

    const [isPasswordModalOpen,  setPasswordModalOpen]   = useState(false)
    const [newPassword,          setNewPassword]          = useState("")
    const [confirmPassword,      setConfirmPassword]      = useState("")
    const [showNew,              setShowNew]              = useState(false)
    const [showConfirm,          setShowConfirm]          = useState(false)
    const [passwordMsg,          setPasswordMsg]          = useState<{ type: "success"|"error"; text: string } | null>(null)

    const [isPaymentModalOpen,   setPaymentModalOpen]    = useState(false)
    const [newCardNumber,        setNewCardNumber]        = useState("")
    const [cardName,             setCardName]             = useState("")
    const [cardExp,              setCardExp]              = useState("")
    const [cardCvv,              setCardCvv]              = useState("")
    const [selectedBank,         setSelectedBank]         = useState<string>("") // <-- state untuk bank

    const [isUpgradeModalOpen,   setUpgradeModalOpen]    = useState(false)
    const [selectedPlan,         setSelectedPlan]         = useState<string | null>(null)

    const [isSubmitting,         setIsSubmitting]         = useState(false)
    const [deleteConfirm,        setDeleteConfirm]        = useState(false)

    // Daftar bank dengan logo (warna dan kode)
    const banks = [
        { id: "bca",   name: "BCA",   color: "bg-blue-600", textColor: "text-blue-600", bg: "bg-blue-50" },
        { id: "mandiri", name: "Mandiri", color: "bg-red-600", textColor: "text-red-600", bg: "bg-red-50" },
        { id: "bni",   name: "BNI",   color: "bg-indigo-700", textColor: "text-indigo-700", bg: "bg-indigo-50" },
        { id: "bri",   name: "BRI",   color: "bg-green-600", textColor: "text-green-600", bg: "bg-green-50" },
        { id: "cimb",  name: "CIMB",  color: "bg-amber-700", textColor: "text-amber-700", bg: "bg-amber-50" },
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

    const handleToggleTwoFactor  = () => { const v = !twoFactor;           setTwoFactor(v);           updateProfileDB("two_factor_enabled",  v) }
    const handleToggleEmail      = () => { const v = !emailPromo;          setEmailPromo(v);          updateProfileDB("email_promotions",    v) }
    const handleToggleOrder      = () => { const v = !orderUpdates;        setOrderUpdates(v);        updateProfileDB("order_updates",       v) }
    const handleToggleActivity   = () => { const v = !activityReminders;   setActivityReminders(v);   updateProfileDB("activity_reminders",  v) }
    const handleVisibility       = (e: React.ChangeEvent<HTMLSelectElement>) => { setVisibility(e.target.value); updateProfileDB("profile_visibility", e.target.value) }

    const passwordStrength = () => {
        if (!newPassword) return null
        if (newPassword.length < 6)  return { label: "Terlalu pendek", color: "bg-red-400",    text: "text-red-500",    w: "30%" }
        if (newPassword.length < 10) return { label: "Sedang",         color: "bg-amber-400",  text: "text-amber-500",  w: "60%" }
        return                              { label: "Kuat",            color: "bg-emerald-400",text: "text-emerald-500",w: "100%" }
    }
    const strength = passwordStrength()

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword.length < 6)             { setPasswordMsg({ type: "error", text: "Minimal 6 karakter." }); return }
        if (newPassword !== confirmPassword)     { setPasswordMsg({ type: "error", text: "Konfirmasi tidak cocok." }); return }
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
        const last4 = newCardNumber.replace(/\s/g,"").slice(-4)
        const newMethod = {
        id: Date.now().toString(),
        type: selectedBank ? banks.find(b => b.id === selectedBank)?.name || "Kartu" : (newCardNumber.replace(/\s/g,"").startsWith("4") ? "VISA" : "Mastercard"),
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

    const formatCard = (v: string) => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim()

    const TOGGLE_CLASS = (on: boolean) =>
        `w-11 h-6 rounded-full relative cursor-pointer transition-colors shrink-0 ${on ? "bg-[#6EB8BB]" : "bg-gray-200"}`
    const THUMB_CLASS  = (on: boolean) =>
        `absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-md transition-transform ${on ? "translate-x-[23px]" : "translate-x-[3px]"}`

    const INPUT = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] bg-gray-50 placeholder:text-gray-300 transition-all"
    const LABEL = "text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block"

    if (loading) {
        return (
        <div className="flex min-h-screen bg-[#F5F5F5]">
            <div className="hidden md:block w-[280px] shrink-0 bg-white border-r border-gray-100" />
            <div className="flex-1 flex items-center justify-center flex-col gap-3">
            <Loader2 size={32} className="text-[#6EB8BB] animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Memuat pengaturan…</p>
            </div>
        </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-[#F5F5F5]">

        {/* Sidebar */}
        <div className="hidden md:block w-[280px] shrink-0 bg-white border-r border-gray-100 z-10">
            <UserSidebar profile={profile} active="settings" />
        </div>

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

            {/* Topbar */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm h-16 flex items-center justify-between px-6 lg:px-10 shrink-0">
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <Link href="/" className="hover:text-gray-600 transition-colors">Beranda</Link>
                <ChevronRight size={13} className="text-gray-300" />
                <span className="text-gray-800 font-bold">Pengaturan Akun</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 bg-[#E6F7F8] border border-[#6EB8BB]/20 text-[#6EB8BB] text-xs font-bold px-3 py-1.5 rounded-xl">
                <ShieldCheck size={12} /> Akun Terproteksi
                </div>
                <Link href="/" className="flex items-center gap-1.5 px-4 py-2 bg-[#E6F7F8] hover:bg-[#C5EAE9] text-[#6EB8BB] rounded-xl text-xs font-bold transition-all">
                <Home size={14} /> <span className="hidden sm:block">Beranda</span>
                </Link>
                <div className="h-5 w-px bg-gray-100 mx-0.5" />
                <Link href="/notifikasi" className="p-2 text-gray-400 hover:text-[#6EB8BB] hover:bg-gray-50 rounded-xl transition-all relative">
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-400 rounded-full" />
                </Link>
                <button className="p-2 text-[#6EB8BB] bg-[#E6F7F8] rounded-xl">
                <SettingsIcon size={16} />
                </button>
            </div>
            </div>

            {/* Content */}
            <div className="p-6 lg:p-10 w-full max-w-5xl mx-auto space-y-6 pb-20">

            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                <p className="text-xs font-semibold text-[#6EB8BB] uppercase tracking-widest mb-1">Akun Saya</p>
                <h1 className="text-2xl font-black text-gray-900">Pengaturan Akun</h1>
                <p className="text-sm text-gray-400 mt-1">Kelola preferensi, keamanan, dan privasi akun kamu.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm shrink-0">
                <div className={`w-2 h-2 rounded-full ${membershipTier !== "free" ? "bg-emerald-400" : "bg-amber-400"}`} />
                <span className="text-xs font-black text-gray-700 capitalize">{membershipTier === "free" ? "Explorer" : membershipTier}</span>
                <span className="text-gray-200">·</span>
                <span className="text-[11px] text-gray-400 truncate max-w-[140px]">{profile?.email ?? user?.email}</span>
                </div>
            </div>

            {/* 2-col grid - ubah items-start menjadi items-stretch agar tinggi sama */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">

                {/* ── Notifikasi ── */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center"><Bell size={15} className="text-purple-500" /></div>
                    <div>
                    <p className="text-sm font-black text-gray-900">Notifikasi</p>
                    <p className="text-[11px] text-gray-400">Atur pemberitahuan yang ingin diterima</p>
                    </div>
                </div>
                <div className="divide-y divide-gray-50 flex-1">
                    {[
                    { icon: Mail,       label: "Email Promosi",        sub: "Diskon, tiket murah & penawaran eksklusif.", on: emailPromo,        toggle: handleToggleEmail   },
                    { icon: Smartphone, label: "Update Pesanan",       sub: "Pemberitahuan resi & pengiriman via WA.",    on: orderUpdates,      toggle: handleToggleOrder   },
                    { icon: Clock,      label: "Pengingat Aktivitas",  sub: "Notifikasi event & promo terbaru harian.",   on: activityReminders, toggle: handleToggleActivity},
                    ].map(({ icon: Icon, label, sub, on, toggle }) => (
                    <div key={label} onClick={toggle} className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors group">
                        <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-[#E6F7F8] transition-colors">
                            <Icon size={13} className="text-gray-400 group-hover:text-[#6EB8BB] transition-colors" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">{label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                            <span className={`inline-block mt-1 text-[9px] font-black px-1.5 py-0.5 rounded-full border ${on ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
                            {on ? "Aktif" : "Nonaktif"}
                            </span>
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
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center"><ShieldCheck size={15} className="text-emerald-500" /></div>
                    <div>
                    <p className="text-sm font-black text-gray-900">Privasi & Keamanan</p>
                    <p className="text-[11px] text-gray-400">Kelola visibilitas dan keamanan akun</p>
                    </div>
                </div>
                <div className="divide-y divide-gray-50 flex-1">
                    {/* Kata sandi */}
                    <div className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Lock size={13} className="text-gray-400" />
                        </div>
                        <div>
                        <p className="text-sm font-bold text-gray-800">Kata Sandi</p>
                        <p className="text-xs text-gray-400 mt-0.5">Ubah secara berkala untuk keamanan.</p>
                        </div>
                    </div>
                    <button onClick={() => setPasswordModalOpen(true)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#6EB8BB] bg-[#E6F7F8] px-3 py-1.5 rounded-xl hover:bg-[#C5EAE9] transition-colors">
                        Ubah <ChevronRight size={11} />
                    </button>
                    </div>

                    {/* 2FA */}
                    <div onClick={handleToggleTwoFactor} className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors group">
                    <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-[#E6F7F8] transition-colors">
                        <ShieldCheck size={13} className="text-gray-400 group-hover:text-[#6EB8BB] transition-colors" />
                        </div>
                        <div>
                        <p className="text-sm font-bold text-gray-800">Two-Factor Auth (2FA)</p>
                        <p className="text-xs text-gray-400 mt-0.5">Lapisan keamanan ekstra via OTP.</p>
                        <span className={`inline-block mt-1 text-[9px] font-black px-1.5 py-0.5 rounded-full border ${twoFactor ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
                            {twoFactor ? "Aktif" : "Nonaktif"}
                        </span>
                        </div>
                    </div>
                    <div className={TOGGLE_CLASS(twoFactor)}><div className={THUMB_CLASS(twoFactor)} /></div>
                    </div>

                    {/* Visibilitas */}
                    <div className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Globe size={13} className="text-gray-400" />
                        </div>
                        <div>
                        <p className="text-sm font-bold text-gray-800">Visibilitas Profil</p>
                        <p className="text-xs text-gray-400 mt-0.5">Siapa yang bisa melihat profilmu.</p>
                        </div>
                    </div>
                    <select value={visibility} onChange={handleVisibility}
                        className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6EB8BB]/25 focus:border-[#6EB8BB] cursor-pointer">
                        <option>Publik</option>
                        <option>Teman</option>
                        <option>Pribadi</option>
                    </select>
                    </div>
                </div>
                </div>

                {/* ── Metode Pembayaran ── */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center"><CreditCard size={15} className="text-blue-500" /></div>
                    <div>
                        <p className="text-sm font-black text-gray-900">Metode Pembayaran</p>
                        <p className="text-[11px] text-gray-400">Kartu & dompet digital tersimpan</p>
                    </div>
                    </div>
                    <button onClick={() => setPaymentModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#6EB8BB] bg-[#E6F7F8] px-3 py-1.5 rounded-xl hover:bg-[#C5EAE9] transition-colors">
                    <Plus size={12} /> Tambah
                    </button>
                </div>
                <div className="p-4 space-y-2.5">
                    {paymentMethods.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-gray-400">
                        <CreditCard size={28} className="text-gray-200 mb-2" />
                        <p className="text-sm font-semibold text-gray-500">Belum ada metode pembayaran</p>
                        <button onClick={() => setPaymentModalOpen(true)} className="mt-3 text-xs font-bold text-[#6EB8BB] hover:underline">+ Tambah sekarang</button>
                    </div>
                    ) : (
                    paymentMethods.map((pm) => (
                        <div key={pm.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className={`w-11 h-7 rounded-lg flex items-center justify-center text-white text-[9px] font-black shadow-sm ${pm.type === "VISA" ? "bg-gradient-to-br from-blue-600 to-blue-800" : "bg-gradient-to-br from-red-500 to-orange-500"}`}>
                            {pm.type}
                            </div>
                            <div>
                            <p className="text-sm font-bold text-gray-800">•••• •••• •••• {pm.last4}</p>
                            <p className="text-[10px] text-gray-400 font-medium">Exp {pm.exp}{pm.name ? ` · ${pm.name}` : ""}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {pm.isDefault && (
                            <span className="text-[9px] font-black text-[#6EB8BB] bg-[#E6F7F8] border border-[#6EB8BB]/20 px-2 py-0.5 rounded-full">Utama</span>
                            )}
                            <button onClick={() => handleDeletePayment(pm.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 size={13} />
                            </button>
                        </div>
                        </div>
                    ))
                    )}
                </div>
                </div>

                {/* ── Akun & Langganan ── */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center"><Award size={15} className="text-amber-500" /></div>
                    <div>
                    <p className="text-sm font-black text-gray-900">Akun & Keanggotaan</p>
                    <p className="text-[11px] text-gray-400">Kelola tier dan status akun kamu</p>
                    </div>
                </div>
                <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#E6F7F8] flex items-center justify-center">
                        <User size={14} className="text-[#6EB8BB]" />
                        </div>
                        <div>
                        <p className="text-xs text-gray-400 font-medium">Tipe Akun</p>
                        <p className="text-sm font-black text-gray-900 capitalize">{membershipTier === "free" ? "Explorer (Gratis)" : membershipTier}</p>
                        </div>
                    </div>
                    <Link href="/profil" className="text-xs font-bold text-[#6EB8BB] hover:underline flex items-center gap-1">
                        Profil <ChevronRight size={11} />
                    </Link>
                    </div>

                    {membershipTier === "free" && (
                    <button onClick={() => setUpgradeModalOpen(true)}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-sm">
                            <Sparkles size={16} className="text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-black text-gray-900">Upgrade ke Premium</p>
                            <p className="text-[10px] text-amber-700 font-semibold">Dapatkan akses fitur eksklusif!</p>
                        </div>
                        </div>
                        <ChevronRight size={15} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                    )}

                    {membershipTier !== "free" && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <div>
                        <p className="text-xs font-bold text-emerald-700">Kamu adalah Member Premium!</p>
                        <p className="text-[10px] text-emerald-600 mt-0.5">Semua fitur eksklusif telah aktif.</p>
                        </div>
                    </div>
                    )}

                    <div className="pt-3 border-t border-gray-100">
                    {!deleteConfirm ? (
                        <button onClick={() => setDeleteConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 text-sm font-bold text-red-400 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-all border border-red-100 hover:border-red-200 hover:text-red-500">
                        <AlertCircle size={14} /> Minta Hapus Akun
                        </button>
                    ) : (
                        <div className="space-y-2">
                        <p className="text-xs text-red-600 font-semibold text-center">Yakin ingin menghapus akun? Tindakan ini permanen.</p>
                        <div className="flex gap-2">
                            <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
                            <button className="flex-1 py-2 text-xs font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">Ya, Hapus</button>
                        </div>
                        </div>
                    )}
                    <p className="text-[10px] text-gray-400 text-center mt-2">Penghapusan akun tidak dapat dipulihkan.</p>
                    </div>
                </div>
                </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-[#E6F7F8] to-white rounded-2xl border border-[#6EB8BB]/20 p-5 flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#6EB8BB]/20 flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck size={17} className="text-[#6EB8BB]" />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900">Akunmu Aman</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">Data kamu dienkripsi dengan standar keamanan tertinggi. Jangan bagikan kata sandi kepada siapapun.</p>
                </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-5 flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-white border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
                    <HelpCircle size={17} className="text-blue-500" />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900">Pusat Bantuan</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">Butuh bantuan? Tim kami siap 24/7 untuk membantu kamu.</p>
                    <Link href="/bantuan" className="text-xs font-bold text-blue-500 hover:underline mt-1.5 inline-flex items-center gap-1">
                    Kunjungi Pusat Bantuan <ChevronRight size={11} />
                    </Link>
                </div>
                </div>
            </div>
            </div>
        </div>

        {/* ══════════════════════════════════════════
            MODAL: UBAH KATA SANDI (tidak diubah)
        ══════════════════════════════════════════ */}
        {isPasswordModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#E6F7F8] flex items-center justify-center">
                    <Lock size={15} className="text-[#6EB8BB]" />
                    </div>
                    <p className="text-sm font-black text-gray-900">Ubah Kata Sandi</p>
                </div>
                <button onClick={() => { setPasswordModalOpen(false); setPasswordMsg(null) }} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                    <X size={16} />
                </button>
                </div>

                <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                {passwordMsg && (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${passwordMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                    {passwordMsg.type === "success" ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                    {passwordMsg.text}
                    </div>
                )}

                <div>
                    <label className={LABEL}>Kata Sandi Baru</label>
                    <div className="relative">
                    <input type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        placeholder="Minimal 8 karakter" className={INPUT + " pr-10"} required />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    </div>
                    {strength && (
                    <div className="mt-1.5 space-y-1">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${strength.color} rounded-full transition-all`} style={{ width: strength.w }} />
                        </div>
                        <p className={`text-[10px] font-bold ${strength.text}`}>{strength.label}</p>
                    </div>
                    )}
                </div>

                <div>
                    <label className={LABEL}>Konfirmasi Kata Sandi</label>
                    <div className="relative">
                    <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Ketik ulang kata sandi" required
                        className={INPUT + " pr-10 " + (confirmPassword && confirmPassword !== newPassword ? "border-red-300 focus:border-red-400" : "")} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    </div>
                    {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">Password tidak cocok</p>
                    )}
                    {confirmPassword && confirmPassword === newPassword && (
                    <p className="text-[10px] text-emerald-500 font-semibold mt-1 flex items-center gap-1"><CheckCircle2 size={10} /> Password cocok</p>
                    )}
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <Info size={13} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-700">Perubahan kata sandi akan mengakhiri semua sesi aktif lainnya.</p>
                </div>

                <button type="submit" disabled={isSubmitting}
                    className="w-full py-3 bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]">
                    {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                    {isSubmitting ? "Menyimpan…" : "Simpan Perubahan"}
                </button>
                </form>
            </div>
            </div>
        )}

        {/* ══════════════════════════════════════════
            MODAL: TAMBAH METODE PEMBAYARAN (dengan pilihan bank)
        ══════════════════════════════════════════ */}
        {isPaymentModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                    <CreditCard size={15} className="text-blue-500" />
                    </div>
                    <p className="text-sm font-black text-gray-900">Tambah Metode Pembayaran</p>
                </div>
                <button onClick={() => { setPaymentModalOpen(false); setSelectedBank("") }} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                    <X size={16} />
                </button>
                </div>

                {/* ── Pilihan Bank (logo) ── */}
                <div className="px-6 pt-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Pilih Bank Penerbit</p>
                <div className="grid grid-cols-4 gap-2">
                    {banks.map((bank) => (
                    <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${
                        selectedBank === bank.id
                            ? `${bank.bg} border-[#6EB8BB] shadow-sm`
                            : "bg-gray-50 border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-full ${bank.color} flex items-center justify-center text-white text-[10px] font-black`}>
                        {bank.name.slice(0, 2)}
                        </div>
                        <span className="text-[10px] font-bold text-gray-700 mt-1">{bank.name}</span>
                    </button>
                    ))}
                </div>
                </div>

                {/* Card preview (gunakan nama bank jika dipilih) */}
                <div className="px-6 pt-5">
                <div className={`rounded-2xl p-5 text-white shadow-lg transition-all ${
                    selectedBank
                    ? "bg-gradient-to-br from-gray-700 to-gray-900"
                    : newCardNumber.replace(/\s/g,"").startsWith("4")
                        ? "bg-gradient-to-br from-blue-600 to-blue-800"
                        : "bg-gradient-to-br from-gray-700 to-gray-900"
                }`}>
                    <div className="flex items-center justify-between mb-6">
                    <div className="w-8 h-6 bg-white/20 rounded-md flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-yellow-400 opacity-80" />
                    </div>
                    <p className="text-sm font-black opacity-80">
                        {selectedBank ? banks.find(b => b.id === selectedBank)?.name || "BANK" : "KARTU"}
                    </p>
                    </div>
                    <p className="text-lg font-mono font-bold tracking-widest mb-4">
                    {newCardNumber || "•••• •••• •••• ••••"}
                    </p>
                    <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[9px] opacity-60 uppercase tracking-wider">Nama Pemegang</p>
                        <p className="text-sm font-bold">{cardName || "NAMA KAMU"}</p>
                    </div>
                    <div>
                        <p className="text-[9px] opacity-60 uppercase tracking-wider">Berlaku Sampai</p>
                        <p className="text-sm font-bold">{cardExp || "MM/YY"}</p>
                    </div>
                    </div>
                </div>
                </div>

                <form onSubmit={handleAddPayment} className="p-6 space-y-4">
                <div>
                    <label className={LABEL}>Nomor Kartu</label>
                    <input type="text" value={newCardNumber} onChange={e => setNewCardNumber(formatCard(e.target.value))}
                    placeholder="0000 0000 0000 0000" className={INPUT + " font-mono tracking-widest"} required />
                </div>
                <div>
                    <label className={LABEL}>Nama Pemegang Kartu</label>
                    <input type="text" value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())}
                    placeholder="SESUAI YANG TERCETAK DI KARTU" className={INPUT} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                    <label className={LABEL}>Berlaku Sampai</label>
                    <input type="text" value={cardExp} onChange={e => {
                        const v = e.target.value.replace(/\D/g,"").slice(0,4)
                        setCardExp(v.length > 2 ? v.slice(0,2)+"/"+v.slice(2) : v)
                    }} placeholder="MM/YY" className={INPUT} required />
                    </div>
                    <div>
                    <label className={LABEL}>CVV</label>
                    <input type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g,"").slice(0,3))}
                        placeholder="•••" className={INPUT} required />
                    </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-[#E6F7F8] border border-[#6EB8BB]/20 rounded-xl">
                    <ShieldCheck size={13} className="text-[#6EB8BB] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#5AA4A7]">Data kartu dienkripsi dan aman. Kami tidak menyimpan nomor CVV.</p>
                </div>

                <button type="submit" className="w-full py-3 bg-[#6EB8BB] hover:bg-[#5AA4A7] text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                    <Plus size={15} /> Tambah Kartu
                </button>
                </form>
            </div>
            </div>
        )}

        {/* ══════════════════════════════════════════
            MODAL: UPGRADE PREMIUM (tidak diubah)
        ══════════════════════════════════════════ */}
        {isUpgradeModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="relative bg-gradient-to-br from-[#6EB8BB] to-[#3d6b52] px-6 py-8 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <button onClick={() => { setUpgradeModalOpen(false); setSelectedPlan(null) }} className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all">
                    <X size={16} />
                </button>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-yellow-400/20 flex items-center justify-center">
                        <Sparkles size={16} className="text-yellow-400" />
                    </div>
                    <span className="text-xs font-black bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Upgrade Member</span>
                    </div>
                    <h2 className="text-2xl font-black mb-1">Tingkatkan Pengalaman Kamu</h2>
                    <p className="text-white/75 text-sm">Pilih paket yang sesuai dan nikmati fitur eksklusif BARLING-GO</p>
                </div>
                </div>

                <div className="p-6 space-y-5">

                {/* Plans */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                    {
                        key: "explorer", name: "Explorer", price: "Gratis", period: "selamanya",
                        color: "border-gray-200", badge: "", popular: false,
                        features: ["Etalase publik", "Pencarian destinasi", "Riwayat pesanan", "Wishlist hingga 20 item"],
                        disabled: membershipTier === "free",
                    },
                    {
                        key: "adventurer", name: "Adventurer", price: "Rp 29.000", period: "/bulan",
                        color: "border-[#6EB8BB]", badge: "Populer", popular: true,
                        features: ["Semua fitur Explorer", "AI Trip Planner tanpa batas", "Rekomendasi personal", "Diskon 5% semua produk", "Wishlist unlimited", "Badge Adventurer"],
                        disabled: false,
                    },
                    {
                        key: "pro", name: "Pro Explorer", price: "Rp 79.000", period: "/bulan",
                        color: "border-amber-300", badge: "Best Value", popular: false,
                        features: ["Semua fitur Adventurer", "Priority customer support", "Flash sale akses awal", "Diskon 10% semua produk", "Laporan perjalanan", "Badge Pro Explorer", "Early access fitur baru"],
                        disabled: false,
                    },
                    ].map((plan) => (
                    <div
                        key={plan.key}
                        onClick={() => !plan.disabled && setSelectedPlan(plan.key)}
                        className={`relative rounded-2xl border-2 p-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                        selectedPlan === plan.key
                            ? plan.popular ? "border-[#6EB8BB] bg-[#E6F7F8]/50 shadow-md" : plan.key === "pro" ? "border-amber-300 bg-amber-50/50 shadow-md" : "border-gray-400 bg-gray-50"
                            : plan.color + " bg-white"
                        } ${plan.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {plan.badge && (
                        <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-black px-3 py-0.5 rounded-full ${plan.popular ? "bg-[#6EB8BB] text-white" : "bg-amber-400 text-gray-900"}`}>
                            {plan.badge}
                        </span>
                        )}

                        <div className="text-center mb-3">
                        <p className="text-sm font-black text-gray-900">{plan.name}</p>
                        <div className="mt-1">
                            <span className="text-xl font-black text-gray-900">{plan.price}</span>
                            <span className="text-xs text-gray-400 ml-1">{plan.period}</span>
                        </div>
                        </div>

                        <ul className="space-y-1.5">
                        {plan.features.map(f => (
                            <li key={f} className="flex items-start gap-1.5 text-xs text-gray-600">
                            <CheckCircle2 size={12} className={`shrink-0 mt-0.5 ${plan.popular ? "text-[#6EB8BB]" : plan.key === "pro" ? "text-amber-500" : "text-gray-400"}`} />
                            {f}
                            </li>
                        ))}
                        </ul>

                        {selectedPlan === plan.key && !plan.disabled && (
                        <div className="mt-3 flex items-center justify-center gap-1 text-[10px] font-black text-[#6EB8BB]">
                            <CheckCircle2 size={11} /> Dipilih
                        </div>
                        )}
                    </div>
                    ))}
                </div>

                {/* CTA */}
                <button
                    onClick={() => selectedPlan && handleUpgrade(selectedPlan)}
                    disabled={!selectedPlan || isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-[#6EB8BB] to-[#5AA4A7] hover:from-[#5AA4A7] hover:to-[#4A9EA1] text-white font-black rounded-2xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-[#6EB8BB]/25"
                >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {isSubmitting ? "Memproses…" : selectedPlan ? `Upgrade ke ${selectedPlan}` : "Pilih Paket Dulu"}
                </button>

                <p className="text-center text-[10px] text-gray-400">
                    Dengan melanjutkan, kamu menyetujui{" "}
                    <Link href="/syarat" className="text-[#6EB8BB] font-bold hover:underline">Syarat & Ketentuan</Link>{" "}
                    layanan keanggotaan kami.
                </p>
                </div>
            </div>
            </div>
        )}

        </div>
    )
    }