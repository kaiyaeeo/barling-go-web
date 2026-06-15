    import { NextRequest, NextResponse } from "next/server"
    import { createClient } from "@/lib/supabase/server"

    // POST /api/webhook/ekspedisi
    // Menerima update status pengiriman dari layanan tracking ekspedisi
    export async function POST(request: NextRequest) {
    const supabase = await createClient()

    // Verifikasi secret key dari header
    const webhookSecret = request.headers.get("x-webhook-secret")
    if (webhookSecret !== process.env.EKSPEDISI_WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let body: any
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const { tracking_number, status, delivered_at } = body

    if (!tracking_number) {
        return NextResponse.json({ error: "tracking_number required" }, { status: 400 })
    }

    // Cari order berdasarkan nomor resi
    const { data: order } = await supabase
        .from("orders")
        .select("id, status")
        .eq("tracking_number", tracking_number)
        .single()

    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Map status ekspedisi ke order status
    const statusMap: Record<string, string> = {
        picked_up: "packing",
        in_transit: "shipped",
        out_for_delivery: "shipped",
        delivered: "delivered",
        failed_delivery: "shipped",
    }

    const newStatus = statusMap[status] ?? order.status

    await supabase
        .from("orders")
        .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)

    return NextResponse.json({ message: "OK", status: newStatus })
    }
