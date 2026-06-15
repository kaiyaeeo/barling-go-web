    -- ============================================
    -- MIGRASI: Profil Ekstensi, Preferensi, Saved Places, Reviews
    -- Jalankan di Supabase Dashboard > SQL Editor
    -- ============================================

    -- Tambah kolom ke tabel profiles
    alter table public.profiles
    add column if not exists date_of_birth date,
    add column if not exists gender text check (gender in ('male', 'female', 'other')),
    add column if not exists preferences text[] default '{}',
    add column if not exists membership_tier text default 'free' check (membership_tier in ('free', 'explorer', 'pro')),
    add column if not exists explorer_points integer default 0,
    add column if not exists destinations_visited integer default 0,
    add column if not exists two_factor_enabled boolean default false;

    -- Tambah kolom ke tabel contents (destinasi)
    alter table public.contents
    add column if not exists ticket_price_min integer default 0,
    add column if not exists ticket_price_max integer default 0,
    add column if not exists opening_hours text,
    add column if not exists phone text,
    add column if not exists kabupaten text,
    add column if not exists rating numeric(3,2) default 0,
    add column if not exists review_count integer default 0;

    -- Tabel ulasan konten/destinasi
    create table if not exists public.content_reviews (
    id uuid default uuid_generate_v4() primary key,
    content_id uuid references public.contents(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    rating integer not null check (rating between 1 and 5),
    body text not null,
    created_at timestamptz default now(),
    unique (content_id, user_id)
    );

    alter table public.content_reviews enable row level security;

    create policy "Anyone can view reviews"
    on content_reviews for select using (true);

    create policy "Authenticated users can write reviews"
    on content_reviews for insert
    with check (auth.uid() = user_id);

    create policy "Users can update own review"
    on content_reviews for update
    using (auth.uid() = user_id);

    -- Tabel saved places (destinasi disimpan/bookmark)
    create table if not exists public.saved_places (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    content_id uuid references public.contents(id) on delete cascade not null,
    created_at timestamptz default now(),
    unique (user_id, content_id)
    );

    alter table public.saved_places enable row level security;

    create policy "Users manage own saved places"
    on saved_places for all
    using (auth.uid() = user_id);

    -- Function: update rating & review_count di contents setelah review baru
    create or replace function update_content_rating()
    returns trigger as $$
    begin
    update public.contents
    set
        rating = (
        select round(avg(rating)::numeric, 2)
        from public.content_reviews
        where content_id = NEW.content_id
        ),
        review_count = (
        select count(*)
        from public.content_reviews
        where content_id = NEW.content_id
        )
    where id = NEW.content_id;
    return NEW;
    end;
    $$ language plpgsql security definer;

    create trigger after_review_insert
    after insert or update on public.content_reviews
    for each row execute procedure update_content_rating();

    -- Update seed konten dengan data wisata lengkap
    update public.contents set
    ticket_price_min = 10000,
    ticket_price_max = 25000,
    opening_hours = '07.00 - 17.00 WIB',
    kabupaten = 'Kebumen',
    phone = '+62 812 3456 789'
    where slug = 'telaga-sunyi-banyumas';

    -- Seed ulasan contoh
    insert into public.content_reviews (content_id, user_id, rating, body)
    select
    c.id,
    p.id,
    5,
    'Pantainya sangat bersih dan pemandangan dari atas bukit benar-benar luar biasa. Sangat direkomendasikan!'
    from public.contents c, public.profiles p
    where c.slug = 'telaga-sunyi-banyumas'
    and p.role = 'user'
    limit 1
    on conflict do nothing;
