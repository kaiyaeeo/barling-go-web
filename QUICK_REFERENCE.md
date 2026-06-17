# ⚡ QUICK REFERENCE - Struktur Halaman Kuliner & Produk

## 📍 Main URLs

| Halaman | URL | File | Fitur |
|---------|-----|------|-------|
| **Listing Kuliner** | `/kuliner` | `app/(public)/kuliner/page.tsx` | Search, Filter, Sort, Pagination, Wishlist |
| **Detail Destinasi** | `/kuliner/[slug]` | `app/(public)/kuliner/[slug]/page.tsx` | Info, Reviews, Review Form, Wishlist |
| **Detail Produk** | `/produk/[slug]` | `app/(public)/produk/[slug]/page.tsx` | Gallery, Harga, Seller, Add Cart, Reviews, **Review Form** |

---

## 🎨 Komponen Baru

### 1. KulinerCard
```typescript
// Location: components/kuliner/KulinerCard.tsx
// Usage: <KulinerCard item={item} isLoggedIn={!!user} inWishlist={bool} />
// Shows: Foto, Harga, Rating, Seller, Wishlist button
```

### 2. ProductReviewForm
```typescript
// Location: components/product/ProductReviewForm.tsx
// Usage: <ProductReviewForm productId={id} userName={name} />
// Shows: Rating selector, Textarea, Submit
```

---

## 🛣️ Navigasi Logic

```
/kuliner
    ↓
[Klik Item]
    ↓
├─ Destinasi → /kuliner/[slug]
└─ Produk → /produk/[slug]
```

---

## 📊 Fitur per Halaman

### `/kuliner`
```
✅ Search by nama
✅ Filter kategori (4 options)
✅ Filter kabupaten (6 options)
✅ Sort (rating, terbaru, termurah)
✅ Pagination (8 items/page)
✅ Wishlist integration
✅ KulinerCard dengan info lengkap
```

### `/kuliner/[slug]` (Destinasi)
```
✅ Hero image
✅ Description
✅ Rating & review count
✅ Review list
✅ Review form (user only)
✅ Wishlist button
✅ Related destinasi
```

### `/produk/[slug]` (Produk UMKM)
```
✅ Image gallery
✅ Harga & diskon
✅ Seller card
✅ Rating & stats
✅ Reviews
✅ Review form (user only) ← NEW
✅ Add to cart
✅ Wishlist
✅ Related products
✅ Service guarantees
```

---

## 💾 Data Flow

```
Database Tables:
├─ contents (Destinasi)
├─ products (Produk UMKM)
├─ product_reviews (Review produk)
├─ content_reviews (Review destinasi)
├─ wishlists
├─ cart_items
└─ profiles (User & UMKM)

Request Flow:
1. Load /kuliner → Fetch contents + products
2. Merge & format → Display KulinerCard
3. Click item → Fetch detail + reviews + seller
4. Form submit → Save to product_reviews
5. Wishlist → Save to wishlists
6. Add cart → Save to cart_items
```

---

## 🎯 Fitur-Fitur Utama

### 🛒 Add to Cart
```typescript
<AddToCartButton
  productId={product.id}
  stock={product.stock}
  initialQty={cartQty}
  isLoggedIn={!!user}
/>
```
→ Saves to `cart_items` table

### ❤️ Wishlist
```typescript
<WishlistButton
  productId={product.id}
  isLoggedIn={!!user}
  initialSaved={inWishlist}
/>
```
→ Saves to `wishlists` table

### ✍️ Review (NEW)
```typescript
<ProductReviewForm
  productId={product.id}
  userName={user?.full_name}
/>
```
→ Saves to `product_reviews` table

---

## 🔑 Keys & Data Fields

### KulinerCard Props
```typescript
{
  id: string                  // Unique ID
  title: string              // Item name
  slug: string               // URL slug
  image: string              // Image URL
  source: "content" | "product"
  price?: number             // Harga/tiket min
  price_max?: number         // Tiket max
  discount_price?: number    // Harga diskon
  rating?: number            // Rating 0-5
  review_count?: number      // Jumlah review
  seller_name?: string       // Nama UMKM
  total_sold?: number        // Penjualan
  is_featured?: boolean      // Featured badge
}
```

### ProductReviewForm State
```typescript
{
  rating: 0-5                // Selected rating
  body: string               // Review text (max 500)
  loading: boolean           // Loading state
  submitted: boolean         // Success state
}
```

---

## 🚀 Common Tasks

### Test Add to Cart
```
1. Go to /produk/[slug]
2. Click + to increase qty
3. Click "Tambah ke Keranjang"
4. Check Supabase cart_items table
```

### Test Wishlist
```
1. Click ❤️ button (harus login)
2. Heart should turn red
3. Check Supabase wishlists table
```

### Test Review Form (NEW)
```
1. Scroll to "Tambah Review" section
2. Click stars to rate
3. Type review (max 500 char)
4. Click "Kirim Review"
5. Review should appear in list
6. Check Supabase product_reviews table
```

### Filter Kuliner
```
1. Go to /kuliner
2. Type in search box
3. Click kategori button
4. Click kabupaten button
5. Select sort option
6. Results should filter instantly
```

---

## 📱 Responsive Breakpoints

```
Mobile (< 768px):   2 columns
Tablet (768-1024):  3 columns
Desktop (> 1024):   4 columns
```

---

## 🎨 Colors

```
Primary: #6EB8BB (Teal)
Light Primary: #E6F7F8
Accent: #FF6B6B (Red for discount)
Text: #1F2937 (Dark gray)
Light Text: #6B7280 (Gray)
```

---

## 🔗 Related Routes

```
/login              → Login page
/keranjang          → Shopping cart
/profil/wishlist    → User's wishlist
/toko/[id]          → Store profile
/chat/[id]          → Chat with seller
/checkout           → Checkout page
/pesanan            → User orders
```

---

## 📖 Documentation Files

```
├─ KULINER_GUIDE.md           → Panduan lengkap routing & fitur
├─ FEATURE_STRUCTURE.md       → Architecture & data flow
├─ IMPLEMENTATION_GUIDE.md    → Tutorial implementation
├─ TESTING_CHECKLIST.md       → Testing procedures
└─ SUMMARY_PERUBAHAN.md       → Summary of changes
```

---

## ❌ Common Errors & Solutions

| Error | Solution |
|-------|----------|
| Items tidak tampil | Check Supabase connection & tables |
| Image tidak load | Verify Supabase storage URL |
| Review tidak submit | Check user auth & RLS permissions |
| Wishlist tidak sync | Try page refresh (router.refresh()) |
| Filter tidak bekerja | Check useEffect dependencies |

---

## 🧪 Quick Tests

```bash
# Test search
http://localhost:3000/kuliner?q=sroto

# Test filter
http://localhost:3000/kuliner (click buttons)

# Test detail
http://localhost:3000/produk/[any-product-slug]

# Test review form
Scroll to "Tambah Review" section dan submit
```

---

## 🚀 Production Checklist

- [ ] Test all flows locally
- [ ] Check Supabase RLS policies
- [ ] Verify image URLs
- [ ] Test on mobile device
- [ ] Check console for errors
- [ ] Monitor performance
- [ ] Setup error tracking
- [ ] Deploy to production

---

**Status**: ✅ Production Ready
**Last Updated**: 2026-06-17
**Version**: 1.0

Enjoy! 🎉
