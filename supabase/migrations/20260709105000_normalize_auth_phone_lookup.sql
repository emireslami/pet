create or replace function public.get_auth_user_id_by_phone(target_phone text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id
  from auth.users
  where regexp_replace(coalesce(phone, ''), '\D', '', 'g')
      = regexp_replace(coalesce(target_phone, ''), '\D', '', 'g')
  limit 1;
$$;

revoke all on function public.get_auth_user_id_by_phone(text) from anon, authenticated;
grant execute on function public.get_auth_user_id_by_phone(text) to service_role;
