    import { NextRequest, NextResponse } from "next/server"
    import { createClient } from "@/lib/supabase/server"

    export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Login terlebih dahulu." }, { status: 401 })

    const { contentId, rating, body } = await request.json()
    if (!contentId || !rating || !body) return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 })
    if (rating < 1 || rating > 5) return NextResponse.json({ error: "Rating harus antara 1-5." }, { status: 400 })
    if (body.trim().length < 10) return NextResponse.json({ error: "Ulasan terlalu pendek." }, { status: 400 })

    const { data, error } = await supabase.from("content_reviews").insert({
        content_id: contentId,
        user_id: user.id,
        rating,
        body: body.trim(),
    }).select().single()

    if (error) {
        if (error.code === "23505") return NextResponse.json({ error: "Kamu sudah pernah mengulas tempat ini." }, { status: 409 })
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data, { status: 201 })
    }
