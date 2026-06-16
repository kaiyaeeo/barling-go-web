    import { createClient } from "@/lib/supabase/server"
    import { notFound } from "next/navigation"
    import WisataForm from "@/components/super-admin/WisataForm"
    import Link from "next/link"
    import { ArrowLeft } from "lucide-react"

    // PERBAIKAN: Di Next.js terbaru, params harus berupa Promise
    type Params = Promise<{ id: string }>

    export default async function EditWisataPage({ params }: { params: Params }) {
    // Wajib di-await sebelum dibaca 'id'-nya
    const resolvedParams = await params
    const supabase = await createClient()
    
    const { data } = await supabase
        .from("contents")
        .select("*")
        .eq("id", resolvedParams.id)
        .single()

    if (!data) notFound()

    return (
        <main className="min-h-screen bg-gray-50 pt-6 pb-16">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-8">
            <Link href="/super-admin/kelola-wisata"
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                <ArrowLeft size={18} />
            </Link>
            <div>
                <h1 className="text-xl font-bold text-gray-900">Edit Destinasi</h1>
                <p className="text-sm text-gray-400 mt-0.5">{data.title}</p>
            </div>
            </div>
            
            {/* Memanggil komponen form milikmu dan mengirimkan data dari database */}
            <WisataForm initialData={data} />
            
        </div>
        </main>
    )
    }