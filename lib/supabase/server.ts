import "server-only";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseServerConfigured = Boolean(
  supabaseUrl?.startsWith("https://") && serviceRoleKey && serviceRoleKey.length > 20
);

/** Server-only client. Never import this module from a Client Component. */
export function getSupabaseAdmin() {
  if (!isSupabaseServerConfigured) {
    throw new Error("Supabase belum dikonfigurasi di environment server.");
  }

  return createClient(supabaseUrl as string, serviceRoleKey as string, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
