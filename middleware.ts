    import { NextResponse, type NextRequest } from "next/server"
    import { updateSession } from "@/lib/supabase/middleware"

    // Route yang TIDAK perlu login sama sekali
    const PUBLIC_ROUTES = [
    "/",
    "/wisata",
    "/kuliner",
    "/oleh-oleh",
    "/produk",
    "/ai-assistant",
    "/bantuan",
    "/tentang",
    "/kontak",
    ]

    // Route auth (login, register, dll)
    const AUTH_ROUTES = ["/login", "/register", "/forgot-password"]

    // Route yang butuh login
    const PROTECTED_USER_ROUTES = ["/dashboard", "/pesanan", "/checkout", "/keranjang", "/pembayaran", "/profil"]

    // Route khusus admin
    const ADMIN_ROUTES = ["/admin"]

    // Route khusus super admin
    const SUPER_ADMIN_ROUTES = ["/super-admin"]

    export async function middleware(request: NextRequest) {
    const { supabaseResponse, user } = await updateSession(request)
    const { pathname } = request.nextUrl

    // ── 1. Halaman publik: langsung lewat ──────────────────────
    const isPublic = PUBLIC_ROUTES.some(
        (r) => pathname === r || pathname.startsWith(r + "/")
    )
    if (isPublic) return supabaseResponse

    // ── 2. Route auth: jika sudah login, redirect ke dashboard ─
    const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r))
    if (isAuthRoute) {
        if (user) return NextResponse.redirect(new URL("/dashboard", request.url))
        return supabaseResponse
    }

    // ── 3. Route user: butuh login ─────────────────────────────
    const isUserProtected = PROTECTED_USER_ROUTES.some((r) => pathname.startsWith(r))
    if (isUserProtected && !user) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("next", pathname)
        return NextResponse.redirect(loginUrl)
    }

    // ── 4. Route admin ─────────────────────────────────────────
    const isAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
    if (isAdmin) {
        if (!user) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("next", pathname)
        loginUrl.searchParams.set("mode", "seller")
        return NextResponse.redirect(loginUrl)
        }
        // Pengecekan role detail dilakukan di layout masing-masing
    }

    // ── 5. Route super admin ───────────────────────────────────
    const isSuperAdmin = SUPER_ADMIN_ROUTES.some((r) => pathname.startsWith(r))
    if (isSuperAdmin && !user) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    return supabaseResponse
    }

    export const config = {
    matcher: [
        /*
        * Jalankan middleware di semua route kecuali:
        * - _next/static (file statis Next.js)
        * - _next/image (optimasi gambar)
        * - favicon.ico
        * - file gambar/font/dll
        */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
    ],
    }