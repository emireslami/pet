alter table public.pets
add column if not exists archived_at timestamptz;

create index if not exists pets_active_created_at_idx
on public.pets (created_at)
where archived_at is null;
