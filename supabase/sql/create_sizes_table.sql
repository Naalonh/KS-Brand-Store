create extension if not exists pgcrypto;

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create table if not exists public.sizes (
  id uuid primary key default gen_random_uuid(),
  group_key text not null check (group_key ~ '^[a-z0-9][a-z0-9-]{0,62}$'),
  group_label text not null check (char_length(trim(group_label)) between 1 and 80),
  size_label text not null check (char_length(trim(size_label)) between 1 and 40),
  active boolean not null default true,
  group_sort_order integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sizes_group_size_unique unique (group_key, size_label)
);

create index if not exists sizes_active_group_sort_order_idx
  on public.sizes (active, group_sort_order, sort_order, created_at desc);

create or replace function public.set_sizes_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_sizes_updated_at on public.sizes;

create trigger set_sizes_updated_at
before update on public.sizes
for each row
execute function public.set_sizes_updated_at();

alter table public.sizes enable row level security;

drop policy if exists "Anyone can view active sizes" on public.sizes;
drop policy if exists "Authenticated read active sizes or admin all" on public.sizes;
drop policy if exists "Admins can create sizes" on public.sizes;
drop policy if exists "Admins can update sizes" on public.sizes;
drop policy if exists "Admins can delete sizes" on public.sizes;

create policy "Anyone can view active sizes"
on public.sizes
for select
to anon
using (active = true);

create policy "Authenticated read active sizes or admin all"
on public.sizes
for select
to authenticated
using (active = true or (select public.is_admin()));

create policy "Admins can create sizes"
on public.sizes
for insert
to authenticated
with check ((select public.is_admin()));

create policy "Admins can update sizes"
on public.sizes
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins can delete sizes"
on public.sizes
for delete
to authenticated
using ((select public.is_admin()));

revoke all on table public.sizes from anon, authenticated;
grant select on table public.sizes to anon;
grant select, insert, update, delete on table public.sizes to authenticated;

insert into public.sizes
  (id, group_key, group_label, size_label, active, group_sort_order, sort_order)
values
  ('00000000-0000-4000-8000-000000000101', 'women', 'Women', 'EU 36', true, 10, 10),
  ('00000000-0000-4000-8000-000000000102', 'women', 'Women', 'EU 37', true, 10, 20),
  ('00000000-0000-4000-8000-000000000103', 'women', 'Women', 'EU 38', true, 10, 30),
  ('00000000-0000-4000-8000-000000000104', 'women', 'Women', 'EU 39', true, 10, 40),
  ('00000000-0000-4000-8000-000000000105', 'women', 'Women', 'EU 40', true, 10, 50),
  ('00000000-0000-4000-8000-000000000106', 'women', 'Women', 'EU 41', true, 10, 60),
  ('00000000-0000-4000-8000-000000000201', 'men', 'Men', 'EU 39', true, 20, 10),
  ('00000000-0000-4000-8000-000000000202', 'men', 'Men', 'EU 40', true, 20, 20),
  ('00000000-0000-4000-8000-000000000203', 'men', 'Men', 'EU 41', true, 20, 30),
  ('00000000-0000-4000-8000-000000000204', 'men', 'Men', 'EU 42', true, 20, 40),
  ('00000000-0000-4000-8000-000000000205', 'men', 'Men', 'EU 43', true, 20, 50),
  ('00000000-0000-4000-8000-000000000206', 'men', 'Men', 'EU 44', true, 20, 60),
  ('00000000-0000-4000-8000-000000000207', 'men', 'Men', 'EU 45', true, 20, 70),
  ('00000000-0000-4000-8000-000000000301', 'display-presets', 'Display Presets', 'EU 38-44', true, 30, 10),
  ('00000000-0000-4000-8000-000000000302', 'display-presets', 'Display Presets', 'EU 39-45', true, 30, 20),
  ('00000000-0000-4000-8000-000000000303', 'display-presets', 'Display Presets', 'EU 40-46', true, 30, 30)
on conflict (id) do update
set
  group_key = excluded.group_key,
  group_label = excluded.group_label,
  size_label = excluded.size_label,
  active = excluded.active,
  group_sort_order = excluded.group_sort_order,
  sort_order = excluded.sort_order;
