const rp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

// State Aplikasi (Terisi data awal realistis & sinkron dengan Supabase jika dikonfigurasi)
let state = {
    kolam: [
        { id_kolam: 'k1', nama_kolam: 'Kolam Terpal A1', jenis_kolam: 'Terpal', kapasitas_maks: 5000, status_kolam: 'Aktif' },
        { id_kolam: 'k2', nama_kolam: 'Kolam Beton B1', jenis_kolam: 'Beton', kapasitas_maks: 8000, status_kolam: 'Aktif' },
        { id_kolam: 'k3', nama_kolam: 'Kolam Tanah C1', jenis_kolam: 'Tanah', kapasitas_maks: 10000, status_kolam: 'Kosong' }
    ],
    persediaan: [
        { id_barang: 'b1', nama_barang: 'Benih Lele Sangkuriang (5-7 cm)', kategori: 'Benih', satuan: 'Ekor', stok_tersedia: 12000, stok_minimum: 5000, harga_satuan: 250 },
        { id_barang: 'p1', nama_barang: 'Pelet Hi-Pro-Vite 781-1 (Starter)', kategori: 'Pakan', satuan: 'Kg', stok_tersedia: 45, stok_minimum: 50, harga_satuan: 13500 },
        { id_barang: 'p2', nama_barang: 'Pelet Hi-Pro-Vite 781 (Grower)', kategori: 'Pakan', satuan: 'Kg', stok_tersedia: 480, stok_minimum: 100, harga_satuan: 12800 },
        { id_barang: 'v1', nama_barang: 'Probiotik EM4 Perikanan', kategori: 'Obat/Vitamin', satuan: 'Botol', stok_tersedia: 12, stok_minimum: 5, harga_satuan: 25000 }
    ],
    siklus: [
        { id_siklus: 's1', id_kolam: 'k1', kode_siklus: 'SIK-01 (Terpal A1)', tgl_tebar: '2026-09-20', ukuran_tebar: '5-7 cm', jumlah_benih: 5000, populasi_hidup: 4720, abw_gram: 115, total_pakan_kg: 520, total_biaya_akumulasi: 7906000, status: 'Aktif' },
        { id_siklus: 's2', id_kolam: 'k2', kode_siklus: 'SIK-02 (Beton B1)', tgl_tebar: '2026-10-15', ukuran_tebar: '7-9 cm', jumlah_benih: 7000, populasi_hidup: 6790, abw_gram: 65, total_pakan_kg: 380, total_biaya_akumulasi: 6614000, status: 'Aktif' }
    ],
    logHarian: [
        { id_log: 'l1', tgl_catat: '2026-11-20', kode_siklus: 'SIK-01 (Terpal A1)', item: 'Pelet Grower (12 kg)', biaya_log: 153600, ikan_mati_ekor: 8, penyebab_mati: 'Normal / Kanibalisme', abw_sampling_gram: 105 },
        { id_log: 'l2', tgl_catat: '2026-11-24', kode_siklus: 'SIK-01 (Terpal A1)', item: 'Pelet Grower (14 kg)', biaya_log: 179200, ikan_mati_ekor: 5, penyebab_mati: 'Normal / Kanibalisme', abw_sampling_gram: 115 }
    ],
    panen: [
        { id_panen: 'pn1', id_siklus: 's0', kode_siklus: 'SIK-00 (Terpal A2)', tgl_panen: '2026-10-10', pembeli: 'Pengepul Pak Slamet', kategori_panen: 'Konsumsi (Isi 7-9 ekor/kg)', berat_kotor_kg: 510, potongan_susut_kg: 10, berat_bersih_kg: 500, harga_per_kg: 18500, total_penjualan: 9250000, hpp_terjual: 5850000, metode_bayar: 'Transfer', status_lunas: true },
        { id_panen: 'pn2', id_siklus: 's0b', kode_siklus: 'SIK-00B (Beton B2)', tgl_panen: '2026-11-12', pembeli: 'Warung Pecel Lele Mbak Yanti', kategori_panen: 'Konsumsi (Isi 7-9 ekor/kg)', berat_kotor_kg: 620, potongan_susut_kg: 15, berat_bersih_kg: 605, harga_per_kg: 19000, total_penjualan: 11495000, hpp_terjual: 7100000, metode_bayar: 'Tempo/Piutang', status_lunas: false }
    ],
    jurnal: [
        { id_jurnal: 'j1', tgl_jurnal: '2026-09-01', no_bukti: 'JU-001', keterangan: 'Setoran Modal Awal Peternakan', akun_debit: 'Kas & Bank', akun_kredit: 'Modal Pemilik', nominal: 50000000, kategori_arus_kas: 'Pendanaan' },
        { id_jurnal: 'j2', tgl_jurnal: '2026-10-10', no_bukti: 'PN-001', keterangan: 'Penjualan Panen SIK-00 (Transfer)', akun_debit: 'Kas & Bank', akun_kredit: 'Pendapatan Panen Lele', nominal: 9250000, kategori_arus_kas: 'Operasional' },
        { id_jurnal: 'j3', tgl_jurnal: '2026-10-10', no_bukti: 'PN-001B', keterangan: 'Reklasifikasi Aset Biologis ke HPP', akun_debit: 'HPP Panen Terjual', akun_kredit: 'Aset Biologis - Lele', nominal: 5850000, kategori_arus_kas: 'Non-Kas' },
        { id_jurnal: 'j4', tgl_jurnal: '2026-11-12', no_bukti: 'PN-002', keterangan: 'Penjualan Panen Tempo Mbak Yanti', akun_debit: 'Piutang Pengepul', akun_kredit: 'Pendapatan Panen Lele', nominal: 11495000, kategori_arus_kas: 'Non-Kas' },
        { id_jurnal: 'j5', tgl_jurnal: '2026-11-25', no_bukti: 'BOP-01', keterangan: 'Beban Listrik Pompa & Gaji Admin', akun_debit: 'Beban Operasional Non-Kolam', akun_kredit: 'Kas & Bank', nominal: 1850000, kategori_arus_kas: 'Operasional' }
    ],
    utangSupplier: 3200000
};

