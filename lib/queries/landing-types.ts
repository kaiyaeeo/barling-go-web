export type Product = {
  id: string
  name: string
  slug: string
  price: number
  discount_price: number | null
  images: string[]
  is_top_umkm: boolean
  is_featured: boolean
  rating: number
  total_sold: number
  categories: { name: string; type: string; slug: string } | null
}

export type Testimonial = {
  id: string
  name: string
  avatar_initials: string
  avatar_color: string
  rating: number
  content: string
}

export type SiteStat = {
  key: string
  value: string
  label: string
  sub_label: string | null
}

export type HeroSettings = {
  image_url: string | null
  title: string
  subtitle: string
}

// Helper: ambil public URL foto dari Supabase Storage
export function getStorageUrl(bucket: string, path: string | null): string {
  if (!path) return "/images/placeholder.jpg"
  if (path.startsWith("http")) return path

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}
