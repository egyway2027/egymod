import { createClient } from "@supabase/supabase-js";

// ضع رابط مشروعك الحقيقي ومفتاح anon الخاص بك مكان النصوص المشار إليها
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://jvmowzfktfybjcvqnlcc.supabase.co/rest/v1/";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_lqpryj6bARHXiqDveRUrVw_scmwGO-0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
