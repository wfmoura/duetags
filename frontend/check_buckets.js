const { createClient } = require('@supabase/supabase-js');

// Using credentials from config.js
const SUPABASE_URL = "https://gwptcsxlpcqhijodyeaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cHRjc3hscGNxaGlqb2R5ZWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NjA1MDgsImV4cCI6MjA4MTIzNjUwOH0.unY30UgwLs0gYbrFK3Qi4HKQWQfzB0zTBz72Z3xrv-M";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkBuckets() {
  console.log("Checking buckets...");
  const { data, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error("Error listing buckets:", error);
    return;
  }
  
  console.log("Buckets found:", data);
  
  const etiquetasBucket = data.find(b => b.name === 'etiquetas');
  if (etiquetasBucket) {
    console.log("Bucket 'etiquetas' exists.");
    console.log("Is public:", etiquetasBucket.public);
  } else {
    console.log("Bucket 'etiquetas' NOT found. Attempting to create...");
    const { data: createData, error: createError } = await supabase.storage.createBucket('etiquetas', {
        public: true
    });
    
    if (createError) {
        console.error("Error creating bucket:", createError);
    } else {
        console.log("Bucket 'etiquetas' created successfully:", createData);
    }
  }
}

checkBuckets();
