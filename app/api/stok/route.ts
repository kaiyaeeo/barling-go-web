    import { NextRequest, NextResponse } from "next/server"
    import { createClient } from "@/lib/supabase/server"

    export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!["admin", "super_admin"].includes(profile?.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { productId, type, qty, reason } = await request.json()

    if (!productId || !type || qty == null) {
        return NextResponse.json({ error: "Parameter tidak lengkap." }, { status: 400 })
    }

    const { data: product } = await supabase
        .from("products").select("id, stock").eq("id", productId).single()

    if (!product) return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 })

    const stockBefore = product.stock
    let stockAfter: number

    if (type === "in") stockAfter = stockBefore + qty
    else if (type === "out") {
        if (qty > stockBefore) return NextResponse.json({ error: "Stok tidak cukup." }, { status: 400 })
        stockAfter = stockBefore - qty
    } else {
        // adjustment: set langsung
        stockAfter = qty
    }

    // Update stok produk
    await supabase.from("products").update({ stock: stockAfter }).eq("id", productId)

    // Catat log
    await supabase.from("inventory_log").insert({
        product_id: productId,
        type,
        qty: type === "adjustment" ? Math.abs(stockAfter - stockBefore) : qty,
        stock_before: stockBefore,
        stock_after: stockAfter,
        reason: reason || "Manual adjustment",
        created_by: user.id,
    })

    return NextResponse.json({ stockBefore, stockAfter })
    }
