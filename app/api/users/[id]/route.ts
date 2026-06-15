    import { NextRequest, NextResponse } from "next/server"
    import { createClient } from "@/lib/supabase/server"

    export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // Cegah super admin menonaktifkan dirinya sendiri
    if (params.id === user.id) return NextResponse.json({ error: "Tidak bisa mengubah akun sendiri." }, { status: 400 })

    const { role, is_active } = await request.json()
    const validRoles = ["user", "admin", "super_admin"]
    if (role && !validRoles.includes(role)) return NextResponse.json({ error: "Role tidak valid." }, { status: 400 })

    const updateData: Record<string, any> = {}
    if (role !== undefined) updateData.role = role
    if (is_active !== undefined) updateData.is_active = is_active

    const { data, error } = await supabase.from("profiles").update(updateData).eq("id", params.id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
    }
