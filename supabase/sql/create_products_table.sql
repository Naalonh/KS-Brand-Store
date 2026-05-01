create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  price text not null check (char_length(trim(price)) between 1 and 40),
  sizes text not null check (char_length(trim(sizes)) between 1 and 120),
  tag text not null check (char_length(trim(tag)) between 1 and 80),
  image_url text not null check (image_url ~* '^https?://'),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_active_sort_order_idx
  on public.products (active, sort_order, created_at desc);

create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;

create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_products_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

alter table public.products enable row level security;

drop policy if exists "Anyone can view active products" on public.products;
drop policy if exists "Admins can view all products" on public.products;
drop policy if exists "Authenticated users can view active products and admins can view all" on public.products;
drop policy if exists "Authenticated read active or admin all" on public.products;
drop policy if exists "Admins can create products" on public.products;
drop policy if exists "Admins can update products" on public.products;
drop policy if exists "Admins can delete products" on public.products;

create policy "Anyone can view active products"
on public.products
for select
to anon
using (active = true);

create policy "Authenticated read active or admin all"
on public.products
for select
to authenticated
using (active = true or (select public.is_admin()));

create policy "Admins can create products"
on public.products
for insert
to authenticated
with check ((select public.is_admin()));

create policy "Admins can update products"
on public.products
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins can delete products"
on public.products
for delete
to authenticated
using ((select public.is_admin()));

revoke all on table public.products from anon, authenticated;
grant select on table public.products to anon;
grant select, insert, update, delete on table public.products to authenticated;

insert into public.products
  (id, name, price, sizes, tag, image_url, active, sort_order)
values
  (
    '00000000-0000-4000-8000-000000000001',
    'Noir Runner',
    '$129',
    'EU 39-45',
    'Premium sneaker',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    true,
    10
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    'Aurum Court',
    '$148',
    'EU 38-44',
    'Leather court shoe',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
    true,
    20
  ),
  (
    '00000000-0000-4000-8000-000000000003',
    'Monarch Low',
    '$156',
    'EU 40-46',
    'Minimal luxury fit',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80',
    true,
    30
  )
on conflict (id) do update
set
  name = excluded.name,
  price = excluded.price,
  sizes = excluded.sizes,
  tag = excluded.tag,
  image_url = excluded.image_url,
  active = excluded.active,
  sort_order = excluded.sort_order;

-- After creating an Auth user in Supabase Dashboard, run this with their email.
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where email = 'admin@ksbrand.store';