let charts = {};

document.addEventListener('DOMContentLoaded', () => {
    renderAllModules();
    bindForms();
});

function switchTab(tabId) {
    const tabs = ['dashboard', 'siklus', 'harian', 'panen', 'persediaan', 'bukubesar', 'labarugi', 'aruskas'];
    tabs.forEach(t => {
        document.getElementById(`tab-${t}`).classList.toggle('hidden', t !== tabId);
        const navBtn = document.getElementById(`nav-${t}`);
        if (navBtn) {
            if (t === tabId) {
                navBtn.classList.add('bg-emerald-50', 'text-emerald-700', 'border', 'border-emerald-200', 'font-semibold');
            } else {
                navBtn.classList.remove('bg-emerald-50', 'text-emerald-700', 'border', 'border-emerald-200', 'font-semibold');
            }
        }
    });
    const labels = {
        dashboard: 'Dashboard Utama', siklus: 'Siklus Kolam & Tebar Benih', harian: 'Pakan, Vitamin & Mortalitas',
        panen: 'Panen & Penjualan', persediaan: 'Stok Pakan, Benih & Belanja', bukubesar: 'Buku Besar & Neraca (PSAK 69)',
        labarugi: 'Laba Rugi per Siklus', aruskas: 'Laporan Arus Kas'
    };
    document.getElementById('breadcrumbTitle').textContent = labels[tabId];
    renderAllModules();
}

function renderAllModules() {
    populateDropdowns();
    renderDashboard();
    renderSiklusModule();
    renderHarianModule();
    renderPanenModule();
    renderPersediaanModule();
    renderKeuanganModules();
    lucide.createIcons();
}

function populateDropdowns() {
    // Filter dashboard
    const fSik = document.getElementById('filterSiklusDash');
    const currentVal = fSik.value;
    fSik.innerHTML = '<option value="ALL">Semua Siklus / Kolam</option>';
    state.siklus.forEach(s => fSik.innerHTML += `<option value="${s.id_siklus}">${s.kode_siklus}</option>`);
    fSik.value = currentVal || 'ALL';

    // Dropdown Modal Tebar
    const tbKolam = document.getElementById('tbKolam');
    tbKolam.innerHTML = state.kolam.filter(k => k.status_kolam === 'Kosong').map(k => `<option value="${k.id_kolam}">${k.nama_kolam} (Maks: ${k.kapasitas_maks} ekor)</option>`).join('') || '<option value="">Tidak ada kolam kosong</option>';

    const tbBenih = document.getElementById('tbBenih');
    tbBenih.innerHTML = state.persediaan.filter(p => p.kategori === 'Benih' && p.stok_tersedia > 0).map(b => `<option value="${b.id_barang}">${b.nama_barang} (Stok: ${b.stok_tersedia} ${b.satuan})</option>`).join('');

    // Dropdown Siklus Aktif (untuk Log Harian, Panen, Mutasi)
    const aktifOpts = state.siklus.filter(s => s.status === 'Aktif').map(s => `<option value="${s.id_siklus}">${s.kode_siklus} (${s.populasi_hidup} ekor)</option>`).join('');
    document.getElementById('lhSiklus').innerHTML = aktifOpts;
    document.getElementById('pnSiklus').innerHTML = aktifOpts;
    document.getElementById('mtAsal').innerHTML = aktifOpts;
    document.getElementById('mtTujuan').innerHTML = aktifOpts;

    // Dropdown Pakan & Obat
    document.getElementById('lhBarang').innerHTML = state.persediaan.filter(p => p.kategori !== 'Benih').map(p => `<option value="${p.id_barang}">${p.nama_barang} (Sisa: ${p.stok_tersedia} ${p.satuan})</option>`).join('');
    document.getElementById('opBarang').innerHTML = state.persediaan.map(p => `<option value="${p.id_barang}">${p.nama_barang} (Sistem: ${p.stok_tersedia} ${p.satuan})</option>`).join('');
}

