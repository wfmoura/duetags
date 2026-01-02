const { createClient } = require('@supabase/supabase-js');

// Using credentials from config.js
const SUPABASE_URL = "https://gwptcsxlpcqhijodyeaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cHRjc3hscGNxaGlqb2R5ZWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NjA1MDgsImV4cCI6MjA4MTIzNjUwOH0.unY30UgwLs0gYbrFK3Qi4HKQWQfzB0zTBz72Z3xrv-M";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testStorage() {
  const fileName = `test_${Date.now()}.txt`;
  const fileContent = "Hello Supabase";

  console.log(`1. Attempting to upload ${fileName} to 'etiquetas'...`);
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('etiquetas')
    .upload(fileName, fileContent, {
        contentType: 'text/plain',
        upsert: true
    });

  if (uploadError) {
    console.error("❌ Upload failed:", uploadError);
    return;
  }
  console.log("✅ Upload successful:", uploadData);

  // 2. Test Public URL
  const { data: publicUrlData } = supabase.storage
    .from('etiquetas')
    .getPublicUrl(fileName);
    
  console.log(`2. Public URL generated: ${publicUrlData.publicUrl}`);
  
  console.log("   Testing Public URL access...");
  try {
      const res = await fetch(publicUrlData.publicUrl);
      if (res.ok) {
          console.log("   ✅ Public URL is ACCESSIBLE (HTTP 200)");
      } else {
          console.log(`   ❌ Public URL is NOT ACCESSIBLE (HTTP ${res.status}) - Bucket might be PRIVATE`);
      }
  } catch (e) {
      console.log("   ❌ Error fetching public URL:", e.message);
  }

  // 3. Test Signed URL
  console.log("3. Generating Signed URL...");
  const { data: signedUrlData, error: signedError } = await supabase.storage
    .from('etiquetas')
    .createSignedUrl(fileName, 60); // 60 seconds

  if (signedError) {
      console.log("   ❌ Error generating signed URL:", signedError);
  } else {
      console.log(`   Signed URL: ${signedUrlData.signedUrl}`);
      console.log("   Testing Signed URL access...");
      try {
        const res = await fetch(signedUrlData.signedUrl);
        if (res.ok) {
            console.log("   ✅ Signed URL is ACCESSIBLE (HTTP 200)");
        } else {
            console.log(`   ❌ Signed URL is NOT ACCESSIBLE (HTTP ${res.status})`);
        }
    } catch (e) {
        console.log("   ❌ Error fetching signed URL:", e.message);
    }
  }
}

testStorage();
