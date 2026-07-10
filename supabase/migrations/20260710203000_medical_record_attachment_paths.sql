alter table public.medical_records
add column if not exists attachment_paths text[];
