    import { NextRequest, NextResponse } from "next/server"
    import { createClient } from "@/lib/supabase/server"
    import { verifyMidtransSignature } from "@/lib/integrations/midtrans"

    // POST /api/webhook/midtrans
    // Midtrans mengirim notifikasi ke sini saat status pembayaran berubah
    export async function POST(request: NextRequest) {
    const supabase = await createClient()

    let body: any
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const {
        order_id,        // ini adalah order_number kita
        transaction_status,
        fraud_status,
        gross_amount,
        status_code,
        signature_key,
    } = body

    // Verifikasi signature Midtrans
    const isValid = verifyMidtransSignature(order_id, status_code, gross_amount, signature_key)
    if (!isValid) {
        console.error("Invalid Midtrans signature for order:", order_id)
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    // Cari order berdasarkan order_number, dan JANGAN LUPA ambil user_id
    const { data: order } = await supabase
        .from("orders")
        .select("id, status, payment_status, user_id") // <-- user_id ditambahkan di sini
        .eq("order_number", order_id)
        .single()

    if (!order) {
        console.error("Order not found:", order_id)
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Jangan proses ulang jika sudah paid
    if (order.payment_status === "paid") {
        return NextResponse.json({ message: "Already processed" })
    }

    // Map status Midtrans ke status order kita
    let paymentStatus = "unpaid"
    let orderStatus = order.status
    let paidAt: string | null = null

    if (
        (transaction_status === "capture" && fraud_status === "accept") ||
        transaction_status === "settlement"
    ) {
        paymentStatus = "paid"
        orderStatus = "paid"
        paidAt = new Date().toISOString()
    } else if (transaction_status === "pending") {
        paymentStatus = "pending"
    } else if (
        transaction_status === "deny" ||
        transaction_status === "cancel" ||
        transaction_status === "expire"
    ) {
        paymentStatus = "failed"
        orderStatus = "cancelled"
    }

    // Update data pesanan
    const updateData: Record<string, any> = {
        payment_status: paymentStatus,
        status: orderStatus,
        updated_at: new Date().toISOString(),
    }
    if (paidAt) updateData.paid_at = paidAt

    await supabase.from("orders").update(updateData).eq("id", order.id)

    // ===== SISTEM NOTIFIKASI OTOMATIS =====
    if (paymentStatus === "paid") {
        // 1. Kirim Notifikasi Sukses
        await supabase.from("user_notifications").insert({
        user_id: order.user_id,
        title: "Pembayaran Berhasil! 🎉",
        message: `Pembayaran untuk pesanan ${order_id} telah kami terima. UMKM sedang menyiapkan pesananmu.`,
        type: "pembayaran",
        reference_id: order.id
        });

        // 2. Auto-generate invoice
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
        fetch(`${siteUrl}/api/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
        }).catch(console.error)

    } else if (paymentStatus === "failed") {
        // Kirim Notifikasi Gagal/Expired (Batal otomatis)
        await supabase.from("user_notifications").insert({
        user_id: order.user_id,
        title: "Pembayaran Dibatalkan ❌",
        message: `Batas waktu pembayaran pesanan ${order_id} telah habis atau pesanan dibatalkan.`,
        type: "sistem",
        reference_id: order.id
        });
    }

    console.log(`Order ${order_id} updated: payment=${paymentStatus}, status=${orderStatus}`)
    return NextResponse.json({ message: "OK" })
    }