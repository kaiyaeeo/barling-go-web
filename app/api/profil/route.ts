    import { NextRequest, NextResponse } from "next/server"
    import { createClient } from "@/lib/supabase/server"

    export async function PATCH(request: NextRequest) {
        const supabase = await createClient()   
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { full_name, phone, date_of_birth, gender, preferences } = await request.json()

        const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
        if (full_name !== undefined) updateData.full_name = full_name
        if (phone !== undefined) updateData.phone = phone ? `+62${phone.replace(/^\+62/, "")}` : null
        if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth || null
        if (gender !== undefined) updateData.gender = gender
        if (preferences !== undefined) updateData.preferences = preferences

        const { data, error } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", user.id)
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json(data)
    }