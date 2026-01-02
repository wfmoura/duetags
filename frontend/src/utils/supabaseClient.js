// supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../config/config';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;