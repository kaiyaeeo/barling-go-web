    "use client"

    import Link from "next/link"
    import { useState, useTransition } from "react"
    import { getStorageUrl } from "@/lib/queries/landing-types"

    const PLACEHOLDER = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=70"
    const tabs = ["All", "Kuliner", "Wisata", "Oleh-oleh"]

    // Menggunakan any[] agar bisa menerima gabungan data Product (UMKM) dan Content (Wisata)
    type Props = { initialProducts: any[] }

    export default function FavoritesSection({ initialProducts }: Props) {
    const [active, setActive] = useState("All")
    const [products, setProducts] = useState<any[]>(initialProducts)
    const [isPending, startTransition] = useTransition()

    async function handleFilter(tab: string) {
        setActive(tab)
        startTransition(async () => {
        // Fetch di client menggunakan API route
        const res = await fetch(`/api/produk/favorites?type=${tab}`)
        if (res.ok) {
            const data = await res.json()
            setProducts(data)
        }
        })
    }

    // Helper untuk menentukan URL gambar yang benar
    const getImageUrl = (item: any) => {
        if (item.source === "wisata" && item.cover_image) {
        return item.cover_image.startsWith("http") 
            ? item.cover_image 
            : getStorageUrl("content-images", item.cover_image);
        }
        if (item.images?.[0]) {
        return getStorageUrl("product-images", item.images[0]);
        }
        return PLACEHOLDER;
    }

    return (
        <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-3">
            <h2 className="text-3xl font-bold text-gray-900">Our Favorite Destinations & UMKM</h2>
            </div>
            <p className="text-center text-sm text-gray-400 mb-8">
            Find your favorite destinations and UMKM here in Barlingmas cakep
            </p>

            <div className="flex justify-center gap-2 mb-10">
            {tabs.map((tab) => (
                <button
                key={tab}
                onClick={() => handleFilter(tab)}
                className={`px-5 py-2 text-sm font-medium rounded-full border transition-all ${
                    active === tab ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
                >
                {tab}
                </button>
            ))}
            </div>

            <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}>
            {products.length === 0 ? (
                <div className="col-span-4 text-center py-16 text-gray-400 text-sm">Belum ada produk untuk kategori ini.</div>
            ) : (
                products.map((item) => {
                const imgSrc = getImageUrl(item);
                // Menentukan rute klik (Wisata vs Produk)
                const hrefLink = item.source === "wisata" ? `/wisata/${item.slug}` : `/produk/${item.slug}`;

                return (
                    <Link key={item.id} href={hrefLink} className="group relative rounded-2xl overflow-hidden aspect-square cursor-pointer">
                    <img src={imgSrc} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                        <p className="text-white text-sm font-semibold">{item.name}</p>
                        <span className="text-xs text-white/70 capitalize">
                        {item.source === "wisata" ? "Destinasi Wisata" : (item.categories?.name || "UMKM")}
                        </span>
                    </div>
                    </Link>
                )
                })
            )}
            </div>

            <div className="flex justify-center mt-10">
            <Link href="/wisata" className="px-8 py-3 text-sm font-semibold text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all">
                Explore More
            </Link>
            </div>
        </div>
        </section>
    )
    }