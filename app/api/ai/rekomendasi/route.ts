    import { NextRequest, NextResponse } from "next/server"
    import { createClient } from "@/lib/supabase/server"

    // POST /api/ai/rekomendasi
    export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { query, categoryType } = await request.json()

    // Ambil produk sebagai konteks
    let productQuery = supabase
        .from("products")
        .select("id, name, slug, price, discount_price, images, rating, categories(name, type)")
        .eq("is_active", true)
        .order("rating", { ascending: false })
        .limit(30)

    if (categoryType) productQuery = productQuery.eq("categories.type", categoryType)

    const { data: products } = await productQuery

    // Jika ada histori pembelian user, sertakan sebagai konteks
    let purchaseContext = ""
    if (user) {
        const { data: history } = await supabase
        .from("order_items")
        .select("product_name, products(categories(type))")
        .eq("orders.user_id", user.id)
        .limit(10)
        if (history?.length) {
        purchaseContext = `\nHistori pembelian pengguna: ${history.map((h: any) => h.product_name).join(", ")}`
        }
    }

    const productList = (products ?? [])
        .map((p: any) => `${p.name} (${p.categories?.name ?? ""}) - Rp ${Number(p.price).toLocaleString("id-ID")} - rating: ${p.rating}`)
        .join("\n")

    const promptText = `Berdasarkan daftar produk berikut dan kueri pengguna, rekomendasikan 4 produk paling relevan.
            
    Kueri: "${query ?? "produk terpopuler"}"
    ${purchaseContext}

    Daftar produk:
    ${productList}

    Respond HANYA dengan JSON array berisi tepat 4 nama produk yang paling relevan (sesuai nama asli dari daftar). Format: ["nama1", "nama2", "nama3", "nama4"]. 
    Jangan tambahkan format markdown, backtick, atau teks lain apa pun di luar array JSON tersebut.`

    try {
        const apiKey = process.env.GEMINI_API_KEY
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: promptText }] }]
        }),
        })

        const aiData = await response.json()
        const text = aiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]"

        let recommendedNames: string[] = []
        try {
        // Membersihkan teks dari sisa-sisa markdown yang mungkin masih terbuat oleh AI
        const cleanText = text.replace(/```json|```/g, "").trim()
        recommendedNames = JSON.parse(cleanText)
        } catch { 
        recommendedNames = [] 
        }

        // Match nama ke produk asli di database
        const recommended = recommendedNames
        .map((name: string) => products?.find((p) => p.name.toLowerCase().includes(name.toLowerCase())))
        .filter(Boolean)

        return NextResponse.json(recommended)
    } catch (error: any) {
        console.error("AI Recommendation Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
    }