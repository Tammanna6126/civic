import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://quqiwofieqybsnrpyxpc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload an image to Supabase Storage bucket 'complaint-evidence'
 * Falls back to Base64 data URL if bucket is not yet provisioned
 */
export async function uploadComplaintImage(file: File): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `complaints/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('complaint-evidence')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      console.warn('Storage bucket upload issue, falling back to local base64:', uploadError.message);
      return fileToBase64(file);
    }

    const { data } = supabase.storage.from('complaint-evidence').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.warn('Fallback to base64 for image upload:', err);
    return fileToBase64(file);
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
