import { createClient } from "@supabase/supabase-js";

// الرابط المباشر لمشروع egymod
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "[https://blijuizmqoprlrsuebgo.supabase.co](https://blijuizmqoprlrsuebgo.supabase.co)";

// المفتاح العام الصحيح للواجهة الأمامية
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_rw8Rym37iQoFRWkLXaDbfw_MaKL65Tc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
