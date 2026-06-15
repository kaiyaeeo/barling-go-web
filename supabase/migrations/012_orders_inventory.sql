    -- ============================================
    -- MIGRASI: Orders & Inventory
    -- Jalankan di Supabase Dashboard > SQL Editor
    -- ============================================

    -- Enum status order
    create type order_status as enum (
    'pending', 'paid', 'processing', 'packing',
    'shipped', 'delivered', 'cancelled', 'refunded'
    );

    -- Enum metode pembayaran
    create type payment_method as enum (
    'transfer_bank', 'virtual_account', 'qris',
    'cod', 'gopay', 'ovo', 'dana'
    );

    -- Tabel orders
    create table public.orders (
    id uuid default uuid_generate_v4() primary key,
    order_number text unique not null,
    user_id uuid references public.profiles(id) on delete set null,
    status order_status default 'pending' not null,

    -- Alamat pengiriman (snapshot saat order)
    shipping_name text not null,
    shipping_phone text not null,
    shipping_address text not null,
    shipping_city text not null,
    shipping_province text not null,
    shipping_postal_code text not null,

    -- Pengiriman
    courier text,
    courier_service text,
    shipping_cost numeric(12,2) default 0,
    tracking_number text,

    -- Pembayaran
    payment_method payment_method,
    payment_status text default 'unpaid',
    payment_proof text,    -- URL bukti transfer
    midtrans_token text,   -- token Midtrans Snap
    midtrans_order_id text,
    paid_at timestamptz,

    -- Total
    subtotal numeric(12,2) not null default 0,
    discount_amount numeric(12,2) default 0,
    total_amount numeric(12,2) not null default 0,

    -- Voucher
    voucher_code text,

    notes text,
    invoice_url text,

    created_at timestamptz default now(),
    updated_at timestamptz default now()
    );

    -- Tabel order items (snapshot harga saat order)
    create table public.order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete set null,
    product_name text not null,      -- snapshot nama
    product_image text,              -- snapshot foto
    price numeric(12,2) not null,    -- snapshot harga
    qty integer not null default 1,
    subtotal numeric(12,2) not null,
    created_at timestamptz default now()
    );

    -- Tabel inventory log (stock in / stock out)
    create table public.inventory_log (
    id uuid default uuid_generate_v4() primary key,
    product_id uuid references public.products(id) on delete cascade not null,
    type text check (type in ('in', 'out', 'adjustment')) not null,
    qty integer not null,
    stock_before integer not null,
    stock_after integer not null,
    reason text,           -- 'order', 'restock', 'return', 'manual'
    reference_id uuid,     -- order_id jika terkait order
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz default now()
    );

    -- Auto-update updated_at pada orders
    create or replace function update_updated_at()
    returns trigger as $$
    begin
    new.updated_at = now();
    return new;
    end;
    $$ language plpgsql;

    create trigger orders_updated_at
    before update on public.orders
    for each row execute procedure update_updated_at();

    -- Function: generate order number (ORD-YYYYMMDD-XXXX)
    create or replace function generate_order_number()
    returns text as $$
    declare
    prefix text := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-';
    seq text;
    begin
    select lpad(cast(count(*) + 1 as text), 4, '0')
    into seq
    from public.orders
    where created_at::date = current_date;
    return prefix || seq;
    end;
    $$ language plpgsql;

    -- RLS
    alter table public.orders enable row level security;
    alter table public.order_items enable row level security;
    alter table public.inventory_log enable row level security;

    -- Orders: user hanya lihat pesanannya sendiri
    create policy "Users can view own orders"
    on orders for select using (auth.uid() = user_id);

    create policy "Users can insert own orders"
    on orders for insert with check (auth.uid() = user_id);

    -- Admin bisa lihat & update semua order
    create policy "Admin can manage all orders"
    on orders for all using (
        exists (
        select 1 from profiles
        where id = auth.uid() and role in ('admin', 'super_admin')
        )
    );

    -- Order items: ikut order
    create policy "Users can view own order items"
    on order_items for select using (
        exists (
        select 1 from orders where id = order_id and user_id = auth.uid()
        )
    );

    create policy "System can insert order items"
    on order_items for insert with check (true);

    create policy "Admin can view all order items"
    on order_items for select using (
        exists (
        select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin')
        )
    );

    -- Inventory log: hanya admin
    create policy "Admin can manage inventory log"
    on inventory_log for all using (
        exists (
        select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin')
        )
    );