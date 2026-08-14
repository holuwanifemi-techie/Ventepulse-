import { supabase } from './supabase';
import { UserProfile } from '../types/database';

/**
 * Fetch profile data for the logged-in user.
 */
export async function getUserProfile(userId: string): Promise<{ data: UserProfile | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, is_admin, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return { data: data as UserProfile | null, error: null };
  } catch (err: any) {
    return { data: null, error: new Error(err.message || 'Failed to fetch user profile') };
  }
}

/**
 * Update full_name or avatar_url for current user's profile.
 */
export async function updateUserProfile(
  userId: string,
  updates: { full_name?: string; avatar_url?: string }
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
      })
      .eq('id', userId);

    if (error) throw new Error(error.message);
    return { error: null };
  } catch (err: any) {
    return { error: new Error(err.message || 'Failed to update profile') };
  }
}

/**
 * Upload profile picture to Supabase Storage 'avatars' bucket with base64 fallback.
 */
export async function uploadAvatarImage(
  userId: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  try {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      return { url: null, error: new Error('Please select a JPG, PNG, or WEBP image file.') };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { url: null, error: new Error('Image size must be under 5MB.') };
    }

    const fileExt = file.name.split('.').pop() || 'png';
    const filePath = `${userId}/avatar_${Date.now()}.${fileExt}`;

    // Attempt Supabase Storage Upload
    try {
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (!uploadErr) {
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return { url: publicUrlData.publicUrl, error: null };
        }
      }
    } catch (storageErr) {
      console.warn('[Storage Notice] Bucket upload fallback to Data URL:', storageErr);
    }

    // Fail-safe fallback: Convert to Data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve({ url: reader.result, error: null });
        } else {
          resolve({ url: null, error: new Error('Failed to read image file.') });
        }
      };
      reader.onerror = () => {
        resolve({ url: null, error: new Error('Failed to read image file.') });
      };
      reader.readAsDataURL(file);
    });
  } catch (err: any) {
    return { url: null, error: new Error(err.message || 'Failed to upload image') };
  }
}

/**
 * Delete user account, business data, leads, followups, and profile securely.
 */
export async function deleteOwnAccount(userId: string): Promise<{ error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return { error: new Error('Unauthorized. You can only delete your own account.') };
    }

    // 1. Delete user followups
    await supabase.from('followups').delete().eq('user_id', userId);

    // 2. Delete user leads
    await supabase.from('leads').delete().eq('user_id', userId);

    // 3. Delete user business profile
    await supabase.from('businesses').delete().eq('user_id', userId);

    // 4. Delete user profile record
    const { error: profileErr } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileErr) {
      throw new Error(profileErr.message);
    }

    // 5. Sign out user
    await supabase.auth.signOut();

    return { error: null };
  } catch (err: any) {
    return { error: new Error(err.message || 'Failed to delete account') };
  }
}
