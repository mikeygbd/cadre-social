-- Copy display_name from auth metadata into profiles on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data->>'display_name'), '')
  );
  return new;
end;
$$;

-- Backfill existing users who signed up before this fix
update public.profiles p
set display_name = nullif(trim(u.raw_user_meta_data->>'display_name'), '')
from auth.users u
where p.id = u.id
  and p.display_name is null
  and nullif(trim(u.raw_user_meta_data->>'display_name'), '') is not null;