// ==========================================
// 1. RENDER DASHBOARD UTAMA
// ==========================================
function renderDashboard() {
    const penjualanBersih = state.panen.reduce((a, b) => a + b.total_penjualan, 0);
    const hppPanen = state.panen.reduce((a, b) => a + b.hpp_terjual, 0);
    const labaKotor = penjualanBersih - hppPanen;
    const bebanNonKolam = state.jurnal.filter(j => j.akun_debit === 'Beban Operasional Non-Kolam').reduce((a, b) => a + b.nominal, 0);
    const labaBersih = labaKotor - bebanNonKolam;

    // Kas & Bank dari Jurnal
    const kasMasuk = state.jurnal.filter(j => j.akun_debit === 'Kas & Bank').reduce((a, b) => a + b.nominal, 0);
    const kasKeluar = state.jurnal.filter(j => j.akun_kredit === 'Kas & Bank').reduce((a, b) => a + b.nominal, 0);
    const saldoKas = kasMasuk - kasKeluar;

    const asetBiologis = state.siklus.filter(s => s.status === 'Aktif').reduce((a, b) => a + b.total_biaya_akumulasi, 0);
    const nilaiStok = state.persediaan.reduce((a, b) => a + (b.stok_tersedia * b.harga_satuan), 0);
    const piutang = state.panen.filter(p => !p.status_lunas).reduce((a, b) => a + b.total_penjualan, 0);

    document.getElementById('kpiPenjualanBersih').textContent = rp(penjualanBersih);
    document.getElementById('kpiHppPanen').textContent = rp(hppPanen);
    document.getElementById('kpiLabaKotor').textContent = rp(labaKotor);
    document.getElementById('kpiLabaBersih').textContent = rp(labaBersih);
    document.getElementById('kpiKasBank').textContent = rp(saldoKas);
    document.getElementById('kpiAsetDanStok').textContent = rp(asetBiologis + nilaiStok);
    document.getElementById('kpiRincianAset').textContent = `Biologis: ${rp(asetBiologis)} | Gudang: ${rp(nilaiStok)}`;
    document.getElementById('kpiPiutang').textContent = rp(piutang);
    document.getElementById('kpiUtang').textContent = rp(state.utangSupplier);

    // Indikator Teknis Budidaya
    const aktif = state.siklus.filter(s => s.status === 'Aktif');
    const totPop = aktif.reduce((a, b) => a + b.populasi_hidup, 0);
    const totTebar = aktif.reduce((a, b) => a + b.jumlah_benih, 0);
    const estBiomassaKg = aktif.reduce((a, b) => a + ((b.populasi_hidup * b.abw_gram) / 1000), 0);
    const totPakan = aktif.reduce((a, b) => a + b.total_pakan_kg, 0);
    const avgFcr = estBiomassaKg > 0 ? (totPakan / estBiomassaKg).toFixed(2) : '0.00';
    const avgSr = totTebar > 0 ? ((totPop / totTebar) * 100).toFixed(1) : '100';

    document.getElementById('techFcr').textContent = avgFcr;
    document.getElementById('techSr').textContent = `${avgSr}%`;
    document.getElementById('techBiomassa').textContent = `${estBiomassaKg.toFixed(1)} kg`;

    // Chart 1: Multi-Line Pendapatan Panen vs Total HPP & Biaya Operasional
    renderLineChart('chartDashProfit', ['Okt 2026 (SIK-00)', 'Nov 2026 (SIK-00B)', 'Proyeksi Des (SIK-01)'], [
        { label: 'Pendapatan Panen Bersih (Rp)', data: [9250000, 11495000, 10200000], borderColor: '#059669', backgroundColor: 'rgba(5,150,105,0.1)', fill: true, tension: 0.35 },
        { label: 'Total HPP + Beban Operasional (Rp)', data: [6750000, 8050000, 7906000], borderColor: '#e11d48', borderDash: [5, 5], tension: 0.35 }
    ]);
}

// ==========================================
// 2A. MODUL SIKLUS KOLAM & MUTASI GRADING
// ==========================================
function renderSiklusModule() {
    document.getElementById('gridMasterKolam').innerHTML = state.kolam.map(k => `
        <div class="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex justify-between items-start">
            <div>
                <span class="px-2 py-0.5 text-[10px] font-bold rounded-full ${k.status_kolam === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}">${k.status_kolam}</span>
                <h4 class="font-bold text-sm text-slate-900 mt-1.5">${k.nama_kolam}</h4>
                <p class="text-[11px] text-slate-400">Jenis: ${k.jenis_kolam} • Maks: ${k.kapasitas_maks.toLocaleString('id-ID')} ekor</p>
            </div>
            <button onclick="hapusMasterKolam('${k.id_kolam}')" class="text-rose-500 hover:text-rose-700 text-[11px] font-semibold">Hapus</button>
        </div>
    `).join('');

    document.getElementById('tbodySiklus').innerHTML = state.siklus.map(s => {
        const estKg = ((s.populasi_hidup * s.abw_gram) / 1000).toFixed(1);
        return `
        <tr class="hover:bg-emerald-50/30">
            <td class="px-5 py-3.5 font-bold text-slate-900">${s.kode_siklus}</td>
            <td class="px-5 py-3.5">${s.tgl_tebar} (${s.ukuran_tebar})</td>
            <td class="px-5 py-3.5">${s.populasi_hidup.toLocaleString('id-ID')} / ${s.jumlah_benih.toLocaleString('id-ID')} ekor</td>
            <td class="px-5 py-3.5">${s.abw_gram} gr • <strong>Est: ${estKg} kg</strong></td>
            <td class="px-5 py-3.5 font-bold text-emerald-700">${rp(s.total_biaya_akumulasi)}</td>
            <td class="px-5 py-3.5 text-right space-x-1">
                <button onclick="openEditSiklus('${s.id_siklus}')" class="px-2 py-1 rounded bg-amber-50 text-amber-700 font-semibold">Ubah</button>
                <button onclick="hapusSiklus('${s.id_siklus}')" class="px-2 py-1 rounded bg-rose-50 text-rose-600 font-semibold">Hapus</button>
            </td>
        </tr>`;
    }).join('');
}

