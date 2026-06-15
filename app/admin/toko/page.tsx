    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    // Memanggil komponen dari lokasi yang baru kamu buat
    import TokoForm from "@/components/ui/TokoForm"

    export default async function AdminTokoPage() {
    const supabase = await createClient()
    
    // 1. Cek sesi user yang sedang login
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // 2. Ambil data profil dari database untuk dijadikan initialData
    const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, phone, avatar_url, umkm_name, umkm_logo, umkm_description, address, city, postal_code, promo_package")
        .eq("id", user.id)
        .single()

    return (
        <main className="min-h-screen bg-gray-50/50 p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Profil Toko & UMKM</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola informasi publik dan data pemilik toko Barling-GO Anda.</p>
            </div>

            {/* 3. Menampilkan Form yang sudah kamu buat */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <TokoForm initialData={profile} />
            </div>
        </div>
        </main>
    )
    }