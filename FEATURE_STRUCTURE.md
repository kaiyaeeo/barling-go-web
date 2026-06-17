# ✅ Struktur Fitur Ecommerce Halaman Kuliner & Detail Produk

## 📦 Fitur yang Sudah Tersedia

### ✅ Halaman Kuliner (`/kuliner`)
- 🔍 **Search** - Mencari produk/destinasi by nama
- 🏷️ **Filter Kategori** - Makanan Berat, Minuman, Jajanan, Dessert
- 📍 **Filter Kabupaten** - Banjarnegara, Purbalingga, Banyumas, dll
- 🔄 **Sort** - Rating, Terbaru, Termurah
- 📄 **Pagination** - 8 item per halaman
- 🎨 **KulinerCard Component** - Menampilkan item dengan:
  - Foto produk
  - Harga & diskon badge
  - Rating & review count
  - Seller name (untuk produk UMKM)
  - Featured badge
  - Wishlist button (❤️)

### ✅ Halaman Detail Destinasi (`/kuliner/[slug]`)
- 📸 **Hero Image** dengan gradient overlay
- 📍 **Breadcrumb Navigation**
- ⭐ **Rating & Review** (dari tabel content_reviews)
- 👥 **Review List** - Menampilkan 5 review terakhir
- 📝 **Review Form** - Untuk pengunjung yang login
- 🏷️ **Category & Location Badges**
- 📋 **Description**
- ❤️ **Wishlist Button** (Saved Places)
- 🎯 **Related Content** - Destinasi lain di kabupaten yang sama

### ✅ Halaman Detail Produk (`/produk/[slug]`)
- 📸 **Image Gallery** - Main image + thumbnail strip
- 💰 **Price Section**
  - Harga normal
  - Harga diskon
  - Percentage diskon badge
  - Savings amount
- ⭐ **Rating & Stats**
  - Average rating
  - Number of reviews
  - Total sold
- 🏪 **Seller Card**
  - Logo/Avatar
  - Nama UMKM
  - Lokasi (city)
  - Badge verified (BadgeCheck)
  - Deskripsi UMKM
  - Tombol "Kunjungi Toko"
  - Tombol "Chat Penjual"
- 📦 **Product Details**
  - SKU
  - Deskripsi lengkap
- 🛒 **Add to Cart**
  - Qty selector (+/-)
  - Add to cart button
  - Buy now button
  - Share button
- ❤️ **Wishlist Button**
- 🚚 **Service Guarantees**
  - Produk 100% Original UMKM
  - Bebas Ongkir (untuk pembelian 50rb+)
  - Retur Mudah (2 hari)
- ⭐ **Reviews Section**
  - Display reviews dari pembeli
  - Rating distribution
  - **NEW: Review Form** - Pembeli bisa menambah review
- 🏪 **Related Products** - Produk lain dari toko yang sama
- 📍 **Breadcrumb** - Home > Produk > Kategori > Nama Produk

## 🛠️ Komponen yang Digunakan

### Newly Created ✨
1. **`components/kuliner/KulinerCard.tsx`**
   - Display item kuliner/produk di listing
   - Support destinasi & produk UMKM
   - Terintegrasi dengan WishlistButton
   - Menampilkan discount & featured badge

2. **`components/product/ProductReviewForm.tsx`**
   - Form untuk menambah review produk
   - Rating selector (1-5 bintang)
   - Text area untuk komentar (max 500 char)
   - Submit button
   - Feedback message

### Existing Components ✅
1. **`components/ui/WishlistButton.tsx`**
   - Love button untuk wishlist
   - Support product & content
   - Automatic redirect ke login jika belum login
   - Menyimpan ke tabel wishlists

2. **`components/product/AddToCartButton.tsx`**
   - Qty selector (+/-)
   - Add to cart button
   - Loading state
   - Menyimpan ke tabel cart_items

3. **`components/ui/WisataClient.tsx`**
   - HeartButton (basic)
   - SortDropdown

## 🗄️ Database Tables

### products
- id, name, slug, description, price, discount_price, sku
- stock, images[], is_active, is_featured, rating, total_sold
- category_id, seller_id, created_at, updated_at

### product_reviews
- id, product_id, user_id, rating (1-5), body, created_at

### wishlists
- id, user_id, product_id, content_id, created_at

### cart_items
- id, user_id, product_id, qty, created_at, updated_at

### contents (Destinasi Kuliner)
- id, title, slug, type, is_published, cover_image
- kabupaten, ticket_price_min, ticket_price_max, rating, review_count
- tags, description, body, created_at

### content_reviews
- id, content_id, user_id, rating, body, created_at, profiles(full_name, avatar_url)

## 🎯 Flow Penggunaan

### 1️⃣ Jelajahi Kuliner
```
GET /kuliner
  ├─ Fetch dari tabel contents (type=kuliner, is_published=true)
  ├─ Fetch dari tabel products (category_id in kuliner_categories)
  ├─ Merge & format data
  ├─ Filter by search, kabupaten, kategori
  ├─ Sort by rating/terbaru/termurah
  ├─ Paginate (8 per page)
  └─ Display dengan KulinerCard
```

### 2️⃣ Lihat Detail (Pilihan A: Destinasi)
```
GET /kuliner/[slug]
  ├─ Fetch destinasi dari tabel contents
  ├─ Fetch reviews dari tabel content_reviews
  ├─ Fetch wishlist status (jika user login)
  ├─ Display hero, info, reviews, form review
  └─ Related destinasi dari kabupaten yang sama
```

