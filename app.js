import { createClient } from 'https://jsdelivr.net';

// Replace these placeholders with your actual copied strings from your Supabase settings!
const supabaseUrl = 'https://yrfjgzakunovdgcrhkzl.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_6_uBDWWPpuLHRvnJw-Gxxw_UulNEOB2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadProfilePicture(fileInputEvent) {
  const file = fileInputEvent.target.files[0];
  if (!file) return;

  const fileExtension = file.name.split('.').pop();
  const fileName = `user-${Date.now()}.${fileExtension}`;

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Upload failed:', error.message);
  } else {
    console.log('Upload successful! File saved at:', data.path);
  }
}
