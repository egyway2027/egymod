import { createClient } from "@supabase/supabase-js";

// ضع رابط مشروعك ومفتاحك المباشرين هنا لضمان عمل التطبيق دائماً
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://xxxx.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJKV1QiLCJ...";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
