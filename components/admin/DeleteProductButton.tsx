    "use client"

    import { useState } from "react"
    import { createClient } from "@/lib/supabase/client"
    import { useRouter } from "next/navigation"
    import { Loader2 } from "lucide-react"

    export default function DeleteProductButton({ id, name }: { id: string, name: string }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault() // Mencegah bentrok dengan navigasi/Link lain

        setIsDeleting(true)
        
        const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)

        if (error) {
        alert("Gagal menghapus produk: " + error.message)
        setIsDeleting(false)
        } else {
        // Refresh halaman untuk memuat ulang daftar data terbaru dari server
        router.refresh() 
        }
    }

    return (
        <button
        onClick={handleDelete}
        disabled={isDeleting}
        title="Hapus Permanen"
        className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors text-base disabled:opacity-50 shrink-0"
        >
        {isDeleting ? <Loader2 size={14} className="animate-spin text-red-500" /> : "🗑️"}
        </button>
    )
    }