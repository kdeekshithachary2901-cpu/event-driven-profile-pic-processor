import { createClient } from 'https://esm.sh'
import { resize } from 'https://deno.land'

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const bucketId = payload.record.bucket_id;
    const name = payload.record.name; // e.g., "user-1718293.jpg"

    // 1. Only process images coming from the 'avatars' storage bucket
    if (bucketId !== 'avatars') {
      return new Response(JSON.stringify({ message: "Not an avatar upload." }), { status: 200 });
    }

    // 2. Initialize Supabase client inside the background environment
    // Note: Supabase automatically provides these system environment variables to Edge Functions
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 3. Download the original uploaded image file into RAM buffer memory
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('avatars')
      .download(name);

    if (downloadError || !fileData) throw new Error(`Download failed: ${downloadError?.message}`);

    // 4. Convert file data blob to an array buffer for the processing engine
    const imageBuffer = new Uint8Array(await fileData.arrayBuffer());

    // 5. Resize the profile picture to 150x150 pixels automatically
    const resizedImage = await resize(imageBuffer, {
      width: 150,
      height: 150,
      mode: 'cover' // Crops nicely into a perfect profile square
    });

    // 6. Upload and overwrite the original file with the new optimized/shrunk version
    const { error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(name, resizedImage, {
        contentType: fileData.type,
        upsert: true // Crucial: Tells Supabase to replace the heavy file
      });

    if (uploadError) throw new Error(`Optimization upload failed: ${uploadError.message}`);

    console.log(`Successfully processed and shrunk profile picture: ${name}`);
    return new Response(JSON.stringify({ optimized: true, file: name }), { status: 200 });

  } catch (error) {
    console.error(`Error processing event: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
});
   
