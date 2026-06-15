    import { NextRequest, NextResponse } from "next/server"
    import { createClient } from "@/lib/supabase/server"

    export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!["admin", "super_admin"].includes(profile?.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { status, tracking_number, payment_status } = body

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
    if (status) updateData.status = status
    if (tracking_number !== undefined) updateData.tracking_number = tracking_number
    if (payment_status) {
        updateData.payment_status = payment_status
        if (payment_status === "paid") updateData.paid_at = new Date().toISOString()
    }

    const { data, error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", params.id)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
    }