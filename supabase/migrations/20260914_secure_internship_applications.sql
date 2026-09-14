-- Existing table used by both internship forms and the admin dashboard:
-- public.internship_applications
--
-- This migration intentionally does not alter application rows or add a second table.
-- It locks personal data to the existing authorized admin UID while retaining the
-- public INSERT required by the public application form.

alter table public.internship_applications enable row level security;

drop policy if exists "Public can submit internship applications" on public.internship_applications;
create policy "Public can submit internship applications"
  on public.internship_applications for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Authorized admin can read internship applications" on public.internship_applications;
create policy "Authorized admin can read internship applications"
  on public.internship_applications for select
  to authenticated
  using (auth.uid() = '67f399fc-0ce3-4589-b1b4-ef7de2541cda'::uuid);

drop policy if exists "Authorized admin can update internship applications" on public.internship_applications;
create policy "Authorized admin can update internship applications"
  on public.internship_applications for update
  to authenticated
  using (auth.uid() = '67f399fc-0ce3-4589-b1b4-ef7de2541cda'::uuid)
  with check (auth.uid() = '67f399fc-0ce3-4589-b1b4-ef7de2541cda'::uuid);

-- Resume paths (not public URLs) are saved in resume_url going forward. The bucket
-- becomes private; only the existing admin UID may create a signed download URL.
update storage.buckets set public = false where id = 'internship-resumes';

drop policy if exists "Anyone can upload internship resumes" on storage.objects;
create policy "Anyone can upload internship resumes"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'internship-resumes');

drop policy if exists "Authorized admin can read internship resumes" on storage.objects;
create policy "Authorized admin can read internship resumes"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'internship-resumes' and auth.uid() = '67f399fc-0ce3-4589-b1b4-ef7de2541cda'::uuid);
