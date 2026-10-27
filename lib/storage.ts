// Public storage URLs, resolved the same way the Rollin app does (see its lib/profile/resolve-avatar-uri.ts).
function publicUrl(bucket: string, path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

export const avatarUrl = (path: string | null | undefined) => publicUrl("avatars", path);
export const postImageUrl = (path: string | null | undefined) => publicUrl("activity-photos", path);
