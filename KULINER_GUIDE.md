# 📋 Panduan Lengkap Halaman Kuliner & Detail Produk

## 🏗️ Struktur Routing

Aplikasi Barling-GO memiliki dua jenis halaman detail:

### 1. **Halaman Destinasi Kuliner** (dari Super Admin)
- **Route**: `/kuliner/[slug]`
- **File**: `app/(public)/kuliner/[slug]/page.tsx`
- **Data**: Diambil dari tabel `contents` dengan type `kuliner`
- **Fitur**:
  - 📸 Gallery foto
  - ⭐ Rating dan review
  - 💬 Form review dari pengunjung
  - 🏷️ Harga tiket (min-max)
  - 📍 Lokasi (Kabupaten)
  - ❤️ Simpan ke tersimpan (saved_places)

### 2. **Halaman Detail Produk** (dari UMKM)
- **Route**: `/produk/[slug]`
- **File**: `app/(public)/produk/[slug]/page.tsx`
- **Data**: Diambil dari tabel `products` dengan kategori kuliner
- **Fitur**:
  - 📸 Gallery foto dengan thumbnail
  - 💰 Harga dengan diskon
  - ⭐ Rating dan review pembeli
  - 🛒 Add to cart dengan qty selector
  - ❤️ Wishlist
  - 🏪 Profile toko (logo, nama, lokasi, deskripsi)
  - 💬 Reviews dari pembeli
  - 📦 Produk lain dari toko yang sama
  - 🚚 Layanan jaminan (asli, bebas ongkir, retur mudah)
  - 💳 Beli langsung button

## 📄 Halaman Kuliner Listing

**Route**: `/kuliner`
**File**: `app/(public)/kuliner/page.tsx`

### Fitur:
✅ **Search** - Cari nama makanan/produk
✅ **Filter Kabupaten** - Pilih lokasi
✅ **Filter Kategori** - Makanan Berat, Minuman, Jajanan, Dessert
✅ **Sort** - Rating Tertinggi, Terbaru, Termurah
✅ **Pagination** - Tampilkan 8 item per halaman
✅ **Wishlist Integration** - Tombol hati untuk simpan favorit

### Tipe Item yang Ditampilkan:
1. **Destinasi** (badge "Destinasi")
   - Dari tabel `contents`
   - Punya harga tiket range
   - Link ke `/kuliner/[slug]`

2. **Produk UMKM** (badge "UMKM")
   - Dari tabel `products`
   - Punya harga produk + diskon
   - Punya toko (seller)
   - Link ke `/produk/[slug]`

## 🎨 Komponen yang Digunakan

### 1. `KulinerCard` 
**File**: `components/kuliner/KulinerCard.tsx`
- Menampilkan kartu item kuliner/produk
- Menampilkan harga, rating, seller, diskon
- Integrasi dengan WishlistButton

### 2. `WishlistButton`
**File**: `components/ui/WishlistButton.tsx`
- Tombol love untuk wishlist
- Support product atau content
- Menyimpan ke tabel `wishlists`
- Memerlukan user login

### 3. `AddToCartButton`
**File**: `components/product/AddToCartButton.tsx`
- Qty selector (+/-)
- Add to cart button
- Menyimpan ke tabel `cart_items`
- Memerlukan user login

### 4. `HeartButton`
**File**: `components/ui/WisataClient.tsx`
- Basic heart button (belum terkoneksi dengan wishlist)
- Perlu diupdate untuk integrasi penuh

## 💾 Database Schema

### Tabel `products`
```sql
- id (uuid)
- name (string)
- slug (string) -- unique
- description (text)
- price (numeric)
- discount_price (numeric)
- sku (string)
- stock (int)
- images (array)
- is_active (boolean)
- is_featured (boolean)
- rating (numeric)
- total_sold (int)
- category_id (uuid) -- FK to categories
- seller_id (uuid) -- FK to profiles
- created_at (timestamp)
- updated_at (timestamp)
```

