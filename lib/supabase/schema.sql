-- =========================================================================
-- BUKU BESAR TAMBAK - SUPABASE SCHEMA MIGRATION (BERSIH / CLEAN PRODUCTION)
-- Jalankan skrip ini di: Supabase Console -> SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE pond_type_enum AS ENUM ('TERPAL', 'BETON', 'TANAH', 'BIOFLOK', 'LAINNYA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pond_status_enum AS ENUM ('KOSONG', 'AKTIF', 'PERSIAPAN', 'NONAKTIF');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE cycle_status_enum AS ENUM ('AKTIF', 'PENJUALAN', 'SELESAI');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE allocation_method_enum AS ENUM ('RATA', 'VOLUME', 'POPULASI');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sale_channel_enum AS ENUM ('PENGEPUL', 'ECERAN', 'LAINNYA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE adjust_reason_enum AS ENUM ('MATI', 'KONSUMSI', 'SUSUT', 'LAINNYA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABEL PENGGUNA APLIKASI (APP USERS)
CREATE TABLE IF NOT EXISTS public.app_users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'OWNER',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MASTER JENIS IKAN (SPECIES)
CREATE TABLE IF NOT EXISTS public.species (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,                     -- 'LELE', 'NILA', 'LAINNYA'
    target_days INTEGER NOT NULL DEFAULT 60,
    target_sr NUMERIC(5, 2) NOT NULL DEFAULT 80.00,
    target_size_per_kg INTEGER,                 -- ekor per kg saat panen (mis. 8)
    target_feed_ratio NUMERIC(4, 2),            -- target rasio pakan (mis. 1.1)
    color_hex TEXT DEFAULT '#0284C7',
    archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MASTER KOLAM (PONDS) - DINAMIS
CREATE TABLE IF NOT EXISTS public.ponds (
    id TEXT PRIMARY KEY,                       -- contoh: 'P-101', 'Kolam A1', 'Terpal 3'
    name TEXT NOT NULL UNIQUE,
    type pond_type_enum NOT NULL DEFAULT 'TERPAL',
    length_m NUMERIC(6, 2),
    width_m NUMERIC(6, 2),
    depth_m NUMERIC(6, 2),
    volume_m3 NUMERIC(10, 2),
    status pond_status_enum NOT NULL DEFAULT 'KOSONG',
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL SIKLUS (CYCLES)
CREATE TABLE IF NOT EXISTS public.cycles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    pond_id TEXT NOT NULL REFERENCES public.ponds(id) ON DELETE CASCADE,
    species_id TEXT NOT NULL REFERENCES public.species(id),
    status cycle_status_enum NOT NULL DEFAULT 'AKTIF',
    stocked_at DATE NOT NULL,
    released_at DATE,                          -- tanggal kolam dikosongkan (populasi = 0)
    closed_at DATE,                            -- tanggal siklus difinalisasi
    initial_count INTEGER NOT NULL,
    initial_size_cm NUMERIC(5, 2),
    expected_size_per_kg INTEGER,              -- perkiraan ukuran panen (ekor/kg)
    reference_price_per_kg NUMERIC(10, 0),     -- harga acuan untuk proyeksi
    seed_supplier TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index satu siklus aktif per kolam (PRD FR-33)
CREATE UNIQUE INDEX IF NOT EXISTS one_active_cycle ON public.cycles(pond_id) WHERE status = 'AKTIF';

-- 6. KATEGORI BIAYA (COST CATEGORIES)
CREATE TABLE IF NOT EXISTS public.cost_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_system BOOLEAN DEFAULT FALSE
);

-- 7. PENCATATAN BIAYA (EXPENSES)
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    cycle_id TEXT REFERENCES public.cycles(id) ON DELETE CASCADE, -- null = biaya bersama
    category TEXT NOT NULL DEFAULT 'Lain-lain',
    spent_at DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    qty NUMERIC(12, 2) NOT NULL DEFAULT 1,
    unit TEXT,
    unit_price NUMERIC(14, 0) NOT NULL,
    total NUMERIC(14, 0) NOT NULL,
    method allocation_method_enum,              -- hanya untuk biaya bersama
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PAKAN PER BATCH (FEED BATCHES)
CREATE TABLE IF NOT EXISTS public.feed_batches (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    cycle_id TEXT NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
    feed_type TEXT NOT NULL,                    -- mis. 'PF800', '781-2'
    qty_kg NUMERIC(8, 2) NOT NULL,
    total_price NUMERIC(12, 0) NOT NULL,
    started_at DATE NOT NULL DEFAULT CURRENT_DATE,
    finished_at DATE,                           -- null = pakan sedang berjalan
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. KEMATIAN IKAN (MORTALITIES)
CREATE TABLE IF NOT EXISTS public.mortalities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    cycle_id TEXT NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
    died_at DATE NOT NULL DEFAULT CURRENT_DATE,
    count INTEGER NOT NULL,
    cause TEXT
);

-- 10. PANEN (HARVESTS)
CREATE TABLE IF NOT EXISTS public.harvests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    cycle_id TEXT NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
    harvested_at DATE NOT NULL DEFAULT CURRENT_DATE,
    count INTEGER NOT NULL,                    -- ekor
    kg NUMERIC(10, 2) NOT NULL,
    note TEXT
);

-- 11. PENJUALAN & STOK PANEN (SALES)
CREATE TABLE IF NOT EXISTS public.sales (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    cycle_id TEXT NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
    sold_at DATE NOT NULL DEFAULT CURRENT_DATE,
    kg NUMERIC(10, 2) NOT NULL,
    price_per_kg NUMERIC(10, 0) NOT NULL,
    total NUMERIC(14, 0) NOT NULL,
    channel sale_channel_enum NOT NULL DEFAULT 'PENGEPUL',
    buyer TEXT,
    is_paid BOOLEAN NOT NULL DEFAULT TRUE,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PENYESUAIAN / SUSUT STOK (STOCK ADJUSTMENTS)
CREATE TABLE IF NOT EXISTS public.stock_adjustments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    cycle_id TEXT NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
    adjusted_at DATE NOT NULL DEFAULT CURRENT_DATE,
    kg NUMERIC(10, 2) NOT NULL,
    reason adjust_reason_enum NOT NULL DEFAULT 'SUSUT',
    note TEXT
);

-- 13. ASET & MODAL AWAL (ASSETS)
CREATE TABLE IF NOT EXISTS public.assets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    pond_id TEXT REFERENCES public.ponds(id) ON DELETE SET NULL, -- null = aset umum
    bought_at DATE NOT NULL,
    cost NUMERIC(14, 0) NOT NULL,
    useful_life_months INTEGER NOT NULL,
    salvage_value NUMERIC(14, 0) NOT NULL DEFAULT 0,
    retired BOOLEAN NOT NULL DEFAULT FALSE
);

-- 14. ROW LEVEL SECURITY
-- Semua query aplikasi melewati Route Handler Vercel dengan service-role key.
-- Tidak ada policy untuk anon/authenticated agar data tambak tidak dapat dibaca
-- atau diubah langsung dari browser maupun REST API publik Supabase.
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.species ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ponds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mortalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.harvests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

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

-- 15. MASTER DATA REFERENSI (HANYA MASTER SPESIES & KATEGORI, TANPA DUMMY KOLAM/TRANSAKSI)
INSERT INTO public.species (id, name, category, target_days, target_sr, target_size_per_kg, target_feed_ratio, color_hex)
VALUES
('sp-lele-sang', 'Lele Sangkuriang', 'LELE', 60, 80.00, 9, 1.05, '#0284C7'),
('sp-lele-muti', 'Lele Mutiara', 'LELE', 60, 85.00, 9, 1.00, '#0369A1'),
('sp-nila-merah', 'Nila Merah Nirwana', 'NILA', 120, 85.00, 3, 1.20, '#0EA5E9'),
('sp-nila-hitam', 'Nila Hitam Gesit', 'NILA', 120, 80.00, 3, 1.25, '#2563EB')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cost_categories (id, name, is_system)
VALUES
('cat-bibit', 'Bibit', TRUE),
('cat-obat', 'Obat & Vitamin', FALSE),
('cat-probiotik', 'Probiotik/Kapur/Garam', FALSE),
('cat-listrik', 'Listrik', FALSE),
('cat-tenaga', 'Tenaga Kerja', FALSE),
('cat-transport', 'Transportasi', FALSE),
('cat-air', 'Air', FALSE),
('cat-perbaikan', 'Perbaikan', FALSE),
('cat-penjualan', 'Biaya Penjualan', TRUE),
('cat-lain', 'Lain-lain', FALSE)
ON CONFLICT (id) DO NOTHING;
