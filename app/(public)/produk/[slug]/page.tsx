    import { createClient } from "@/lib/supabase/server"
    import { getStorageUrl } from "@/lib/queries/landing"
    import { notFound } from "next/navigation"
    import AddToCartButton from "@/components/produk/AddToCartButton"
    import { ShoppingBag, Star, Package, ArrowLeft } from "lucide-react"
    import Link from "next/link"

    const PLACEHOLDER = "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=70"

    export async function generateMetadata({ params }: { params: { slug: string } }) {
    const supabase = await createClient()
    const { data } = await supabase.from("products").select("name, description").eq("slug", params.slug).single()
    return {
        title: data ? `${data.name} — Barling-GO` : "Produk",
        description: data?.description ?? "",
    }
    }

    export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
    const supabase = await createClient()

    const { data: product } = await supabase
        .from("products")
        .select(`
        id, name, slug, description, price, discount_price,
        images, sku, stock, rating, total_sold, is_active,
        categories(id, name, type, slug),
        profiles(full_name, umkm_name, umkm_logo)
        `)
        .eq("slug", params.slug)
        .eq("is_active", true)
        .single()

    if (!product) notFound()

    const images: string[] = (product.images ?? []).map((img: string) =>
        img.startsWith("http") ? img : getStorageUrl("product-images", img)
    )
    if (images.length === 0) images.push(PLACEHOLDER)

    const discounted = product.discount_price && product.discount_price < product.price
    const finalPrice = discounted ? product.discount_price : product.price
    const discountPct = discounted ? Math.round((1 - product.discount_price / product.price) * 100) : 0

    // Produk terkait (kategori sama)
    const { data: related } = await supabase
        .from("products")
        .select("id, name, slug, price, discount_price, images, rating")
        .eq("is_active", true)
        .eq("category_id", (product.categories as any)?.id)
        .neq("id", product.id)
        .limit(4)

    return (
        <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/produk" className="hover:text-gray-700 flex items-center gap-1.5">
                <ArrowLeft size={14} /> Produk
            </Link>
            <span>/</span>
            {(product.categories as any) && (
                <>
                <Link href={`/produk?type=${(product.categories as any).type}`} className="hover:text-gray-700 capitalize">
                    {(product.categories as any).name}
                </Link>
                <span>/</span>
                </>
            )}
            <span className="text-gray-600 truncate max-w-xs">{product.name}</span>
            </nav>

            <div className="grid lg:grid-cols-2 gap-10">
            {/* Images */}
            <div className="space-y-3">
                <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100">
                <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
                </div>
                {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto">
                    {images.slice(1).map((img, i) => (
                    <div key={i} className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-gray-100">
                        <img src={img} alt={`${product.name} ${i + 2}`} className="w-full h-full object-cover" />
                    </div>
                    ))}
                </div>
                )}
            </div>

            {/* Info */}
            <div>
                {(product.categories as any) && (
                <span className="inline-block text-xs font-semibold text-[#6EB8BB] bg-green-50 px-3 py-1 rounded-full mb-3 capitalize">
                    {(product.categories as any).name}
                </span>
                )}

                <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>

                {/* Rating & sold */}
                <div className="flex items-center gap-4 mb-5">
                {product.rating > 0 && (
                    <div className="flex items-center gap-1.5">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium text-gray-700">{(product.rating as number).toFixed(1)}</span>
                    </div>
                )}
                {product.total_sold > 0 && (
                    <span className="text-sm text-gray-400">{product.total_sold} terjual</span>
                )}
                <div className="flex items-center gap-1.5">
                    <Package size={14} className="text-gray-400" />
                    <span className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                    {product.stock > 0 ? `${product.stock} tersedia` : "Stok habis"}
                    </span>
                </div>
                </div>

                {/* Price */}
                <div className="flex items-end gap-3 mb-6 pb-6 border-b border-gray-100">
                <span className="text-3xl font-black text-gray-900">
                    Rp {(finalPrice as number).toLocaleString("id-ID")}
                </span>
                {discounted && (
                    <>
                    <span className="text-base text-gray-400 line-through mb-1">
                        Rp {(product.price as number).toLocaleString("id-ID")}
                    </span>
                    <span className="text-sm font-bold text-white bg-[#FF6B35] px-2 py-0.5 rounded-full mb-1">
                        -{discountPct}%
                    </span>
                    </>
                )}
                </div>

                {/* Description */}
                {product.description && (
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Deskripsi</h3>
                    <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{product.description}</p>
                </div>
                )}

                {/* Seller info */}
                {(product.profiles as any)?.umkm_name && (
                <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-9 h-9 rounded-full bg-[#6EB8BB]/10 flex items-center justify-center text-[#6EB8BB] font-bold text-sm">
                    {(product.profiles as any).umkm_name[0]}
                    </div>
                    <div>
                    <p className="text-xs text-gray-400">Dijual oleh</p>
                    <p className="text-sm font-semibold text-gray-800">{(product.profiles as any).umkm_name}</p>
                    </div>
                </div>
                )}

                {/* CTA */}
                <AddToCartButton product={{
                id: product.id,
                name: product.name,
                price: finalPrice as number,
                image: images[0],
                stock: product.stock as number,
                }} />
            </div>
            </div>

            {/* Related products */}
            {related && related.length > 0 && (
            <div className="mt-16">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Produk Terkait</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {related.map((item: any) => {
                    const img = item.images?.[0] ? getStorageUrl("product-images", item.images[0]) : PLACEHOLDER
                    return (
                    <Link key={item.id} href={`/produk/${item.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all">
                        <div className="aspect-square overflow-hidden">
                        <img src={img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-3">
                        <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">Rp {(item.discount_price || item.price).toLocaleString("id-ID")}</p>
                        </div>
                    </Link>
                    )
                })}
                </div>
            </div>
            )}
        </div>
        </main>
    )
    }
