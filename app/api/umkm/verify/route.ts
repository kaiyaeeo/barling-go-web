    import { NextRequest, NextResponse } from "next/server"
    import { createClient } from "@/lib/supabase/server"

    export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { verificationId, userId, action, reason } = await request.json()
    if (!["approve", "reject"].includes(action)) return NextResponse.json({ error: "Invalid action" }, { status: 400 })

    // Update status verifikasi
    const { error: verifErr } = await supabase
        .from("umkm_verifications")
        .update({
        status: action === "approve" ? "approved" : "rejected",
        rejection_reason: action === "reject" ? reason : null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        })
        .eq("id", verificationId)

    if (verifErr) return NextResponse.json({ error: verifErr.message }, { status: 500 })

    // Jika disetujui, upgrade role user menjadi admin
    if (action === "approve") {
        await supabase.from("profiles").update({ role: "admin" }).eq("id", userId)
    }

    // Kirim notifikasi ke user
    const message = action === "approve"
        ? "Selamat! Toko UMKM kamu telah diverifikasi. Kamu sekarang bisa mulai berjualan."
        : `Maaf, pengajuan verifikasi UMKM kamu ditolak. Alasan: ${reason}`

    await supabase.from("notifications").insert({
        user_id: userId,
        type: "umkm_verification",
        title: action === "approve" ? "Verifikasi UMKM Disetujui ✅" : "Verifikasi UMKM Ditolak",
        message,
        link: "/dashboard",
    })

    return NextResponse.json({ success: true })
    }
