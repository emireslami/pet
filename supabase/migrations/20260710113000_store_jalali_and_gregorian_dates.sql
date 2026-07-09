alter table public.pets add column if not exists birth_date_jalali text;
alter table public.pets add column if not exists passport_issue_date_jalali text;
alter table public.pets add column if not exists microchip_implant_date_jalali text;

alter table public.medical_records add column if not exists event_date_gregorian date;
alter table public.medical_records add column if not exists event_date_jalali text;

alter table public.pet_preventive_care_records add column if not exists administered_at_jalali text;
alter table public.pet_preventive_care_records add column if not exists next_relevant_date_jalali text;

alter table public.pet_surgical_history add column if not exists performed_at_jalali text;

alter table public.pet_rabies_antibody_certificates add column if not exists issued_at_jalali text;
