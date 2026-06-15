    import { NextRequest, NextResponse } from "next/server"
    import { createClient } from "@/lib/supabase/server"

    export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")
    const next = searchParams.get("next") ?? "/"

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single()

        const role = profile?.role
        let redirectTo = next

        if (next === "/") {
            if (role === "super_admin") redirectTo = "/super-admin/dashboard"
            else if (role === "admin") redirectTo = "/admin/dashboard"
            else redirectTo = "/dashboard"
        }
        return NextResponse.redirect(`${origin}${redirectTo}`)
        }
    }

    // UBAH BAGIAN INI: 
    // Jika gagal, jangan paksa redirect ke login jika user tidak ada kode (hanya akses biasa)
    // Kembalikan ke halaman utama saja agar user bisa browsing
    return NextResponse.redirect(`${origin}/`)
    }