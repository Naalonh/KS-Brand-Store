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
  name text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sizes
add column if not exists name text;

alter table public.sizes
add column if not exists active boolean not null default true;

alter table public.sizes
add column if not exists sort_order integer not null default 0;

alter table public.sizes
add column if not exists created_at timestamptz not null default now();

alter table public.sizes
add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sizes'
      and column_name = 'size_label'
  ) then
    execute '
      update public.sizes
      set name = size_label
      where (name is null or char_length(trim(name)) = 0)
        and size_label is not null
    ';
  end if;
end;
$$;

update public.sizes
set name = 'Size ' || left(id::text, 8)
where name is null or char_length(trim(name)) = 0;

alter table public.sizes
alter column name set not null;

alter table public.sizes
drop constraint if exists sizes_group_size_unique;

alter table public.sizes
drop constraint if exists sizes_name_length_check;

alter table public.sizes
add constraint sizes_name_length_check
check (char_length(trim(name)) between 1 and 40);

alter table public.sizes
drop column if exists group_key;

alter table public.sizes
drop column if exists group_label;

alter table public.sizes
drop column if exists size_label;

alter table public.sizes
drop column if exists group_sort_order;

drop index if exists sizes_active_group_sort_order_idx;

create index if not exists sizes_active_sort_order_idx
  on public.sizes (active, sort_order, created_at desc);

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

delete from public.sizes
where id in (
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000202',
  '00000000-0000-4000-8000-000000000203'
)
and name in ('EU 39', 'EU 40', 'EU 41');

insert into public.sizes
  (id, name, active, sort_order)
values
  ('00000000-0000-4000-8000-000000000101', 'EU 36', true, 10),
  ('00000000-0000-4000-8000-000000000102', 'EU 37', true, 20),
  ('00000000-0000-4000-8000-000000000103', 'EU 38', true, 30),
  ('00000000-0000-4000-8000-000000000104', 'EU 39', true, 40),
  ('00000000-0000-4000-8000-000000000105', 'EU 40', true, 50),
  ('00000000-0000-4000-8000-000000000106', 'EU 41', true, 60),
  ('00000000-0000-4000-8000-000000000204', 'EU 42', true, 70),
  ('00000000-0000-4000-8000-000000000205', 'EU 43', true, 80),
  ('00000000-0000-4000-8000-000000000206', 'EU 44', true, 90),
  ('00000000-0000-4000-8000-000000000207', 'EU 45', true, 100),
  ('00000000-0000-4000-8000-000000000301', 'EU 38-44', true, 110),
  ('00000000-0000-4000-8000-000000000302', 'EU 39-45', true, 120),
  ('00000000-0000-4000-8000-000000000303', 'EU 40-46', true, 130)
on conflict (id) do update
set
  name = excluded.name,
  active = excluded.active,
  sort_order = excluded.sort_order;

notify pgrst, 'reload schema';
