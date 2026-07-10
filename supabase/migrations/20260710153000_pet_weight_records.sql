create table if not exists public.pet_weight_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  weight_kg numeric(8,2) not null check (weight_kg > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pet_weight_records_pet_idx on public.pet_weight_records(pet_id, created_at desc);

alter table public.pet_weight_records enable row level security;

drop policy if exists "members view weight records" on public.pet_weight_records;
create policy "members view weight records" on public.pet_weight_records for select to authenticated
using (exists (select 1 from public.pet_members m where m.pet_id = pet_weight_records.pet_id and m.user_id = (select auth.uid())));

drop policy if exists "editors create weight records" on public.pet_weight_records;
create policy "editors create weight records" on public.pet_weight_records for insert to authenticated
with check (exists (select 1 from public.pet_members m where m.pet_id = pet_weight_records.pet_id and m.user_id = (select auth.uid()) and m.can_edit));

drop policy if exists "editors update weight records" on public.pet_weight_records;
create policy "editors update weight records" on public.pet_weight_records for update to authenticated
using (exists (select 1 from public.pet_members m where m.pet_id = pet_weight_records.pet_id and m.user_id = (select auth.uid()) and m.can_edit))
with check (exists (select 1 from public.pet_members m where m.pet_id = pet_weight_records.pet_id and m.user_id = (select auth.uid()) and m.can_edit));

drop policy if exists "editors delete weight records" on public.pet_weight_records;
create policy "editors delete weight records" on public.pet_weight_records for delete to authenticated
using (exists (select 1 from public.pet_members m where m.pet_id = pet_weight_records.pet_id and m.user_id = (select auth.uid()) and m.can_edit));