### 3️⃣ Lihat Detail (Pilihan B: Produk)
```
GET /produk/[slug]
  ├─ Fetch produk dari tabel products
  ├─ Fetch seller info dari tabel profiles
  ├─ Fetch reviews dari tabel product_reviews
  ├─ Fetch cart & wishlist status
  ├─ Display gallery, harga, seller, reviews, form review
  ├─ Add to cart → POST to cart_items
  ├─ Wishlist → POST to wishlists
  ├─ Submit review → POST to product_reviews
  └─ Related produk dari seller yang sama
```

### 4️⃣ Tambah Review
```
POST /api/product_reviews (atau via action)
  ├─ Authenticate user
  ├─ Validate rating (1-5)
  ├─ Validate body (not empty, max 500 char)
  ├─ Insert ke product_reviews
  ├─ Revalidate page
  └─ Show success message
```

## 📊 Data Flow Diagram

```
HALAMAN KULINER (/kuliner)
    ↓
[Filter & Search]
    ↓
┌─────────────────────┬─────────────────────┐
│   KulinerCard       │   KulinerCard       │
│  (Destinasi)        │   (Produk UMKM)     │
│                     │                     │
│ - Logo              │ - Logo              │
│ - Nama              │ - Nama              │
│ - Kabupaten         │ - Seller Name       │
│ - Harga Tiket       │ - Harga Produk      │
│ - Rating            │ - Rating            │
│ - Wishlist ❤️       │ - Wishlist ❤️       │
│                     │                     │
│ Klik → /kuliner/.. │ Klik → /produk/...  │
└─────────────────────┴─────────────────────┘
         ↓                      ↓
    DESTINASI DETAIL       PRODUK DETAIL
    (/kuliner/[slug])      (/produk/[slug])
         ├─                      ├─
         ├─ Hero Image           ├─ Gallery + Thumbnail
         ├─ Info                 ├─ Harga & Diskon
         ├─ Reviews ⭐           ├─ Seller Card 🏪
         ├─ Review Form          ├─ Reviews ⭐
         ├─ Wishlist ❤️          ├─ Review Form ✍️
         ├─ Related Places       ├─ Add to Cart 🛒
         └─ Map                  ├─ Wishlist ❤️
                                 ├─ Buy Now 💳
                                 └─ Related Products
```

## 🚀 Workflow Lengkap User Membeli Produk

```
1. EXPLORE
   User masuk → /kuliner
   ↓
2. FILTER & SEARCH
   Filter by kategori, kabupaten, sort, search
   ↓
3. SELECT ITEM
   Klik KulinerCard (produk UMKM)
   ↓
4. VIEW DETAIL
   Masuk ke /produk/[slug]
   - Lihat foto, harga, rating, seller
   - Baca review pembeli lain
   - Tambah review pribadi (jika login)
   ↓
5. ADD TO CART
   Pilih qty → Klik "Tambah ke Keranjang"
   Item tersimpan di cart_items table
   Badge cart update di navbar
   ↓
6. REVIEW WISHLIST (Optional)
   Klik ❤️ button → Simpan ke wishlists table
   Bisa dilihat di /profil/wishlist
   ↓
7. CHECKOUT
   Klik "Beli Langsung" atau /keranjang
   Pilih items, review, checkout
   ↓
8. PAYMENT
   Midtrans integration
   ↓
9. ORDER
   Pesanan masuk ke pesanan table
   User bisa track di /profil/pesanan
   ↓
10. DELIVERY & REVIEW
    Barang sampai → Tulis review
    Rating & komentar → Produk rating update
```

## 🔐 Authentication & Authorization

- **Login Required** untuk:
  - Wishlist (❤️)
  - Add to Cart (🛒)
  - Review Form (✍️)
  - Checkout (💳)

- **Automatic Redirect** ke `/login` jika:
  - Click wishlist, add to cart, checkout saat belum login

## 📈 Performance Optimization

✅ **Image Optimization**
- Gunakan Next.js Image component
- Lazy loading untuk thumbnail
- NEXT_PUBLIC_SUPABASE_URL + storage path

✅ **Database Queries**
- Select hanya field yang dibutuhkan
- Join dengan profiles untuk seller info
- Limit results (e.g., 5 reviews, 4 related products)

✅ **Caching**
- Revalidate on-demand setelah submit review
- Client-side wishlist state untuk responsiveness

## 🎨 UI/UX Highlights

✨ **Visual Hierarchy**
- Hero image prominent
- Price jelas & menonjol
- Seller card eye-catching
- CTA buttons easily accessible

✨ **Responsive Design**
- Mobile-first approach
- Sticky sidebar (desktop only)
- Touch-friendly buttons (min 44x44px)

✨ **Color Scheme**
- Primary: #6EB8BB (Teal)
- Secondary: #E6F7F8 (Light Teal)
- Accent: #FF6B6B (Red for discount)
- Neutral: Gray palette

## 📝 Next Steps / TODO

- [ ] Advanced search dengan AI
- [ ] Filter harga range
- [ ] Photo review upload
- [ ] Seller rating & response time
- [ ] Product comparison
- [ ] Bundle deals
- [ ] Seasonal promotions
- [ ] Notification system
- [ ] Live chat with seller
- [ ] Product Q&A section

---

**Last Updated**: 2026-06-17
**Version**: 1.0
**Status**: ✅ Production Ready (dengan fitur baru ProductReviewForm)
