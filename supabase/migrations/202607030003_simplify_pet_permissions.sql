drop function if exists public.invite_pet_member(uuid, text, public.pet_member_role, boolean);

create or replace function public.set_pet_member_access(
  target_pet_id uuid,
  target_phone text,
  access_level text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user_id uuid;
  edit_access boolean;
begin
  if not private.is_pet_owner(target_pet_id) then
    raise exception 'Only pet owners can manage access';
  end if;

  if access_level not in ('view', 'edit') then
    raise exception 'Invalid access level';
  end if;
  edit_access := access_level = 'edit';

  select id into target_user_id from auth.users where phone = target_phone limit 1;
  if target_user_id is null then
    raise exception 'No registered user was found for this phone number';
  end if;

  if target_user_id = (select auth.uid()) then
    raise exception 'Owner access cannot be changed';
  end if;

  insert into public.pet_members (pet_id, user_id, role, can_edit, invited_by)
  values (target_pet_id, target_user_id, 'caregiver', edit_access, (select auth.uid()))
  on conflict (pet_id, user_id) do update
  set role = 'caregiver', can_edit = excluded.can_edit, invited_by = excluded.invited_by;

  return jsonb_build_object('success', true, 'access_level', access_level);
end;
$$;

revoke all on function public.set_pet_member_access(uuid, text, text) from public;
grant execute on function public.set_pet_member_access(uuid, text, text) to authenticated;

create or replace function public.remove_pet_member(
  target_pet_id uuid,
  target_phone text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user_id uuid;
begin
  if not private.is_pet_owner(target_pet_id) then
    raise exception 'Only pet owners can manage access';
  end if;
  select id into target_user_id from auth.users where phone = target_phone limit 1;
  if target_user_id is null then raise exception 'User not found'; end if;
  delete from public.pet_members where pet_id = target_pet_id and user_id = target_user_id and role <> 'owner';
  return jsonb_build_object('success', true);
end;
$$;

revoke all on function public.remove_pet_member(uuid, text) from public;
grant execute on function public.remove_pet_member(uuid, text) to authenticated;
