create or replace function public.invite_pet_member(
  target_pet_id uuid,
  target_phone text,
  target_role public.pet_member_role default 'caregiver',
  target_can_edit boolean default true
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user_id uuid;
begin
  if not private.is_pet_owner(target_pet_id) then
    raise exception 'Only pet owners can add members';
  end if;

  select id into target_user_id from auth.users where phone = target_phone limit 1;
  if target_user_id is null then
    raise exception 'No registered user was found for this phone number';
  end if;

  insert into public.pet_members (pet_id, user_id, role, can_edit, invited_by)
  values (target_pet_id, target_user_id, target_role, target_can_edit, (select auth.uid()))
  on conflict (pet_id, user_id) do update
  set role = excluded.role, can_edit = excluded.can_edit, invited_by = excluded.invited_by;

  return jsonb_build_object('success', true, 'user_id', target_user_id);
end;
$$;

revoke all on function public.invite_pet_member(uuid, text, public.pet_member_role, boolean) from public;
grant execute on function public.invite_pet_member(uuid, text, public.pet_member_role, boolean) to authenticated;
