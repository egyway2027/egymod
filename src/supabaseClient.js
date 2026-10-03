import { createClient } from "@supabase/supabase-js";

// الرابط المباشر لمشروع egymod
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://blijuizmqoprlrsuebgo.supabase.co";

// المفتاح العام الصحيح للواجهة الأمامية
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_rw8Rym37iQoFRWkLXaDbfw_MaKL65Tc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```[cite: 20]

---

### الخطوة التالية للتشغيل:
1. اضغط **Commit changes** لحفظ الملف على GitHub.
2. انتظر دقيقة واحدة حتى تنتهي منصة Vercel من إعادة بناء الموقع آلياً.
3. أعد تحميل صفحة "إضافة عميل جديد" واضغط حفظ؛ وستُرسل البيانات لقاعدة البيانات بنجاح تام دون ظهور خطأ `Failed to fetch`.
