    import WisataForm from "@/components/super-admin/WisataForm"
    import Link from "next/link"
    import { ArrowLeft } from "lucide-react"

    export default function TambahWisataPage() {
    return (
        <main className="min-h-screen bg-gray-50 pt-6 pb-16">
        <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-8">
            <Link href="/super-admin/kelola-wisata"
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                <ArrowLeft size={18} />
            </Link>
            <div>
                <h1 className="text-xl font-bold text-gray-900">Tambah Destinasi Wisata</h1>
                <p className="text-sm text-gray-400 mt-0.5">Isi form di bawah untuk menambahkan destinasi baru</p>
            </div>
            </div>
            <WisataForm />
        </div>
        </main>
    )
    }
