    // app/api/midtrans/webhook/route.ts

    import { createClient } from "@/lib/supabase/server"
    import { NextRequest, NextResponse } from "next/server"
    import crypto from "crypto"

    export async function POST(req: NextRequest) {
    const body = await req.json()

    // 1. Verifikasi signature Midtrans
    const {
        order_id,
        status_code,
        gross_amount,
        transaction_status,
        payment_type,
        signature_key,
    } = body

    const serverKey  = process.env.MIDTRANS_SERVER_KEY!
    const rawString  = order_id + status_code + gross_amount + serverKey
    const expected   = crypto.createHash("sha512").update(rawString).digest("hex")

    if (signature_key !== expected) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const supabase = await createClient()

    // ==========================================
    // SKENARIO A: CEK PEMBAYARAN IKLAN UMKM (ad_orders)
    // ==========================================
    const { data: adOrder } = await supabase
        .from("ad_orders")
        .select("id, seller_id, amount, ad_packages(name)")
        .eq("midtrans_order_id", order_id)
        .single()

    if (adOrder) {
        if (transaction_status === "settlement" || transaction_status === "capture") {
        // Update status Iklan jadi dibayar
        await supabase.from("ad_orders").update({ payment_status: "paid", status: "paid" }).eq("id", adOrder.id)
        
        // Kirim Notifikasi Iklan
        await supabase.from("notifications").insert({
            user_id: adOrder.seller_id,
            type: "payment_success",
            title: "🎉 Pembayaran Iklan Berhasil",
            message: `Pembayaran paket promosi ${adOrder.ad_packages?.name} berhasil. Super Admin akan segera meninjau pengajuan iklan Anda.`,
            link: `/admin/iklan/${adOrder.id}`,
            metadata: { amount: adOrder.amount, payment_method: payment_type }
        })
        } else if (transaction_status === "deny" || transaction_status === "cancel" || transaction_status === "expire") {
        await supabase.from("ad_orders").update({ payment_status: "failed", status: "cancelled" }).eq("id", adOrder.id)
        }
        return NextResponse.json({ received: true })
    }

    // ==========================================
    // SKENARIO B: CEK PEMBAYARAN PESANAN FISIK (orders)
    // ==========================================
    const { data: order } = await supabase
        .from("orders")
        .select(`
        id, order_number, total_amount, shipping_name,
        order_items ( products ( seller_id ) )
        `)
        .eq("order_number", order_id)
        .single()

    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Ekstrak ID Penjual dari relasi order_items -> products
    const sellerId = (order.order_items as any)?.[0]?.products?.seller_id

    if (transaction_status === "settlement" || transaction_status === "capture") {
        // 💡 Cukup ubah status orders.
        // Trigger SQL di database akan otomatis mendeteksi perubahan ini dan menembakkan Notifikasi "Pesanan Baru Masuk"!
        await supabase
        .from("orders")
        .update({ status: "paid", payment_status: "paid", payment_method: payment_type })
        .eq("id", order.id)

    } else if (transaction_status === "deny" || transaction_status === "cancel" || transaction_status === "expire") {
        // Update status gagal
        await supabase
        .from("orders")
        .update({ status: "cancelled", payment_status: "failed" })
        .eq("id", order.id)

        // Kirim notifikasi gagal bayar (Karena trigger SQL hanya menangani yang sukses)
        if (sellerId) {
        await supabase.from("notifications").insert({
            user_id: sellerId,
            type: "payment_failed",
            title: "❌ Pembayaran Gagal / Dibatalkan",
            message: `Pembayaran pesanan #${order.order_number} dari ${order.shipping_name ?? "pembeli"} gagal atau kedaluwarsa. Stok akan dikembalikan.`,
            link: `/admin/pesanan/${order.id}`,
            metadata: { order_id: order.id, order_number: order.order_number, amount: order.total_amount, transaction_status }
        })
        }
    } else if (transaction_status === "pending") {
        // Update metode pembayaran jika user memilih pending (misal: Transfer VA)
        await supabase
        .from("orders")
        .update({ payment_status: "pending", payment_method: payment_type })
        .eq("id", order.id)
    }

    return NextResponse.json({ received: true })
    }