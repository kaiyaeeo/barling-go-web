    -- ============================================
    -- MIGRASI: CRM, Promosi, Analytics Views
    -- Jalankan di Supabase Dashboard > SQL Editor
    -- ============================================

    -- Tabel customer_segments
    create table public.customer_segments (
    id uuid default uuid_generate_v4() primary key,
    name text not null,          -- 'VIP', 'Regular', 'New'
    description text,
    min_orders integer default 0,
    min_spend numeric(12,2) default 0,
    color text default '#6EB8BB',
    created_at timestamptz default now()
    );

    -- Tabel membership_points
    create table public.membership_points (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade unique,
    points integer default 0,
    tier text default 'bronze' check (tier in ('bronze','silver','gold','platinum')),
    total_spent numeric(12,2) default 0,
    updated_at timestamptz default now()
    );

    -- Tabel promotions (diskon & voucher)
    create table public.promotions (
    id uuid default uuid_generate_v4() primary key,
    code text unique not null,
    name text not null,
    type text check (type in ('percentage', 'fixed')) not null,
    value numeric(12,2) not null,    -- persen atau nominal
    min_purchase numeric(12,2) default 0,
    max_discount numeric(12,2),      -- max diskon untuk tipe persen
    quota integer,                   -- null = unlimited
    used_count integer default 0,
    start_date timestamptz,
    end_date timestamptz,
    is_active boolean default true,
    created_at timestamptz default now()
    );

    -- Tabel promotion_usage
    create table public.promotion_usage (
    id uuid default uuid_generate_v4() primary key,
    promotion_id uuid references public.promotions(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete set null,
    order_id uuid references public.orders(id) on delete set null,
    discount_amount numeric(12,2) not null,
    used_at timestamptz default now()
    );

    -- RLS
    alter table public.customer_segments enable row level security;
    alter table public.membership_points enable row level security;
    alter table public.promotions enable row level security;
    alter table public.promotion_usage enable row level security;

    create policy "Admin manage customer segments"
    on customer_segments for all using (
        exists (select 1 from profiles where id = auth.uid() and role in ('admin','super_admin'))
    );

    create policy "Users view own points"
    on membership_points for select using (auth.uid() = user_id);

    create policy "Admin manage all points"
    on membership_points for all using (
        exists (select 1 from profiles where id = auth.uid() and role in ('admin','super_admin'))
    );

    create policy "Anyone can read active promotions"
    on promotions for select using (is_active = true);

    create policy "Admin manage promotions"
    on promotions for all using (
        exists (select 1 from profiles where id = auth.uid() and role in ('admin','super_admin'))
    );

    create policy "Admin view promotion usage"
    on promotion_usage for select using (
        exists (select 1 from profiles where id = auth.uid() and role in ('admin','super_admin'))
    );

    -- ============================================
    -- VIEWS untuk Analytics Dashboard
    -- ============================================

    -- View: penjualan harian 30 hari terakhir
    create or replace view public.daily_sales as
    select
    date_trunc('day', created_at)::date as date,
    count(*) as order_count,
    sum(total_amount) as revenue,
    sum(subtotal) as subtotal_revenue,
    avg(total_amount) as avg_order_value
    from public.orders
    where
    status not in ('cancelled','refunded')
    and payment_status = 'paid'
    and created_at >= now() - interval '30 days'
    group by date_trunc('day', created_at)::date
    order by date;

    -- View: produk terlaris
    create or replace view public.top_products as
    select
    p.id,
    p.name,
    p.slug,
    p.price,
    p.images,
    coalesce(sum(oi.qty), 0) as total_sold,
    coalesce(sum(oi.subtotal), 0) as total_revenue,
    c.name as category_name
    from public.products p
    left join public.order_items oi on oi.product_id = p.id
    left join public.orders o on o.id = oi.order_id and o.status not in ('cancelled','refunded')
    left join public.categories c on c.id = p.category_id
    where p.is_active = true
    group by p.id, p.name, p.slug, p.price, p.images, c.name
    order by total_sold desc;

    -- View: statistik pelanggan
    create or replace view public.customer_stats as
    select
    p.id,
    p.full_name,
    p.phone,
    p.created_at as joined_at,
    count(o.id) as total_orders,
    coalesce(sum(o.total_amount), 0) as total_spent,
    max(o.created_at) as last_order_at
    from public.profiles p
    left join public.orders o on o.user_id = p.id and o.status not in ('cancelled','refunded')
    where p.role = 'user'
    group by p.id, p.full_name, p.phone, p.created_at;

    -- Seed data promosi contoh
    insert into public.promotions (code, name, type, value, min_purchase, quota, is_active)
    values
    ('BARLING10', 'Diskon 10% Semua Produk', 'percentage', 10, 50000, 100, true),
    ('SELAMATDATANG', 'Diskon Rp 15.000 Member Baru', 'fixed', 15000, 0, 500, true);

    -- Seed customer segments
    insert into public.customer_segments (name, description, min_orders, min_spend, color)
    values
    ('New', 'Pelanggan baru, belum pernah order', 0, 0, '#6B7280'),
    ('Regular', 'Sudah pernah order minimal 1x', 1, 0, '#2563EB'),
    ('VIP', 'Order 5x atau belanja min. Rp 500.000', 5, 500000, '#D97706');
