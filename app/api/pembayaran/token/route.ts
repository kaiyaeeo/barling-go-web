    import { NextRequest, NextResponse } from "next/server"
    import { createClient } from "@/lib/supabase/server"
    import { createSnapToken } from "@/lib/integrations/midtrans"

    // POST /api/pembayaran/token
    export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { orderId } = await request.json()

    // Ambil order + items
    const { data: order, error } = await supabase
        .from("orders")
        .select("*, order_items(id, product_name, price, qty)")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single()

    if (error || !order) return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 })
    if (order.payment_status === "paid") return NextResponse.json({ error: "Order sudah dibayar." }, { status: 400 })

    // Ambil email user
    const { data: { user: authUser } } = await supabase.auth.getUser()

    try {
        const { token, redirectUrl } = await createSnapToken({
        orderId: order.order_number,  // Midtrans pakai order_number bukan UUID
        amount: order.total_amount,
        customerName: order.shipping_name,
        customerEmail: authUser?.email ?? "",
        customerPhone: order.shipping_phone,
        items: [
            ...(order.order_items ?? []).map((item: any) => ({
            id: item.id,
            price: item.price,
            quantity: item.qty,
            name: item.product_name,
            })),
            {
            id: "SHIPPING",
            price: order.shipping_cost,
            quantity: 1,
            name: `Ongkir ${order.courier?.toUpperCase()} ${order.courier_service}`,
            },
        ],
        shippingAddress: {
            firstName: order.shipping_name,
            address: order.shipping_address,
            city: order.shipping_city,
            postalCode: order.shipping_postal_code,
            phone: order.shipping_phone,
        },
        })

        // Simpan token ke order
        await supabase
        .from("orders")
        .update({ midtrans_token: token, midtrans_order_id: order.order_number })
        .eq("id", orderId)

        return NextResponse.json({ token, redirectUrl })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
    }
