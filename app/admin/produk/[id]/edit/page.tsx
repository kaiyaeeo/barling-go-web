    import { createClient } from "@/lib/supabase/server"
    import { redirect, notFound } from "next/navigation"
    import ProductForm from "@/components/produk/ProductForm"
    import Link from "next/link"
    import { ArrowLeft } from "lucide-react"

    export default async function EditProdukPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!profile || !["admin", "super_admin"].includes(profile.role)) redirect("/dashboard")

    const { data: product } = await supabase
        .from("products")
        .select("id, name, slug, description, price, discount_price, sku, stock, category_id, images, is_active, is_top_umkm, is_featured")
        .eq("id", params.id)
        .single()

    if (!product) notFound()

    const { data: categories } = await supabase
        .from("categories").select("id, name, type").eq("is_active", true).order("type")

    return (
        <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-3 mb-8">
            <Link href="/admin/produk" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                <ArrowLeft size={18} />
            </Link>
            <div>
                <h1 className="text-xl font-bold text-gray-900">Edit Produk</h1>
                <p className="text-sm text-gray-400 mt-0.5">{product.name}</p>
            </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8">
            <ProductForm categories={categories ?? []} initialData={product} />
            </div>
        </div>
        </main>
    )
    }
