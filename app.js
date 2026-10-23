import { createClient } from 'https://esm.sh'

// 1. Initialize your Supabase client connection
const supabase = createClient('https://supabase.co', 'sb_publishable_6_uBDWWPpuLHRvnJw-Gxxw_UulNEOB2')

async function uploadProfilePicture(fileInputEvent) {
  const file = fileInputEvent.target.files[0]
  if (!file) return;

  // Generate a clean, unique file name for the user profile
  const fileExtension = file.name.split('.').pop()
  const fileName = `user-${Date.now()}.${fileExtension}`

  // 2. Upload the file to your 'avatars' storage bucket
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Upload failed:', error.message)
  } else {
    console.log('Upload successful! File saved at:', data.path)
    // This insert event will automatically trigger your background processor!
  }
}
