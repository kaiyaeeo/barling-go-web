    import { NextRequest, NextResponse } from "next/server"
    import { createClient } from "@/lib/supabase/server"

    export async function POST(request: NextRequest) {
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const {
        items, shipping_name, shipping_phone, shipping_address,
        shipping_city, shipping_province, shipping_postal_code,
        courier, courier_service, shipping_cost,
        payment_method, subtotal, total_amount, notes,
    } = body

    if (!items?.length) return NextResponse.json({ error: "Keranjang kosong." }, { status: 400 })

    // Validasi stok setiap item
    for (const item of items) {
        const { data: product } = await supabase
        .from("products")
        .select("id, name, stock, is_active")
        .eq("id", item.product_id)
        .single()

        if (!product || !product.is_active)
        return NextResponse.json({ error: `Produk "${item.product_name}" tidak tersedia.` }, { status: 400 })
        if (product.stock < item.qty)
        return NextResponse.json({ error: `Stok "${item.product_name}" tidak cukup. Tersisa: ${product.stock}` }, { status: 400 })
    }

    // Generate order number
    const { data: orderNumberData } = await supabase.rpc("generate_order_number")
    const orderNumber = orderNumberData ?? `ORD-${Date.now()}`

    // Buat order
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
        order_number: orderNumber,
        user_id: user.id,
        status: "pending",
        shipping_name, shipping_phone, shipping_address,
        shipping_city, shipping_province, shipping_postal_code,
        courier, courier_service,
        shipping_cost: shipping_cost ?? 0,
        payment_method,
        subtotal, total_amount,
        notes: notes || null,
        })
        .select()
        .single()

    if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })

    // Insert order items
    const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image ?? null,
        price: item.price,
        qty: item.qty,
        subtotal: item.subtotal,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)
    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })

    // Update stok & catat inventory log
    for (const item of items) {
        // Ambil stok sekarang
        const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.product_id)
        .single()

        const stockBefore = product?.stock ?? 0
        const stockAfter = stockBefore - item.qty

        // Update stok
        await supabase
        .from("products")
        .update({ stock: stockAfter, updated_at: new Date().toISOString() })
        .eq("id", item.product_id)

        // Catat inventory log
        await supabase.from("inventory_log").insert({
        product_id: item.product_id,
        type: "out",
        qty: item.qty,
        stock_before: stockBefore,
        stock_after: stockAfter,
        reason: "order",
        reference_id: order.id,
        created_by: user.id,
        })
    }

    return NextResponse.json(order, { status: 201 })
    }

    export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    const isAdmin = ["admin", "super_admin"].includes(profile?.role)

    let query = supabase
        .from("orders")
        .select("id, order_number, status, total_amount, payment_method, payment_status, created_at, shipping_name")
        .order("created_at", { ascending: false })

    if (!isAdmin) query = query.eq("user_id", user.id)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
    }