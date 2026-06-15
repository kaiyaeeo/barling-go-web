    "use client"

    import { Heart } from "lucide-react"

    // Komponen Dropdown Sort yang interaktif
    export function SortDropdown({ sort, options }: { sort: string, options: {value: string, label: string}[] }) {
    return (
        <select
        name="sort"
        defaultValue={sort}
        onChange={(e) => e.currentTarget.form?.submit()}
        className="pl-4 pr-8 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#6EB8BB] appearance-none cursor-pointer"
        >
        {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
        </select>
    )
    }

    // Komponen Tombol Favorit (Heart) yang interaktif
    export function HeartButton() {
    return (
        <button
        onClick={(e) => { 
            e.preventDefault() // Mencegah pindah halaman saat tombol love diklik
            alert("Destinasi ditambahkan ke Favorit!")
        }}
        className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-all z-10"
        >
        <Heart size={14} className="text-gray-500 hover:text-red-500 transition-colors" />
        </button>
    )
    }