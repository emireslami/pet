alter table public.profiles add column if not exists first_name_fa text;
alter table public.profiles add column if not exists last_name_fa text;
alter table public.profiles add column if not exists address_fa text;
alter table public.profiles add column if not exists first_name_en text;
alter table public.profiles add column if not exists last_name_en text;
alter table public.profiles add column if not exists address_en text;
alter table public.profiles add column if not exists phone_number text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

update public.profiles set phone_number = coalesce(phone_number, phone);

drop policy if exists "profile self insert" on public.profiles;
create policy "profile self insert" on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);

alter table public.pets add column if not exists color text;
alter table public.pets add column if not exists distinctive_marks text;
alter table public.pets add column if not exists is_neutered boolean;
alter table public.pets add column if not exists passport_number text;
alter table public.pets add column if not exists passport_issue_date date;
alter table public.pets add column if not exists microchip_implant_date date;
alter table public.pets add column if not exists issuing_veterinarian_name text;
alter table public.pets add column if not exists updated_at timestamptz not null default now();

create table if not exists public.pet_preventive_care_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  type text not null check (type in ('RABIES_VACCINATION','ANTI_PARASITIC_TREATMENT','OTHER_VACCINATION')),
  substance_name text,
  administered_at date,
  next_relevant_date date,
  veterinarian_name text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pet_surgical_history (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  procedure_name text,
  description text,
  performed_at date,
  veterinarian_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pet_rabies_antibody_certificates (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  veterinarian_name text,
  address text,
  telephone_number text,
  email text,
  issued_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pet_preventive_care_records_pet_idx on public.pet_preventive_care_records(pet_id, created_at desc);
create index if not exists pet_preventive_care_records_type_idx on public.pet_preventive_care_records(type);
create index if not exists pet_surgical_history_pet_idx on public.pet_surgical_history(pet_id, created_at desc);
create index if not exists pet_rabies_antibody_certificates_pet_idx on public.pet_rabies_antibody_certificates(pet_id, created_at desc);

alter table public.pet_preventive_care_records enable row level security;
alter table public.pet_surgical_history enable row level security;
alter table public.pet_rabies_antibody_certificates enable row level security;

drop policy if exists "members view preventive care" on public.pet_preventive_care_records;
create policy "members view preventive care" on public.pet_preventive_care_records for select to authenticated
using (private.has_pet_access(pet_id));
drop policy if exists "editors create preventive care" on public.pet_preventive_care_records;
create policy "editors create preventive care" on public.pet_preventive_care_records for insert to authenticated
with check (private.can_edit_pet(pet_id));
drop policy if exists "editors update preventive care" on public.pet_preventive_care_records;
create policy "editors update preventive care" on public.pet_preventive_care_records for update to authenticated
using (private.can_edit_pet(pet_id)) with check (private.can_edit_pet(pet_id));
drop policy if exists "editors delete preventive care" on public.pet_preventive_care_records;
create policy "editors delete preventive care" on public.pet_preventive_care_records for delete to authenticated
using (private.can_edit_pet(pet_id));

drop policy if exists "members view surgical history" on public.pet_surgical_history;
create policy "members view surgical history" on public.pet_surgical_history for select to authenticated
using (private.has_pet_access(pet_id));
drop policy if exists "editors create surgical history" on public.pet_surgical_history;
create policy "editors create surgical history" on public.pet_surgical_history for insert to authenticated
with check (private.can_edit_pet(pet_id));
drop policy if exists "editors update surgical history" on public.pet_surgical_history;
create policy "editors update surgical history" on public.pet_surgical_history for update to authenticated
using (private.can_edit_pet(pet_id)) with check (private.can_edit_pet(pet_id));
drop policy if exists "editors delete surgical history" on public.pet_surgical_history;
create policy "editors delete surgical history" on public.pet_surgical_history for delete to authenticated
using (private.can_edit_pet(pet_id));

drop policy if exists "members view rabies antibody certificates" on public.pet_rabies_antibody_certificates;
create policy "members view rabies antibody certificates" on public.pet_rabies_antibody_certificates for select to authenticated
using (private.has_pet_access(pet_id));
drop policy if exists "editors create rabies antibody certificates" on public.pet_rabies_antibody_certificates;
create policy "editors create rabies antibody certificates" on public.pet_rabies_antibody_certificates for insert to authenticated
with check (private.can_edit_pet(pet_id));
drop policy if exists "editors update rabies antibody certificates" on public.pet_rabies_antibody_certificates;
create policy "editors update rabies antibody certificates" on public.pet_rabies_antibody_certificates for update to authenticated
using (private.can_edit_pet(pet_id)) with check (private.can_edit_pet(pet_id));
drop policy if exists "editors delete rabies antibody certificates" on public.pet_rabies_antibody_certificates;
create policy "editors delete rabies antibody certificates" on public.pet_rabies_antibody_certificates for delete to authenticated
using (private.can_edit_pet(pet_id));
