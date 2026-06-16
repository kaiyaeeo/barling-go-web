    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import TokoForm from "@/components/ui/TokoForm"

    export default async function AdminTokoPage() {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // 1. Ambil Profil Toko
    const { data: profile } = await supabase
        .from("profiles")
        // PASTIKAN umkm_banner ADA DI DALAM SELECT INI:
        .select("id, full_name, phone, avatar_url, umkm_name, umkm_logo, umkm_banner, umkm_description, address, city, postal_code, promo_package")
        .eq("id", user.id)
        .single()

    // 2. Ambil Statistik Produk dari Database
    const { data: products } = await supabase
        .from("products")
        .select("rating, total_sold")
        .eq("seller_id", user.id)
        .eq("is_active", true)

    // 3. Kalkulasi Angka Nyata
    const activeProducts = products?.length || 0
    const totalSold = products?.reduce((sum, p) => sum + (p.total_sold || 0), 0) || 0
    const avgRating = activeProducts > 0
        ? (products!.reduce((sum, p) => sum + (Number(p.rating) || 0), 0) / activeProducts)
        : 0

    const stats = { activeProducts, totalSold, avgRating }

    return (
        <main className="min-h-screen bg-[#F8FAFC] pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
            <h1 className="text-2xl font-black text-gray-900">Profil Toko & UMKM</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola informasi publik dan data pemilik toko Barling-GO Anda.</p>
            </div>

            {/* Kirim data profil DAN statistik ke dalam Form */}
            <TokoForm initialData={profile} stats={stats} />
            
        </div>
        </main>
    )
    }