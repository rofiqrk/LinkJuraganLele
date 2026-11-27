const SUPABASE_URL = 'https://nbnwvykkfewrpkfdreef.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hUnVUjpDZrejCnghAcfPGg_arI4afHZ';

const isSupabaseConfigured = 
    SUPABASE_URL !== 'https://nbnwvykkfewrpkfdreef.supabase.co' && 
    SUPABASE_ANON_KEY !== 'sb_publishable_hUnVUjpDZrejCnghAcfPGg_arI4afHZ';

const supabaseClient = isSupabaseConfigured 
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
    : null;
