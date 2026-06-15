    -- ============================================
    -- MIGRASI: Konten, Notifikasi, AI Logs
    -- Jalankan di Supabase Dashboard > SQL Editor
    -- ============================================

    -- Tabel konten destinasi wisata & artikel
    create table public.contents (
    id uuid default uuid_generate_v4() primary key,
    type text check (type in ('destinasi','kuliner','artikel','oleh-oleh')) not null,
    title text not null,
    slug text unique not null,
    description text,
    body text,
    cover_image text,
    location text,
    address text,
    latitude numeric(10,7),
    longitude numeric(10,7),
    tags text[] default '{}',
    is_published boolean default false,
    view_count integer default 0,
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
    );

    alter table public.contents enable row level security;

    create policy "Anyone can view published content"
    on contents for select using (is_published = true);

    create policy "Super admin manage all content"
    on contents for all using (
        exists (select 1 from profiles where id = auth.uid() and role = 'super_admin')
    );

    -- Tabel notifikasi in-app
    create table public.notifications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    type text not null,
    title text not null,
    message text,
    link text,
    is_read boolean default false,
    created_at timestamptz default now()
    );

    alter table public.notifications enable row level security;

    create policy "Users view own notifications"
    on notifications for select using (auth.uid() = user_id);

    create policy "Users update own notifications"
    on notifications for update using (auth.uid() = user_id);

    create policy "System insert notifications"
    on notifications for insert with check (true);

    -- Tabel AI chat history
    create table public.ai_chat_history (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    session_id text not null,
    role text check (role in ('user','assistant')) not null,
    content text not null,
    created_at timestamptz default now()
    );

    alter table public.ai_chat_history enable row level security;

    create policy "Users view own chat history"
    on ai_chat_history for select using (auth.uid() = user_id);

    create policy "Users insert own messages"
    on ai_chat_history for insert with check (auth.uid() = user_id);

    create policy "Super admin view all AI history"
    on ai_chat_history for select using (
        exists (select 1 from profiles where id = auth.uid() and role = 'super_admin')
    );

    -- Tabel UMKM verification requests
    create table public.umkm_verifications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade unique,
    business_name text not null,
    business_type text,
    address text,
    phone text,
    ktp_url text,
    npwp_url text,
    status text default 'pending' check (status in ('pending','approved','rejected')),
    rejection_reason text,
    reviewed_by uuid references public.profiles(id) on delete set null,
    reviewed_at timestamptz,
    created_at timestamptz default now()
    );

    alter table public.umkm_verifications enable row level security;

    create policy "Users view own verification"
    on umkm_verifications for select using (auth.uid() = user_id);

    create policy "Users submit verification"
    on umkm_verifications for insert with check (auth.uid() = user_id);

    create policy "Super admin manage verifications"
    on umkm_verifications for all using (
        exists (select 1 from profiles where id = auth.uid() and role = 'super_admin')
    );

    -- Storage bucket untuk konten & dokumen verifikasi
    insert into storage.buckets (id, name, public)
    values
    ('content-images', 'content-images', true),
    ('verification-docs', 'verification-docs', false)
    on conflict (id) do nothing;

    create policy "Public read content images"
    on storage.objects for select using (bucket_id = 'content-images');

    create policy "Authenticated upload content images"
    on storage.objects for insert
    with check (bucket_id = 'content-images' and auth.role() = 'authenticated');

    create policy "Users read own verification docs"
    on storage.objects for select
    using (bucket_id = 'verification-docs' and auth.uid()::text = (storage.foldername(name))[1]);

    -- Function: auto-notifikasi saat order status berubah
    create or replace function notify_order_status()
    returns trigger as $$
    declare
    msg text;
    begin
    if NEW.status != OLD.status then
        msg := case NEW.status
        when 'paid'       then 'Pembayaran dikonfirmasi. Pesanan sedang diproses.'
        when 'shipped'    then 'Pesananmu sedang dalam perjalanan! Cek nomor resi di detail pesanan.'
        when 'delivered'  then 'Pesananmu sudah tiba. Terima kasih sudah belanja di Barling-GO!'
        when 'cancelled'  then 'Pesananmu telah dibatalkan.'
        else null
        end;
        if msg is not null then
        insert into public.notifications (user_id, type, title, message, link)
        values (
            NEW.user_id,
            'order_update',
            'Update Pesanan #' || NEW.order_number,
            msg,
            '/pesanan/' || NEW.id
        );
        end if;
    end if;
    return NEW;
    end;
    $$ language plpgsql security definer;

    create trigger order_status_notification
    after update on public.orders
    for each row execute procedure notify_order_status();

    -- Seed konten awal
    insert into public.contents (type, title, slug, description, is_published) values
    ('destinasi', 'Telaga Sunyi Banyumas', 'telaga-sunyi-banyumas', 'Danau tersembunyi di kaki Gunung Slamet dengan air jernih dan suasana tenang.', true),
    ('destinasi', 'Hutan Pinus Limpakuwus', 'hutan-pinus-limpakuwus', 'Kawasan hutan pinus yang sejuk untuk berkemah dan piknik keluarga.', true),
    ('destinasi', 'Baturaden Resort', 'baturaden-resort', 'Kawasan wisata alam di lereng Gunung Slamet dengan suhu sejuk.', true),
    ('kuliner', 'Mendoan Purwokerto', 'mendoan-purwokerto', 'Tempe goreng tipis khas Purwokerto yang renyah dan gurih.', true),
    ('kuliner', 'Soto Sokaraja', 'soto-sokaraja', 'Soto berkuah bening dengan bumbu kacang khas Banyumas.', true);
