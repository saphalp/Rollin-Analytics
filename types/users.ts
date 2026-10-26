export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  university: string | null;
  major: string | null;
  profile_picture: string | null;
  profile_completed: boolean;
  is_educational_email: boolean | null;
  is_private: boolean;
  is_driver: boolean;
  created_at: string;
};

export type AdminUser = Profile & {
  banned_until: string | null;
  last_sign_in_at: string | null;
};
