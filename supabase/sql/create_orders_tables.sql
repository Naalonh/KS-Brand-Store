create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique check (char_length(trim(order_number)) between 1 and 40),
  customer_name text not null default '',
  customer_phone text not null default '',
  customer_address text not null default '',
  note text not null default '',
  status text not null default 'pending' check (status in ('pending', 'paid', 'fulfilled', 'cancelled')),
  total_price numeric(12, 2) not null default 0 check (total_price >= 0),
  total_price_label text not null default '0$',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_shares (
  id uuid primary key default gen_random_uuid(),
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  status text not null default 'shared' check (status in ('shared', 'converted')),
  total_price numeric(12, 2) not null default 0 check (total_price >= 0),
  total_price_label text not null default '0$',
  converted_order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null check (char_length(trim(product_name)) between 1 and 160),
  product_image text not null check (product_image ~* '^https?://'),
  size text not null default '',
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null default 0 check (unit_price >= 0),
  unit_price_label text not null default '0$',
  total_price numeric(12, 2) not null default 0 check (total_price >= 0),
  total_price_label text not null default '0$',
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx
  on public.orders (created_at desc);

create index if not exists orders_status_created_at_idx
  on public.orders (status, created_at desc);

create index if not exists order_shares_created_at_idx
  on public.order_shares (created_at desc);

create index if not exists order_shares_status_created_at_idx
  on public.order_shares (status, created_at desc);

create index if not exists order_shares_converted_order_id_idx
  on public.order_shares (converted_order_id);

create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

create index if not exists order_items_product_id_idx
  on public.order_items (product_id);

create schema if not exists private;

create or replace function private.can_insert_order_item(target_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders
    where id = target_order_id
      and status = 'pending'
  );
$$;

revoke all on function private.can_insert_order_item(uuid) from public;
grant execute on function private.can_insert_order_item(uuid) to anon, authenticated;

create or replace function public.set_orders_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_orders_updated_at on public.orders;

create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_orders_updated_at();

drop trigger if exists set_order_shares_updated_at on public.order_shares;

create trigger set_order_shares_updated_at
before update on public.order_shares
for each row
execute function public.set_orders_updated_at();

alter table public.orders enable row level security;
alter table public.order_shares enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Customers can create pending orders" on public.orders;
drop policy if exists "Admins can create pending orders" on public.orders;
drop policy if exists "Admins can view orders" on public.orders;
drop policy if exists "Admins can update orders" on public.orders;
drop policy if exists "Admins can delete orders" on public.orders;

drop policy if exists "Customers can create order shares" on public.order_shares;
drop policy if exists "Admins can view order shares" on public.order_shares;
drop policy if exists "Admins can update order shares" on public.order_shares;
drop policy if exists "Admins can delete order shares" on public.order_shares;

drop policy if exists "Customers can create order items" on public.order_items;
drop policy if exists "Customers can create order items for pending orders" on public.order_items;
drop policy if exists "Admins can create order items for pending orders" on public.order_items;
drop policy if exists "Admins can view order items" on public.order_items;
drop policy if exists "Admins can update order items" on public.order_items;
drop policy if exists "Admins can delete order items" on public.order_items;

create policy "Admins can create pending orders"
on public.orders
for insert
to authenticated
with check (status = 'pending' and (select public.is_admin()));

create policy "Admins can view orders"
on public.orders
for select
to authenticated
using ((select public.is_admin()));

create policy "Admins can update orders"
on public.orders
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins can delete orders"
on public.orders
for delete
to authenticated
using ((select public.is_admin()));

create policy "Customers can create order shares"
on public.order_shares
for insert
to anon, authenticated
with check (status = 'shared' and converted_order_id is null);

create policy "Admins can view order shares"
on public.order_shares
for select
to authenticated
using ((select public.is_admin()));

create policy "Admins can update order shares"
on public.order_shares
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins can delete order shares"
on public.order_shares
for delete
to authenticated
using ((select public.is_admin()));

create policy "Admins can create order items for pending orders"
on public.order_items
for insert
to authenticated
with check (
  (select public.is_admin())
  and (select private.can_insert_order_item(order_id))
);

create policy "Admins can view order items"
on public.order_items
for select
to authenticated
using ((select public.is_admin()));

create policy "Admins can update order items"
on public.order_items
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins can delete order items"
on public.order_items
for delete
to authenticated
using ((select public.is_admin()));

revoke all on table public.orders from anon, authenticated;
revoke all on table public.order_shares from anon, authenticated;
revoke all on table public.order_items from anon, authenticated;
grant insert on table public.orders to authenticated;
grant insert on table public.order_shares to anon, authenticated;
grant select, update, delete on table public.order_shares to authenticated;
grant insert on table public.order_items to authenticated;
grant select, update, delete on table public.orders to authenticated;
grant select, update, delete on table public.order_items to authenticated;

notify pgrst, 'reload schema';
