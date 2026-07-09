import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const hasSupabase = Boolean(url && key);
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "vetrica-auth-v2",
    },
  },
);

export function normalizeIranPhone(value: string) {
  const english = value.replace(/[۰-۹]/g, (x) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(x))).replace(/\D/g, "");
  if (english.startsWith("09")) return `+98${english.slice(1)}`;
  if (english.startsWith("98")) return `+${english}`;
  return value.startsWith("+") ? value : `+${english}`;
}
