/**
 * Nilai ini hanya dipakai untuk menampilkan status pada UI. Seluruh akses data
 * dilakukan melalui Route Handler di server, sehingga service-role key tidak
 * pernah ikut terkirim ke browser.
 */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("https://")
);
