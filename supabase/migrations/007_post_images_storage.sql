-- Post image storage bucket and RLS policies.
-- Files are stored at: post-images/{user_id}/{uuid}.{ext}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images',
  'post-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "Post images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "Users can upload post images to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'post-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own post images"
  on storage.objects for delete
  using (
    bucket_id = 'post-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