### Tabel `wishlists`
```sql
- id (uuid)
- user_id (uuid) -- FK to profiles
- product_id (uuid) -- FK to products (nullable)
- content_id (uuid) -- FK to contents (nullable)
- created_at (timestamp)
```

### Tabel `cart_items`
```sql
- id (uuid)
- user_id (uuid) -- FK to profiles
- product_id (uuid) -- FK to products
- qty (int)
- created_at (timestamp)
- updated_at (timestamp)
```

### Tabel `product_reviews`
```sql
- id (uuid)
- product_id (uuid) -- FK to products
- user_id (uuid) -- FK to profiles
- rating (int 1-5)
- body (text)
- created_at (timestamp)
```

## 🚀 Flow Pengguna

### 1. Jelajahi Kuliner
```
/kuliner
  ↓
[Filter & Search]
  ↓
Lihat Destinasi atau Produk UMKM
  ↓
Klik pada item yang ingin dilihat
```

### 2. Lihat Detail Produk
```
/produk/[slug]
  ├─ 📸 Gallery foto
  ├─ 💰 Harga & Diskon
  ├─ 👥 Info Toko
  ├─ ⭐ Rating & Reviews
  ├─ 🛒 Add to Cart
  ├─ ❤️ Wishlist
  └─ 💳 Beli Langsung
```

### 3. Tambah ke Keranjang
```
1. Klik "Tambah ke Keranjang"
2. Pilih jumlah (qty)
3. Item tersimpan di tabel cart_items
4. Update badge di navbar
5. Lanjut ke checkout
```

### 4. Simpan ke Wishlist
```
1. Klik tombol hati (❤️)
2. Jika belum login → redirect ke /login
3. Jika sudah login → simpan ke tabel wishlists
4. Bisa dilihat di /profil/wishlist
```

## 🔗 Link Penting

| Halaman | URL | File |
|---------|-----|------|
| Daftar Kuliner | `/kuliner` | `app/(public)/kuliner/page.tsx` |
| Detail Destinasi | `/kuliner/[slug]` | `app/(public)/kuliner/[slug]/page.tsx` |
| Detail Produk | `/produk/[slug]` | `app/(public)/produk/[slug]/page.tsx` |
| Wishlist User | `/profil/wishlist` | `app/(user)/wishlist/page.tsx` |
| Keranjang User | `/keranjang` | `app/(user)/keranjang/page.tsx` |
| Toko | `/toko/[id]` | `app/(public)/toko/[id]/page.tsx` |

## 🛠️ Cara Menambahkan Fitur Baru

### 1. Review Form untuk Produk
Buat file: `components/product/ProductReviewForm.tsx`
```typescript
// Support untuk:
// - Rating 1-5 bintang
// - Text review
// - Upload foto (optional)
```

### 2. Store Profile Card
Update: `app/(public)/produk/[slug]/page.tsx`
```typescript
// Tampilkan:
// - Rating toko
// - Jumlah followers
// - Jumlah produk
// - Response time
// - Jumlah penjualan
```

### 3. Related Products
Sudah ada di halaman detail produk:
- Produk lain dari toko yang sama (4 item)
- Related kuliner dari kabupaten yang sama (destinasi)

## ⚙️ Konfigurasi

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### Color Theme
- Primary: `#6EB8BB` (Teal)
- Secondary: `#E6F7F8` (Light Teal)
- Accent: `#FF6B6B` (Red untuk diskon)

## 🎯 TODO / Improvement

- [ ] Review form untuk produk (belum ada form input)
- [ ] Detail review seller (rating toko, response time)
- [ ] Filter harga range di listing
- [ ] Sort by seller rating
- [ ] Product comparison
- [ ] Advanced search dengan AI
- [ ] Photo review dari pembeli
- [ ] Bundle deals
- [ ] Seasonal promotions

## 📞 Support

Untuk pertanyaan atau issue, silakan hubungi tim developer.
