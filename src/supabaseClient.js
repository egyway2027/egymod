import { createClient } from "@supabase/supabase-js";

// استبدل هذين السطرين بالرابط والمفتاح الحقيقيين لمشروعك
const supabaseUrl = "https://your-project-id.supabase.co"; // ضع رابط مشروعك بدلاً من xxxx
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // ضع مفتاح anon الحقيقي هنا

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
