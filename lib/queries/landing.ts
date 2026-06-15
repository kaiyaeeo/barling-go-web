import { createClient } from "@/lib/supabase/server"
import { type Product, type Testimonial, type SiteStat, type HeroSettings } from "@/lib/queries/landing-types"

// Re-export tipe & helper agar import lama tetap berfungsi
export {
  getStorageUrl,
} from "@/lib/queries/landing-types"
export type { Product, Testimonial, SiteStat, HeroSettings }

// Ambil produk Top UMKM (is_top_umkm = true, max 8)
export async function getTopUMKM(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, name, slug, price, discount_price,
      images, is_top_umkm, is_featured, rating, total_sold,
      categories (name, type, slug)
    `)
    .eq("is_active", true)
    .eq("is_top_umkm", true)
    .order("total_sold", { ascending: false })
    .limit(8)

  if (error) {
    console.error("getTopUMKM error:", error.message)
    return []
  }
  return (data as unknown as Product[]) ?? []
}

// Ambil produk Favorites (semua kategori, bisa filter, max 8)
export async function getFavoriteProducts(type?: string): Promise<Product[]> {
  const supabase = await createClient()

  let query = supabase
    .from("products")
    .select(`
      id, name, slug, price, discount_price,
      images, is_top_umkm, is_featured, rating, total_sold,
      categories (name, type, slug)
    `)
    .eq("is_active", true)
    .order("rating", { ascending: false })
    .limit(8)

  if (type && type !== "All") {
    query = query.eq("categories.type", type.toLowerCase())
  }

  const { data, error } = await query
  if (error) {
    console.error("getFavoriteProducts error:", error.message)
    return []
  }
  return (data as unknown as Product[]) ?? []
}

// Ambil testimonial featured
export async function getFeaturedTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, name, avatar_initials, avatar_color, rating, content")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(3)

  if (error) {
    console.error("getFeaturedTestimonials error:", error.message)
    return []
  }
  return data ?? []
}

// Ambil site stats
export async function getSiteStats(): Promise<SiteStat[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("site_stats")
    .select("key, value, label, sub_label")
    .order("sort_order")

  if (error) {
    console.error("getSiteStats error:", error.message)
    return []
  }
  return data ?? []
}

// Ambil hero settings
export async function getHeroSettings(): Promise<HeroSettings> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("hero_settings")
    .select("image_url, title, subtitle")
    .eq("id", 1)
    .single()

  if (error || !data) {
    return {
      image_url: null,
      title: "BARLING-GO",
      subtitle: "Jelajahi kuliner khas 5 kabupaten dalam hitungan detik dengan AI",
    }
  }
  return data
}
