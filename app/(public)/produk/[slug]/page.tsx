    import { createClient } from "@/lib/supabase/server"
    import { notFound } from "next/navigation"
    import BackButton from "@/components/product/BackButton"
    import {
    Star, MapPin, ShieldCheck, Package, Truck, RefreshCw,
    ChevronRight, Store, BadgeCheck, MessageCircle, Share2,
    Tag, Clock, TrendingUp, ShoppingCart
    } from "lucide-react"
    import AddToCartButton from "@/components/product/AddToCartButton"
    import WishlistButton from "@/components/ui/WishlistButton"
    import ProductReviewForm from "@/components/product/ProductReviewForm"
    import Navbar from "@/components/layout/navbar"

    export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: product } = await supabase
        .from("products")
        .select(`
        id, name, slug, description, price, discount_price, sku,
        stock, images, is_active, is_featured, rating, total_sold,
        category_id,
        categories(name, slug),
        profiles!seller_id(id, full_name, umkm_name, umkm_logo, city, umkm_description)
        `)
        .eq("slug", slug)
        .eq("is_active", true)
        .single()

    if (!product) notFound()

    const seller = product.profiles as any
    const category = product.categories as any

    const { data: reviews } = await supabase
        .from("product_reviews")
        .select("id, rating, body, created_at, profiles(full_name, avatar_url)")
        .eq("product_id", product.id)
        .order("created_at", { ascending: false })

    let cartQty = 0
    let inWishlist = false

    if (user) {
        const [{ data: cartItem }, { data: wishItem }] = await Promise.all([
        supabase.from("cart_items").select("qty").eq("user_id", user.id).eq("product_id", product.id).single(),
        supabase.from("wishlists").select("id").eq("user_id", user.id).eq("product_id", product.id).single(),
        ])
        cartQty = cartItem?.qty ?? 0
        inWishlist = !!wishItem
    }

    const { data: relatedProducts } = await supabase
        .from("products")
        .select("id, name, slug, price, discount_price, images, rating, total_sold")
        .eq("seller_id", seller?.id)
        .eq("is_active", true)
        .neq("id", product.id)
        .limit(4)

    const PLACEHOLDER = "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=70"
    const images = product.images?.length ? product.images.map((img: string) => img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${img}`) : [PLACEHOLDER]

    return (
        <main className="min-h-screen bg-[#F5F7FA] pb-24">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 pt-20">
            <BackButton />
            
            <div className="grid lg:grid-cols-2 gap-10">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <img src={images[0]} alt={product.name} className="w-full h-96 object-contain rounded-xl" />
            </div>

            <div className="space-y-6">
                <h1 className="text-3xl font-black text-gray-900">{product.name}</h1>
                <p className="text-3xl font-black text-[#6EB8BB]">Rp {Number(product.discount_price ?? product.price).toLocaleString("id-ID")}</p>
                
                <AddToCartButton productId={product.id} stock={product.stock} initialQty={cartQty} isLoggedIn={!!user} />
                
                <div className="bg-white p-5 rounded-xl border border-gray-100">
                <p className="font-bold mb-2">Toko: {seller?.umkm_name}</p>
                <p className="text-sm text-gray-600">{seller?.umkm_description}</p>
                </div>
            </div>
            </div>

            <div className="mt-10 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Deskripsi</h2>
            <p className="text-gray-600">{product.description}</p>
            </div>
        </div>
        </main>
    )
    }