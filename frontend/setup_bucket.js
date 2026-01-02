
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://gwptcsxlpcqhijodyeaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cHRjc3hscGNxaGlqb2R5ZWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NjA1MDgsImV4cCI6MjA4MTIzNjUwOH0.unY30UgwLs0gYbrFK3Qi4HKQWQfzB0zTBz72Z3xrv-M";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createBucket() {
  console.log("Checking bucket 'etiquetas'...");
  const { data: buckets, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error("Error listing buckets:", error);
    return;
  }

  const bucketExists = buckets.some(b => b.name === 'etiquetas');
  
  if (bucketExists) {
    console.log("Bucket 'etiquetas' already exists.");
  } else {
    console.log("Creating bucket 'etiquetas'...");
    const { data, error: createError } = await supabase.storage.createBucket('etiquetas', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg']
    });
    
    if (createError) {
        console.error("Error creating bucket:", createError);
    } else {
        console.log("Bucket 'etiquetas' created successfully.");
    }
  }
}

createBucket();
