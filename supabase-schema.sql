-- نفّذ هذا الملف مرة واحدة في Supabase > SQL Editor
create extension if not exists pgcrypto;
create table if not exists public.posts (id uuid primary key default gen_random_uuid(), title text not null, category text default 'أخبار', excerpt text, content text not null, cover_url text, status text not null default 'draft' check(status in ('draft','published')), published_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public.media (id uuid primary key default gen_random_uuid(), post_id uuid references public.posts(id) on delete cascade, type text not null default 'image', title text, description text, url text not null, thumbnail_url text, sort_order int default 0, created_at timestamptz default now());
create table if not exists public.videos (id uuid primary key default gen_random_uuid(), title text not null, description text, url text not null, thumbnail_url text, created_at timestamptz default now());
create table if not exists public.ads (id uuid primary key default gen_random_uuid(), title text not null, image_url text, video_url text, target_url text, placement text default 'home', start_at timestamptz, end_at timestamptz, active boolean default true, sort_order int default 0, created_at timestamptz default now());
alter table public.posts enable row level security; alter table public.media enable row level security; alter table public.videos enable row level security; alter table public.ads enable row level security;
create policy "public read published posts" on public.posts for select using (status='published' or auth.uid() is not null);
create policy "admin write posts" on public.posts for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "public read media" on public.media for select using (true); create policy "admin write media" on public.media for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "public read videos" on public.videos for select using (true); create policy "admin write videos" on public.videos for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "public read active ads" on public.ads for select using (active=true and (start_at is null or start_at<=now()) and (end_at is null or end_at>=now()) or auth.uid() is not null);
create policy "admin write ads" on public.ads for all using (auth.uid() is not null) with check (auth.uid() is not null);
-- Storage: أنشئ bucket باسم media واجعله Public من Storage. ثم أضف سياسات upload/delete للمستخدمين المسجلين من لوحة Storage Policies.