// ==========================================
// 2B. MODUL PAKAN, VITAMIN & MORTALITAS
// ==========================================
function renderHarianModule() {
    document.getElementById('tbodyLogHarian').innerHTML = state.logHarian.map(l => `
        <tr class="hover:bg-emerald-50/30">
            <td class="px-5 py-3">${l.tgl_catat}</td>
            <td class="px-5 py-3 font-semibold">${l.kode_siklus}</td>
            <td class="px-5 py-3">${l.item}</td>
            <td class="px-5 py-3 font-semibold text-emerald-700">${rp(l.biaya_log)}</td>
            <td class="px-5 py-3 text-rose-600">${l.ikan_mati_ekor} ekor (${l.penyebab_mati})</td>
            <td class="px-5 py-3">${l.abw_sampling_gram ? l.abw_sampling_gram + ' gr' : '-'}</td>
            <td class="px-5 py-3 text-right"><button onclick="hapusLog('${l.id_log}')" class="text-rose-600 font-semibold">Hapus</button></td>
        </tr>
    `).join('');

    // Grafik 1: Kurva Pertumbuhan Biomassa vs Akumulasi Pakan
    renderLineChart('chartKurvaPakan', ['Mgg 1', 'Mgg 2', 'Mgg 3', 'Mgg 4', 'Mgg 5', 'Mgg 6', 'Mgg 7', 'Mgg 8'], [
        { label: 'Estimasi Biomassa Ikan (kg)', data: [30, 68, 130, 215, 320, 430, 510, 542], borderColor: '#0284c7', backgroundColor: 'rgba(2,132,199,0.1)', fill: true, tension: 0.35 },
        { label: 'Akumulasi Pakan Diberikan (kg)', data: [25, 62, 125, 210, 315, 420, 495, 520], borderColor: '#f59e0b', tension: 0.35 }
    ]);

    // Grafik 2: Tren Mortalitas Harian
    renderLineChart('chartMortalitas', ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'], [
        { label: 'Jumlah Ikan Mati (Ekor/Hari)', data: [4, 6, 5, 12, 8, 5, 3], borderColor: '#e11d48', backgroundColor: 'rgba(225,29,72,0.1)', fill: true, tension: 0.3 }
    ]);
}

// ==========================================
// 2C. MODUL PANEN & PENJUALAN
// ==========================================
function renderPanenModule() {
    document.getElementById('tbodyPanen').innerHTML = state.panen.map(p => {
        const hppPerKg = p.berat_bersih_kg > 0 ? (p.hpp_terjual / p.berat_bersih_kg) : 0;
        return `
        <tr class="hover:bg-emerald-50/30">
            <td class="px-5 py-3.5">${p.tgl_panen}</td>
            <td class="px-5 py-3.5"><strong>${p.pembeli}</strong><br><span class="text-slate-400">${p.kategori_panen}</span></td>
            <td class="px-5 py-3.5"><strong>${p.berat_bersih_kg} kg</strong> <span class="text-slate-400">(${p.berat_kotor_kg} - ${p.potongan_susut_kg})</span></td>
            <td class="px-5 py-3.5 font-bold text-emerald-700">${rp(p.total_penjualan)}</td>
            <td class="px-5 py-3.5">${rp(hppPerKg)}/kg<br><span class="text-slate-400">Tot: ${rp(p.hpp_terjual)}</span></td>
            <td class="px-5 py-3.5"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status_lunas ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">${p.metode_bayar}</span></td>
            <td class="px-5 py-3.5 text-right"><button onclick="hapusPanen('${p.id_panen}')" class="text-rose-600 font-semibold">Hapus</button></td>
        </tr>`;
    }).join('');
}

// ==========================================
// 3. MODUL PERSEDIAAN GUDANG
// ==========================================
function renderPersediaanModule() {
    const lowItems = state.persediaan.filter(p => p.stok_tersedia <= p.stok_minimum);
    const alertBox = document.getElementById('lowStockAlertBox');
    const badge = document.getElementById('badgeLowStock');
    if (lowItems.length > 0) {
        alertBox.classList.remove('hidden');
        badge.classList.remove('hidden');
        document.getElementById('lowStockText').innerHTML = `<strong>Peringatan Stok Minimum (Low Stock Alert):</strong> ${lowItems.map(i => `${i.nama_barang} tersisa ${i.stok_tersedia} ${i.satuan}`).join(', ')}. Segera lakukan pemesanan ulang!`;
    } else {
        alertBox.classList.add('hidden');
        badge.classList.add('hidden');
    }

    document.getElementById('tbodyPersediaan').innerHTML = state.persediaan.map(p => `
        <tr class="hover:bg-emerald-50/30">
            <td class="px-5 py-3.5 font-semibold text-slate-900">${p.nama_barang}</td>
            <td class="px-5 py-3.5">${p.kategori}</td>
            <td class="px-5 py-3.5 font-bold ${p.stok_tersedia <= p.stok_minimum ? 'text-rose-600' : 'text-slate-800'}">${p.stok_tersedia} ${p.satuan} <span class="text-slate-400 font-normal">(Min: ${p.stok_minimum})</span></td>
            <td class="px-5 py-3.5">${rp(p.harga_satuan)}</td>
            <td class="px-5 py-3.5 font-bold text-teal-700">${rp(p.stok_tersedia * p.harga_satuan)}</td>
            <td class="px-5 py-3.5 text-right"><button onclick="hapusPersediaan('${p.id_barang}')" class="text-rose-600 font-semibold">Hapus</button></td>
        </tr>
    `).join('');

    // Grafik 3: Pergerakan Sisa Stok Pakan vs Fluktuasi Harga Beli per Kg
    renderLineChart('chartPersediaan', ['Mgg 1', 'Mgg 2', 'Mgg 3', 'Mgg 4'], [
        { label: 'Sisa Stok Pakan Gudang (kg)', data: [850, 710, 580, 525], borderColor: '#0d9488', yAxisID: 'y', tension: 0.3 },
        { label: 'Harga Beli Pakan (Rp/kg)', data: [12500, 12600, 12800, 13000], borderColor: '#f59e0b', borderDash: [4, 4], yAxisID: 'y1', tension: 0.3 }
    ], true);
}

