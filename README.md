# Buku Besar Tambak

Platform pencatatan kolam, siklus budidaya, pakan, biaya, panen, penjualan, aset, dan analisis finansial tambak.

## Arsitektur produksi

- Next.js dijalankan di Vercel.
- Data disimpan di Supabase PostgreSQL.
- Browser tidak pernah menerima `SUPABASE_SERVICE_ROLE_KEY`; semua operasi data melewati `/api/data` setelah sesi tervalidasi.
- RLS Supabase aktif tanpa policy publik, sehingga tabel tidak bisa diakses dari anon key/REST API publik.
- Password akun tambahan disimpan dengan hash scrypt; cookie sesi memakai tanda tangan HMAC dan `HttpOnly`.
- Tidak ada data kolam, siklus, aset, atau transaksi contoh.

## Menjalankan lokal

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Isi semua nilai di `.env.local`. Jangan pernah memasukkan service-role key ke variabel berawalan `NEXT_PUBLIC_` atau ke repository.

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
SUPERADMIN_USERNAME=admin_anda
SUPERADMIN_PASSWORD=password-panjang-dan-unik
SESSION_SECRET=secret-acak-minimal-32-karakter
```

Setelah masuk memakai akun bootstrap superadmin, buat akun owner/operator di halaman **Pengaturan**. Password akun baru minimal 12 karakter.

## Menyiapkan Supabase

1. Buat project Supabase baru.
2. Buka **SQL Editor**, lalu jalankan [schema.sql](lib/supabase/schema.sql). File ini membuat tabel kosong dan data referensi spesies/kategori saja.
3. Bila project pernah memakai versi lama aplikasi, jalankan [upgrade-from-legacy.sql](lib/supabase/upgrade-from-legacy.sql) sekali. Skrip ini menghapus akun tambahan lama yang password-nya tersimpan plaintext; data kolam/transaksi tidak dihapus.
4. Dari **Project Settings → API**, salin Project URL ke `SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_URL`, serta `service_role` key ke `SUPABASE_SERVICE_ROLE_KEY`.

## Deploy ke Vercel

1. Impor repository ke Vercel dengan framework **Next.js**.
2. Tambahkan enam environment variables di atas pada Production, Preview, dan Development sesuai kebutuhan.
3. Deploy. Tidak diperlukan konfigurasi Vercel tambahan; build command menggunakan `npm run build`.

## Pemeriksaan

```bash
npm run typecheck
npm run lint
npm test
npm run build
```
