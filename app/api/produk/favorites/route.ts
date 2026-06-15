    import { NextRequest, NextResponse } from "next/server"
    import { createClient } from "@/lib/supabase/server"

    // GET /api/produk — daftar produk (admin)
    export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") ?? "1")
    const limit = parseInt(searchParams.get("limit") ?? "20")
    const q = searchParams.get("q") ?? ""
    const from = (page - 1) * limit

    let query = supabase
        .from("products")
        .select(`id, name, slug, price, discount_price, stock, is_active, is_top_umkm, images, created_at, categories(name, type)`, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, from + limit - 1)

    if (q) query = query.ilike("name", `%${q}%`)

    const { data, error, count } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data, count })
    }

    // POST /api/produk — tambah produk baru
    export async function POST(request: NextRequest) {
    const supabase = await createClient()

    // Verifikasi role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!["admin", "super_admin"].includes(profile?.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, slug, description, price, discount_price, sku, stock, category_id, images, is_active, is_top_umkm, is_featured } = body

    if (!name || !price) {
        return NextResponse.json({ error: "Nama dan harga wajib diisi." }, { status: 400 })
    }

    // Cek slug unik
    const { data: existing } = await supabase.from("products").select("id").eq("slug", slug).single()
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const { data, error } = await supabase
        .from("products")
        .insert({
        name, slug: finalSlug, description, price, discount_price: discount_price || null,
        sku: sku || null, stock: stock ?? 0, category_id: category_id || null,
        images: images ?? [], is_active: is_active ?? true,
        is_top_umkm: is_top_umkm ?? false, is_featured: is_featured ?? false,
        seller_id: user.id,
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
    }