// This function runs automatically when a profile picture is uploaded
Deno.serve(async (req) => {
  try {
    // 1. Parse the incoming trigger event payload from Supabase
    const payload = await req.json();
    console.log("Received storage event payload:", payload);

    // 2. Extract the file details (bucket ID and file name)
    const bucketId = payload.record.bucket_id;
    const name = payload.record.name;

    // 3. Check if the file was uploaded to your profile pictures bucket
    if (bucketId !== 'avatars') {
      return new Response(JSON.stringify({ message: "Not an avatar upload. Skipping." }), { status: 200 });
    }

    console.log(`Processing profile picture: ${name} from bucket: ${bucketId}`);

    // TODO: Add your image optimization/resizing logic here

    return new Response(JSON.stringify({ success: true, file: name }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400
    });
  }
});
