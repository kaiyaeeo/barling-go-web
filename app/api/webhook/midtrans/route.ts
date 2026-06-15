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

    // Cari order berdasarkan order_number
    const { data: order } = await supabase
        .from("orders")
        .select("id, status, payment_status")
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
        transaction_status === "capture" && fraud_status === "accept" ||
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

    // Update order
    const updateData: Record<string, any> = {
        payment_status: paymentStatus,
        status: orderStatus,
        updated_at: new Date().toISOString(),
    }
    if (paidAt) updateData.paid_at = paidAt

    await supabase.from("orders").update(updateData).eq("id", order.id)

    // Auto-generate invoice jika sudah paid
    if (paymentStatus === "paid") {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
        fetch(`${siteUrl}/api/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
        }).catch(console.error)
    }

    console.log(`Order ${order_id} updated: payment=${paymentStatus}, status=${orderStatus}`)
    return NextResponse.json({ message: "OK" })
    }
