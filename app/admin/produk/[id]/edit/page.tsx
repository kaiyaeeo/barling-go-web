    import { createClient } from "@/lib/supabase/server"
    import { notFound, redirect } from "next/navigation"
    import ProdukForm from "@/components/admin/ProdukForm"

    type Params = Promise<{ id: string }>

    export default async function EditProdukPage({ params }: { params: Params }) {
    const resolvedParams = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", resolvedParams.id)
        .eq("seller_id", user.id) 
        .single()

    if (!data) notFound()

    return (
        <main className="min-h-screen bg-[#F8FAFC] pt-6 pb-16">
        <div className="max-w-7xl mx-auto px-6">
            <ProdukForm initialData={data} />
        </div>
        </main>
    )
    }