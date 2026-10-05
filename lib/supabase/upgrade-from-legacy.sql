-- Jalankan HANYA bila sebelumnya Anda menjalankan schema lama dengan tabel
-- app_users berkolom password plaintext. Seluruh akun tambahan lama dihapus
-- agar tidak ada password plaintext yang tertinggal. Login kembali dengan
-- SUPERADMIN environment lalu buat ulang akun dari halaman Pengaturan.

DELETE FROM public.app_users;
ALTER TABLE public.app_users DROP COLUMN IF EXISTS password;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.app_users ALTER COLUMN password_hash SET NOT NULL;

DROP POLICY IF EXISTS "Allow All App Users" ON public.app_users;
DROP POLICY IF EXISTS "Allow All Species" ON public.species;
DROP POLICY IF EXISTS "Allow All Ponds" ON public.ponds;
DROP POLICY IF EXISTS "Allow All Cycles" ON public.cycles;
DROP POLICY IF EXISTS "Allow All Cost Categories" ON public.cost_categories;
DROP POLICY IF EXISTS "Allow All Expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow All Feed Batches" ON public.feed_batches;
DROP POLICY IF EXISTS "Allow All Mortalities" ON public.mortalities;
DROP POLICY IF EXISTS "Allow All Harvests" ON public.harvests;
DROP POLICY IF EXISTS "Allow All Sales" ON public.sales;
DROP POLICY IF EXISTS "Allow All Stock Adjustments" ON public.stock_adjustments;
DROP POLICY IF EXISTS "Allow All Assets" ON public.assets;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