// ==========================================
// 4. MODUL KEUANGAN (BUKU BESAR, NERACA, LABA RUGI, ARUS KAS)
// ==========================================
function renderKeuanganModules() {
    // Jurnal Umum
    document.getElementById('tbodyJurnal').innerHTML = state.jurnal.map(j => `
        <tr class="hover:bg-slate-50">
            <td class="px-5 py-3">${j.tgl_jurnal}</td>
            <td class="px-5 py-3"><strong>${j.no_bukti}</strong> — ${j.keterangan}</td>
            <td class="px-5 py-3 text-emerald-700 font-medium">${j.akun_debit}</td>
            <td class="px-5 py-3 text-slate-600 pl-8">${j.akun_kredit}</td>
            <td class="px-5 py-3 text-right font-bold">${rp(j.nominal)}</td>
        </tr>
    `).join('');

    // Neraca PSAK 69
    const kas = state.jurnal.filter(j => j.akun_debit === 'Kas & Bank').reduce((a, b) => a + b.nominal, 0) - state.jurnal.filter(j => j.akun_kredit === 'Kas & Bank').reduce((a, b) => a + b.nominal, 0);
    const piutang = state.panen.filter(p => !p.status_lunas).reduce((a, b) => a + b.total_penjualan, 0);
    const stok = state.persediaan.reduce((a, b) => a + (b.stok_tersedia * b.harga_satuan), 0);
    const biologis = state.siklus.filter(s => s.status === 'Aktif').reduce((a, b) => a + b.total_biaya_akumulasi, 0);
    const totalAset = kas + piutang + stok + biologis;

    document.getElementById('neracaAsetList').innerHTML = `
        <div class="flex justify-between"><span>Kas & Bank</span><strong>${rp(kas)}</strong></div>
        <div class="flex justify-between"><span>Piutang Pengepul</span><strong>${rp(piutang)}</strong></div>
        <div class="flex justify-between"><span>Persediaan Pakan & Benih</span><strong>${rp(stok)}</strong></div>
        <div class="flex justify-between text-emerald-700"><span>Aset Biologis - Lele (PSAK 69)</span><strong>${rp(biologis)}</strong></div>
        <div class="border-t pt-2 flex justify-between font-bold text-slate-900"><span>TOTAL ASET</span><span>${rp(totalAset)}</span></div>
    `;
    document.getElementById('neracaKewajibanList').innerHTML = `
        <div class="flex justify-between"><span>Utang Supplier Pakan</span><strong>${rp(state.utangSupplier)}</strong></div>
        <div class="border-t pt-2 flex justify-between font-bold text-slate-900"><span>TOTAL KEWAJIBAN</span><span>${rp(state.utangSupplier)}</span></div>
    `;
    document.getElementById('neracaModalList').innerHTML = `
        <div class="flex justify-between"><span>Modal Pemilik & Laba Ditahan</span><strong>${rp(totalAset - state.utangSupplier)}</strong></div>
        <div class="border-t pt-2 flex justify-between font-bold text-slate-900"><span>TOTAL KEWAJIBAN & MODAL</span><span>${rp(totalAset)}</span></div>
    `;

    // Laba Rugi per Siklus
    document.getElementById('tbodyProfitSiklus').innerHTML = state.panen.map(p => {
        const laba = p.total_penjualan - p.hpp_terjual;
        const margin = ((laba / p.total_penjualan) * 100).toFixed(1);
        return `
        <tr>
            <td class="px-5 py-3.5 font-bold">${p.kode_siklus}</td>
            <td class="px-5 py-3.5">${rp(p.total_penjualan)}</td>
            <td class="px-5 py-3.5">${rp(p.hpp_terjual)}</td>
            <td class="px-5 py-3.5 font-bold text-emerald-600">${rp(laba)}</td>
            <td class="px-5 py-3.5">${margin}%</td>
            <td class="px-5 py-3.5">1.03</td>
        </tr>`;
    }).join('');

    // Laporan Arus Kas
    const opIn = state.jurnal.filter(j => j.kategori_arus_kas === 'Operasional' && j.akun_debit === 'Kas & Bank').reduce((a, b) => a + b.nominal, 0);
    const opOut = state.jurnal.filter(j => j.kategori_arus_kas === 'Operasional' && j.akun_kredit === 'Kas & Bank').reduce((a, b) => a + b.nominal, 0);
    const invNet = state.jurnal.filter(j => j.kategori_arus_kas === 'Investasi').reduce((a, b) => a + (b.akun_debit === 'Kas & Bank' ? b.nominal : -b.nominal), 0);
    const penNet = state.jurnal.filter(j => j.kategori_arus_kas === 'Pendanaan').reduce((a, b) => a + (b.akun_debit === 'Kas & Bank' ? b.nominal : -b.nominal), 0);

    document.getElementById('ringkasanArusKasCards').innerHTML = `
        <div class="bg-white p-5 rounded-2xl border border-emerald-100"><p class="text-xs text-slate-500">Arus Kas Aktivitas Operasional</p><p class="text-lg font-bold text-emerald-700 mt-1">${rp(opIn - opOut)}</p></div>
        <div class="bg-white p-5 rounded-2xl border border-emerald-100"><p class="text-xs text-slate-500">Arus Kas Aktivitas Investasi</p><p class="text-lg font-bold text-sky-700 mt-1">${rp(invNet)}</p></div>
        <div class="bg-white p-5 rounded-2xl border border-emerald-100"><p class="text-xs text-slate-500">Arus Kas Aktivitas Pendanaan</p><p class="text-lg font-bold text-indigo-700 mt-1">${rp(penNet)}</p></div>
    `;

    // Chart 4: Arus Kas Masuk vs Keluar Mingguan
    renderLineChart('chartArusKas', ['Mgg 1', 'Mgg 2', 'Mgg 3', 'Mgg 4 (Panen)', 'Mgg 5', 'Mgg 6 (Panen)'], [
        { label: 'Cash Inflow / Kas Masuk (Rp)', data: [0, 0, 0, 9250000, 0, 11495000], borderColor: '#059669', backgroundColor: 'rgba(5,150,105,0.1)', fill: true, tension: 0.3 },
        { label: 'Cash Outflow / Kas Keluar Pakan (Rp)', data: [1200000, 1450000, 1800000, 2100000, 1600000, 1850000], borderColor: '#e11d48', tension: 0.3 }
    ]);
}

