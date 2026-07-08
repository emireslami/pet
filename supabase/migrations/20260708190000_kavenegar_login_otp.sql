create table if not exists public.login_otps (
  id uuid primary key default gen_random_uuid(),
  phone text not null check (phone ~ '^\+989[0-9]{9}$'),
  code_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  attempts integer not null default 0,
  consumed_at timestamptz
);

create index if not exists login_otps_phone_created_idx on public.login_otps(phone, created_at desc);
create index if not exists login_otps_active_idx on public.login_otps(phone, expires_at)
  where consumed_at is null;

alter table public.login_otps enable row level security;

revoke all on table public.login_otps from anon, authenticated;
grant all on table public.login_otps to service_role;

create or replace function public.get_auth_user_id_by_phone(target_phone text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id
  from auth.users
  where phone = target_phone
  limit 1;
$$;

revoke all on function public.get_auth_user_id_by_phone(text) from anon, authenticated;
grant execute on function public.get_auth_user_id_by_phone(text) to service_role;
