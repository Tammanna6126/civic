import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://quqiwofieqybsnrpyxpc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1cWl3b2ZpZXF5YnNucnB5eHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMjU2NjMsImV4cCI6MjEwODkwMTY2M30.4ALE37bcI3ZytD4kiDbRG8sLh4_rBMgejCMv6S_A14Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload an image to Supabase Storage bucket 'complaint-evidence'
 * Falls back to optimized Base64 data URL if bucket is not yet provisioned
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
      console.warn('Storage bucket upload issue, falling back to local compressed base64:', uploadError.message);
      return compressImage(file);
    }

    const { data } = supabase.storage.from('complaint-evidence').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.warn('Fallback to compressed base64 for image upload:', err);
    return compressImage(file);
  }
}

/**
 * Lightweight client-side image compression to prevent memory/payload limit errors
 */
function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target?.result as string || '');
    };
    reader.onerror = () => resolve('');
  });
}
