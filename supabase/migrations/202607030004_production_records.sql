alter table public.pets add column if not exists gender text;
alter table public.pets add column if not exists current_weight numeric(8,2);
alter table public.pets add column if not exists microchip_number text;

create table if not exists public.medical_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  record_type text not null,
  title text,
  event_date text,
  clinic text,
  veterinarian text,
  diagnosis text,
  medications text,
  amount text,
  notes text,
  attachment_path text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists medical_records_pet_id_idx on public.medical_records(pet_id);
create index if not exists medical_records_created_at_idx on public.medical_records(created_at desc);
alter table public.medical_records enable row level security;

create policy "members view medical records" on public.medical_records for select to authenticated
using (private.has_pet_access(pet_id));
create policy "editors create medical records" on public.medical_records for insert to authenticated
with check (private.can_edit_pet(pet_id) and created_by = (select auth.uid()));
create policy "editors update medical records" on public.medical_records for update to authenticated
using (private.can_edit_pet(pet_id)) with check (private.can_edit_pet(pet_id));
create policy "editors delete medical records" on public.medical_records for delete to authenticated
using (private.can_edit_pet(pet_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pet-documents', 'pet-documents', false, 10485760, array['image/jpeg','image/png','image/webp','image/heic','application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "members view pet documents" on storage.objects for select to authenticated
using (bucket_id = 'pet-documents' and private.has_pet_access(((storage.foldername(name))[1])::uuid));
create policy "editors upload pet documents" on storage.objects for insert to authenticated
with check (bucket_id = 'pet-documents' and private.can_edit_pet(((storage.foldername(name))[1])::uuid));
create policy "editors delete pet documents" on storage.objects for delete to authenticated
using (bucket_id = 'pet-documents' and private.can_edit_pet(((storage.foldername(name))[1])::uuid));

-- Remove all prototype/sample domain data. Auth accounts are intentionally preserved.
truncate table public.medical_records, public.pet_members, public.pets restart identity cascade;
