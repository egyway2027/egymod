import { createClient } from "@supabase/supabase-js";

// رابط مشروع egymod المباشر
const supabaseUrl = "https://blijuizmqoprlrsuebgo.supabase.co";

// المفتاح العام للواجهة الأمامية
const supabaseAnonKey = "sb_publishable_rw8Rym37iQoFRWkLXaDbfw_MaKL65Tc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
