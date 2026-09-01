-- Church Website — auto-create a profiles row when a new admin/staff account signs up.
-- New accounts default to 'content_manager' (least privilege); a super_admin promotes them
-- to 'church_staff' or 'super_admin' afterwards via the admin dashboard or SQL editor.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'content_manager'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
