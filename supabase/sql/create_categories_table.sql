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

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]{0,62}$'),
  name text not null check (char_length(trim(name)) between 1 and 120),
  product_count integer not null default 0 check (product_count >= 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_slug_unique unique (slug)
);

alter table public.categories
drop column if exists description;

create index if not exists categories_active_sort_order_idx
  on public.categories (active, sort_order, created_at desc);

create or replace function public.set_categories_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_categories_updated_at on public.categories;

create trigger set_categories_updated_at
before update on public.categories
for each row
execute function public.set_categories_updated_at();

alter table public.categories enable row level security;

drop policy if exists "Anyone can view active categories" on public.categories;
drop policy if exists "Authenticated read active categories or admin all" on public.categories;
drop policy if exists "Admins can create categories" on public.categories;
drop policy if exists "Admins can update categories" on public.categories;
drop policy if exists "Admins can delete categories" on public.categories;

create policy "Anyone can view active categories"
on public.categories
for select
to anon
using (active = true);

create policy "Authenticated read active categories or admin all"
on public.categories
for select
to authenticated
using (active = true or (select public.is_admin()));

create policy "Admins can create categories"
on public.categories
for insert
to authenticated
with check ((select public.is_admin()));

create policy "Admins can update categories"
on public.categories
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins can delete categories"
on public.categories
for delete
to authenticated
using ((select public.is_admin()));

revoke all on table public.categories from anon, authenticated;
grant select on table public.categories to anon;
grant select, insert, update, delete on table public.categories to authenticated;

insert into public.categories
  (id, slug, name, product_count, active, sort_order)
values
  (
    '00000000-0000-4000-8000-000000000401',
    'new-arrivals',
    'New Arrivals',
    3,
    true,
    10
  ),
  (
    '00000000-0000-4000-8000-000000000402',
    'sneakers',
    'Sneakers',
    2,
    true,
    20
  ),
  (
    '00000000-0000-4000-8000-000000000403',
    'court-shoes',
    'Court Shoes',
    1,
    true,
    30
  ),
  (
    '00000000-0000-4000-8000-000000000404',
    'limited-drops',
    'Limited Drops',
    0,
    false,
    40
  )
on conflict (id) do update
set
  slug = excluded.slug,
  name = excluded.name,
  product_count = excluded.product_count,
  active = excluded.active,
  sort_order = excluded.sort_order;
