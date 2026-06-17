# 🛠️ Panduan Implementasi Fitur Ecommerce Kuliner

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Menggunakan KulinerCard](#menggunakan-kulinercard)
3. [Menambah Review Produk](#menambah-review-produk)
4. [Add to Cart Flow](#add-to-cart-flow)
5. [Wishlist Integration](#wishlist-integration)
6. [Testing & Debugging](#testing--debugging)

---

## 🚀 Quick Start

### Langkah 1: Verifikasi Halaman Kuliner Berfungsi
```bash
npm run dev
# Buka http://localhost:3000/kuliner
```

Anda harus melihat:
- ✅ List kuliner (destinasi + produk UMKM)
- ✅ Filter kategori, kabupaten, sort
- ✅ Search bar
- ✅ Pagination

### Langkah 2: Test Detail Produk
```bash
# Klik salah satu produk UMKM di halaman kuliner
# Atau langsung ke http://localhost:3000/produk/[slug]
```

Anda harus melihat:
- ✅ Gallery foto dengan thumbnail
- ✅ Harga & diskon
- ✅ Info toko (seller)
- ✅ Reviews pembeli
- ✅ **NEW: Review Form**
- ✅ Add to Cart button
- ✅ Wishlist button

---

## 🎨 Menggunakan KulinerCard

### Import Component
```typescript
import KulinerCard from "@/components/kuliner/KulinerCard"
```

### Type Definition
```typescript
type KulinerItem = {
  id: string
  title: string
  slug: string
  image: string
  source: "content" | "product"
  price?: number
  price_max?: number
  rating?: number
  review_count?: number
  kabupaten?: string
  category?: string
  seller_name?: string
  seller_id?: string
  total_sold?: number
  is_featured?: boolean
  discount_price?: number
}
```

### Usage Example
```typescript
// Data dari API/Supabase
const items = [
  {
    id: "1",
    title: "Sroto Ayam",
    slug: "sroto-ayam",
    image: "https://...",
    source: "product",
    price: 25000,
    discount_price: 20000,
    rating: 4.5,
    review_count: 120,
    seller_name: "Warung Sroto Mbak Siti",
    kabupaten: "Banjarnegara",
    total_sold: 450,
    is_featured: true
  },
  // ... more items
]

// Component
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
  {items.map((item) => (
    <KulinerCard 
      key={item.id}
      item={item}
      isLoggedIn={!!user}
      inWishlist={wishlistIds.has(item.id)}
    />
  ))}
</div>
```

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `item` | `KulinerItem` | ✅ | Data item kuliner/produk |
| `isLoggedIn` | `boolean` | ✅ | User login status |
| `inWishlist` | `boolean` | ❌ | Item ada di wishlist user |

---

## ✍️ Menambah Review Produk

### File Location
`components/product/ProductReviewForm.tsx`

### Import & Usage
```typescript
import ProductReviewForm from "@/components/product/ProductReviewForm"

// Di halaman detail produk
{user && (
  <ProductReviewForm 
    productId={product.id}
    userName={user?.user_metadata?.full_name}
  />
)}
```

### Features
✅ Rating selector 1-5 bintang
✅ Text input (max 500 karakter)
✅ Real-time character count
✅ Loading state
✅ Success feedback
✅ Input validation

### Data Saved
Review tersimpan di tabel `product_reviews`:
```sql
INSERT INTO product_reviews (
  product_id,
  user_id,
  rating,
  body,
  created_at
) VALUES (...)
```

### User Experience Flow
```
User klik "Tulis Review"
  ↓
Jika belum login → Redirect ke /login
  ↓
Form terbuka
  ↓
Pilih rating (1-5 bintang)
  ↓
Tulis komentar (max 500 char)
  ↓
Klik "Kirim Review"
  ↓
Loading...
  ↓
✓ Review Terkirim! (success message)
  ↓
Halaman refresh → review tampil di list
```

---

## 🛒 Add to Cart Flow

### Component
`components/product/AddToCartButton.tsx`

### Usage
```typescript
import AddToCartButton from "@/components/product/AddToCartButton"

<AddToCartButton
  productId={product.id}
  stock={product.stock}
  initialQty={cartQty}
  isLoggedIn={!!user}
/>
```

### Props
```typescript
type Props = {
  productId: string     // Product ID dari DB
  stock: number         // Stock tersedia
  initialQty?: number   // Jumlah di cart (default: 0)
  isLoggedIn: boolean   // User login status
}
```

### Flow
```
User lihat Add to Cart button
  ↓
Jika stok habis → Button disabled
  ↓
Jika belum login → Redirect ke /login
  ↓
User ubah qty dengan +/-
  ↓
Klik "Tambah ke Keranjang"
  ↓
Tersimpan ke tabel cart_items
  ↓
✓ Ditambahkan! (success msg)
  ↓
Badge keranjang di navbar update
```

### Database Entry
```sql
INSERT INTO cart_items (user_id, product_id, qty)
VALUES (...)
ON CONFLICT (user_id, product_id) DO UPDATE SET qty = ...
```

---

## ❤️ Wishlist Integration

### Component
`components/ui/WishlistButton.tsx`

### Usage
```typescript
import WishlistButton from "@/components/ui/WishlistButton"

// Untuk produk
<WishlistButton
  productId={product.id}
  isLoggedIn={!!user}
  initialSaved={inWishlist}
/>

// Atau untuk content/destinasi
<WishlistButton
  contentId={content.id}
  isLoggedIn={!!user}
  initialSaved={isSaved}
/>
```

### Props
```typescript
type Props = {
  productId?: string      // Product ID (optional)
  contentId?: string      // Content ID (optional)
  isLoggedIn: boolean     // User login status
  initialSaved: boolean   // Status saved saat load
}
```

### Features
✅ Toggle wishlist on/off
✅ Automatic login redirect
✅ Visual feedback (color change)
✅ Loading spinner

### Styling
```
Normal: bg-white, border-gray-200, text-gray-400
Saved: bg-rose-50, border-rose-200, text-rose-500
Hover: border-rose-200, bg-rose-50
```

### Data Saved
```sql
-- Add to wishlist
INSERT INTO wishlists (user_id, product_id, content_id)
VALUES (...)

-- Remove from wishlist
DELETE FROM wishlists WHERE user_id = ? AND product_id = ?
```

---

## 🧪 Testing & Debugging

### 1. Test Halaman Kuliner
```bash
# Check: Apakah data loading dengan benar?
1. Buka browser DevTools (F12)
2. Network tab → Filter "graphql"
3. Cari request ke supabase
4. Verify response data

# Check: Apakah filter berfungsi?
1. Type di search bar
2. Klik filter buttons
3. Verify items di-filter
4. Check pagination (8 items per page)
```

### 2. Test Detail Produk
```bash
# Check: Image gallery
1. Verify main image tampil
2. Klik thumbnail → main image change
3. Hover effect berfungsi

# Check: Harga & diskon
1. Verify harga normal tampil
2. Verify diskon percentage benar
3. Verify final price = normal - discount

# Check: Add to Cart
1. Qty selector +/- berfungsi
2. Stok max limit berfungsi
3. Klik add → redirects ke login jika perlu
4. Cart item tersimpan
```

### 3. Test Review Form
```bash
# Check: Form validation
1. Klik submit tanpa isi rating → error
2. Klik submit tanpa isi body → error
3. Type > 500 char → auto cut

# Check: Submit review
1. Login dengan user
2. Isi rating & body
3. Klik "Kirim Review"
4. Check browser console untuk error
5. Verify review muncul di list

# Debug: Check Supabase
1. Buka Supabase dashboard
2. Table product_reviews
3. Verify row baru ada
4. Check created_at timestamp
```

### 4. Console Logs untuk Debugging
```typescript
// Di KulinerCard.tsx
console.log("Item prop:", item)
console.log("Wishlist status:", inWishlist)

// Di ProductReviewForm.tsx
console.log("Submitting review:", { rating, body, productId })
console.log("User:", user?.id)

// Di AddToCartButton.tsx
console.log("Adding to cart:", { productId, qty })
```

### 5. Common Issues & Solutions

**Issue: Item tidak tampil di halaman kuliner**
```typescript
// Solution: Check filter logic
console.log("Filter results:", {
  items: filteredItems.length,
  q, kabupaten, kategori, sort
})
```

**Issue: Review tidak tersimpan**
```typescript
// Solution: Check user auth & permissions
const { data: { user } } = await supabase.auth.getUser()
console.log("Current user:", user?.id)

// Verify table permissions di Supabase RLS
```

**Issue: Wishlist tidak sync**
```typescript
// Solution: Check page refresh
router.refresh() // Trigger revalidation
```

---

## 🔍 Inspeksi Data di Supabase

### Connect ke Supabase Dashboard
1. Go to https://supabase.com
2. Login dengan project anda
3. Navigate ke table:
   - `products` - cek produk kuliner
   - `product_reviews` - cek reviews
   - `wishlists` - cek wishlist user
   - `cart_items` - cek cart

### Query Test
```sql
-- Check produk kuliner
SELECT * FROM products 
WHERE category_id IN (
  SELECT id FROM categories WHERE type = 'kuliner'
) 
LIMIT 10;

-- Check reviews untuk produk tertentu
SELECT * FROM product_reviews 
WHERE product_id = 'YOUR_PRODUCT_ID'
ORDER BY created_at DESC;

-- Check wishlist user
SELECT * FROM wishlists 
WHERE user_id = 'YOUR_USER_ID';
```

---

## 📱 Testing di Mobile

### Using Chrome DevTools
1. F12 → Toggle Device Toolbar
2. Select iPhone / Android device
3. Test responsiveness:
   - Grid columns scale down (2 → 1)
   - Buttons accessible (tap-friendly)
   - Images responsive

### Using Real Device
1. Run: `npm run dev`
2. Network IP: `http://YOUR_IP:3000/kuliner`
3. Test all interactions on actual device

---

## 🚀 Performance Optimization Tips

### 1. Image Optimization
```typescript
// Use Next.js Image component
import Image from "next/image"

<Image
  src={item.image}
  alt={item.title}
  width={400}
  height={300}
  loading="lazy" // Lazy load
/>
```

### 2. Database Queries
```typescript
// Select only needed fields
const { data: products } = await supabase
  .from("products")
  .select(`
    id, name, slug, images, price, discount_price,
    rating, total_sold,
    profiles(city, full_name, umkm_name)
  `)
  .limit(100)
```

### 3. Caching Strategy
```typescript
// Revalidate on-demand
import { revalidatePath } from "next/cache"

// After review submission
revalidatePath(`/produk/${productId}`)
```

---

## 📖 Helpful Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js 13+ App Router](https://nextjs.org/docs/app)
- [React Hook Form](https://react-hook-form.com)
- [Lucide Icons](https://lucide.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

**Happy Coding! 🎉**

*Questions or issues? Check FEATURE_STRUCTURE.md for architecture overview*
