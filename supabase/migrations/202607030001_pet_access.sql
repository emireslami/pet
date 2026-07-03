create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  species text,
  breed text,
  birth_date date,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create type public.pet_member_role as enum ('owner', 'caregiver', 'veterinarian', 'viewer');

create table if not exists public.pet_members (
  pet_id uuid not null references public.pets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.pet_member_role not null default 'caregiver',
  can_edit boolean not null default true,
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  primary key (pet_id, user_id)
);

create index if not exists pet_members_user_id_idx on public.pet_members(user_id);
create index if not exists pet_members_pet_id_idx on public.pet_members(pet_id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.phone)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.add_pet_owner() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.pet_members (pet_id, user_id, role, can_edit)
  values (new.id, new.created_by, 'owner', true)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_pet_created on public.pets;
create trigger on_pet_created after insert on public.pets for each row execute procedure public.add_pet_owner();

alter table public.profiles enable row level security;
alter table public.pets enable row level security;
alter table public.pet_members enable row level security;

create schema if not exists private;
revoke all on schema private from public;

create or replace function private.has_pet_access(target_pet_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.pet_members
    where pet_id = target_pet_id and user_id = (select auth.uid())
  );
$$;

create or replace function private.can_edit_pet(target_pet_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.pet_members
    where pet_id = target_pet_id and user_id = (select auth.uid()) and can_edit
  );
$$;

create or replace function private.is_pet_owner(target_pet_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.pet_members
    where pet_id = target_pet_id and user_id = (select auth.uid()) and role = 'owner'
  );
$$;

create policy "profile self read" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profile self update" on public.profiles for update to authenticated using ((select auth.uid()) = id);

create policy "members can read pets" on public.pets for select to authenticated using (
  private.has_pet_access(id)
);
create policy "users can create pets" on public.pets for insert to authenticated with check ((select auth.uid()) = created_by);
create policy "editors can update pets" on public.pets for update to authenticated using (
  private.can_edit_pet(id)
);

create policy "members can read memberships" on public.pet_members for select to authenticated using (
  private.has_pet_access(pet_id)
);
create policy "owners manage memberships" on public.pet_members for all to authenticated using (
  private.is_pet_owner(pet_id)
) with check (
  private.is_pet_owner(pet_id)
);