// Helper Render Chart.js
function renderLineChart(canvasId, labels, datasets, dualAxis = false) {
    const el = document.getElementById(canvasId);
    if (!el) return;
    if (charts[canvasId]) charts[canvasId].destroy();
    const scales = dualAxis ? {
        y: { type: 'linear', position: 'left' },
        y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false } }
    } : { y: { beginAtZero: true } };

    charts[canvasId] = new Chart(el.getContext('2d'), {
        type: 'line',
        data: { labels, datasets },
        options: { responsive: true, maintainAspectRatio: false, scales }
    });
}

// ==========================================
// HANDLER FORM & CRUD AKSI
// ==========================================
function bindForms() {
    // 1. Tambah Master Kolam
    document.getElementById('formMasterKolam').addEventListener('submit', e => {
        e.preventDefault();
        state.kolam.push({
            id_kolam: 'k' + Date.now(),
            nama_kolam: document.getElementById('mkNama').value,
            jenis_kolam: document.getElementById('mkJenis').value,
            kapasitas_maks: parseInt(document.getElementById('mkKapasitas').value),
            status_kolam: 'Kosong'
        });
        closeModal('modalMasterKolam'); e.target.reset(); renderAllModules();
    });

    // 2. Tebar Benih (Buka Siklus Baru)
    document.getElementById('formTebar').addEventListener('submit', e => {
        e.preventDefault();
        const id_kolam = document.getElementById('tbKolam').value;
        const id_benih = document.getElementById('tbBenih').value;
        const jumlah = parseInt(document.getElementById('tbJumlah').value);
        const kolam = state.kolam.find(k => k.id_kolam === id_kolam);
        const benih = state.persediaan.find(b => b.id_barang === id_benih);
        if (!kolam || !benih) return;

        const biayaBenih = jumlah * benih.harga_satuan;
        benih.stok_tersedia = Math.max(0, benih.stok_tersedia - jumlah);
        kolam.status_kolam = 'Aktif';

        const kode = `SIK-0${state.siklus.length + 1} (${kolam.nama_kolam})`;
        state.siklus.unshift({
            id_siklus: 's' + Date.now(), id_kolam, kode_siklus: kode,
            tgl_tebar: new Date().toISOString().split('T')[0],
            ukuran_tebar: document.getElementById('tbUkuran').value,
            jumlah_benih: jumlah, populasi_hidup: jumlah, abw_gram: 5,
            total_pakan_kg: 0, total_biaya_akumulasi: biayaBenih, status: 'Aktif'
        });
        state.jurnal.unshift({ tgl_jurnal: new Date().toISOString().split('T')[0], no_bukti: 'TB-' + Date.now().toString().slice(-3), keterangan: `Tebar Benih ${kode}`, akun_debit: 'Aset Biologis - Lele', akun_kredit: 'Persediaan Benih', nominal: biayaBenih, kategori_arus_kas: 'Non-Kas' });
        closeModal('modalTebar'); e.target.reset(); renderAllModules();
    });

    // 3. Mutasi & Grading Antar-Kolam
    document.getElementById('formMutasi').addEventListener('submit', e => {
        e.preventDefault();
        const asal = state.siklus.find(s => s.id_siklus === document.getElementById('mtAsal').value);
        const tujuan = state.siklus.find(s => s.id_siklus === document.getElementById('mtTujuan').value);
        const qty = parseInt(document.getElementById('mtJumlah').value);
        if (!asal || !tujuan || asal.id_siklus === tujuan.id_siklus || qty > asal.populasi_hidup) return alert('Data mutasi tidak valid!');

        const porsiBiaya = (qty / asal.populasi_hidup) * asal.total_biaya_akumulasi;
        asal.populasi_hidup -= qty;
        asal.total_biaya_akumulasi -= porsiBiaya;
        tujuan.populasi_hidup += qty;
        tujuan.total_biaya_akumulasi += porsiBiaya;

        closeModal('modalMutasi'); e.target.reset(); renderAllModules();
    });

    // 4. Log Harian (Pakan, Vitamin, Mortalitas & Sampling ABW)
    document.getElementById('formLogHarian').addEventListener('submit', e => {
        e.preventDefault();
        const siklus = state.siklus.find(s => s.id_siklus === document.getElementById('lhSiklus').value);
        const barang = state.persediaan.find(b => b.id_barang === document.getElementById('lhBarang').value);
        const pakanKg = parseFloat(document.getElementById('lhPakanKg').value) || 0;
        const mati = parseInt(document.getElementById('lhMati').value) || 0;
        const penyebab = document.getElementById('lhPenyebab').value;
        const abw = parseFloat(document.getElementById('lhSamplingAbw').value);

        const biaya = barang ? pakanKg * barang.harga_satuan : 0;
        if (barang && pakanKg > 0) barang.stok_tersedia = Math.max(0, barang.stok_tersedia - pakanKg);
        if (siklus) {
            siklus.total_pakan_kg += pakanKg;
            siklus.total_biaya_akumulasi += biaya;
            siklus.populasi_hidup = Math.max(0, siklus.populasi_hidup - mati);
            if (abw > 0) siklus.abw_gram = abw;
        }
        state.logHarian.unshift({
            id_log: 'l' + Date.now(), tgl_catat: new Date().toISOString().split('T')[0],
            kode_siklus: siklus.kode_siklus, item: barang ? `${barang.nama_barang} (${pakanKg} ${barang.satuan})` : '-',
            biaya_log: biaya, ikan_mati_ekor: mati, penyebab_mati: penyebab, abw_sampling_gram: abw || null
        });
        if (biaya > 0) {
            state.jurnal.unshift({ tgl_jurnal: new Date().toISOString().split('T')[0], no_bukti: 'PK-' + Date.now().toString().slice(-3), keterangan: `Pemakaian Pakan ${siklus.kode_siklus}`, akun_debit: 'Aset Biologis - Lele', akun_kredit: 'Persediaan Pakan & Obat', nominal: biaya, kategori_arus_kas: 'Non-Kas' });
        }
        closeModal('modalLogHarian'); e.target.reset(); renderAllModules();
    });

    // 5. Panen & Penjualan
    document.getElementById('formPanenBaru').addEventListener('submit', e => {
        e.preventDefault();
        const siklus = state.siklus.find(s => s.id_siklus === document.getElementById('pnSiklus').value);
        const kotor = parseFloat(document.getElementById('pnBeratKotor').value);
        const susut = parseFloat(document.getElementById('pnSusut').value) || 0;
        const bersih = kotor - susut;
        const harga = parseFloat(document.getElementById('pnHargaKg').value);
        const total = bersih * harga;
        const metode = document.getElementById('pnMetode').value;
        const hpp = siklus ? siklus.total_biaya_akumulasi : 0;

        if (siklus) {
            siklus.status = 'Panen Selesai';
            const k = state.kolam.find(x => x.id_kolam === siklus.id_kolam);
            if (k) k.status_kolam = 'Sanitasi';
        }
        state.panen.push({
            id_panen: 'pn' + Date.now(), id_siklus: siklus.id_siklus, kode_siklus: siklus.kode_siklus,
            tgl_panen: new Date().toISOString().split('T')[0], pembeli: document.getElementById('pnPembeli').value,
            kategori_panen: document.getElementById('pnKategori').value, berat_kotor_kg: kotor, potongan_susut_kg: susut,
            berat_bersih_kg: bersih, harga_per_kg: harga, total_penjualan: total, hpp_terjual: hpp,
            metode_bayar: metode, status_lunas: metode !== 'Tempo/Piutang'
        });
        state.jurnal.unshift({ tgl_jurnal: new Date().toISOString().split('T')[0], no_bukti: 'INV-' + Date.now().toString().slice(-3), keterangan: `Panen ${siklus.kode_siklus} (${metode})`, akun_debit: metode === 'Tempo/Piutang' ? 'Piutang Pengepul' : 'Kas & Bank', akun_kredit: 'Pendapatan Panen Lele', nominal: total, kategori_arus_kas: metode === 'Tempo/Piutang' ? 'Non-Kas' : 'Operasional' });
        state.jurnal.unshift({ tgl_jurnal: new Date().toISOString().split('T')[0], no_bukti: 'HPP-' + Date.now().toString().slice(-3), keterangan: `HPP Panen ${siklus.kode_siklus}`, akun_debit: 'HPP Panen Terjual', akun_kredit: 'Aset Biologis - Lele', nominal: hpp, kategori_arus_kas: 'Non-Kas' });
        closeModal('modalPanenBaru'); e.target.reset(); renderAllModules();
    });

    // 6. Belanja Stok & Operasional
    document.getElementById('formBelanjaBaru').addEventListener('submit', e => {
        e.preventDefault();
        const nama = document.getElementById('blNama').value;
        const kat = document.getElementById('blKategori').value;
        const bayar = document.getElementById('blBayar').value;
        const qty = parseFloat(document.getElementById('blQty').value);
        const harga = parseFloat(document.getElementById('blHarga').value);
        const total = qty * harga;

        if (kat !== 'Beban Non-Kolam') {
            state.persediaan.push({ id_barang: 'br' + Date.now(), nama_barang: nama, kategori: kat, satuan: kat === 'Benih' ? 'Ekor' : 'Kg', stok_tersedia: qty, stok_minimum: 50, harga_satuan: harga });
        }
        if (bayar === 'Utang Supplier') state.utangSupplier += total;
        state.jurnal.unshift({ tgl_jurnal: new Date().toISOString().split('T')[0], no_bukti: 'BLJ-' + Date.now().toString().slice(-3), keterangan: `Belanja ${nama}`, akun_debit: kat === 'Beban Non-Kolam' ? 'Beban Operasional Non-Kolam' : `Persediaan ${kat}`, akun_kredit: bayar === 'Utang Supplier' ? 'Utang Supplier' : 'Kas & Bank', nominal: total, kategori_arus_kas: bayar === 'Utang Supplier' ? 'Non-Kas' : 'Operasional' });
        closeModal('modalBelanjaBaru'); e.target.reset(); renderAllModules();
    });

    // 7. Stock Opname
    document.getElementById('formOpname').addEventListener('submit', e => {
        e.preventDefault();
        const brg = state.persediaan.find(b => b.id_barang === document.getElementById('opBarang').value);
        const fisik = parseFloat(document.getElementById('opFisik').value);
        if (!brg) return;
        const selisih = brg.stok_tersedia - fisik;
        if (selisih > 0) {
            const nilaiSelisih = selisih * brg.harga_satuan;
            state.jurnal.unshift({ tgl_jurnal: new Date().toISOString().split('T')[0], no_bukti: 'OPN-' + Date.now().toString().slice(-3), keterangan: `Selisih Stock Opname ${brg.nama_barang}`, akun_debit: 'Beban Selisih Persediaan', akun_kredit: 'Persediaan Gudang', nominal: nilaiSelisih, kategori_arus_kas: 'Non-Kas' });
        }
        brg.stok_tersedia = fisik;
        closeModal('modalOpname'); e.target.reset(); renderAllModules();
    });

    // 8. Jurnal Manual
    document.getElementById('formJurnalManual').addEventListener('submit', e => {
        e.preventDefault();
        state.jurnal.unshift({
            tgl_jurnal: new Date().toISOString().split('T')[0],
            no_bukti: 'JM-' + Date.now().toString().slice(-3),
            keterangan: document.getElementById('jmKet').value,
            akun_debit: document.getElementById('jmDebit').value,
            akun_kredit: document.getElementById('jmKredit').value,
            nominal: parseFloat(document.getElementById('jmNominal').value),
            kategori_arus_kas: document.getElementById('jmArusKas').value
        });
        closeModal('modalJurnalManual'); e.target.reset(); renderAllModules();
    });

    // 9. Koreksi Data Siklus
    document.getElementById('formEditSiklus').addEventListener('submit', e => {
        e.preventDefault();
        const s = state.siklus.find(x => x.id_siklus === document.getElementById('edSiklusId').value);
        if (s) {
            s.populasi_hidup = parseInt(document.getElementById('edPopulasi').value);
            s.total_biaya_akumulasi = parseFloat(document.getElementById('edBiaya').value);
        }
        closeModal('modalEditSiklus'); renderAllModules();
    });
}

