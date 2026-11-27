-- Bersihkan tabel lama jika ada
DROP TABLE IF EXISTS jurnal_umum, transaksi_panen, log_harian_kolam, mutasi_kolam, siklus_kolam, master_kolam, persediaan_gudang, akun_keuangan CASCADE;

-- 1. MASTER AKUN KEUANGAN (Chart of Accounts - PSAK 69)
CREATE TABLE akun_keuangan (
    kode_akun VARCHAR(10) PRIMARY KEY,
    nama_akun VARCHAR(100) NOT NULL,
    tipe_akun VARCHAR(30) NOT NULL CHECK (tipe_akun IN ('Aset', 'Kewajiban', 'Modal', 'Pendapatan', 'Beban')),
    saldo_normal VARCHAR(10) NOT NULL CHECK (saldo_normal IN ('Debit', 'Kredit'))
);

-- 2. PERSEDIAAN GUDANG (Benih, Pakan, Obat/Vitamin)
CREATE TABLE persediaan_gudang (
    id_barang UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_barang VARCHAR(100) NOT NULL,
    kategori VARCHAR(30) NOT NULL CHECK (kategori IN ('Benih', 'Pakan', 'Obat/Vitamin')),
    satuan VARCHAR(20) NOT NULL,
    stok_tersedia NUMERIC(12, 2) NOT NULL DEFAULT 0,
    stok_minimum NUMERIC(12, 2) NOT NULL DEFAULT 50,
    harga_satuan NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MASTER DATA KOLAM
CREATE TABLE master_kolam (
    id_kolam UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_kolam VARCHAR(100) NOT NULL,
    jenis_kolam VARCHAR(30) NOT NULL CHECK (jenis_kolam IN ('Terpal', 'Beton', 'Tanah')),
    kapasitas_maks INT NOT NULL,
    status_kolam VARCHAR(20) NOT NULL DEFAULT 'Kosong' CHECK (status_kolam IN ('Kosong', 'Aktif', 'Masa Panen', 'Sanitasi'))
);

-- 4. SIKLUS KOLAM (Job Costing & Aset Biologis)
CREATE TABLE siklus_kolam (
    id_siklus UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_kolam UUID REFERENCES master_kolam(id_kolam) ON DELETE SET NULL,
    kode_siklus VARCHAR(50) NOT NULL,
    tgl_tebar DATE NOT NULL DEFAULT CURRENT_DATE,
    ukuran_tebar VARCHAR(20) DEFAULT '5-7 cm',
    jumlah_benih INT NOT NULL,
    populasi_hidup INT NOT NULL,
    abw_gram NUMERIC(10, 2) DEFAULT 5, -- Average Body Weight (gram/ekor)
    total_pakan_kg NUMERIC(10, 2) DEFAULT 0,
    total_biaya_akumulasi NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Panen Selesai')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. LOG HARIAN KOLAM (Pakan, Vitamin, Mortalitas & Sampling ABW)
CREATE TABLE log_harian_kolam (
    id_log UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_siklus UUID NOT NULL REFERENCES siklus_kolam(id_siklus) ON DELETE CASCADE,
    id_barang UUID REFERENCES persediaan_gudang(id_barang),
    tgl_catat DATE NOT NULL DEFAULT CURRENT_DATE,
    jumlah_pakan_kg NUMERIC(10, 2) DEFAULT 0,
    biaya_log NUMERIC(15, 2) DEFAULT 0,
    ikan_mati_ekor INT DEFAULT 0,
    penyebab_mati VARCHAR(50),
    is_abnormal BOOLEAN DEFAULT FALSE,
    abw_sampling_gram NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TRANSAKSI PANEN & PENJUALAN
CREATE TABLE transaksi_panen (
    id_panen UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_siklus UUID NOT NULL REFERENCES siklus_kolam(id_siklus) ON DELETE CASCADE,
    tgl_panen DATE NOT NULL DEFAULT CURRENT_DATE,
    pembeli VARCHAR(100) NOT NULL,
    kategori_panen VARCHAR(50) DEFAULT 'Konsumsi (7-9 ekor/kg)',
    berat_kotor_kg NUMERIC(10, 2) NOT NULL,
    potongan_susut_kg NUMERIC(10, 2) DEFAULT 0,
    berat_bersih_kg NUMERIC(10, 2) GENERATED ALWAYS AS (berat_kotor_kg - potongan_susut_kg) STORED,
    harga_per_kg NUMERIC(15, 2) NOT NULL,
    total_penjualan NUMERIC(15, 2) GENERATED ALWAYS AS ((berat_kotor_kg - potongan_susut_kg) * harga_per_kg) STORED,
    hpp_terjual NUMERIC(15, 2) NOT NULL DEFAULT 0,
    metode_bayar VARCHAR(20) NOT NULL CHECK (metode_bayar IN ('Tunai', 'Transfer', 'Tempo/Piutang')),
    status_lunas BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. JURNAL UMUM & BUKU BESAR OTOMATIS
CREATE TABLE jurnal_umum (
    id_jurnal UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tgl_jurnal DATE NOT NULL DEFAULT CURRENT_DATE,
    no_bukti VARCHAR(50) NOT NULL,
    keterangan TEXT NOT NULL,
    akun_debit VARCHAR(100) NOT NULL,
    akun_kredit VARCHAR(100) NOT NULL,
    nominal NUMERIC(15, 2) NOT NULL,
    kategori_arus_kas VARCHAR(30) DEFAULT 'Operasional' CHECK (kategori_arus_kas IN ('Operasional', 'Investasi', 'Pendanaan', 'Non-Kas')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nonaktifkan RLS untuk akses langsung
ALTER TABLE akun_keuangan DISABLE ROW LEVEL SECURITY;
ALTER TABLE persediaan_gudang DISABLE ROW LEVEL SECURITY;
ALTER TABLE master_kolam DISABLE ROW LEVEL SECURITY;
ALTER TABLE siklus_kolam DISABLE ROW LEVEL SECURITY;
ALTER TABLE log_harian_kolam DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi_panen DISABLE ROW LEVEL SECURITY;
ALTER TABLE jurnal_umum DISABLE ROW LEVEL SECURITY;