// Fungsi Koreksi & Hapus Data
function openEditSiklus(id) {
    const s = state.siklus.find(x => x.id_siklus === id);
    if (!s) return;
    document.getElementById('edSiklusId').value = s.id_siklus;
    document.getElementById('edPopulasi').value = s.populasi_hidup;
    document.getElementById('edBiaya').value = s.total_biaya_akumulasi;
    openModal('modalEditSiklus');
}
function hapusSiklus(id) { if (confirm('Hapus siklus kolam ini?')) { state.siklus = state.siklus.filter(s => s.id_siklus !== id); renderAllModules(); } }
function hapusMasterKolam(id) { if (confirm('Hapus master kolam tidak terpakai ini?')) { state.kolam = state.kolam.filter(k => k.id_kolam !== id); renderAllModules(); } }
function hapusLog(id) { if (confirm('Hapus log harian ini?')) { state.logHarian = state.logHarian.filter(l => l.id_log !== id); renderAllModules(); } }
function hapusPanen(id) { if (confirm('Hapus data panen ini?')) { state.panen = state.panen.filter(p => p.id_panen !== id); renderAllModules(); } }
function hapusPersediaan(id) { if (confirm('Hapus item persediaan ini?')) { state.persediaan = state.persediaan.filter(p => p.id_barang !== id); renderAllModules(); } }
function refreshDashboard() { renderDashboard(); }

function openModal(id) { document.getElementById(id).classList.remove('hidden'); document.getElementById(id).classList.add('flex'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); document.getElementById(id).classList.remove('flex'); }