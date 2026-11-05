/************************************************************
 * WONDERLAND MARKETING CENTER - Backend
 * File: Code.gs  (Google Apps Script Web App)
 ************************************************************/

/* ==================== CONFIGURATION ==================== */
const APP_NAME = 'Wonderland Marketing Center';
const TIMEZONE = 'Asia/Makassar';
const DB_ID_PROPERTY = 'WMC_DB_SPREADSHEET_ID';
const SESSION_PROPERTY = 'WMC_SESSIONS';
const SESSION_IDLE_TIMEOUT_MS = 60 * 60 * 1000; // logout otomatis bila tidak ada aktivitas > 1 jam
const SESSION_TOUCH_INTERVAL_MS = 60 * 1000;    // sesi diperpanjang paling sering sekali per menit
const PASSWORD_SALT = 'WMC-SMRD-SALT-2026';

const SHEETS = {
  SYSTEM_CONFIG: ['key','value','description','updated_at'],
  USERS: ['user_id','username','password_hash','nama','email','role','status','created_at','updated_at','last_login'],
  TEAM_MARKETING: ['team_id','user_id','nama','jabatan','whatsapp','email','tanggal_mulai','status','tanggung_jawab','created_at','updated_at'],
  OKR: ['okr_id','periode','sasaran','hasil_utama','target','aktual','pencapaian','status','PIC','created_at','updated_at','metric_id'],
  KPI: ['kpi_id','periode','nama_kpi','target','aktual','pencapaian','bobot','skor','PIC','created_at','updated_at'],
  RACI: ['raci_id','aktivitas','PIC','responsible','accountable','consulted','informed','okr_id','kpi_id','created_at','updated_at'],
  PDCA: ['pdca_id','periode','program','plan','do_action','check_result','action_improvement','status','PIC','okr_id','kpi_id','created_at','updated_at','metric_id'],
  CAMPAIGNS: ['campaign_id','nama_program','tujuan','target_pelanggan','periode_mulai','periode_selesai','anggaran','target_leads','target_transaksi','target_revenue','aktual_leads','aktual_transaksi','aktual_revenue','status','PIC','created_at','updated_at'],
  CONTENT: ['content_id','tanggal','judul','platform','jenis_konten','tujuan','target_pelanggan','status','PIC','caption','CTA','link','views','engagement','leads','transaksi','created_at','updated_at'],
  ACTIVITIES: ['activity_id','tanggal','user_id','jenis_aktivitas','qty','deskripsi','hasil','leads','transaksi','revenue','status','sumber','okr_id','kpi_id','pdca_id','raci_id','deadline','priority','progress','bukti','created_at','updated_at'],
  CUSTOMERS: ['customer_id','nama','whatsapp','email','kota','jenis_pelanggan','sumber','minat','tanggal_kunjungan_terakhir','total_transaksi','total_nilai_transaksi','status','PIC','created_at','updated_at','tanggal_lahir'],
  LEADS: ['lead_id','tanggal','nama','whatsapp','sumber','jenis_pelanggan','kebutuhan','nilai_potensi','status','tahap','PIC','tanggal_followup','catatan','alasan_lost','created_at','updated_at','crm_id','masuk_followup'],
  FOLLOWUPS: ['followup_id','lead_id','customer_id','tanggal','jenis','hasil','hasil_followup','alasan_lost','tindak_lanjut','tanggal_followup_berikutnya','PIC','status','reservation_id','created_at','crm_id','sumber'],
  RESERVATIONS: ['reservation_id','nomor_reservasi','customer_id','tanggal_reservasi','tanggal_kunjungan','jumlah_peserta','paket','wahana','aula','sound','makanan','snack','tambahan','harga','diskon','total','uang_muka','sisa_pembayaran','status_pembayaran','status_reservasi','PIC','catatan','created_at','updated_at','lead_id'],
  EVENTS: ['event_id','nama_event','jenis_event','tanggal_mulai','tanggal_selesai','lokasi','PIC','target_peserta','aktual_peserta','target_revenue','aktual_revenue','anggaran','aktual_biaya','sponsor','status','deskripsi','created_at','updated_at'],
  EVENT_PARTICIPANTS: ['participant_id','event_id','customer_id','nomor_peserta','nama','umur','sekolah','whatsapp','kategori','biaya','status_pembayaran','status_kehadiran','created_at','updated_at','crm_id','source','catatan'],
  // Master data vendor / rekanan marketing (percetakan, media, influencer, event organizer, dll.)
  // Sponsor event: perusahaan / pihak yang mendukung event dalam bentuk dana, barang, jasa, atau media
  SPONSORS: ['sponsor_id','nama_sponsor','kategori_sponsor','jenis_sponsorship','event_id','nilai_sponsorship','status','tanggal_deal','kontak_person','whatsapp','email','alamat','benefit_sponsor','PIC','catatan','created_at','updated_at'],
  VENDORS: ['vendor_id','nama_vendor','kategori_vendor','kontak_person','whatsapp','email','alamat','layanan','bank','no_rekening','status','catatan','created_at','updated_at'],
  VOUCHERS: ['voucher_id','kode_voucher','jenis_voucher','harga','benefit','tanggal_terbit','tanggal_kadaluarsa','status','customer_id','PIC','tanggal_penjualan','tanggal_penggunaan','created_at','updated_at'],
  // Laporan penjualan harian dari sistem POS Kasir (per kategori produk) -> menjadi sumber KPI Revenue Marketing
  POS_SALES: ['pos_id','tanggal','kategori_produk','harga','qty','satuan','total','catatan','created_at','updated_at'],
  // Definisi KPI yang bisa diatur sendiri (target, bobot, sumber data)
  KPI_SETTINGS: ['kpiset_id','nama_kpi','metrik','target','bobot','unit','aktual_manual','status','keterangan','okr_id','created_at','updated_at','metric_id','PIC','periode'],
  // Biaya marketing: promosi online & offline
  MARKETING_COSTS: ['biaya_id','tanggal','tipe_promosi','kategori_biaya','media_vendor','deskripsi','campaign_id','jumlah','status_pembayaran','PIC','catatan','created_at','updated_at'],
  // Pengaturan pilihan dropdown yang bisa diatur langsung dari web app
  DROPDOWN_OPTIONS: ['opsi_id','grup','nilai','urutan','status','created_at','updated_at'],
  // Customer Outreach: materi pesan WhatsApp (teks / gambar + caption) dan log aktivitas outreach (relasi utama: crm_id)
  OUTREACH_TEMPLATES: ['materi_id','nama_materi','tipe','segmen','isi_pesan','gambar_url','status','created_at','updated_at','spin_aktif','spin_varian'],
  OUTREACH_IMAGES: ['image_id','idx','mime','nama','data','created_at'],
  OUTREACH_QUEUE: ['queue_id','batch_id','crm_id','nama','whatsapp','pesan','image_ref','kirim_ms','status','dikirim_ms','error','PIC','campaign_id','campaign','materi_id','materi','outreach_id','dibuat_oleh','created_at','updated_at'],
  // Metric Library: definisi metrik (konfigurasi) yang dihitung engine dari data modul -> dipakai KPI, OKR, Scoreboard, Dashboard, PDCA
  METRICS: ['metric_id','metric_name','module','description','calculation_type','data_source','filter','unit','period','date_field','value_field','distinct_field','pic_field','numerator_metric','denominator_metric','formula','tampil_dashboard','status','is_system','created_at','updated_at'],
  OUTREACH_LOGS: ['outreach_id','crm_id','tanggal','PIC','campaign_id','campaign','materi_id','materi','segmen','pesan','status','hasil','lead_id','created_at','updated_at'],
  // Public Landing Pages: halaman publik (tanpa login) untuk Lead Capture / Reservasi Online / Registrasi Event
  LANDING_PAGES: ['page_id','slug','judul','deskripsi','banner_url','tipe','penawaran','cta_label','form_fields','campaign_id','source','event_id','biaya','kuota','PIC','status','periode_mulai','periode_selesai','created_at','updated_at']
};

// Modul frontend -> sheet + role yang berhak mengakses
const MODULES = {
  dashboard:    { sheet: null,             roles: ['ADMIN','MANAGER','MARKETING'] },
  team:         { sheet: 'TEAM_MARKETING', roles: ['ADMIN','MANAGER'] },
  okr:          { sheet: 'OKR',            roles: ['ADMIN','MANAGER'] },
  kpi:          { sheet: 'KPI',            roles: ['ADMIN','MANAGER'] },
  kpiset:       { sheet: 'KPI_SETTINGS',   roles: ['ADMIN','MANAGER'] },
  performance:  { sheet: null,             roles: ['ADMIN','MANAGER'] },
  scorecard:    { sheet: null,             roles: ['ADMIN','MANAGER'] },
  raci:         { sheet: 'RACI',           roles: ['ADMIN','MANAGER'] },
  pdca:         { sheet: 'PDCA',           roles: ['ADMIN','MANAGER'] },
  campaigns:    { sheet: 'CAMPAIGNS',      roles: ['ADMIN','MANAGER','MARKETING'] },
  content:      { sheet: 'CONTENT',        roles: ['ADMIN','MANAGER','MARKETING'] },
  activities:   { sheet: 'ACTIVITIES',     roles: ['ADMIN','MANAGER','MARKETING'] },
  customers:    { sheet: 'CUSTOMERS',      roles: ['ADMIN','MANAGER','MARKETING'] },
  leads:        { sheet: 'LEADS',          roles: ['ADMIN','MANAGER','MARKETING'] },
  followups:    { sheet: 'FOLLOWUPS',      roles: ['ADMIN','MANAGER','MARKETING'] },
  reservations: { sheet: 'RESERVATIONS',   roles: ['ADMIN','MANAGER','MARKETING'] },
  events:       { sheet: 'EVENTS',         roles: ['ADMIN','MANAGER','MARKETING'] },
  participants: { sheet: 'EVENT_PARTICIPANTS', roles: ['ADMIN','MANAGER','MARKETING'] },
  sponsors:     { sheet: 'SPONSORS',      roles: ['ADMIN','MANAGER','MARKETING'] },
  vendors:      { sheet: 'VENDORS',       roles: ['ADMIN','MANAGER','MARKETING'] },
  vouchers:     { sheet: 'VOUCHERS',       roles: ['ADMIN','MANAGER','MARKETING'] },
  pos:          { sheet: 'POS_SALES',      roles: ['ADMIN','MANAGER','MARKETING'] },
  costs:        { sheet: 'MARKETING_COSTS', roles: ['ADMIN','MANAGER','MARKETING'] },
  metrics:      { sheet: null,             roles: ['ADMIN','MANAGER','MARKETING'] },
  outreach:     { sheet: null,             roles: ['ADMIN','MANAGER','MARKETING'] },
  outreachtpl:  { sheet: 'OUTREACH_TEMPLATES', roles: ['ADMIN','MANAGER','MARKETING'] },
  landingpages: { sheet: 'LANDING_PAGES',       roles: ['ADMIN','MANAGER','MARKETING'] },
  opsi:         { sheet: null,             roles: ['ADMIN','MANAGER'] },
  reports:      { sheet: null,             roles: ['ADMIN','MANAGER'] }
};

const MODULE_ID_FIELDS = {
  team:'team_id', okr:'okr_id', kpi:'kpi_id', raci:'raci_id', pdca:'pdca_id',
  campaigns:'campaign_id', content:'content_id', activities:'activity_id',
  customers:'customer_id', leads:'lead_id', followups:'followup_id',
  reservations:'reservation_id', events:'event_id', participants:'participant_id', sponsors:'sponsor_id', vendors:'vendor_id',
  vouchers:'voucher_id', pos:'pos_id', costs:'biaya_id', kpiset:'kpiset_id', outreachtpl:'materi_id', landingpages:'page_id'
};

const MODULE_PREFIX = {
  team:'TM', okr:'OKR', kpi:'KPI', raci:'RC', pdca:'PDCA', campaigns:'CMP',
  content:'CNT', activities:'ACT', customers:'CUS', leads:'LEAD', followups:'FU',
  reservations:'RES', events:'EVT', participants:'PTC', sponsors:'SPN', vendors:'VND', vouchers:'VCH',
  pos:'POS', costs:'BYA', kpiset:'KS', outreachtpl:'MTR', landingpages:'LP'
};

/* ==================== CRM MASTER & RELASI: LEADS -> FOLLOW UP -> RESERVATION ==================== */
// Tahap lead baru mengikuti alur: NEW > CONTACTED > INTERESTED > FOLLOW UP > RESERVED / LOST.
// Nilai lama (BARU, DIHUBUNGI, BERMINAT, PENAWARAN, NEGOSIASI, BERHASIL, TIDAK BERHASIL)
// tetap dikenali di seluruh perhitungan agar data historis tidak rusak (backward-compatible).
const LEAD_STAGE_CONVERTED = ['RESERVED', 'BERHASIL'];
const LEAD_STAGE_QUALIFIED = ['INTERESTED', 'FOLLOW UP', 'RESERVED', 'BERHASIL', 'BERMINAT', 'PENAWARAN', 'NEGOSIASI'];

function normalizePhone_(v) {
  return String(v || '').replace(/\D/g, '');
}
function leadConverted_(l) {
  return LEAD_STAGE_CONVERTED.indexOf(String(l.tahap).toUpperCase()) >= 0;
}
function leadQualified_(l) {
  return LEAD_STAGE_QUALIFIED.indexOf(String(l.tahap).toUpperCase()) >= 0;
}

// Cache per-request agar pengecekan relasi CRM tidak berulang kali membaca sheet
let __crmCtx = null;
function crmCtx_() {
  if (!__crmCtx) {
    __crmCtx = {
      customers: null,
      leads: null,
      events: null,
      findCustomer: function(phone) {
        if (!this.customers) this.customers = getDataAsObjects('CUSTOMERS');
        const p = normalizePhone_(phone);
        if (!p) return null;
        return this.customers.filter(function(c) { return normalizePhone_(c.whatsapp) === p; })[0] || null;
      },
      findLead: function(id) {
        if (!this.leads) this.leads = getDataAsObjects('LEADS');
        return this.leads.filter(function(l) { return String(l.lead_id) === String(id); })[0] || null;
      },
      findEvent: function(id) {
        if (!this.events) {
          this.events = {};
          const self = this;
          getDataAsObjects('EVENTS').forEach(function(e) { self.events[String(e.event_id)] = e; });
        }
        return this.events[String(id)] || null;
      }
    };
  }
  return __crmCtx;
}

// Buat profil CRM baru dari data lead (dipakai bila nomor WhatsApp belum terdaftar di CRM)
function createCrmFromLead_(leadRec, now) {
  const ctx = crmCtx_();
  const id = generateId('CUS', 'CUSTOMERS', 'customer_id');
  const rec = {
    customer_id: id,
    nama: leadRec.nama || '',
    whatsapp: leadRec.whatsapp || '',
    email: leadRec.email || '',
    kota: leadRec.kota || '',
    jenis_pelanggan: leadRec.jenis_pelanggan || '',
    sumber: leadRec.sumber || '',
    minat: leadRec.kebutuhan || '',
    tanggal_kunjungan_terakhir: '',
    total_transaksi: 0,
    total_nilai_transaksi: 0,
    status: 'AKTIF',
    PIC: leadRec.PIC || '',
    created_at: now,
    updated_at: now
  };
  createRecord('CUSTOMERS', rec);
  if (ctx.customers) ctx.customers.push(rec);
  return id;
}

// Buat profil CRM baru dari data peserta event (sumber CRM = EVENT, menyimpan event asal)
function createCrmFromParticipant_(partRec, now) {
  const ctx = crmCtx_();
  const ev = partRec.event_id ? ctx.findEvent(partRec.event_id) : null;
  const evNama = ev ? String(ev.nama_event || '') : '';
  const id = generateId('CUS', 'CUSTOMERS', 'customer_id');
  const rec = {
    customer_id: id,
    nama: partRec.nama || '',
    whatsapp: partRec.whatsapp || '',
    email: partRec.email || '',
    kota: partRec.kota || '',
    jenis_pelanggan: partRec.kategori || '',
    sumber: 'EVENT',
    minat: 'Peserta event' + (evNama ? ': ' + evNama : '') + (partRec.event_id ? ' (' + partRec.event_id + ')' : ''),
    tanggal_kunjungan_terakhir: '',
    total_transaksi: 0,
    total_nilai_transaksi: 0,
    status: 'AKTIF',
    PIC: '',
    created_at: now,
    updated_at: now
  };
  createRecord('CUSTOMERS', rec);
  if (ctx.customers) ctx.customers.push(rec);
  return id;
}

// Pastikan lead punya profil CRM (buat bila belum ada). Mengembalikan crm_id atau ''.
function ensureCrmForLead_(leadRec, now) {
  if (!leadRec) return '';
  const ctx = crmCtx_();
  if (String(leadRec.crm_id || '').trim()) return String(leadRec.crm_id);
  const c = ctx.findCustomer(leadRec.whatsapp);
  if (c) return String(c.customer_id);
  return createCrmFromLead_(leadRec, now || nowString());
}

// Aturan inti: SATU nomor WhatsApp = SATU profil CRM.
// Lead otomatis menempel ke CRM yang sudah ada; CRM baru hanya dibuat bila belum terdaftar.
function linkLeadToCrm_(rec, isUpdate, current) {
  if (isUpdate && current && String(current.crm_id || '').trim()) {
    rec.crm_id = current.crm_id; // relasi yang sudah terbentuk tidak diubah
    return;
  }
  const phone = rec.whatsapp !== undefined ? rec.whatsapp : (current ? current.whatsapp : '');
  const existing = crmCtx_().findCustomer(phone);
  rec.crm_id = existing ? String(existing.customer_id) : createCrmFromLead_(rec, nowString());
}

// Setelah data tersimpan: jaga konsistensi alur status lead
function afterRecordSave_(module, rec, isUpdate) {
  try {
    if (!rec) return;
    const now = nowString();
    if (module === 'followups') {
      // Hasil follow up: RESERVATION / KUNJUNGAN BIASA / FOLLOW UP LAGI / LOST
      const hf = String(rec.hasil_followup || '').toUpperCase().trim();
      if (hf === 'RESERVATION') {
        const resId = createDraftReservationFromFollowup_(rec);
        if (resId && rec.followup_id) {
          updateRecord('FOLLOWUPS', 'followup_id', rec.followup_id, { reservation_id: resId, updated_at: now });
        }
      } else if (hf === 'FOLLOW UP LAGI') {
        createNextFollowup_(rec, now);
      } else if (hf === 'LOST') {
        if (rec.lead_id) {
          updateRecord('LEADS', 'lead_id', rec.lead_id, {
            tahap: 'LOST', status: 'BATAL',
            alasan_lost: rec.alasan_lost || '', updated_at: now
          });
        }
      }
      // Lead berlanjut ke tahap FOLLOW UP bila belum final (kecuali hasil LOST yang menutup lead)
      if (rec.lead_id && hf !== 'LOST') {
        const l = crmCtx_().findLead(rec.lead_id);
        if (l && String(rec.status || '').toUpperCase() !== 'BATAL') {
          const t = String(l.tahap).toUpperCase();
          if (['RESERVED', 'LOST', 'BERHASIL'].indexOf(t) < 0) {
            updateRecord('LEADS', 'lead_id', l.lead_id, { tahap: 'FOLLOW UP', updated_at: now });
          }
        }
      }
    }
    if (module === 'leads') {
      scheduleFollowupFromLead_(rec, now);
    }
    if (module === 'reservations' && rec.lead_id) {
      const l = crmCtx_().findLead(rec.lead_id);
      if (l && String(l.tahap).toUpperCase() !== 'LOST') {
        updateRecord('LEADS', 'lead_id', l.lead_id, { tahap: 'RESERVED', updated_at: now });
      }
    }
  } catch (e) {
    logError_('afterRecordSave_:' + module, e);
  }
}

/* ---- Otomatisasi hasil follow up: draft reservasi & jadwal berikutnya ---- */

// Buat DRAFT reservasi dari data Lead + Follow Up (marketing tinggal melengkapi detail)
function createDraftReservationFromFollowup_(fu) {
  const lead = fu.lead_id ? crmCtx_().findLead(fu.lead_id) : null;
  let customerId = String(fu.customer_id || fu.crm_id || (lead ? lead.crm_id : '') || '');
  if (!customerId && lead) customerId = ensureCrmForLead_(lead);
  if (!customerId) return '';
  const now = nowString();
  const id = generateId('RES', 'RESERVATIONS', 'reservation_id');
  const note = '[DRAFT otomatis dari Follow Up ' + (fu.followup_id || '') + (lead ? ' · Lead ' + lead.nama : '') +
    '] Lengkapi: tanggal kunjungan, jumlah pax, paket, harga, DP. ' + (fu.hasil || '');
  createRecord('RESERVATIONS', {
    reservation_id: id,
    nomor_reservasi: '',
    customer_id: customerId,
    tanggal_reservasi: todayString(),
    tanggal_kunjungan: String(fu.tanggal_followup_berikutnya || ''),
    jumlah_peserta: 1,
    paket: '', wahana: '', aula: '', sound: '', makanan: '', snack: '', tambahan: '',
    harga: '', diskon: 0, total: '', uang_muka: 0, sisa_pembayaran: '',
    status_pembayaran: 'BELUM BAYAR',
    status_reservasi: RESERVATION_STATUS_DRAFT,
    PIC: fu.PIC || '',
    catatan: note,
    created_at: now,
    updated_at: now,
    lead_id: fu.lead_id || ''
  });
  return id;
}

// Buat jadwal follow up berikutnya otomatis (status TERJADWAL)
function createNextFollowup_(fu, now) {
  if (!String(fu.tanggal_followup_berikutnya || '').trim()) return '';
  const id = generateId('FU', 'FOLLOWUPS', 'followup_id');
  createRecord('FOLLOWUPS', {
    followup_id: id,
    lead_id: fu.lead_id || '',
    customer_id: fu.customer_id || '',
    crm_id: fu.crm_id || '',
    tanggal: String(fu.tanggal_followup_berikutnya || ''),
    jenis: fu.jenis || '',
    hasil: '',
    hasil_followup: '',
    alasan_lost: '',
    reservation_id: '',
    tindak_lanjut: fu.tindak_lanjut || '',
    tanggal_followup_berikutnya: '',
    PIC: fu.PIC || '',
    status: 'TERJADWAL',
    created_at: now,
    updated_at: now
  });
  return id;
}

/* ---- Lead masuk -> jadwal Follow Up otomatis ---- */
const FOLLOWUP_SOURCE_LEAD = 'LEAD_AUTO';
const LEAD_STAGE_CLOSED = ['RESERVED', 'BERHASIL', 'LOST', 'TIDAK BERHASIL'];

function normDate_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, TIMEZONE, 'yyyy-MM-dd');
  return String(v || '').trim().substring(0, 10);
}

// Dijalankan setelah lead tersimpan (baru maupun diedit).
// Jadwal dibuat bila "Tanggal Follow-up" terisi ATAU "Masukkan ke Daftar Follow Up" = YA
// (bila tanggal kosong, jadwal dibuat untuk hari ini). Lead yang sudah RESERVED/LOST tidak dijadwalkan.
function scheduleFollowupFromLead_(lead, now) {
  if (!lead || !lead.lead_id) return '';
  if (LEAD_STAGE_CLOSED.indexOf(String(lead.tahap || '').toUpperCase()) >= 0) return '';
  const hasDate = String(lead.tanggal_followup || '').trim() !== '';
  const flagged = String(lead.masuk_followup || '').toUpperCase().trim() === 'YA';
  if (!hasDate && !flagged) return '';
  const date = hasDate ? normDate_(lead.tanggal_followup) : todayString();

  const mine = getDataAsObjects('FOLLOWUPS').filter(function(f) {
    return String(f.lead_id) === String(lead.lead_id) && String(f.sumber) === FOLLOWUP_SOURCE_LEAD;
  });
  // Jadwal untuk tanggal yang sama sudah pernah dibuat (terjadwal maupun selesai) -> jangan dobel
  if (mine.some(function(f) { return normDate_(f.tanggal) === date; })) return '';
  // Tanggal lead diubah & jadwal otomatis sebelumnya belum dikerjakan -> geser jadwal itu saja
  const pending = mine.filter(function(f) { return String(f.status).toUpperCase() === 'TERJADWAL'; })[0];
  if (pending) {
    updateRecord('FOLLOWUPS', 'followup_id', pending.followup_id, { tanggal: date, PIC: lead.PIC || pending.PIC || '' });
    return String(pending.followup_id);
  }

  const crmId = String(lead.crm_id || '').trim() || ensureCrmForLead_(lead, now);
  const id = generateId('FU', 'FOLLOWUPS', 'followup_id');
  createRecord('FOLLOWUPS', {
    followup_id: id,
    lead_id: lead.lead_id,
    customer_id: crmId,
    crm_id: crmId,
    tanggal: date,
    jenis: 'WhatsApp',
    hasil: '',
    hasil_followup: '',
    alasan_lost: '',
    tindak_lanjut: String(lead.kebutuhan || ''),
    tanggal_followup_berikutnya: '',
    PIC: lead.PIC || '',
    status: 'TERJADWAL',
    reservation_id: '',
    created_at: now || nowString(),
    sumber: FOLLOWUP_SOURCE_LEAD
  });
  return id;
}

/* ---- Peserta Event -> CRM (tombol manual di menu Peserta Event) ---- */
// ids kosong = semua peserta yang belum punya crm_id. Nomor WhatsApp dicek dulu agar tidak ada profil ganda.
function apiAddParticipantsToCrm(token, ids) {
  try {
    checkPermission(token, 'participants', 'update');
    __crmCtx = null;
    const targets = {};
    const useIds = Array.isArray(ids) && ids.length > 0;
    if (useIds) ids.forEach(function(x) { targets[String(x)] = true; });
    const now = nowString();
    let added = 0, linked = 0, already = 0, noPhone = 0;
    // Tanpa script lock di sini: generateId() sudah memakai lock sendiri (lock tidak bisa dipakai bersarang)
    getDataAsObjects('EVENT_PARTICIPANTS').forEach(function(p) {
      if (useIds ? !targets[String(p.participant_id)] : String(p.crm_id || '').trim()) return;
      if (String(p.crm_id || '').trim()) { already++; return; }
      if (!normalizePhone_(p.whatsapp)) { noPhone++; return; }
      const c = crmCtx_().findCustomer(p.whatsapp);
      let crmId;
      if (c) { crmId = String(c.customer_id); linked++; }
      else { crmId = createCrmFromParticipant_(p, now); added++; }
      updateRecord('EVENT_PARTICIPANTS', 'participant_id', p.participant_id,
        { crm_id: crmId, source: 'EVENT', updated_at: now });
    });
    const parts = [];
    if (added) parts.push(added + ' CRM baru dibuat');
    if (linked) parts.push(linked + ' dihubungkan ke CRM yang sudah ada');
    if (already) parts.push(already + ' sudah ada di CRM');
    if (noPhone) parts.push(noPhone + ' dilewati karena tanpa nomor WhatsApp');
    return {
      success: true, added: added, linked: linked, already: already, noPhone: noPhone,
      message: parts.length ? 'Selesai: ' + parts.join(', ') + '.' : 'Tidak ada peserta yang perlu dimasukkan ke CRM.'
    };
  } catch (e) {
    return handleError_('apiAddParticipantsToCrm', e);
  }
}

// Sumber data KPI yang tersedia (dihitung otomatis) + MANUAL
const KPI_METRICS = ['REVENUE_TOTAL','REVENUE_POS','KONVERSI','REPEAT','LEADS_POTENSIAL','AKTIVITAS','CUSTOMER_BARU','CONTENT','MANUAL','METRIC'];
const KPI_METRIC_UNIT = { REVENUE_TOTAL: 'Rp', REVENUE_POS: 'Rp', KONVERSI: '%' };
const KPI_SEEDED_PROPERTY = 'WMC_KPI_SETTINGS_SEEDED';
// Migrasi database lama: kolom baru yang harus ada di sheet (ditambah di ujung kanan bila belum ada)
const COLUMN_MIGRATIONS = {
  ACTIVITIES: ['qty', 'sumber', 'okr_id', 'kpi_id', 'pdca_id', 'raci_id', 'deadline', 'priority', 'progress', 'bukti'],
  CUSTOMERS: ['tanggal_lahir'],
  OUTREACH_TEMPLATES: ['spin_aktif', 'spin_varian'],
  LEADS: ['crm_id', 'alasan_lost', 'masuk_followup', 'landing_page_id'],
  FOLLOWUPS: ['crm_id', 'hasil_followup', 'alasan_lost', 'reservation_id', 'sumber'],
  RESERVATIONS: ['lead_id', 'landing_page_id'],
  EVENT_PARTICIPANTS: ['crm_id', 'source', 'checked_in_at', 'catatan'],
  KPI_SETTINGS: ['okr_id', 'metric_id', 'PIC', 'periode'],
  OKR: ['metric_id'],
  RACI: ['okr_id', 'kpi_id'],
  PDCA: ['okr_id', 'kpi_id', 'metric_id']
};
const COLUMNS_MIGRATED_PROPERTY = 'WMC_COLUMNS_MIGRATED_V9';

// Pilihan wajib hasil follow up: RESERVATION / KUNJUNGAN BIASA / FOLLOW UP LAGI / LOST
const FOLLOWUP_RESULTS = ['RESERVATION', 'KUNJUNGAN BIASA', 'FOLLOW UP LAGI', 'LOST'];
const RESERVATION_STATUS_DRAFT = 'DRAFT';
const VENDOR_OPTIONS_SEEDED_PROPERTY = 'WMC_VENDOR_OPTIONS_SEEDED';
const SPONSOR_OPTIONS_SEEDED_PROPERTY = 'WMC_SPONSOR_OPTIONS_SEEDED';

/* ==================== WEB APP ENTRY ==================== */
function doGet(e) {
  // URL publik landing page: .../exec?page=<slug>  -> halaman tanpa login (Public.html)
  if (e && e.parameter && e.parameter.page) {
    const t = HtmlService.createTemplateFromFile('Public');
    // Parameter disuntik dari server: tetap benar walau halaman dibuka lewat domain/proxy sendiri
    const params = {};
    Object.keys(e.parameter).forEach(function (k) { params[k] = String(e.parameter[k]); });
    t.serverParams = JSON.stringify(params).replace(/</g, '\\u003c');
    return t.evaluate()
      .setTitle('Wonderland Samarinda')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Wonderland Marketing Center')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setFaviconUrl('https://ssl.gstatic.com/docs/script/images/logo.png');
}

// API gateway untuk PWA (frontend statis di GitHub Pages) dan landing page publik.
// Body: text/plain berisi JSON {fn, args} (menghindari CORS preflight).
// Hanya fungsi pada whitelist yang bisa dipanggil. Autentikasi tetap lewat token sesi
// yang divalidasi di dalam masing-masing fungsi (validateSession / checkPermission).
// initializeSystem sengaja TIDAK dibuka: jalankan dari editor Apps Script atau lewat versi web app bawaan.
function doPost(e) {
  let out;
  try {
    const map = {
    getCustomer360: getCustomer360,
    apiImportCustomers: apiImportCustomers,
    apiOutreachUploadImage: apiOutreachUploadImage,
    apiOutreachGetImage: apiOutreachGetImage,
    apiOutreachDeleteImage: apiOutreachDeleteImage,
    apiOutreachSenderKey: apiOutreachSenderKey,
    apiOutreachScheduleBatch: apiOutreachScheduleBatch,
    apiOutreachQueueList: apiOutreachQueueList,
    apiOutreachQueueAction: apiOutreachQueueAction,
    senderPull: senderPull,
    senderImage: senderImage,
    senderReport: senderReport,
    apiAddParticipantsToCrm: apiAddParticipantsToCrm,
    apiCheckCustomerByPhone: apiCheckCustomerByPhone,
    apiCreateRecord: apiCreateRecord,
    apiCreateRecords: apiCreateRecords,
    apiDeleteMany: apiDeleteMany,
    apiDeleteOption: apiDeleteOption,
    apiDeleteRecord: apiDeleteRecord,
    apiEventCheckin: apiEventCheckin,
    apiExportParticipants: apiExportParticipants,
    apiGetLookups: apiGetLookups,
    apiGetOptionSettings: apiGetOptionSettings,
    apiGetOptions: apiGetOptions,
    apiGetRecords: apiGetRecords,
    apiGetTeamNames: apiGetTeamNames,
    apiLandingGetSettings: apiLandingGetSettings,
    apiLandingSaveSettings: apiLandingSaveSettings,
    apiMetricDelete: apiMetricDelete,
    apiMetricEvaluate: apiMetricEvaluate,
    apiMetricGetLibrary: apiMetricGetLibrary,
    apiMetricPreview: apiMetricPreview,
    apiMetricSave: apiMetricSave,
    apiMoveOption: apiMoveOption,
    apiOutreachCreateLog: apiOutreachCreateLog,
    apiOutreachDeleteLog: apiOutreachDeleteLog,
    apiOutreachGetBootstrap: apiOutreachGetBootstrap,
    apiOutreachGetOverview: apiOutreachGetOverview,
    apiOutreachSetTarget: apiOutreachSetTarget,
    apiOutreachUpdateLog: apiOutreachUpdateLog,
    apiRevenueConfigGet: apiRevenueConfigGet,
    apiRevenueConfigSave: apiRevenueConfigSave,
    apiSaveOption: apiSaveOption,
    apiUpdateRecord: apiUpdateRecord,
    apiWaReportData: apiWaReportData,
    changePassword: changePassword,
    checkSystemStatus: checkSystemStatus,
    getCostSummary: getCostSummary,
    getCurrentUser: getCurrentUser,
    getDashboardData: getDashboardData,
    getKpiData: getKpiData,
    getPerformanceOverview: getPerformanceOverview,
    getPosSummary: getPosSummary,
    getReportData: getReportData,
    getScorecardData: getScorecardData,
    login: login,
    logout: logout,
    pingSession: pingSession,
    pubGetLandingPage: pubGetLandingPage,
    pubRegisterEvent: pubRegisterEvent,
    pubSubmitLead: pubSubmitLead,
    pubSubmitReservation: pubSubmitReservation,
    saveKpiSnapshot: saveKpiSnapshot
    };
    const body = JSON.parse(e.postData.contents);
    const fn = String(body.fn || '');
    if (!Object.prototype.hasOwnProperty.call(map, fn)) {
      out = { success: false, message: 'Permintaan tidak dikenal.' };
    } else {
      out = map[fn].apply(null, Array.isArray(body.args) ? body.args : []);
    }
  } catch (err) {
    out = { success: false, message: 'Permintaan tidak valid.' };
  }
  return ContentService.createTextOutput(JSON.stringify(out === undefined ? null : out)).setMimeType(ContentService.MimeType.JSON);
}

/* ==================== SYSTEM STATUS & AUTO SETUP ==================== */
function checkSystemStatus() {
  try {
    const id = PropertiesService.getScriptProperties().getProperty(DB_ID_PROPERTY);
    if (!id) return { success: true, initialized: false };
    try {
      const ss = SpreadsheetApp.openById(id);
      return { success: true, initialized: true, spreadsheetUrl: ss.getUrl() };
    } catch (e) {
      return { success: true, initialized: false };
    }
  } catch (e) {
    return { success: false, initialized: false, message: 'Terjadi kesalahan saat memeriksa sistem.' };
  }
}

// Dipanggil dari frontend saat user menekan tombol INITIALIZE SYSTEM
function initializeSystem() {
  try {
    const result = initializeDatabase();
    return result;
  } catch (e) {
    logError_('initializeSystem', e);
    return { success: false, message: 'Gagal membuat database. Silakan coba lagi.' };
  }
}

// Dapat dijalankan manual dari Apps Script Editor
function setupSystem() {
  const result = initializeDatabase();
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

/* ==================== DATABASE INITIALIZATION ==================== */
function initializeDatabase() {
  const props = PropertiesService.getScriptProperties();
  const existingId = props.getProperty(DB_ID_PROPERTY);
  if (existingId) {
    try {
      const existingSS = SpreadsheetApp.openById(existingId);
      if (existingSS) {
        return { success: true, alreadyExists: true, spreadsheetId: existingId, spreadsheetUrl: existingSS.getUrl(), message: 'Database sudah ada dan digunakan.' };
      }
    } catch (e) { /* id rusak, buat baru */ }
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    // Double-check setelah lock
    const recheck = props.getProperty(DB_ID_PROPERTY);
    if (recheck) {
      try {
        const ss0 = SpreadsheetApp.openById(recheck);
        if (ss0) return { success: true, alreadyExists: true, spreadsheetId: recheck, spreadsheetUrl: ss0.getUrl(), message: 'Database sudah ada dan digunakan.' };
      } catch (e) {}
    }

    const ss = SpreadsheetApp.create('Wonderland Marketing Center - Database');
    const keys = Object.keys(SHEETS);
    // Gunakan sheet default sebagai sheet pertama
    ss.getSheets()[0].setName(keys[0]).getRange(1, 1, 1, SHEETS[keys[0]].length).setValues([SHEETS[keys[0]]]).setFontWeight('bold').setBackground('#6d28d9').setFontColor('#ffffff');
    for (let i = 1; i < keys.length; i++) {
      const sh = ss.insertSheet(keys[i]);
      sh.getRange(1, 1, 1, SHEETS[keys[i]].length).setValues([SHEETS[keys[i]]]).setFontWeight('bold').setBackground('#6d28d9').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    }
    ss.getSheetByName(keys[0]).setFrozenRows(1);

    seedInitialData_(ss);
    props.setProperty(DB_ID_PROPERTY, ss.getId());
    return { success: true, alreadyExists: false, spreadsheetId: ss.getId(), spreadsheetUrl: ss.getUrl(), message: 'Database berhasil dibuat.' };
  } finally {
    lock.releaseLock();
  }
}

function seedInitialData_(ss) {
  const now = nowString();
  const today = todayString();
  const periode = currentMonthKey_();

  // SYSTEM_CONFIG
  const cfg = ss.getSheetByName('SYSTEM_CONFIG');
  [
    ['app_name', APP_NAME, 'Nama aplikasi', now],
    ['timezone', TIMEZONE, 'Zona waktu sistem', now],
    ['default_passwords', JSON.stringify({ admin: 'admin123', manager: 'manager123', marketing1: 'mkt12345', marketing2: 'mkt12345' }), 'Password awal akun seed (WAJIB diganti setelah login pertama)', now],
    ['kpi_target_revenue', '50000000', 'Target pendapatan dari marketing per bulan (Rp)', now],
    ['kpi_target_konversi', '25', 'Target tingkat konversi penjualan per bulan (%)', now],
    ['kpi_target_repeat', '20', 'Target transaksi pelanggan kembali per bulan', now],
    ['kpi_target_leads', '60', 'Target calon pelanggan potensial per bulan', now],
    ['kpi_target_aktivitas', '80', 'Target aktivitas marketing per bulan', now],
    ['kpi_target_customer_baru', '40', 'Target pertumbuhan data pelanggan baru per bulan', now]
  ].forEach(function(r) { cfg.appendRow(r); });

  // USERS
  const us = ss.getSheetByName('USERS');
  [
    ['USR-00001','admin', hashPassword('admin123'), 'Administrator', 'admin@wonderlandsamarinda.com', 'ADMIN', 'AKTIF', now, now, ''],
    ['USR-00002','manager', hashPassword('manager123'), 'Manager Marketing', 'manager@wonderlandsamarinda.com', 'MANAGER', 'AKTIF', now, now, ''],
    ['USR-00003','marketing1', hashPassword('mkt12345'), 'Marketing 1', 'mkt1@wonderlandsamarinda.com', 'MARKETING', 'AKTIF', now, now, ''],
    ['USR-00004','marketing2', hashPassword('mkt12345'), 'Marketing 2', 'mkt2@wonderlandsamarinda.com', 'MARKETING', 'AKTIF', now, now, '']
  ].forEach(function(r) { us.appendRow(r); });

  // TEAM_MARKETING
  const tm = ss.getSheetByName('TEAM_MARKETING');
  [
    ['TM-00001','USR-00003','Marketing 1','Marketing','0812-0000-001','mkt1@wonderlandsamarinda.com',today,'AKTIF','Konten, leads, follow-up reservasi',now,now],
    ['TM-00002','USR-00004','Marketing 2','Marketing','0812-0000-002','mkt2@wonderlandsamarinda.com',today,'AKTIF','Campaign, event, voucher',now,now]
  ].forEach(function(r) { tm.appendRow(r); });

  // KPI definisi periode berjalan (bobot total 100%)
  const kp = ss.getSheetByName('KPI');
  [
    ['KPI-00001', periode, 'Pendapatan dari Marketing', '50000000', '0', '0', '30', '0', 'Tim Marketing', now, now],
    ['KPI-00002', periode, 'Tingkat Konversi Penjualan', '25', '0', '0', '20', '0', 'Tim Marketing', now, now],
    ['KPI-00003', periode, 'Total Konten yang Dihasilkan', '30', '0', '0', '10', '0', 'Tim Marketing', now, now],
    ['KPI-00004', periode, 'Calon Pelanggan Potensial', '60', '0', '0', '15', '0', 'Tim Marketing', now, now],
    ['KPI-00005', periode, 'Pencapaian Aktivitas Marketing', '80', '0', '0', '15', '0', 'Tim Marketing', now, now],
    ['KPI-00006', periode, 'Pertumbuhan Data Pelanggan', '40', '0', '0', '10', '0', 'Tim Marketing', now, now]
  ].forEach(function(r) { kp.appendRow(r); });

  // OKR contoh
  ss.getSheetByName('OKR').appendRow(['OKR-00001', periode, 'Meningkatkan jumlah reservasi grup', 'Jumlah reservasi grup tercapai', '30', '0', '0', 'ON TRACK', 'Tim Marketing', now, now]);

  // RACI contoh
  ss.getSheetByName('RACI').appendRow(['RC-00001','Penyusunan kalender konten bulanan','Tim Marketing','Marketing 1, Marketing 2','Manager Marketing','Manager','Seluruh tim',now,now]);

  // PDCA contoh
  ss.getSheetByName('PDCA').appendRow(['PDCA-00001',periode,'Promosi weekend Wonderland','Menyusun konten promosi weekend','Posting konten di IG & TikTok','','','PLAN','Marketing 1',now,now]);
}

/* ==================== AUTHENTICATION ==================== */
function login(username, password) {
  try {
    if (!username || !password) {
      return { success: false, message: 'Username dan password wajib diisi.' };
    }
    const users = getDataAsObjects('USERS');
    const user = users.find(function(u) {
      return String(u.username).toLowerCase() === String(username).toLowerCase();
    });
    if (!user) return { success: false, message: 'Username atau password salah.' };
    if (String(user.status).toUpperCase() !== 'AKTIF') {
      return { success: false, message: 'Akun tidak aktif. Hubungi administrator.' };
    }
    if (String(user.password_hash) !== hashPassword(password)) {
      return { success: false, message: 'Username atau password salah.' };
    }
    const token = createSession(user);
    updateRecord('USERS', 'user_id', user.user_id, { last_login: nowString() });

    const mustChange = isDefaultPassword_(user);
    return {
      success: true,
      token: token,
      user: { user_id: user.user_id, username: user.username, nama: user.nama, role: user.role },
      mustChangePassword: mustChange
    };
  } catch (e) {
    logError_('login', e);
    return { success: false, message: 'Terjadi kesalahan saat login. Silakan coba lagi.' };
  }
}

function logout(token) {
  try {
    destroySession(token);
    return { success: true };
  } catch (e) {
    return { success: false, message: 'Terjadi kesalahan.' };
  }
}

function getCurrentUser(token) {
  try {
    const session = validateSession(token);
    if (!session) return { success: false, code: 'SESSION_EXPIRED', message: 'Sesi berakhir. Silakan login kembali.' };
    const users = getDataAsObjects('USERS');
    const user = users.find(function(u) { return u.user_id === session.user_id; });
    if (!user || String(user.status).toUpperCase() !== 'AKTIF') {
      destroySession(token);
      return { success: false, code: 'SESSION_EXPIRED', message: 'Sesi berakhir. Silakan login kembali.' };
    }
    return {
      success: true,
      user: { user_id: user.user_id, username: user.username, nama: user.nama, role: user.role, email: user.email },
      mustChangePassword: isDefaultPassword_(user)
    };
  } catch (e) {
    logError_('getCurrentUser', e);
    return { success: false, code: 'SESSION_EXPIRED', message: 'Sesi berakhir. Silakan login kembali.' };
  }
}

function isDefaultPassword_(user) {
  try {
    const cfg = getConfigMap_();
    const defaults = cfg.default_passwords ? JSON.parse(cfg.default_passwords) : {};
    const keys = Object.keys(defaults);
    for (let i = 0; i < keys.length; i++) {
      if (String(user.password_hash) === hashPassword(defaults[keys[i]])) return true;
    }
    return false;
  } catch (e) { return false; }
}

function changePassword(token, oldPassword, newPassword) {
  try {
    const session = validateSession(token);
    if (!session) return { success: false, code: 'SESSION_EXPIRED', message: 'Sesi berakhir. Silakan login kembali.' };
    if (!oldPassword || !newPassword) return { success: false, message: 'Password lama dan baru wajib diisi.' };
    if (String(newPassword).length < 8) return { success: false, message: 'Password baru minimal 8 karakter.' };
    if (String(newPassword) === String(oldPassword)) return { success: false, message: 'Password baru harus berbeda dengan password lama.' };

    const users = getDataAsObjects('USERS');
    const user = users.find(function(u) { return u.user_id === session.user_id; });
    if (!user) return { success: false, message: 'Pengguna tidak ditemukan.' };
    if (String(user.password_hash) !== hashPassword(oldPassword)) {
      return { success: false, message: 'Password lama salah.' };
    }
    updateRecord('USERS', 'user_id', user.user_id, { password_hash: hashPassword(newPassword), updated_at: nowString() });
    return { success: true, message: 'Password berhasil diubah.' };
  } catch (e) {
    logError_('changePassword', e);
    return { success: false, message: 'Terjadi kesalahan saat mengubah password. Silakan coba lagi.' };
  }
}

/* ==================== SESSION ==================== */
function createSession(user) {
  const token = Utilities.getUuid();
  const nowMs = Date.now();
  mutateSessions_(function(sessions) {
    // Bersihkan sesi yang sudah tidak aktif lebih dari batas idle
    Object.keys(sessions).forEach(function(t) {
      const last = Number(sessions[t].last || sessions[t].created) || 0;
      if (nowMs - last > SESSION_IDLE_TIMEOUT_MS) delete sessions[t];
    });
    sessions[token] = {
      user_id: user.user_id,
      username: user.username,
      nama: user.nama,
      role: user.role,
      created: nowMs,
      last: nowMs
    };
  });
  return token;
}

// Sesi hanya berakhir bila TIDAK ADA aktivitas lebih dari SESSION_IDLE_TIMEOUT_MS (1 jam).
// Setiap aktivitas (request ke server) memperpanjang sesi, sehingga selama dipakai sesi tidak tertutup sendiri.
function validateSession(token) {
  if (!token) return null;
  const sessions = getSessions_();
  const s = sessions[token];
  if (!s) return null;
  const nowMs = Date.now();
  const last = Number(s.last || s.created) || 0;
  if (nowMs - last > SESSION_IDLE_TIMEOUT_MS) {
    try {
      mutateSessions_(function(all) { if (all[token]) delete all[token]; });
    } catch (e) { logError_('validateSession:expire', e); }
    return null;
  }
  // Perbarui waktu aktivitas terakhir (dibatasi agar tidak menulis di setiap request)
  if (nowMs - last > SESSION_TOUCH_INTERVAL_MS) {
    try {
      mutateSessions_(function(all) { if (all[token]) all[token].last = nowMs; });
    } catch (e) { logError_('validateSession:touch', e); }
  }
  s.last = nowMs;
  return s;
}

// Dipanggil frontend secara berkala saat pengguna aktif (menjaga sesi tetap hidup)
function pingSession(token) {
  try {
    const s = validateSession(token);
    if (!s) return { success: false, code: 'SESSION_EXPIRED', message: 'Sesi berakhir. Silakan login kembali.' };
    return { success: true };
  } catch (e) {
    return { success: false, message: 'Terjadi kesalahan.' };
  }
}

function destroySession(token) {
  if (!token) return;
  mutateSessions_(function(sessions) { if (sessions[token]) delete sessions[token]; });
}

function getSessions_() {
  try {
    const raw = PropertiesService.getScriptProperties().getProperty(SESSION_PROPERTY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

function saveSessions_(sessions) {
  PropertiesService.getScriptProperties().setProperty(SESSION_PROPERTY, JSON.stringify(sessions));
}

// Baca-ubah-tulis daftar sesi dengan lock, agar login/aktivitas beberapa pengguna sekaligus tidak saling menimpa
function mutateSessions_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sessions = getSessions_();
    fn(sessions);
    saveSessions_(sessions);
  } finally {
    lock.releaseLock();
  }
}

/* ==================== AUTHORIZATION ==================== */
function checkPermission(token, module, action) {
  const session = validateSession(token);
  if (!session) {
    const err = new Error('Sesi berakhir. Silakan login kembali.');
    err.code = 'SESSION_EXPIRED';
    throw err;
  }
  const def = MODULES[module];
  if (!def || def.roles.indexOf(session.role) === -1) {
    const err = new Error('Anda tidak memiliki izin untuk mengakses modul ini.');
    err.code = 'PERMISSION_DENIED';
    throw err;
  }
  return session;
}

/* ==================== DATABASE HELPERS ==================== */
let __ssCache = null;
function getSS() {
  if (__ssCache) return __ssCache;
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty(DB_ID_PROPERTY);
  if (!id) {
    const err = new Error('Database belum diinisialisasi.');
    err.code = 'NOT_INITIALIZED';
    throw err;
  }
  let ss;
  try {
    ss = SpreadsheetApp.openById(id);
  } catch (e) {
    const err = new Error('Spreadsheet database tidak ditemukan.');
    err.code = 'DB_NOT_FOUND';
    throw err;
  }
  ensureSheets_(ss);
  ensureColumns_(ss);
  __ssCache = ss;
  seedKpiSettingsOnce_(ss);
  return ss;
}

// Isi awal pengaturan KPI (sekali saja) memakai target lama dari SYSTEM_CONFIG
function seedKpiSettingsOnce_(ss) {
  try {
    const props = PropertiesService.getScriptProperties();
    if (props.getProperty(KPI_SEEDED_PROPERTY)) return;
    const sh = ss.getSheetByName('KPI_SETTINGS');
    if (!sh) return;
    if (sh.getLastRow() < 2) {
      const lock = LockService.getScriptLock();
      lock.waitLock(30000);
      try {
        if (sh.getLastRow() < 2) {
          const cfg = getConfigMap_();
          const now = nowString();
          [
            ['KS-00001','Pendapatan Marketing','REVENUE_TOTAL', parseNum_(cfg.kpi_target_revenue) || 50000000, 30,'Rp','','AKTIF','Reservasi + event + POS Kasir','OKR-00001'],
            ['KS-00002','Tingkat Konversi Leads','KONVERSI', parseNum_(cfg.kpi_target_konversi) || 25, 20,'%','','AKTIF','Leads berhasil / total leads','OKR-00001'],
            ['KS-00003','Total Konten yang Dihasilkan','CONTENT', 30, 10,'','','AKTIF','Jumlah konten dihasilkan bulan berjalan','OKR-00001'],
            ['KS-00004','Jumlah Pelanggan Potensial','LEADS_POTENSIAL', parseNum_(cfg.kpi_target_leads) || 60, 15,'','','AKTIF','Leads tahap berminat s/d berhasil','OKR-00001'],
            ['KS-00005','Pencapaian Aktivitas Marketing','AKTIVITAS', parseNum_(cfg.kpi_target_aktivitas) || 80, 15,'','','AKTIF','Total Qty aktivitas berstatus selesai','OKR-00001'],
            ['KS-00006','Pertumbuhan Data Pelanggan','CUSTOMER_BARU', parseNum_(cfg.kpi_target_customer_baru) || 40, 10,'','','AKTIF','Pelanggan baru bulan berjalan','OKR-00001']
          ].forEach(function(r) { sh.appendRow(r.concat([now, now])); });
        }
      } finally {
        lock.releaseLock();
      }
    }
    props.setProperty(KPI_SEEDED_PROPERTY, '1');
  } catch (e) {
    logError_('seedKpiSettingsOnce_', e);
  }
}

// Migrasi otomatis: membuat sheet baru (mis. POS_SALES, MARKETING_COSTS) pada database lama
function ensureSheets_(ss) {
  const existing = {};
  ss.getSheets().forEach(function(sh) { existing[sh.getName()] = true; });
  const missing = Object.keys(SHEETS).filter(function(n) { return !existing[n]; });
  if (missing.length === 0) return;
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    missing.forEach(function(name) {
      if (ss.getSheetByName(name)) return; // sudah dibuat oleh proses lain
      const sh = ss.insertSheet(name);
      sh.getRange(1, 1, 1, SHEETS[name].length).setValues([SHEETS[name]])
        .setFontWeight('bold').setBackground('#6d28d9').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    });
  } finally {
    lock.releaseLock();
  }
}

// Migrasi otomatis kolom baru pada database lama (mis. kolom qty di ACTIVITIES).
// Data lama diberi qty = 1 agar total aktivitas & KPI tidak berubah. Hanya berjalan sekali.
// Tanggal lahir disimpan sebagai teks yyyy-mm-dd agar tidak bergeser sehari karena zona waktu
function customerBirthTextFormat_(sh, col) {
  try {
    const n = Math.max(1, sh.getMaxRows() - 1);
    sh.getRange(2, col, n, 1).setNumberFormat('@');
  } catch (e) { logError_('customerBirthTextFormat_', e); }
}

function ensureColumns_(ss) {
  try {
    const props = PropertiesService.getScriptProperties();
    if (props.getProperty(COLUMNS_MIGRATED_PROPERTY)) return;
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      if (props.getProperty(COLUMNS_MIGRATED_PROPERTY)) return;
      Object.keys(COLUMN_MIGRATIONS).forEach(function(sheetName) {
        const sh = ss.getSheetByName(sheetName);
        if (!sh || sh.getLastColumn() < 1) return;
        const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
        COLUMN_MIGRATIONS[sheetName].forEach(function(col) {
          if (headers.indexOf(col) >= 0) {
            if (sheetName === 'CUSTOMERS' && col === 'tanggal_lahir') customerBirthTextFormat_(sh, headers.indexOf(col) + 1);
            return;
          }
          const newCol = headers.length + 1;
          sh.getRange(1, headers.length).copyTo(sh.getRange(1, newCol), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
          sh.getRange(1, newCol).setValue(col);
          headers.push(col);
          if (sheetName === 'CUSTOMERS' && col === 'tanggal_lahir') customerBirthTextFormat_(sh, newCol);
          // Isi nilai awal 1 untuk baris lama yang sudah berisi data
          if (sheetName === 'ACTIVITIES' && col === 'qty' && sh.getLastRow() > 1) {
            const n = sh.getLastRow() - 1;
            const ids = sh.getRange(2, 1, n, 1).getValues();
            const vals = ids.map(function(r) { return [String(r[0]).trim() ? 1 : '']; });
            sh.getRange(2, newCol, n, 1).setValues(vals);
          }
        });
      });
      props.setProperty(COLUMNS_MIGRATED_PROPERTY, '1');
    } finally {
      lock.releaseLock();
    }
  } catch (e) {
    logError_('ensureColumns_', e);
  }
}

function getHeaders(sheetName) {
  const ss = getSS();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 1 || sheet.getLastColumn() < 1) {
    return SHEETS[sheetName] ? SHEETS[sheetName].slice() : [];
  }
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
}

// Pola wajib: Spreadsheet -> Object -> JSON -> Frontend
function getDataAsObjects(sheetName) {
  const ss = getSS();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];
  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0].map(String);
  const out = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    let empty = true;
    for (let c = 0; c < row.length; c++) {
      if (row[c] !== '' && row[c] !== null && row[c] !== undefined) { empty = false; break; }
    }
    if (empty) continue;
    const obj = {};
    for (let h = 0; h < headers.length; h++) {
      obj[headers[h]] = normalizeValue_(row[h]);
    }
    out.push(obj);
  }
  return out;
}

function normalizeValue_(v) {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return Utilities.formatDate(v, TIMEZONE, 'yyyy-MM-dd');
  return v;
}

function getConfigMap_() {
  const rows = getDataAsObjects('SYSTEM_CONFIG');
  const map = {};
  rows.forEach(function(r) { map[String(r.key)] = r.value; });
  return map;
}

/* ==================== ID GENERATOR ==================== */
function generateId(prefix, sheetName, idField) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = getSS().getSheetByName(sheetName);
    const headers = getHeaders(sheetName);
    const colIdx = headers.indexOf(idField);
    let max = 0;
    if (sheet && sheet.getLastRow() > 1 && colIdx >= 0) {
      const vals = sheet.getRange(2, colIdx + 1, sheet.getLastRow() - 1, 1).getValues();
      for (let i = 0; i < vals.length; i++) {
        const m = String(vals[i][0]).match(/(\d+)\s*$/);
        if (m) max = Math.max(max, parseInt(m[1], 10));
      }
    }
    return prefix + '-' + String(max + 1).padStart(5, '0');
  } finally {
    lock.releaseLock();
  }
}

/* ==================== GENERIC CRUD ==================== */
function createRecord(sheetName, data) {
  const sheet = getSS().getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet ' + sheetName + ' tidak ditemukan.');
  const headers = getHeaders(sheetName);
  const row = headers.map(function(h) {
    return data[h] !== undefined && data[h] !== null ? data[h] : '';
  });
  sheet.appendRow(row);
  return data;
}

function getRecordById(sheetName, idField, id) {
  const rows = getDataAsObjects(sheetName);
  return rows.find(function(r) { return String(r[idField]) === String(id); }) || null;
}

function updateRecord(sheetName, idField, id, data) {
  const sheet = getSS().getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet ' + sheetName + ' tidak ditemukan.');
  const headers = getHeaders(sheetName);
  const colIdx = headers.indexOf(idField);
  const lastRow = sheet.getLastRow();
  if (colIdx < 0 || lastRow < 2) return false;
  const ids = sheet.getRange(2, colIdx + 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      const rowIdx = i + 2;
      const current = sheet.getRange(rowIdx, 1, 1, headers.length).getValues()[0];
      for (let c = 0; c < headers.length; c++) {
        if (headers[c] !== idField && data[headers[c]] !== undefined) {
          current[c] = data[headers[c]];
        }
      }
      sheet.getRange(rowIdx, 1, 1, headers.length).setValues([current]);
      return true;
    }
  }
  return false;
}

function deleteRecord(sheetName, idField, id) {
  const sheet = getSS().getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet ' + sheetName + ' tidak ditemukan.');
  const headers = getHeaders(sheetName);
  const colIdx = headers.indexOf(idField);
  const lastRow = sheet.getLastRow();
  if (colIdx < 0 || lastRow < 2) return false;
  const ids = sheet.getRange(2, colIdx + 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      sheet.deleteRow(i + 2);
      return true;
    }
  }
  return false;
}

/* ==================== GENERIC API (dipanggil frontend) ==================== */
function apiGetRecords(token, module) {
  try {
    checkPermission(token, module, 'read');
    const sheet = MODULES[module].sheet;
    const data = getDataAsObjects(sheet);
    if (module === 'activities') {
      const resolveTeam_ = buildTeamNameResolver_();
      data.forEach(function(a) { a.user_id = resolveTeam_(a.user_id); });
    }
    if (module === 'leads') {
      // Lead lama tanpa crm_id tetap terhubung ke CRM lewat pencocokan nomor WhatsApp
      const custById = {}, custByPhone = {};
      getDataAsObjects('CUSTOMERS').forEach(function(c) {
        custById[String(c.customer_id)] = c;
        const p = normalizePhone_(c.whatsapp);
        if (p) custByPhone[p] = c;
      });
      data.forEach(function(l) {
        if (!String(l.crm_id || '').trim()) {
          const c = custByPhone[normalizePhone_(l.whatsapp)];
          if (c) l.crm_id = String(c.customer_id);
        }
        const c = custById[String(l.crm_id)];
        l.crm_nama = c ? String(c.nama) : '';
      });
    }
    if (module === 'participants') {
      const evMap = {};
      getDataAsObjects('EVENTS').forEach(function(e) { evMap[String(e.event_id)] = String(e.nama_event || ''); });
      data.forEach(function(p) { p.event_nama = evMap[String(p.event_id)] || ''; });
    }
    if (module === 'landingpages') {
      data.forEach(function(p) { p.public_url = landingPublicUrl_(p.slug); });
    }
    if (module === 'okr') {
      // Progress OKR otomatis dari KPI terhubung (bila tidak ada KPI, nilai manual tetap dipakai)
      enrichOkrRows_(data);
    }
    if (module === 'kpiset') {
      const okrMap = {};
      getDataAsObjects('OKR').forEach(function(o) { okrMap[String(o.okr_id)] = String(o.sasaran || ''); });
      data.forEach(function(k) { k.okr_sasaran = okrMap[String(k.okr_id || '')] || ''; });
      const rtK = metricRuntime_();
      data.forEach(function(k) { kpiDecorate_(rtK, k); });
    }
    if (module === 'pdca') {
      const rtP = metricRuntime_();
      data.forEach(function(p) {
        const mm = String(p.metric_id || '').trim() ? rtP.metric(p.metric_id) : null;
        if (!mm) return;
        const per = /^\d{4}-\d{2}$/.test(String(p.periode)) ? String(p.periode) : currentMonthKey_();
        try { p.metric_aktual = metricEval_(rtP, p.metric_id, { period: per }).v; } catch (err) { p.metric_aktual = ''; }
        p.metric_nama = mm.metric_name; p.metric_unit = mm.unit || '';
      });
    }
    return { success: true, data: data };
  } catch (e) {
    return handleError_('apiGetRecords:' + module, e);
  }
}

function apiCreateRecord(token, module, data) {
  try {
    checkPermission(token, module, 'create');
    __crmCtx = null;
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Data tidak valid.' };
    }
    const sheet = MODULES[module].sheet;
    const idField = MODULE_ID_FIELDS[module];
    const prefix = MODULE_PREFIX[module];
    const now = nowString();
    const clean = {};
    Object.keys(data).forEach(function(k) {
      if (k !== idField && k !== 'created_at' && k !== 'updated_at') clean[k] = data[k];
    });
    const verr = validateRecord_(module, clean, false, null);
    if (verr) return { success: false, message: verr };
    applyDerivedFields_(module, clean, null);
    clean[idField] = generateId(prefix, sheet, idField);
    const headers = getHeaders(sheet);
    if (headers.indexOf('created_at') >= 0) clean.created_at = now;
    if (headers.indexOf('updated_at') >= 0) clean.updated_at = now;
    createRecord(sheet, clean);
    afterRecordSave_(module, clean, false);
    return { success: true, data: clean, message: 'Data berhasil ditambahkan.' };
  } catch (e) {
    return handleError_('apiCreateRecord:' + module, e);
  }
}

// Simpan banyak baris sekaligus (editor data grid). Semua baris divalidasi dulu; bila ada yang salah, tidak ada yang ditulis.
function apiCreateRecords(token, module, list) {
  try {
    checkPermission(token, module, 'create');
    __crmCtx = null;
    if (!Array.isArray(list) || list.length === 0) return { success: false, message: 'Tidak ada data untuk disimpan.' };
    if (list.length > 200) return { success: false, message: 'Maksimal 200 baris sekali simpan.' };
    const sheetName = MODULES[module].sheet;
    const idField = MODULE_ID_FIELDS[module];
    const prefix = MODULE_PREFIX[module];
    const headers = getHeaders(sheetName);
    const now = nowString();

    const cleaned = [];
    for (let i = 0; i < list.length; i++) {
      const data = list[i];
      if (!data || typeof data !== 'object') return { success: false, message: 'Baris ' + (i + 1) + ': data tidak valid.' };
      const clean = {};
      Object.keys(data).forEach(function(k) {
        if (k !== idField && k !== 'created_at' && k !== 'updated_at') clean[k] = data[k];
      });
      const verr = validateRecord_(module, clean, false, null);
      if (verr) return { success: false, message: 'Baris ' + (i + 1) + ': ' + verr };
      applyDerivedFields_(module, clean, null);
      cleaned.push(clean);
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = getSS().getSheetByName(sheetName);
      if (!sheet) throw new Error('Sheet ' + sheetName + ' tidak ditemukan.');
      const colIdx = headers.indexOf(idField);
      let max = 0;
      if (sheet.getLastRow() > 1 && colIdx >= 0) {
        const vals = sheet.getRange(2, colIdx + 1, sheet.getLastRow() - 1, 1).getValues();
        for (let i = 0; i < vals.length; i++) {
          const m = String(vals[i][0]).match(/(\d+)\s*$/);
          if (m) max = Math.max(max, parseInt(m[1], 10));
        }
      }
      const rows = cleaned.map(function(c, i) {
        c[idField] = prefix + '-' + String(max + i + 1).padStart(5, '0');
        if (headers.indexOf('created_at') >= 0) c.created_at = now;
        if (headers.indexOf('updated_at') >= 0) c.updated_at = now;
        return headers.map(function(h) { return c[h] !== undefined && c[h] !== null ? c[h] : ''; });
      });
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
    } finally {
      lock.releaseLock();
    }
    cleaned.forEach(function(c) { afterRecordSave_(module, c, false); });
    return { success: true, count: cleaned.length, message: cleaned.length + ' data berhasil ditambahkan.' };
  } catch (e) {
    return handleError_('apiCreateRecords:' + module, e);
  }
}

function apiUpdateRecord(token, module, id, data) {
  try {
    checkPermission(token, module, 'update');
    __crmCtx = null;
    if (!id) return { success: false, message: 'ID data tidak valid.' };
    if (!data || typeof data !== 'object') return { success: false, message: 'Data tidak valid.' };
    const sheet = MODULES[module].sheet;
    const idField = MODULE_ID_FIELDS[module];
    const headers = getHeaders(sheet);
    const clean = {};
    Object.keys(data).forEach(function(k) {
      if (k !== idField && k !== 'created_at' && headers.indexOf(k) >= 0) clean[k] = data[k];
    });
    if (headers.indexOf('updated_at') >= 0) clean.updated_at = nowString();
    const currentRec = getRecordById(sheet, idField, id);
    const verr = validateRecord_(module, clean, true, currentRec);
    if (verr) return { success: false, message: verr };
    applyDerivedFields_(module, clean, currentRec);
    const ok = updateRecord(sheet, idField, id, clean);
    if (!ok) return { success: false, message: 'Data tidak ditemukan.' };
    const merged = getRecordById(sheet, idField, id);
    if (merged) afterRecordSave_(module, merged, true);
    return { success: true, message: 'Data berhasil diperbarui.' };
  } catch (e) {
    return handleError_('apiUpdateRecord:' + module, e);
  }
}

// Validasi ringan di sisi server
function validateRecord_(module, rec, isUpdate, current) {
  function has(k) { return rec[k] !== undefined && String(rec[k]).trim() !== ''; }
  if (module === 'customers' && rec.tanggal_lahir !== undefined && has('tanggal_lahir')) {
    const tl = String(rec.tanggal_lahir).trim().substring(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tl)) return 'Format Tanggal Lahir tidak valid.';
    const y = parseInt(tl.substring(0, 4), 10);
    if (y < 1900 || tl > todayString()) return 'Tanggal Lahir tidak valid (tidak boleh di masa depan).';
    rec.tanggal_lahir = tl;
  }
  if (module === 'pos') {
    if (!isUpdate || rec.tanggal !== undefined) { if (!has('tanggal')) return 'Tanggal wajib diisi.'; }
    if (!isUpdate || rec.kategori_produk !== undefined) { if (!has('kategori_produk')) return 'Kategori produk wajib diisi.'; }
    if (!isUpdate || rec.total !== undefined) {
      if (!has('total') || parseNum_(rec.total) < 0) return 'Total omset wajib diisi (tidak boleh negatif).';
    }
  }
  if (module === 'kpiset') {
    if (!isUpdate || rec.nama_kpi !== undefined) { if (!has('nama_kpi')) return 'Nama KPI wajib diisi.'; }
    if (!isUpdate || rec.metric_id !== undefined || rec.metrik !== undefined) {
      const midV = String(rec.metric_id === undefined ? '' : rec.metric_id).trim();
      if (midV && midV !== 'MANUAL') { if (!metricExists_(midV)) return 'Metric tidak ditemukan di Metric Library.'; }
      else if (!midV && rec.metrik !== undefined && String(rec.metrik) !== '' && KPI_METRICS.indexOf(String(rec.metrik)) < 0) return 'Sumber data KPI tidak valid.';
      else if (!midV && !isUpdate && String(rec.metrik || '') === '') return 'Pilih Metric dari Metric Library.';
    }
    if (!isUpdate || rec.target !== undefined) { if (!has('target') || parseNum_(rec.target) < 0) return 'Target harus diisi (tidak boleh negatif).'; }
    if (!isUpdate || rec.bobot !== undefined) { const b = parseNum_(rec.bobot); if (!has('bobot') || b < 0 || b > 100) return 'Bobot harus antara 0 sampai 100.'; }
  }
  if (module === 'activities' && (!isUpdate || rec.user_id !== undefined)) {
    if (!has('user_id')) return 'PIC wajib dipilih dari Data Tim.';
  }
  if (module === 'activities' && rec.qty !== undefined && has('qty')) {
    const q = parseNum_(rec.qty);
    if (q < 1) return 'Qty aktivitas minimal 1.';
    if (q > 9999) return 'Qty aktivitas maksimal 9999.';
  }
  if (module === 'sponsors') {
    if (!isUpdate || rec.nama_sponsor !== undefined) { if (!has('nama_sponsor')) return 'Nama sponsor wajib diisi.'; }
    if (!isUpdate || rec.kategori_sponsor !== undefined) { if (!has('kategori_sponsor')) return 'Kategori sponsor wajib diisi.'; }
    if (!isUpdate || rec.jenis_sponsorship !== undefined) { if (!has('jenis_sponsorship')) return 'Jenis sponsorship wajib dipilih.'; }
    if (has('nilai_sponsorship') && parseNum_(rec.nilai_sponsorship) < 0) return 'Nilai sponsorship tidak boleh negatif.';
    if (has('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(rec.email).trim())) return 'Format email sponsor tidak valid.';
  }
  if (module === 'vendors') {
    if (!isUpdate || rec.nama_vendor !== undefined) { if (!has('nama_vendor')) return 'Nama vendor wajib diisi.'; }
    if (!isUpdate || rec.kategori_vendor !== undefined) { if (!has('kategori_vendor')) return 'Kategori vendor wajib diisi.'; }
    if (has('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(rec.email).trim())) return 'Format email vendor tidak valid.';
  }
  if (module === 'costs') {
    if (!isUpdate || rec.tanggal !== undefined) { if (!has('tanggal')) return 'Tanggal wajib diisi.'; }
    if (!isUpdate || rec.kategori_biaya !== undefined) { if (!has('kategori_biaya')) return 'Kategori biaya wajib diisi.'; }
    if (!isUpdate || rec.jumlah !== undefined) { if (parseNum_(rec.jumlah) <= 0) return 'Jumlah biaya harus lebih dari 0.'; }
  }
  if (module === 'outreachtpl') {
    const spinErr = validateTemplateSpin_(rec);
    if (spinErr) return spinErr;
    const curT = current || {};
    if (!isUpdate || rec.nama_materi !== undefined) { if (!has('nama_materi')) return 'Nama materi wajib diisi.'; }
    if (!isUpdate || rec.isi_pesan !== undefined) { if (!has('isi_pesan')) return 'Isi pesan / caption wajib diisi.'; }
    const tipeT = String(rec.tipe !== undefined ? rec.tipe : curT.tipe || '').toUpperCase();
    const imgT = rec.gambar_url !== undefined ? rec.gambar_url : curT.gambar_url;
    if (tipeT.indexOf('GAMBAR') === 0 && !String(imgT || '').trim()) return 'Materi bertipe GAMBAR + CAPTION wajib mengunggah Gambar.';
  }
  if (module === 'followups') {
    const cur = current || {};
    const hf = rec.hasil_followup !== undefined ? String(rec.hasil_followup).toUpperCase().trim() : '';
    if (!isUpdate && !hf) return 'Hasil follow up wajib dipilih (RESERVATION / KUNJUNGAN BIASA / FOLLOW UP LAGI / LOST).';
    if (hf && FOLLOWUP_RESULTS.indexOf(hf) < 0) return 'Hasil follow up tidak valid.';
    const nextVal = rec.tanggal_followup_berikutnya !== undefined ? rec.tanggal_followup_berikutnya : cur.tanggal_followup_berikutnya;
    if (hf === 'FOLLOW UP LAGI' && !String(nextVal || '').trim()) return 'Hasil FOLLOW UP LAGI wajib diisi "Tanggal Follow-up Berikutnya".';
    const lostVal = rec.alasan_lost !== undefined ? rec.alasan_lost : cur.alasan_lost;
    if (hf === 'LOST' && !String(lostVal || '').trim()) return 'Hasil LOST wajib mencatat "Alasan Lost".';
    const leadVal = rec.lead_id !== undefined ? rec.lead_id : cur.lead_id;
    if ((hf === 'LOST' || hf === 'RESERVATION') && !String(leadVal || '').trim()) return 'Hasil ' + hf + ' memerlukan Lead terkait (pilih Lead pada form).';
  }
  if (module === 'landingpages') {
    const cur = current || {};
    if (!isUpdate || rec.slug !== undefined) {
      if (!has('slug')) return 'Slug wajib diisi.';
      if (!/^[a-z0-9][a-z0-9\-]{2,59}$/i.test(String(rec.slug).trim())) return 'Slug hanya huruf/angka/tanda hubung (3-60 karakter), tanpa spasi.';
    }
    if (!isUpdate || rec.judul !== undefined) { if (!has('judul')) return 'Judul wajib diisi.'; }
    if (!isUpdate || rec.tipe !== undefined) {
      const t = String(rec.tipe === undefined ? '' : rec.tipe).toUpperCase().trim();
      if (['LEAD', 'RESERVASI', 'EVENT'].indexOf(t) < 0) return 'Tipe halaman tidak valid (LEAD / RESERVASI / EVENT).';
      if (t === 'EVENT' && !String(rec.event_id !== undefined ? rec.event_id : cur.event_id || '').trim()) return 'Tipe EVENT wajib memilih Event terkait.';
    }
    if (rec.form_fields !== undefined && String(rec.form_fields).trim()) {
      try {
        const a = JSON.parse(String(rec.form_fields));
        if (!Array.isArray(a)) throw new Error('x');
        for (let i = 0; i < a.length; i++) {
          const it = a[i];
          const k = String(it && typeof it === 'object' ? it.key : it || '').trim();
          if (!k) throw new Error('x');
          if (/^x_/i.test(k)) {
            if (!/^x_[a-z0-9_]{1,40}$/i.test(k)) return 'Kode kolom kustom tidak valid.';
            if (!(it && typeof it === 'object' && String(it.label || '').trim())) return 'Kolom kustom wajib punya label.';
          } else if (!LANDING_STD_FIELDS[k]) return 'Kolom "' + k + '" tidak dikenal.';
        }
      } catch (e) { return 'Form Fields harus berupa JSON array.'; }
    }
    if (!isUpdate || rec.slug !== undefined) {
      const clash = getDataAsObjects('LANDING_PAGES').some(function(p) {
        return String(p.page_id) !== String(cur.page_id || '') && String(p.slug).toLowerCase() === String(rec.slug).trim().toLowerCase();
      });
      if (clash) return 'Slug "' + rec.slug + '" sudah dipakai halaman lain.';
    }
  }
  return '';
}

// Nilai turunan yang dihitung server (total omset POS dibulatkan 2 desimal)
function applyDerivedFields_(module, rec, current) {
  if (module === 'landingpages') {
    if (rec.slug !== undefined) rec.slug = String(rec.slug).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    if (rec.tipe !== undefined) rec.tipe = String(rec.tipe).toUpperCase().trim();
    if (rec.status !== undefined) rec.status = String(rec.status).toUpperCase().trim() || 'AKTIF';
    if (rec.kuota !== undefined && String(rec.kuota).trim() !== '') rec.kuota = Math.max(0, Math.round(parseNum_(rec.kuota)));
    if (rec.biaya !== undefined && String(rec.biaya).trim() !== '') rec.biaya = Math.max(0, parseNum_(rec.biaya));
  }
  if (module === 'kpiset') {
    const cur = current || {};
    if (rec.metric_id !== undefined && String(rec.metric_id).trim() !== '') {
      const mid = String(rec.metric_id).trim();
      if (mid === 'MANUAL') {
        rec.metrik = 'MANUAL'; rec.metric_id = '';
      } else {
        const mm = metricRuntime_().metric(mid);
        const legacy = Object.keys(LEGACY_METRIC_MAP).filter(function(k) { return LEGACY_METRIC_MAP[k] === mid; })[0];
        rec.metrik = legacy || 'METRIC';
        if (mm) rec.unit = mm.unit || '';
      }
    } else {
      const metrik = rec.metrik !== undefined ? rec.metrik : cur.metrik;
      if (metrik && metrik !== 'MANUAL' && metrik !== 'METRIC') rec.unit = KPI_METRIC_UNIT[metrik] || '';
    }
  }
  if (module === 'pos' && rec.total !== undefined) {
    rec.total = Math.round(parseNum_(rec.total) * 100) / 100;
  }
  // Qty aktivitas: bilangan bulat; tidak terisi otomatis (data baru tanpa qty = 0, harus diisi marketing)
  if (module === 'activities') {
    if (rec.qty !== undefined && String(rec.qty).trim() !== '') rec.qty = Math.max(0, Math.round(parseNum_(rec.qty)));
    else if (!current) rec.qty = 0;
    else if (rec.qty !== undefined) delete rec.qty;
    // Performance management: sumber tugas, konteks relasional, deadline, priority, progress, bukti
    if (rec.sumber !== undefined) rec.sumber = String(rec.sumber).toUpperCase().trim() || 'MANUAL';
    else if (!current) rec.sumber = 'MANUAL';
    if (rec.priority !== undefined) {
      const pr = String(rec.priority).toUpperCase().trim();
      rec.priority = ['RENDAH', 'SEDANG', 'TINGGI'].indexOf(pr) >= 0 ? pr : 'SEDANG';
    }
    if (rec.progress !== undefined && String(rec.progress).trim() !== '') {
      rec.progress = Math.min(100, Math.max(0, Math.round(parseNum_(rec.progress))));
    }
  }

  /* ---- Relasi CRM otomatis (Leads -> Follow Up -> Reservation) ---- */
  if (module === 'leads') {
    linkLeadToCrm_(rec, !!current, current || null);
  }
  if (module === 'followups') {
    const lid = rec.lead_id !== undefined ? rec.lead_id : (current ? current.lead_id : '');
    let cid = '';
    if (lid) {
      const l = crmCtx_().findLead(lid);
      if (l && l.crm_id) cid = String(l.crm_id);
    }
    if (!cid) {
      const c = rec.customer_id !== undefined ? rec.customer_id : (current ? current.customer_id : '');
      if (c) cid = String(c);
    }
    if (cid) rec.crm_id = cid;

    // Hasil follow up (RESERVATION / KUNJUNGAN BIASA / FOLLOW UP LAGI / LOST):
    // seluruh hasil wajib terhubung ke CRM; RESERVATION juga butuh customer_id utk draft reservasi
    const hf = String(rec.hasil_followup !== undefined ? rec.hasil_followup : (current ? current.hasil_followup : '')).toUpperCase().trim();
    if (FOLLOWUP_RESULTS.indexOf(hf) >= 0) {
      if (!rec.crm_id) {
        const lead = lid ? crmCtx_().findLead(lid) : null;
        if (lead) {
          rec.crm_id = ensureCrmForLead_(lead);
        } else {
          const c2 = crmCtx_().findCustomer(rec.whatsapp || '');
          if (c2) rec.crm_id = String(c2.customer_id);
        }
      }
      if (hf === 'RESERVATION' && !rec.customer_id && rec.crm_id) rec.customer_id = rec.crm_id;
      if (lid && !rec.lead_id) rec.lead_id = lid;
    }
  }
  if (module === 'reservations') {
    const lid = rec.lead_id !== undefined ? rec.lead_id : (current ? current.lead_id : '');
    if (lid) {
      const l = crmCtx_().findLead(lid);
      if (l && l.crm_id && !(rec.customer_id || (current && current.customer_id))) {
        rec.customer_id = String(l.crm_id);
      }
    }
  }

  /* ---- Peserta Event otomatis masuk CRM: sumber CRM = EVENT, cek WhatsApp dulu agar tidak ganda ---- */
  if (module === 'participants') {
    rec.source = 'EVENT';
    const phone = rec.whatsapp !== undefined ? rec.whatsapp : (current ? current.whatsapp : '');
    if (String(phone || '').trim()) {
      const c = crmCtx_().findCustomer(phone);
      rec.crm_id = c ? String(c.customer_id) : createCrmFromParticipant_(rec, nowString());
    }
  }
}

function apiDeleteRecord(token, module, id) {
  try {
    checkPermission(token, module, 'delete');
    if (!id) return { success: false, message: 'ID data tidak valid.' };
    const sheet = MODULES[module].sheet;
    const idField = MODULE_ID_FIELDS[module];
    const ok = deleteRecord(sheet, idField, id);
    if (!ok) return { success: false, message: 'Data tidak ditemukan.' };
    return { success: true, message: 'Data berhasil dihapus.' };
  } catch (e) {
    return handleError_('apiDeleteRecord:' + module, e);
  }
}

function apiDeleteMany(token, module, ids) {
  try {
    checkPermission(token, module, 'delete');
    if (!Array.isArray(ids) || ids.length === 0) return { success: false, message: 'Tidak ada data dipilih.' };
    const sheet = MODULES[module].sheet;
    const idField = MODULE_ID_FIELDS[module];
    let deleted = 0;
    // Hapus dari bawah agar nomor row tidak bergeser
    const sheetObj = getSS().getSheetByName(sheet);
    const headers = getHeaders(sheet);
    const colIdx = headers.indexOf(idField);
    const lastRow = sheetObj.getLastRow();
    if (lastRow >= 2 && colIdx >= 0) {
      const vals = sheetObj.getRange(2, colIdx + 1, lastRow - 1, 1).getValues();
      const targets = {};
      ids.forEach(function(x) { targets[String(x)] = true; });
      for (let i = vals.length - 1; i >= 0; i--) {
        if (targets[String(vals[i][0])]) {
          sheetObj.deleteRow(i + 2);
          deleted++;
        }
      }
    }
    return { success: true, message: deleted + ' data berhasil dihapus.' };
  } catch (e) {
    return handleError_('apiDeleteMany:' + module, e);
  }
}

/* ==================== LOOKUP DATA (untuk form select) ==================== */
function apiGetTeamNames(token) {
  try {
    const session = validateSession(token);
    if (!session) return { success: false, code: 'SESSION_EXPIRED', message: 'Sesi berakhir. Silakan login kembali.' };
    const usersById = {};
    getDataAsObjects('USERS').forEach(function(u) { usersById[String(u.user_id)] = u; });
    const team = getDataAsObjects('TEAM_MARKETING')
      .filter(function(t) { return String(t.status).toUpperCase() === 'AKTIF'; })
      .map(function(t) {
        const u = usersById[String(t.user_id)] || {};
        return { nama: t.nama, jabatan: t.jabatan, user_id: String(t.user_id || ''), username: String(u.username || '') };
      });
    return { success: true, data: team };
  } catch (e) {
    return handleError_('apiGetTeamNames', e);
  }
}

// Petakan nilai PIC lama (username / user_id akun) ke nama anggota di Data Tim
function buildTeamNameResolver_() {
  const users = {};
  getDataAsObjects('USERS').forEach(function(u) { users[String(u.user_id)] = u; });
  const map = {};
  getDataAsObjects('TEAM_MARKETING').forEach(function(t) {
    const u = users[String(t.user_id)] || {};
    [t.nama, t.user_id, u.username, u.nama].forEach(function(a) {
      const k = String(a || '').trim().toLowerCase();
      if (k) map[k] = String(t.nama);
    });
  });
  return function(value) {
    const raw = String(value || '').trim();
    return map[raw.toLowerCase()] || raw;
  };
}

function apiGetLookups(token) {
  try {
    const session = validateSession(token);
    if (!session) return { success: false, code: 'SESSION_EXPIRED', message: 'Sesi berakhir. Silakan login kembali.' };
    const customers = getDataAsObjects('CUSTOMERS').map(function(c) { return { id: c.customer_id, nama: c.nama }; });
    const leads = getDataAsObjects('LEADS').map(function(l) { return { id: l.lead_id, nama: l.nama }; });
    const events = getDataAsObjects('EVENTS').map(function(ev) { return { id: ev.event_id, nama: ev.nama_event }; });
    const users = getDataAsObjects('USERS').map(function(u) { return { id: u.user_id, nama: u.nama, username: u.username }; });
    const campaigns = getDataAsObjects('CAMPAIGNS').map(function(c) { return { id: c.campaign_id, nama: c.nama_program }; });
    const okr = getDataAsObjects('OKR').map(function(o) { return { id: o.okr_id, nama: o.sasaran }; });
    const kpiset = getDataAsObjects('KPI_SETTINGS').map(function(k) { return { id: k.kpiset_id, nama: k.nama_kpi }; });
    const pdca = getDataAsObjects('PDCA').map(function(p) { return { id: p.pdca_id, nama: p.program }; });
    const raci = getDataAsObjects('RACI').map(function(r) { return { id: r.raci_id, nama: r.aktivitas }; });
    return { success: true, data: { customers: customers, leads: leads, events: events, users: users, campaigns: campaigns, okr: okr, kpiset: kpiset, pdca: pdca, raci: raci, metrics: metricLookups_() } };
  } catch (e) {
    return handleError_('apiGetLookups', e);
  }
}

/* ==================== OKR <-> KPI: progress OKR dihitung otomatis dari KPI terhubung ==================== */
// KPI terhubung ke OKR lewat kolom okr_id pada KPI_SETTINGS. Actual tiap KPI dihitung live dari
// sumber operasional yang sama (CRM, Leads, Reservasi, Konten, Aktivitas) -> single source of truth.
function enrichOkrRows_(rows) {
  const live = computeKpiNow_();
  const settings = getDataAsObjects('KPI_SETTINGS');
  const rtO = metricRuntime_();
  rows.forEach(function(o) {
    if (String(o.metric_id || '').trim()) {
      const mm = rtO.metric(o.metric_id);
      if (mm) {
        const per = /^\d{4}-\d{2}$/.test(String(o.periode)) ? String(o.periode) : currentMonthKey_();
        const r = metricEval_(rtO, o.metric_id, { period: per });
        o.metric_nama = mm.metric_name; o.kpis = []; o.aktual = r.v;
        o.pencapaian = parseNum_(o.target) > 0 ? Math.round((r.v / parseNum_(o.target)) * 1000) / 10 : 0;
        return;
      }
    }
    const linked = settings.filter(function(k) { return String(k.okr_id || '') !== '' && String(k.okr_id) === String(o.okr_id); });
    if (!linked.length) { o.kpis = []; return; }
    let sum = 0;
    const names = [];
    o.kpis = linked.map(function(k) {
      const d = live.kpis.filter(function(x) { return String(x.id) === String(k.kpiset_id); })[0];
      const aktual = d ? d.aktual : parseNum_(k.aktual_manual);
      const p = d ? d.pencapaian : (parseNum_(k.target) > 0 ? Math.round((aktual / parseNum_(k.target)) * 1000) / 10 : 0);
      sum += p;
      names.push(k.nama_kpi);
      return { kpiset_id: k.kpiset_id, nama: k.nama_kpi, metrik: k.metrik, target: parseNum_(k.target), aktual: aktual, pencapaian: p, bobot: parseNum_(k.bobot) };
    });
    o.kpi_nama = names.join(', ');
    o.aktual = Math.round((sum / linked.length) * 10) / 10;
    o.pencapaian = o.aktual;
  });
  return rows;
}

// Hubungan terpadu: OKR -> KPI -> RACI -> PDCA -> Aktivitas -> Actual (satu tampilan untuk Manager/Owner)
function getPerformanceOverview(token) {
  try {
    checkPermission(token, 'performance', 'read');
    const okrs = enrichOkrRows_(getDataAsObjects('OKR'));
    const raci = getDataAsObjects('RACI');
    const pdca = getDataAsObjects('PDCA');
    const activities = getDataAsObjects('ACTIVITIES');
    const today = todayString();
    okrs.forEach(function(o) {
      o.raci = raci.filter(function(r) { return String(r.okr_id || '') !== '' && String(r.okr_id) === String(o.okr_id); });
      o.pdca = pdca.filter(function(p) { return String(p.okr_id || '') !== '' && String(p.okr_id) === String(o.okr_id); });
      const act = activities.filter(function(a) { return String(a.okr_id || '') !== '' && String(a.okr_id) === String(o.okr_id); });
      o.activities = {
        qty: sumActQty_(act),
        selesai: sumActQty_(act.filter(function(a) { return String(a.status).toUpperCase() === 'SELESAI'; })),
        berjalan: sumActQty_(act.filter(function(a) { return String(a.status).toUpperCase() === 'BERJALAN'; })),
        overdue: act.filter(function(a) {
          return String(a.deadline || '') !== '' && String(a.deadline) < today && ['SELESAI', 'BATAL'].indexOf(String(a.status).toUpperCase()) < 0;
        }).length
      };
    });
    return { success: true, data: { okrs: okrs } };
  } catch (e) {
    return handleError_('getPerformanceOverview', e);
  }
}

/* ==================== KPI (OTOMATIS) ==================== */
function currentMonthKey_() {
  return Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM');
}

function monthKey_(dateStr) {
  return String(dateStr || '').substring(0, 7);
}

function parseNum_(v) {
  if (v === null || v === undefined || v === '') return 0;
  const n = parseFloat(String(v).replace(/[^\d.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

// Qty sebuah baris aktivitas (jumlah kegiatan pada jenis tsb). Data lama / kosong dianggap 1.
function actQty_(a) {
  const raw = a ? a.qty : '';
  if (raw === '' || raw === null || raw === undefined) return 1;
  const n = Math.round(parseNum_(raw));
  return n > 0 ? n : 0;
}
function sumActQty_(list) {
  return list.reduce(function(s, a) { return s + actQty_(a); }, 0);
}

// Target revenue bulanan: ikut pengaturan KPI (sumber REVENUE_TOTAL), fallback ke SYSTEM_CONFIG
function getRevenueTarget_() {
  const k = getDataAsObjects('KPI_SETTINGS').filter(function(x) {
    return String(x.metrik) === 'REVENUE_TOTAL' && String(x.status || 'AKTIF').toUpperCase() !== 'NONAKTIF';
  })[0];
  if (k && parseNum_(k.target) > 0) return parseNum_(k.target);
  return parseNum_(getConfigMap_().kpi_target_revenue) || 50000000;
}

/* ---------- Pengaturan sumber Actual Revenue (Dashboard) ----------
 * Actual Revenue = jumlah sumber yang DIAKTIFKAN di Dashboard -> kartu "Actual Revenue" -> ⚙️ Atur Sumber.
 * Default (belum pernah diatur) = Reservasi + Event + POS Kasir, sama seperti sebelumnya (backward-compatible).
 * Sumber tambahan apa pun bisa dipakai lewat Metric Library (metrik ber-unit Rp).
 * Disimpan di SYSTEM_CONFIG (key: dashboard_revenue_sources) sebagai JSON. */
const REVENUE_CONFIG_KEY = 'dashboard_revenue_sources';
const REVENUE_METRICS_PROPERTY = 'WMC_REV_METRICS_V1';
const REVENUE_EXTRA_METRICS = ['MET-REV_VOUCHER', 'MET-REV_SPONSOR'];
const REVENUE_SOURCE_CATALOG = [
  { key: 'RESERVASI', label: 'Reservasi', metric: 'MET-REV_RESERVASI', def: true, core: true, desc: 'Aktual revenue / total reservasi (selain BATAL), berdasarkan tanggal reservasi.' },
  { key: 'EVENT', label: 'Event', metric: 'MET-EVENT_REVENUE', def: true, core: true, desc: 'Aktual revenue event, berdasarkan tanggal mulai event.' },
  { key: 'POS', label: 'POS Kasir', metric: 'MET-REV_POS', def: true, core: true, desc: 'Seluruh penjualan yang diinput di menu POS Kasir.' },
  { key: 'VOUCHER', label: 'Penjualan Voucher', metric: 'MET-REV_VOUCHER', def: false, desc: 'Harga voucher yang terjual, berdasarkan tanggal penjualan.' },
  { key: 'SPONSOR', label: 'Sponsor', metric: 'MET-REV_SPONSOR', def: false, desc: 'Nilai sponsorship berstatus DEAL / TEREALISASI, berdasarkan tanggal deal.' },
  { key: 'CAMPAIGN', label: 'Campaign', metric: 'MET-CAMPAIGN_REVENUE', def: false, warn: 'Berisiko dihitung dobel bila revenue campaign sama dengan reservasi / event / POS.', desc: 'Aktual revenue yang dicatat pada program campaign.' }
];
let __revCfg = null;

function revenueDefaultConfig_() {
  const src = {};
  REVENUE_SOURCE_CATALOG.forEach(function(s) { src[s.key] = s.def === true; });
  return { v: 1, sources: src, custom: [] };
}

function getRevenueConfig_() {
  if (__revCfg) return __revCfg;
  const cfg = revenueDefaultConfig_();
  try {
    const raw = String(getConfigMap_()[REVENUE_CONFIG_KEY] || '').trim();
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.sources && typeof p.sources === 'object') {
        Object.keys(cfg.sources).forEach(function(k) {
          if (p.sources[k] !== undefined) cfg.sources[k] = (p.sources[k] === true || String(p.sources[k]).toUpperCase() === 'TRUE');
        });
      }
      if (p && Array.isArray(p.custom)) {
        const seen = {};
        p.custom.forEach(function(c) {
          const id = String((c && c.metric_id) || '').trim();
          if (!id || seen[id]) return;
          seen[id] = true;
          cfg.custom.push({ metric_id: id, aktif: !(c.aktif === false || String(c.aktif).toUpperCase() === 'FALSE') });
        });
      }
    }
  } catch (e) {
    logError_('getRevenueConfig_', e);
  }
  __revCfg = cfg;
  return cfg;
}

// Tambahkan metrik bawaan baru (Voucher, Sponsor) ke Metric Library untuk instalasi yang sudah ada. Berjalan sekali.
function ensureRevenueMetrics_() {
  try {
    const props = PropertiesService.getScriptProperties();
    if (props.getProperty(REVENUE_METRICS_PROPERTY)) return;
    ensureMetricsSeeded_();
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      if (props.getProperty(REVENUE_METRICS_PROPERTY)) return;
      const sheet = getSS().getSheetByName('METRICS');
      if (!sheet) return;
      const headers = getHeaders('METRICS');
      const have = {};
      getDataAsObjects('METRICS').forEach(function(m) { have[String(m.metric_id)] = true; });
      const now = nowString();
      const rows = metricSeedList_().filter(function(m) {
        return REVENUE_EXTRA_METRICS.indexOf(m.metric_id) >= 0 && !have[m.metric_id];
      }).map(function(m) {
        m.created_at = now; m.updated_at = now;
        return headers.map(function(h) { return m[h] !== undefined && m[h] !== null ? m[h] : ''; });
      });
      if (rows.length) sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
      props.setProperty(REVENUE_METRICS_PROPERTY, '1');
    } finally {
      lock.releaseLock();
    }
  } catch (e) {
    logError_('ensureRevenueMetrics_', e);
  }
}

// Revenue marketing per periode sesuai sumber yang dipilih di pengaturan Actual Revenue (default: reservasi + event + POS Kasir)
function computeRevenueBreakdown_(period) {
  ensureRevenueMetrics_();
  const rt = metricRuntime_();
  const cfg = getRevenueConfig_();
  const out = { reservasi: 0, event: 0, pos: 0, voucher: 0, sponsor: 0, campaign: 0, custom: 0, total: 0, items: [], errors: [] };
  let sum = 0;
  REVENUE_SOURCE_CATALOG.forEach(function(s) {
    const aktif = cfg.sources[s.key] === true;
    let v = 0;
    if (aktif || s.core) {   // reservasi / event / POS tetap dihitung agar kartu lain (mis. POS bulan ini) tetap terisi
      try { v = metricEval_(rt, s.metric, { period: period }).v; }
      catch (e) { v = 0; if (aktif) out.errors.push(s.label + ': ' + String(e.message || e)); logError_('computeRevenueBreakdown_:' + s.key, e); }
    }
    out[s.key.toLowerCase()] = Math.round(v);
    if (aktif) { sum += v; out.items.push({ key: s.key, label: s.label, value: Math.round(v) }); }
  });
  cfg.custom.forEach(function(c) {
    if (!c.aktif) return;
    const m = rt.metric(c.metric_id);
    const label = m ? String(m.metric_name) : c.metric_id;
    let v = 0;
    try { v = metricEval_(rt, c.metric_id, { period: period }).v; }
    catch (e) { v = 0; out.errors.push(label + ': ' + String(e.message || e)); logError_('computeRevenueBreakdown_:custom', e); }
    sum += v;
    out.custom += Math.round(v);
    out.items.push({ key: 'CUSTOM:' + c.metric_id, label: label, value: Math.round(v) });
  });
  out.total = Math.round(sum);
  return out;
}

// Ambil pengaturan + nilai live tiap sumber (periode berjalan) untuk modal "Atur Sumber Actual Revenue"
function apiRevenueConfigGet(token) {
  try {
    const session = checkPermission(token, 'dashboard', 'read');
    ensureRevenueMetrics_();
    const period = currentMonthKey_();
    const rt = metricRuntime_();
    const cfg = getRevenueConfig_();
    const sources = REVENUE_SOURCE_CATALOG.map(function(s) {
      let v = 0, err = '';
      try { v = Math.round(metricEval_(rt, s.metric, { period: period }).v); } catch (e) { err = String(e.message || e); }
      return { key: s.key, label: s.label, desc: s.desc, warn: s.warn || '', aktif: cfg.sources[s.key] === true, value: v, error: err };
    });
    const catalogMetric = {};
    REVENUE_SOURCE_CATALOG.forEach(function(s) { catalogMetric[s.metric] = true; });
    catalogMetric['MET-REVENUE_TOTAL'] = true;
    const chosen = {};
    const custom = cfg.custom.map(function(c) {
      chosen[c.metric_id] = true;
      const m = rt.metric(c.metric_id);
      let v = 0, err = '';
      if (!m) err = 'Metrik tidak ditemukan di Metric Library.';
      else { try { v = Math.round(metricEval_(rt, c.metric_id, { period: period }).v); } catch (e) { err = String(e.message || e); } }
      return { metric_id: c.metric_id, nama: m ? m.metric_name : c.metric_id, module: m ? m.module : '', aktif: c.aktif, value: v, error: err };
    });
    const metrics = rt.allMetrics().filter(function(m) {
      return String(m.status || 'AKTIF').toUpperCase() !== 'NONAKTIF' && String(m.unit || '') === 'Rp' &&
        !catalogMetric[String(m.metric_id)] && !chosen[String(m.metric_id)];
    }).map(function(m) { return { id: m.metric_id, nama: m.metric_name, module: m.module }; })
      .sort(function(a, b) { return String(a.module).localeCompare(String(b.module)) || String(a.nama).localeCompare(String(b.nama)); });
    return { success: true, data: { periode: period, sources: sources, custom: custom, metrics: metrics, canEdit: ['ADMIN', 'MANAGER'].indexOf(session.role) >= 0 } };
  } catch (e) {
    return handleError_('apiRevenueConfigGet', e);
  }
}

// Simpan pengaturan sumber Actual Revenue (hanya Admin / Manager)
function apiRevenueConfigSave(token, payload) {
  try {
    const session = checkPermission(token, 'dashboard', 'read');
    if (['ADMIN', 'MANAGER'].indexOf(session.role) < 0) {
      return { success: false, message: 'Hanya Admin / Manager yang dapat mengubah pengaturan Actual Revenue.' };
    }
    if (!payload || typeof payload !== 'object') return { success: false, message: 'Data pengaturan tidak valid.' };
    const clean = { v: 1, sources: {}, custom: [] };
    const inSrc = (payload.sources && typeof payload.sources === 'object') ? payload.sources : {};
    let active = 0;
    REVENUE_SOURCE_CATALOG.forEach(function(s) {
      const on = inSrc[s.key] === true || String(inSrc[s.key]).toUpperCase() === 'TRUE';
      clean.sources[s.key] = on;
      if (on) active++;
    });
    const rt = metricRuntime_();
    const seen = {};
    const inCustom = Array.isArray(payload.custom) ? payload.custom : [];
    if (inCustom.length > 20) return { success: false, message: 'Maksimal 20 sumber tambahan.' };
    for (let i = 0; i < inCustom.length; i++) {
      const id = String((inCustom[i] && inCustom[i].metric_id) || '').trim();
      if (!id || seen[id]) continue;
      if (!rt.metric(id)) return { success: false, message: 'Metrik "' + id + '" tidak ditemukan di Metric Library.' };
      seen[id] = true;
      const on = !(inCustom[i].aktif === false || String(inCustom[i].aktif).toUpperCase() === 'FALSE');
      clean.custom.push({ metric_id: id, aktif: on });
      if (on) active++;
    }
    if (active === 0) return { success: false, message: 'Pilih minimal satu sumber revenue.' };
    const json = JSON.stringify(clean);
    const now = nowString();
    const ok = updateRecord('SYSTEM_CONFIG', 'key', REVENUE_CONFIG_KEY, { value: json, updated_at: now });
    if (!ok) createRecord('SYSTEM_CONFIG', { key: REVENUE_CONFIG_KEY, value: json, description: 'Pengaturan sumber Actual Revenue pada Dashboard', updated_at: now });
    __revCfg = null;
    return { success: true, message: 'Pengaturan Actual Revenue disimpan.' };
  } catch (e) {
    return handleError_('apiRevenueConfigSave', e);
  }
}

// Biaya marketing per periode (online / offline)
function computeCostBreakdown_(period) {
  const out = { total: 0, online: 0, offline: 0, lainnya: 0, belumLunas: 0 };
  getDataAsObjects('MARKETING_COSTS').forEach(function(c) {
    if (monthKey_(c.tanggal) !== period) return;
    const n = parseNum_(c.jumlah);
    out.total += n;
    const t = String(c.tipe_promosi).toUpperCase();
    if (t === 'ONLINE') out.online += n; else if (t === 'OFFLINE') out.offline += n; else out.lainnya += n;
    if (String(c.status_pembayaran).toUpperCase() !== 'LUNAS') out.belumLunas += n;
  });
  Object.keys(out).forEach(function(k) { out[k] = Math.round(out[k]); });
  return out;
}

// Hitung 6 KPI secara live dari data transaksi periode berjalan
function computeKpiNow_() {
  const period = currentMonthKey_();
  const rt = metricRuntime_();
  const defs = getDataAsObjects('KPI_SETTINGS')
    .filter(function(k) { return String(k.status || 'AKTIF').toUpperCase() !== 'NONAKTIF'; })
    .map(function(k) {
      const metrik = String(k.metrik || 'MANUAL');
      const mid = kpiMetricId_(k);
      const mm = mid ? rt.metric(mid) : null;
      let aktual, unit, err = '';
      if (mm) {
        try { aktual = metricEval_(rt, mid, { period: kpiPeriodSpec_(k, period), aliases: kpiAliases_(rt, k) }).v; }
        catch (e) { aktual = 0; err = String(e.message || e); }
        unit = String(mm.unit || '');
      } else {
        aktual = parseNum_(k.aktual_manual);   // input manual (KPI lama bertipe MANUAL)
        unit = String(k.unit || '');
      }
      return {
        id: k.kpiset_id, nama: k.nama_kpi, metrik: metrik, metric_id: mid, metric_nama: mm ? mm.metric_name : '',
        pic: String(k.PIC || ''), periode_kpi: String(k.periode || ''), error: err,
        target: parseNum_(k.target), aktual: aktual, bobot: parseNum_(k.bobot), unit: unit
      };
    });

  const totalBobot = defs.reduce(function(s, d) { return s + d.bobot; }, 0);
  let totalSkor = 0;
  defs.forEach(function(d) {
    d.pencapaian = d.target > 0 ? Math.round((d.aktual / d.target) * 1000) / 10 : 0;
    d.skor = Math.round(d.pencapaian * d.bobot) / 100;
    totalSkor += d.skor;
  });
  return { periode: period, kpis: defs, totalBobot: totalBobot, totalSkor: Math.round(totalSkor * 10) / 10, revenueSumber: computeRevenueBreakdown_(period), biaya: computeCostBreakdown_(period) };
}

function getKpiData(token) {
  try {
    checkPermission(token, 'kpi', 'read');
    const live = computeKpiNow_();
    const snapshot = getDataAsObjects('KPI');
    const rtK = metricRuntime_();
    const settings = getDataAsObjects('KPI_SETTINGS');
    settings.forEach(function(k) { kpiDecorate_(rtK, k); });
    return { success: true, data: { live: live, snapshot: snapshot, settings: settings } };
  } catch (e) {
    return handleError_('getKpiData', e);
  }
}

// Simpan snapshot KPI live ke sheet KPI (periode berjalan, hanya MANAGER/ADMIN)
function saveKpiSnapshot(token) {
  try {
    const session = checkPermission(token, 'kpi', 'update');
    const live = computeKpiNow_();
    const sheet = getSS().getSheetByName('KPI');
    const headers = getHeaders('KPI');
    const existing = getDataAsObjects('KPI');
    const now = nowString();
    existing.forEach(function(r) {
      if (String(r.periode) === live.periode) {
        deleteRecord('KPI', 'kpi_id', r.kpi_id);
      }
    });
    live.kpis.forEach(function(k) {
      const row = {
        kpi_id: generateId('KPI', 'KPI', 'kpi_id'),
        periode: live.periode,
        nama_kpi: k.nama,
        target: k.target,
        aktual: k.aktual,
        pencapaian: k.pencapaian,
        bobot: k.bobot,
        skor: k.skor,
        PIC: 'Tim Marketing',
        created_at: now,
        updated_at: now
      };
      createRecord('KPI', row);
    });
    return { success: true, message: 'Snapshot KPI periode ' + live.periode + ' tersimpan.' };
  } catch (e) {
    return handleError_('saveKpiSnapshot', e);
  }
}

/* ==================== CUSTOMER 360 (CRM MASTER VIEW) ==================== */
// Satu customer = satu profil CRM (customer_id sebagai crm_id), dengan seluruh
// riwayat Lead, Follow Up, dan Reservation sepanjang waktu.
function getCustomer360(token, crmId) {
  try {
    checkPermission(token, 'customers', 'read');
    if (!crmId) return { success: false, message: 'ID CRM tidak valid.' };
    const customer = getRecordById('CUSTOMERS', 'customer_id', crmId);
    if (!customer) return { success: false, message: 'Data CRM tidak ditemukan.' };

    // Lead lama yang belum punya crm_id tetap muncul lewat pencocokan nomor WhatsApp
    const phone = normalizePhone_(customer.whatsapp);
    const leads = getDataAsObjects('LEADS').filter(function(l) {
      return String(l.crm_id) === String(crmId) || (phone && normalizePhone_(l.whatsapp) === phone);
    }).sort(function(a, b) { return String(b.tanggal).localeCompare(String(a.tanggal)); });
    const followups = getDataAsObjects('FOLLOWUPS').filter(function(f) {
      return String(f.crm_id) === String(crmId) || String(f.customer_id) === String(crmId);
    }).sort(function(a, b) { return String(b.tanggal).localeCompare(String(a.tanggal)); });
    const reservations = getDataAsObjects('RESERVATIONS').filter(function(r) {
      return String(r.customer_id) === String(crmId);
    }).sort(function(a, b) { return String(b.tanggal_reservasi).localeCompare(String(a.tanggal_reservasi)); });

    // Riwayat event: peserta terhubung via crm_id (fallback: cocokkan nomor WhatsApp)
    const evById = {};
    getDataAsObjects('EVENTS').forEach(function(e) { evById[String(e.event_id)] = e; });
    const participants = getDataAsObjects('EVENT_PARTICIPANTS').filter(function(p) {
      return String(p.crm_id) === String(crmId) || (phone && normalizePhone_(p.whatsapp) === phone);
    }).map(function(p) {
      const e = evById[String(p.event_id)] || {};
      return {
        participant_id: p.participant_id,
        event_id: p.event_id,
        event_nama: String(e.nama_event || ''),
        tanggal_event: String(e.tanggal_mulai || ''),
        kategori: p.kategori,
        biaya: parseNum_(p.biaya),
        status_kehadiran: p.status_kehadiran,
        sumber: 'EVENT'
      };
    }).sort(function(a, b) { return String(b.tanggal_event).localeCompare(String(a.tanggal_event)); });

    const outreach = getDataAsObjects('OUTREACH_LOGS').filter(function(o) {
      return String(o.crm_id) === String(crmId);
    }).sort(function(a, b) { return String(b.outreach_id).localeCompare(String(a.outreach_id)); });

    let last = String(customer.updated_at || customer.created_at || '');
    function bump_(d) { if (d && String(d) > last) last = String(d); }
    leads.forEach(function(x) { bump_(x.updated_at || x.created_at); });
    followups.forEach(function(x) { bump_(x.created_at); });
    reservations.forEach(function(x) { bump_(x.updated_at || x.created_at); });
    participants.forEach(function(x) { bump_(x.tanggal_event); });

    return { success: true, data: {
      customer: customer,
      leads: leads,
      followups: followups,
      reservations: reservations,
      events: participants,
      outreach: outreach,
      summary: {
        totalLeads: leads.length,
        totalFollowups: followups.length,
        totalReservations: reservations.length,
        totalEvents: participants.length,
        totalOutreach: outreach.length,
        kunjunganBiasa: followups.filter(function(f) { return String(f.hasil_followup).toUpperCase() === 'KUNJUNGAN BIASA'; }).length,
        totalNilai: Math.round(reservations.reduce(function(s, r) {
          return s + (parseNum_(r.aktual_revenue) || parseNum_(r.total));
        }, 0))
      },
      lastActivity: last
    } };
  } catch (e) {
    return handleError_('getCustomer360', e);
  }
}

/* ==================== OUTREACH: GAMBAR MATERI, SPIN TEKS, ANTREAN KIRIM TERJADWAL ====================
 * - Gambar materi diunggah dari browser (sudah diperkecil), disimpan di sheet OUTREACH_IMAGES per potongan (maks 40.000 karakter/sel).
 *   Materi menyimpan rujukan "wmc-img:IMG-00001" pada kolom gambar_url.
 * - Antrean kirim terjadwal (OUTREACH_QUEUE) diproses oleh program "wa-sender" di PC memakai kunci rahasia (WMC_SENDER_KEY).
 *   Hanya fungsi senderPull / senderImage / senderReport yang dapat dipanggil tanpa token, dan semuanya wajib memakai kunci.
 */
const OUTREACH_IMG_CHUNK = 40000;
const OUTREACH_IMG_MAX_CHARS = 420000;
const SENDER_KEY_PROP = 'WMC_SENDER_KEY';
const SENDER_SEEN_PROP = 'WMC_SENDER_LAST_SEEN';
const QUEUE_MAX_BATCH = 300;

function imageRowIdx_(sheet, id) {
  const last = sheet.getLastRow();
  if (last < 2) return [];
  const ids = sheet.getRange(2, 1, last - 1, 1).getValues();
  const out = [];
  for (let i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(id)) out.push(i + 2);
  return out;
}
function imageRefId_(ref) {
  const m = String(ref || '').match(/^(?:wmc-img:)?(IMG-\d+)$/);
  return m ? m[1] : '';
}
function loadImage_(ref) {
  const id = imageRefId_(ref);
  if (!id) return null;
  const sheet = getSS().getSheetByName('OUTREACH_IMAGES');
  if (!sheet) return null;
  const idx = imageRowIdx_(sheet, id);
  if (!idx.length) return null;
  const rows = idx.map(function(r) { return sheet.getRange(r, 1, 1, 6).getValues()[0]; });
  rows.sort(function(a, b) { return Number(a[1]) - Number(b[1]); });
  return { id: id, mime: String(rows[0][2] || 'image/jpeg'), nama: String(rows[0][3] || ''), base64: rows.map(function(r) { return String(r[4]); }).join('') };
}

function apiOutreachUploadImage(token, dataUrl, nama) {
  try {
    checkPermission(token, 'outreachtpl', 'create');
    const m = String(dataUrl || '').match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+\/=]+)$/);
    if (!m) return { success: false, message: 'Format gambar tidak valid (gunakan JPG, PNG, atau WebP).' };
    if (m[2].length > OUTREACH_IMG_MAX_CHARS) return { success: false, message: 'Ukuran gambar terlalu besar. Gunakan gambar yang lebih kecil.' };
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = getSS().getSheetByName('OUTREACH_IMAGES');
      if (!sheet) throw new Error('Sheet OUTREACH_IMAGES tidak ditemukan.');
      let max = 0;
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().forEach(function(r) {
          const k = String(r[0]).match(/(\d+)\s*$/);
          if (k) max = Math.max(max, parseInt(k[1], 10));
        });
      }
      const id = 'IMG-' + String(max + 1).padStart(5, '0');
      const parts = [];
      for (let i = 0; i < m[2].length; i += OUTREACH_IMG_CHUNK) parts.push(m[2].substring(i, i + OUTREACH_IMG_CHUNK));
      const now = nowString();
      const nm = String(nama || '').replace(/[^\w.\- ]/g, '').substring(0, 80);
      const rows = parts.map(function(p, i) { return [id, i, m[1], nm, p, now]; });
      const start = sheet.getLastRow() + 1;
      sheet.getRange(start, 1, rows.length, 6).setNumberFormat('@');
      sheet.getRange(start, 1, rows.length, 6).setValues(rows);
      return { success: true, data: { image_id: id, ref: 'wmc-img:' + id }, message: 'Gambar tersimpan.' };
    } finally {
      lock.releaseLock();
    }
  } catch (e) {
    return handleError_('apiOutreachUploadImage', e);
  }
}

function apiOutreachGetImage(token, ref) {
  try {
    checkPermission(token, 'outreach', 'read');
    const img = loadImage_(ref);
    if (!img) return { success: false, message: 'Gambar tidak ditemukan.' };
    return { success: true, data: { dataUrl: 'data:' + img.mime + ';base64,' + img.base64 } };
  } catch (e) {
    return handleError_('apiOutreachGetImage', e);
  }
}

function apiOutreachDeleteImage(token, ref) {
  try {
    checkPermission(token, 'outreachtpl', 'delete');
    const id = imageRefId_(ref);
    if (!id) return { success: true };
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = getSS().getSheetByName('OUTREACH_IMAGES');
      if (sheet) imageRowIdx_(sheet, id).reverse().forEach(function(r) { sheet.deleteRow(r); });
    } finally {
      lock.releaseLock();
    }
    return { success: true };
  } catch (e) {
    return handleError_('apiOutreachDeleteImage', e);
  }
}

/* ---------- Antrean kirim terjadwal ---------- */
function senderKey_() {
  const props = PropertiesService.getScriptProperties();
  let k = props.getProperty(SENDER_KEY_PROP);
  if (!k) {
    k = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '').substring(0, 12);
    props.setProperty(SENDER_KEY_PROP, k);
  }
  return k;
}
function senderAuth_(key) {
  const real = PropertiesService.getScriptProperties().getProperty(SENDER_KEY_PROP);
  const k = String(key || '');
  if (!real || k.length !== real.length) return false;
  let diff = 0;
  for (let i = 0; i < real.length; i++) diff |= real.charCodeAt(i) ^ k.charCodeAt(i);
  return diff === 0;
}
function senderTouch_(info) {
  try { PropertiesService.getScriptProperties().setProperty(SENDER_SEEN_PROP, JSON.stringify({ at: Date.now(), info: String(info || '').substring(0, 80) })); } catch (e) { /* abaikan */ }
}

function apiOutreachSenderKey(token, reset) {
  try {
    const session = checkPermission(token, 'outreach', 'read');
    if (['ADMIN', 'MANAGER'].indexOf(session.role) < 0) return { success: false, message: 'Hanya Admin / Manager yang dapat melihat kunci pengirim.' };
    if (reset) PropertiesService.getScriptProperties().deleteProperty(SENDER_KEY_PROP);
    return { success: true, data: { key: senderKey_() } };
  } catch (e) {
    return handleError_('apiOutreachSenderKey', e);
  }
}

function queueText_(v, max) { return String(v === undefined || v === null ? '' : v).substring(0, max || 200); }

function apiOutreachScheduleBatch(token, req) {
  try {
    const session = checkPermission(token, 'outreach', 'create');
    req = req || {};
    const items = Array.isArray(req.items) ? req.items : [];
    if (!items.length) return { success: false, message: 'Tidak ada customer yang dijadwalkan.' };
    if (items.length > QUEUE_MAX_BATCH) return { success: false, message: 'Maksimal ' + QUEUE_MAX_BATCH + ' pesan per jadwal.' };
    const pic = String(req.PIC || '').trim();
    if (!pic) return { success: false, message: 'PIC wajib dipilih.' };
    const tpl = getRecordById('OUTREACH_TEMPLATES', 'materi_id', String(req.materi_id || ''));
    if (!tpl) return { success: false, message: 'Materi tidak ditemukan.' };
    const jMin = Math.max(15, Math.round(Number(req.jeda_min) || 60));
    const jMax = Math.max(jMin, Math.min(3600, Math.round(Number(req.jeda_max) || 120)));
    let start = Number(req.start_ms) || Date.now();
    if (start < Date.now() - 60000) start = Date.now();
    if (start > Date.now() + 30 * 86400000) return { success: false, message: 'Jadwal terlalu jauh (maksimal 30 hari ke depan).' };
    const isImg = String(tpl.tipe || '').toUpperCase().indexOf('GAMBAR') === 0;
    const imageRef = isImg ? String(tpl.gambar_url || '') : '';

    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const customers = {};
      getDataAsObjects('CUSTOMERS').forEach(function(c) { customers[String(c.customer_id)] = c; });
      const today = todayString();
      const contacted = {};
      getDataAsObjects('OUTREACH_LOGS').forEach(function(l) { if (normDate_(l.tanggal) === today) contacted[String(l.crm_id)] = true; });
      const pending = {};
      getDataAsObjects('OUTREACH_QUEUE').forEach(function(q) { if (q.status === 'MENUNGGU' || q.status === 'MENGIRIM') pending[String(q.crm_id)] = true; });

      const sheet = getSS().getSheetByName('OUTREACH_QUEUE');
      if (!sheet) throw new Error('Sheet OUTREACH_QUEUE tidak ditemukan.');
      const headers = getHeaders('OUTREACH_QUEUE');
      let max = 0;
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().forEach(function(r) {
          const k = String(r[0]).match(/(\d+)\s*$/); if (k) max = Math.max(max, parseInt(k[1], 10));
        });
      }
      const batchId = 'BT-' + Utilities.formatDate(new Date(), TIMEZONE, 'yyMMddHHmmss');
      const now = nowString();
      let t = start, skipped = 0, firstMs = 0, lastMs = 0;
      const rows = [];
      const seen = {};
      items.forEach(function(it) {
        const id = String((it && it.crm_id) || '').trim();
        const c = customers[id];
        const msg = String((it && it.pesan) || '').trim();
        const wa = c ? crmPhoneLocal_(c.whatsapp) : '';
        if (!c || wa.length < 9 || !msg || contacted[id] || pending[id] || seen[id]) { skipped++; return; }
        seen[id] = true;
        max++;
        const rec = {
          queue_id: 'Q-' + String(max).padStart(6, '0'), batch_id: batchId, crm_id: id, nama: queueText_(c.nama, 120),
          whatsapp: '62' + wa.substring(1), pesan: msg.substring(0, 3000), image_ref: imageRef,
          kirim_ms: Math.round(t), status: 'MENUNGGU', dikirim_ms: '', error: '', PIC: pic,
          campaign_id: queueText_(req.campaign_id, 60), campaign: queueText_(req.campaign, 150),
          materi_id: String(tpl.materi_id), materi: queueText_(tpl.nama_materi, 150), outreach_id: '',
          dibuat_oleh: queueText_(session.username || session.nama || '', 80), created_at: now, updated_at: now
        };
        if (!firstMs) firstMs = rec.kirim_ms;
        lastMs = rec.kirim_ms;
        rows.push(headers.map(function(h) { return rec[h] !== undefined ? rec[h] : ''; }));
        t += (jMin + Math.random() * (jMax - jMin)) * 1000;
      });
      if (!rows.length) return { success: false, message: 'Tidak ada pesan yang dapat dijadwalkan (customer sudah dihubungi hari ini, sudah ada di antrean, atau nomor tidak valid).' };
      const startRow = sheet.getLastRow() + 1;
      ['whatsapp', 'pesan', 'nama'].forEach(function(h) {
        const ci = headers.indexOf(h);
        if (ci >= 0) sheet.getRange(startRow, ci + 1, rows.length, 1).setNumberFormat('@');
      });
      sheet.getRange(startRow, 1, rows.length, headers.length).setValues(rows);
      return { success: true, data: { batch_id: batchId, count: rows.length, skipped: skipped, first_ms: firstMs, last_ms: lastMs },
        message: rows.length + ' pesan dijadwalkan' + (skipped ? ', ' + skipped + ' dilewati.' : '.') };
    } finally {
      lock.releaseLock();
    }
  } catch (e) {
    return handleError_('apiOutreachScheduleBatch', e);
  }
}

function apiOutreachQueueList(token) {
  try {
    checkPermission(token, 'outreach', 'read');
    let rows = getDataAsObjects('OUTREACH_QUEUE');
    const counts = { MENUNGGU: 0, MENGIRIM: 0, TERKIRIM: 0, GAGAL: 0, DIBATALKAN: 0 };
    rows.forEach(function(r) { if (counts[r.status] !== undefined) counts[r.status]++; });
    rows.sort(function(a, b) { return Number(b.kirim_ms) - Number(a.kirim_ms); });
    const truncated = rows.length > 500;
    rows = rows.slice(0, 500).map(function(r) {
      return { queue_id: r.queue_id, batch_id: r.batch_id, crm_id: r.crm_id, nama: r.nama, whatsapp: String(r.whatsapp),
        pesan: String(r.pesan || '').substring(0, 200), has_image: !!String(r.image_ref || ''), kirim_ms: Number(r.kirim_ms) || 0,
        status: r.status, dikirim_ms: Number(r.dikirim_ms) || 0, error: r.error, PIC: r.PIC, campaign: r.campaign, materi: r.materi };
    });
    let seen = null;
    try { seen = JSON.parse(PropertiesService.getScriptProperties().getProperty(SENDER_SEEN_PROP) || 'null'); } catch (e) { seen = null; }
    return { success: true, data: { rows: rows, counts: counts, truncated: truncated, sender: seen, now: Date.now() } };
  } catch (e) {
    return handleError_('apiOutreachQueueList', e);
  }
}

// opts: { batch_id } atau { queue_id }; action: 'cancel' | 'retry'
function apiOutreachQueueAction(token, action, opts) {
  try {
    checkPermission(token, 'outreach', 'update');
    opts = opts || {};
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    let n = 0;
    try {
      const sheet = getSS().getSheetByName('OUTREACH_QUEUE');
      if (!sheet || sheet.getLastRow() < 2) return { success: false, message: 'Antrean kosong.' };
      const headers = getHeaders('OUTREACH_QUEUE');
      const ci = function(h) { return headers.indexOf(h); };
      const last = sheet.getLastRow();
      const vals = sheet.getRange(2, 1, last - 1, headers.length).getValues();
      const now = nowString();
      vals.forEach(function(row, i) {
        const match = (opts.queue_id && String(row[ci('queue_id')]) === String(opts.queue_id)) || (opts.batch_id && String(row[ci('batch_id')]) === String(opts.batch_id));
        if (!match) return;
        const st = String(row[ci('status')]);
        if (action === 'cancel' && st === 'MENUNGGU') { row[ci('status')] = 'DIBATALKAN'; n++; }
        else if (action === 'retry' && (st === 'GAGAL' || st === 'DIBATALKAN')) { row[ci('status')] = 'MENUNGGU'; row[ci('kirim_ms')] = Date.now() + n * 60000; row[ci('error')] = ''; n++; }
        else return;
        row[ci('updated_at')] = now;
        sheet.getRange(i + 2, 1, 1, headers.length).setValues([row]);
      });
    } finally {
      lock.releaseLock();
    }
    if (!n) return { success: false, message: 'Tidak ada pesan yang dapat diubah.' };
    return { success: true, data: { changed: n }, message: n + ' pesan ' + (action === 'cancel' ? 'dibatalkan.' : 'dijadwalkan ulang.') };
  } catch (e) {
    return handleError_('apiOutreachQueueAction', e);
  }
}

/* ---------- Endpoint untuk program wa-sender (wajib kunci) ---------- */
function senderPull(key, limit, info) {
  try {
    if (!senderAuth_(key)) return { success: false, message: 'Kunci tidak valid.' };
    senderTouch_(info);
    const n = Math.max(1, Math.min(5, Number(limit) || 1));
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = getSS().getSheetByName('OUTREACH_QUEUE');
      const out = { success: true, now: Date.now(), items: [], pending: 0, next_ms: 0 };
      if (!sheet || sheet.getLastRow() < 2) return out;
      const headers = getHeaders('OUTREACH_QUEUE');
      const ci = function(h) { return headers.indexOf(h); };
      const vals = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
      const now = Date.now();
      const due = [];
      vals.forEach(function(row, i) {
        const st = String(row[ci('status')]);
        const ms = Number(row[ci('kirim_ms')]) || 0;
        if (st === 'MENGIRIM' && now - (Number(row[ci('dikirim_ms')]) || 0) > 15 * 60000 && Number(row[ci('dikirim_ms')])) {
          row[ci('status')] = 'GAGAL'; row[ci('error')] = 'Tidak ada laporan dari pengirim (dicek manual di WhatsApp)'; row[ci('updated_at')] = nowString();
          sheet.getRange(i + 2, 1, 1, headers.length).setValues([row]);
        } else if (st === 'MENUNGGU') {
          out.pending++;
          if (!out.next_ms || ms < out.next_ms) out.next_ms = ms;
          if (ms <= now) due.push({ i: i, ms: ms });
        }
      });
      due.sort(function(a, b) { return a.ms - b.ms; });
      due.slice(0, n).forEach(function(d) {
        const row = vals[d.i];
        row[ci('status')] = 'MENGIRIM'; row[ci('dikirim_ms')] = now; row[ci('updated_at')] = nowString();
        sheet.getRange(d.i + 2, 1, 1, headers.length).setValues([row]);
        out.items.push({ queue_id: String(row[ci('queue_id')]), whatsapp: String(row[ci('whatsapp')]), pesan: String(row[ci('pesan')]), image_ref: String(row[ci('image_ref')] || ''), nama: String(row[ci('nama')]) });
      });
      return out;
    } finally {
      lock.releaseLock();
    }
  } catch (e) {
    logError_('senderPull', e);
    return { success: false, message: 'Kesalahan server.' };
  }
}

function senderImage(key, ref) {
  try {
    if (!senderAuth_(key)) return { success: false, message: 'Kunci tidak valid.' };
    const img = loadImage_(ref);
    if (!img) return { success: false, message: 'Gambar tidak ditemukan.' };
    return { success: true, mime: img.mime, base64: img.base64 };
  } catch (e) {
    logError_('senderImage', e);
    return { success: false, message: 'Kesalahan server.' };
  }
}

function senderReport(key, queueId, ok, error) {
  try {
    if (!senderAuth_(key)) return { success: false, message: 'Kunci tidak valid.' };
    senderTouch_('lapor');
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const q = getRecordById('OUTREACH_QUEUE', 'queue_id', String(queueId));
      if (!q) return { success: false, message: 'Antrean tidak ditemukan.' };
      const now = nowString();
      if (!ok) {
        updateRecord('OUTREACH_QUEUE', 'queue_id', q.queue_id, { status: 'GAGAL', error: queueText_(error, 300), dikirim_ms: Date.now(), updated_at: now });
        return { success: true };
      }
      let outId = '';
      const today = todayString();
      const dup = getDataAsObjects('OUTREACH_LOGS').filter(function(l) { return String(l.crm_id) === String(q.crm_id) && normDate_(l.tanggal) === today; })[0];
      if (dup) outId = String(dup.outreach_id);
      else {
        const log = {
          outreach_id: generateId('OUT', 'OUTREACH_LOGS', 'outreach_id'), crm_id: String(q.crm_id), tanggal: today, PIC: String(q.PIC || ''),
          campaign_id: String(q.campaign_id || ''), campaign: String(q.campaign || ''), materi_id: String(q.materi_id || ''), materi: String(q.materi || ''),
          segmen: '', pesan: outreachSafeText_(q.pesan, 1500), status: 'DIHUBUNGI', hasil: '', lead_id: '', created_at: now, updated_at: now
        };
        createRecord('OUTREACH_LOGS', log);
        outId = log.outreach_id;
      }
      updateRecord('OUTREACH_QUEUE', 'queue_id', q.queue_id, { status: 'TERKIRIM', error: '', dikirim_ms: Date.now(), outreach_id: outId, updated_at: now });
      return { success: true, outreach_id: outId };
    } finally {
      lock.releaseLock();
    }
  } catch (e) {
    logError_('senderReport', e);
    return { success: false, message: 'Kesalahan server.' };
  }
}

// Validasi spin teks materi (dipanggil dari validateRecord_)
function validateTemplateSpin_(rec) {
  if (rec.spin_aktif !== undefined) {
    const a = String(rec.spin_aktif).trim().toLowerCase();
    rec.spin_aktif = (a === '1' || a === 'true' || a === 'ya') ? '1' : '0';
  }
  if (rec.spin_varian !== undefined) {
    let arr = rec.spin_varian;
    if (typeof arr === 'string') {
      if (!arr.trim()) { rec.spin_varian = ''; return ''; }
      try { arr = JSON.parse(arr); } catch (e) { return 'Format variasi spin teks tidak valid.'; }
    }
    if (!Array.isArray(arr)) return 'Format variasi spin teks tidak valid.';
    arr = arr.map(function(x) { return String(x || '').trim(); }).filter(Boolean);
    if (arr.length > 30) return 'Maksimal 30 variasi spin teks.';
    if (arr.some(function(x) { return x.length > 1500; })) return 'Setiap variasi spin teks maksimal 1500 karakter.';
    rec.spin_varian = arr.length ? JSON.stringify(arr) : '';
  }
  return '';
}

/* ==================== CRM: IMPORT DATA PELANGGAN ====================
 * Dipanggil dari menu CRM Pelanggan -> Import Data (file .xlsx dibaca di browser, dikirim per 200 baris).
 * Validasi ulang di server, nomor WhatsApp dinormalkan ke format 08xxxx, duplikat (nomor sama) dilewati / ditolak.
 */
function crmPhoneLocal_(v) {
  let p = String(v === null || v === undefined ? '' : v).replace(/\D/g, '');
  if (!p) return '';
  if (p.indexOf('62') === 0) p = '0' + p.substring(2);
  else if (p.charAt(0) === '8') p = '0' + p;
  return p;
}
function crmPhoneKey_(v) {
  const p = crmPhoneLocal_(v);
  return p ? p.substring(1) : '';
}

function apiImportCustomers(token, list, skipDup) {
  try {
    checkPermission(token, 'customers', 'create');
    __crmCtx = null;
    if (!Array.isArray(list) || list.length === 0) return { success: false, message: 'Tidak ada data untuk disimpan.' };
    if (list.length > 200) return { success: false, message: 'Maksimal 200 baris sekali simpan.' };
    const STATUS_OK = ['AKTIF', 'PASIF', 'VIP'];
    const clean = [];
    for (let i = 0; i < list.length; i++) {
      const d = list[i];
      if (!d || typeof d !== 'object') return { success: false, message: 'Baris ' + (i + 1) + ': data tidak valid.' };
      const nama = String(d.nama || '').trim();
      const wa = crmPhoneLocal_(d.whatsapp);
      if (!nama) return { success: false, message: 'Baris ' + (i + 1) + ': Nama wajib diisi.' };
      if (wa.length < 9 || wa.length > 15) return { success: false, message: 'Baris ' + (i + 1) + ' (' + nama + '): nomor WhatsApp tidak valid.' };
      const email = String(d.email || '').trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { success: false, message: 'Baris ' + (i + 1) + ' (' + nama + '): format email tidak valid.' };
      const status = String(d.status || 'AKTIF').toUpperCase().trim();
      if (STATUS_OK.indexOf(status) < 0) return { success: false, message: 'Baris ' + (i + 1) + ' (' + nama + '): status tidak valid.' };
      const jenis = String(d.jenis_pelanggan || '').trim();
      const sumber = String(d.sumber || '').trim();
      if (!jenis || !sumber) return { success: false, message: 'Baris ' + (i + 1) + ' (' + nama + '): Jenis Pelanggan dan Sumber wajib diisi.' };
      const tx = Math.max(0, Math.round(parseNum_(d.total_transaksi)));
      const nilai = Math.max(0, parseNum_(d.total_nilai_transaksi));
      let tgl = String(d.tanggal_kunjungan_terakhir || '').trim().substring(0, 10);
      if (tgl && !/^\d{4}-\d{2}-\d{2}$/.test(tgl)) return { success: false, message: 'Baris ' + (i + 1) + ' (' + nama + '): tanggal kunjungan tidak valid.' };
      const lahir = String(d.tanggal_lahir || '').trim().substring(0, 10);
      if (lahir && (!/^\d{4}-\d{2}-\d{2}$/.test(lahir) || lahir < '1900-01-01' || lahir > todayString())) return { success: false, message: 'Baris ' + (i + 1) + ' (' + nama + '): tanggal lahir tidak valid.' };
      clean.push({
        nama: nama, whatsapp: wa, email: email, kota: String(d.kota || '').trim() || 'Samarinda',
        jenis_pelanggan: jenis, sumber: sumber, minat: String(d.minat || '').trim(),
        tanggal_kunjungan_terakhir: tgl, tanggal_lahir: lahir, total_transaksi: tx, total_nilai_transaksi: nilai,
        status: status, PIC: String(d.PIC || '').trim()
      });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    let added = 0, skipped = 0;
    try {
      const sheet = getSS().getSheetByName(MODULES.customers.sheet);
      if (!sheet) throw new Error('Sheet CUSTOMERS tidak ditemukan.');
      const headers = getHeaders('CUSTOMERS');
      const idCol = headers.indexOf('customer_id');
      const waCol = headers.indexOf('whatsapp');
      const last = sheet.getLastRow();
      let max = 0;
      const seen = {};
      if (last > 1) {
        if (idCol >= 0) {
          sheet.getRange(2, idCol + 1, last - 1, 1).getValues().forEach(function(r) {
            const m = String(r[0]).match(/(\d+)\s*$/);
            if (m) max = Math.max(max, parseInt(m[1], 10));
          });
        }
        if (waCol >= 0) {
          sheet.getRange(2, waCol + 1, last - 1, 1).getValues().forEach(function(r) {
            const k = crmPhoneKey_(r[0]);
            if (k) seen[k] = true;
          });
        }
      }
      const now = nowString();
      const rows = [];
      clean.forEach(function(c) {
        const k = crmPhoneKey_(c.whatsapp);
        if (seen[k] && skipDup !== false) { skipped++; return; }
        seen[k] = true;
        max++;
        c.customer_id = 'CUS-' + String(max).padStart(5, '0');
        c.created_at = now;
        c.updated_at = now;
        rows.push(headers.map(function(h) { return c[h] !== undefined && c[h] !== null ? c[h] : ''; }));
      });
      if (rows.length) {
        const start = sheet.getLastRow() + 1;
        if (waCol >= 0) sheet.getRange(start, waCol + 1, rows.length, 1).setNumberFormat('@');
        const lhCol = headers.indexOf('tanggal_lahir');
        if (lhCol >= 0) sheet.getRange(start, lhCol + 1, rows.length, 1).setNumberFormat('@');
        sheet.getRange(start, 1, rows.length, headers.length).setValues(rows);
        added = rows.length;
      }
    } finally {
      lock.releaseLock();
    }
    return { success: true, added: added, skipped: skipped, message: added + ' pelanggan ditambahkan' + (skipped ? ', ' + skipped + ' dilewati (nomor WhatsApp sudah ada).' : '.') };
  } catch (e) {
    return handleError_('apiImportCustomers', e);
  }
}

// Pengecekan nomor WhatsApp saat input Lead (indikator: CRM sudah ada / akan dibuat otomatis)
function apiCheckCustomerByPhone(token, phone) {
  try {
    const session = validateSession(token);
    if (!session) return { success: false, code: 'SESSION_EXPIRED', message: 'Sesi berakhir. Silakan login kembali.' };
    const p = normalizePhone_(phone);
    if (!p) return { success: true, data: { exists: false, customer: null } };
    const c = getDataAsObjects('CUSTOMERS').filter(function(x) { return normalizePhone_(x.whatsapp) === p; })[0];
    return { success: true, data: { exists: !!c, customer: c ? { customer_id: c.customer_id, nama: c.nama } : null } };
  } catch (e) {
    return handleError_('apiCheckCustomerByPhone', e);
  }
}

/* ==================== CUSTOMER OUTREACH ====================
 * Alur: CRM -> Segmentasi -> Pilih Customer -> Materi -> WhatsApp Web -> Log -> Response -> Lead -> Follow Up -> Reservation
 * - crm_id (= CUSTOMERS.customer_id) adalah relasi utama. Outreach TIDAK membuat profil CRM baru.
 * - Sheet baru (otomatis dibuat): OUTREACH_LOGS, OUTREACH_TEMPLATES. Sheet lama tidak diubah.
 * - Lead dari outreach memakai alur Lead yang sudah ada (LEAD -> FOLLOW UP -> RESERVATION).
 */
const OUTREACH_STATUSES = ['DIHUBUNGI', 'MERESPONS', 'TERTARIK', 'TIDAK TERTARIK', 'TIDAK ADA RESPONS', 'NOMOR TIDAK AKTIF'];
const OUTREACH_RESPONDED = ['MERESPONS', 'TERTARIK', 'TIDAK TERTARIK'];
const OUTREACH_TARGET_KEY = 'outreach_target_harian';       // SYSTEM_CONFIG: target customer per PIC per hari
const OUTREACH_INACTIVE_KEY = 'outreach_hari_tidak_berkunjung'; // SYSTEM_CONFIG (opsional): batas "lama tidak berkunjung"
const OUTREACH_DEFAULT_TARGET = 10;
const OUTREACH_DEFAULT_INACTIVE_DAYS = 90;
const OUTREACH_TEMPLATES_SEEDED_PROPERTY = 'WMC_OUTREACH_TEMPLATES_SEEDED';

function outreachTarget_() {
  const v = Math.round(parseNum_(getConfigMap_()[OUTREACH_TARGET_KEY]));
  return v > 0 ? v : OUTREACH_DEFAULT_TARGET;
}

// Selisih hari (a - b) untuk tanggal 'yyyy-MM-dd'
function outreachDateDiff_(a, b) {
  const pa = String(a).split('-'), pb = String(b).split('-');
  return Math.round((Date.UTC(+pa[0], +pa[1] - 1, +pa[2]) - Date.UTC(+pb[0], +pb[1] - 1, +pb[2])) / 86400000);
}
function outreachAddDays_(dateStr, n) {
  const p = String(dateStr).split('-');
  return Utilities.formatDate(new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + n)), 'UTC', 'yyyy-MM-dd');
}
// Periode statistik: TODAY / WEEK (Senin s.d. hari ini) / MONTH (tgl 1 s.d. hari ini)
function outreachRange_(period) {
  const today = todayString();
  let start = today, key = 'TODAY';
  if (period === 'WEEK') {
    const p = today.split('-');
    const dow = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay(); // 0 = Minggu
    start = outreachAddDays_(today, -((dow + 6) % 7));
    key = 'WEEK';
  } else if (period === 'MONTH') {
    start = today.substring(0, 8) + '01';
    key = 'MONTH';
  }
  return { period: key, start: start, end: today, days: outreachDateDiff_(today, start) + 1 };
}
// Cegah teks yang diawali = + - @ dibaca sebagai rumus oleh Spreadsheet
function outreachSafeText_(v, max) {
  let s = String(v === undefined || v === null ? '' : v).trim();
  if (max && s.length > max) s = s.substring(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

// Materi awal (sekali saja) agar tim bisa langsung mulai. Dapat diubah / dihapus di menu Materi Outreach.
function seedOutreachTemplatesOnce_() {
  try {
    const props = PropertiesService.getScriptProperties();
    if (props.getProperty(OUTREACH_TEMPLATES_SEEDED_PROPERTY)) return;
    const sh = getSS().getSheetByName('OUTREACH_TEMPLATES');
    if (!sh) return;
    if (sh.getLastRow() < 2) {
      const now = nowString();
      [
        ['Sapa Customer Lama', 'CUSTOMER LAMA',
          'Halo Kak {nama} 👋\n\nKami {pic} dari Wonderland Samarinda. Terima kasih sudah pernah berkunjung ke Wonderland 😊\n\nKalau Kakak sedang merencanakan liburan keluarga atau acara bersama, kami siap membantu informasi paket dan reservasinya.\n\nAda rencana berkunjung kapan, Kak?'],
        ['Ajak Kembali Berkunjung', 'LAMA TIDAK BERKUNJUNG',
          'Halo Kak {nama}, apa kabar? 😊\n\nKami {pic} dari Wonderland Samarinda. Sudah cukup lama sejak kunjungan terakhir Kakak. Kalau ada waktu, yuk mampir lagi bersama keluarga atau teman.\n\nBoleh kami bantu infokan jam operasional dan pilihan paket kunjungan, Kak?'],
        ['Penawaran Sekolah', 'SEKOLAH',
          'Selamat siang Bapak/Ibu {nama},\n\nPerkenalkan, saya {pic} dari Wonderland Samarinda. Kami menyediakan paket kunjungan untuk sekolah (outing class, study tour, perpisahan).\n\nBila berkenan, kami kirimkan informasi paket dan simulasi biaya sesuai jumlah peserta. Kapan waktu yang tepat untuk kami kirimkan detailnya?\n\nTerima kasih 🙏'],
        ['Penawaran Corporate Gathering', 'CORPORATE',
          'Selamat siang Bapak/Ibu {nama},\n\nSaya {pic} dari Wonderland Samarinda. Kami melayani company gathering, family day, dan kegiatan outbound untuk perusahaan/instansi.\n\nBoleh kami kirimkan proposal dan pilihan paket sesuai jumlah peserta dan tanggal yang direncanakan?\n\nTerima kasih 🙏'],
        ['Ajakan Keluarga', 'FAMILY',
          'Halo Kak {nama} 👋\n\nKami {pic} dari Wonderland Samarinda. Untuk liburan akhir pekan bersama keluarga, kami siap bantu informasi tiket dan paket kunjungan.\n\nApakah ada rencana dalam waktu dekat, Kak?'],
        ['Ajakan Komunitas', 'KOMUNITAS',
          'Halo Kak {nama} 👋\n\nKami {pic} dari Wonderland Samarinda. Untuk kegiatan komunitas (gathering, arisan, ulang tahun komunitas), kami dapat membantu informasi paket grup dan reservasi.\n\nBoleh kami kirimkan informasinya, Kak?']
      ].forEach(function(r, i) {
        createRecord('OUTREACH_TEMPLATES', {
          materi_id: 'MTR-' + String(i + 1).padStart(5, '0'),
          nama_materi: r[0], tipe: 'TEKS', segmen: r[1], isi_pesan: r[2], gambar_url: '',
          status: 'AKTIF', created_at: now, updated_at: now
        });
      });
    }
    props.setProperty(OUTREACH_TEMPLATES_SEEDED_PROPERTY, '1');
  } catch (e) {
    logError_('seedOutreachTemplatesOnce_', e);
  }
}

// Data halaman Customer Outreach: customer CRM + segmentasi otomatis + materi aktif
function apiOutreachGetBootstrap(token) {
  try {
    checkPermission(token, 'outreach', 'read');
    seedOutreachTemplatesOnce_();
    const today = todayString();
    const cfg = getConfigMap_();
    const inactiveDays = Math.round(parseNum_(cfg[OUTREACH_INACTIVE_KEY])) > 0
      ? Math.round(parseNum_(cfg[OUTREACH_INACTIVE_KEY])) : OUTREACH_DEFAULT_INACTIVE_DAYS;

    const customers = getDataAsObjects('CUSTOMERS');
    const logs = getDataAsObjects('OUTREACH_LOGS');
    const leads = getDataAsObjects('LEADS');
    const followups = getDataAsObjects('FOLLOWUPS');
    const reservations = getDataAsObjects('RESERVATIONS');
    const participants = getDataAsObjects('EVENT_PARTICIPANTS');

    // Data lama tanpa crm_id tetap dikenali lewat nomor WhatsApp (sama seperti Customer 360)
    const idByPhone = {};
    customers.forEach(function(c) {
      const p = normalizePhone_(c.whatsapp);
      if (p) idByPhone[p] = String(c.customer_id);
    });
    function crmOf_(crmId, phone) {
      const id = String(crmId || '').trim();
      return id || idByPhone[normalizePhone_(phone)] || '';
    }

    const logAgg = {}, todayByPic = {};
    logs.forEach(function(l) {
      const id = String(l.crm_id || '').trim();
      if (!id) return;
      const a = logAgg[id] || (logAgg[id] = { count: 0, last: '', today: false });
      const d = normDate_(l.tanggal);
      a.count++;
      if (d > a.last) a.last = d;
      if (d === today) {
        a.today = true;
        const pic = String(l.PIC || '');
        todayByPic[pic] = (todayByPic[pic] || 0) + 1;
      }
    });
    const fuSet = {};
    followups.forEach(function(f) {
      const id = String(f.crm_id || f.customer_id || '').trim();
      if (id) fuSet[id] = true;
    });
    const resByCrm = {};
    reservations.forEach(function(r) {
      const st = String(r.status_reservasi || '').toUpperCase();
      if (st === 'BATAL' || st === 'DRAFT') return;
      const id = String(r.customer_id || '').trim();
      if (id) resByCrm[id] = (resByCrm[id] || 0) + 1;
    });
    const leadAny = {}, leadOpen = {};
    leads.forEach(function(l) {
      const id = crmOf_(l.crm_id, l.whatsapp);
      if (!id) return;
      leadAny[id] = true;
      if (LEAD_STAGE_CLOSED.indexOf(String(l.tahap || '').toUpperCase()) < 0) leadOpen[id] = String(l.lead_id);
    });
    const evSet = {};
    participants.forEach(function(p) {
      const id = crmOf_(p.crm_id, p.whatsapp);
      if (id) evSet[id] = true;
    });

    const rows = customers.map(function(c) {
      const id = String(c.customer_id);
      const agg = logAgg[id] || { count: 0, last: '', today: false };
      const visit = normDate_(c.tanggal_kunjungan_terakhir);
      const since = visit ? outreachDateDiff_(today, visit) : null;
      const jenis = String(c.jenis_pelanggan || '').toLowerCase();
      const hasRes = (resByCrm[id] || 0) > 0;
      const seg = [];
      if (agg.count === 0 && !fuSet[id]) seg.push('BELUM DIHUBUNGI');
      if (parseNum_(c.total_transaksi) > 0 || hasRes || visit) seg.push('CUSTOMER LAMA');
      if (since !== null && since > inactiveDays) seg.push('LAMA TIDAK BERKUNJUNG');
      if (/sekolah|school/.test(jenis)) seg.push('SEKOLAH');
      if (/kantor|corporate|perusahaan|instansi/.test(jenis)) seg.push('CORPORATE');
      if (/komunitas|community/.test(jenis)) seg.push('KOMUNITAS');
      if (/keluarga|family/.test(jenis)) seg.push('FAMILY');
      if (evSet[id]) seg.push('PESERTA EVENT');
      if (leadAny[id] && !hasRes) seg.push('PROSPEK');
      if (String(c.status || '').toUpperCase() === 'VIP') seg.push('VIP');
      const lahir = String(c.tanggal_lahir || '').substring(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(lahir) && lahir.substring(5, 7) === today.substring(5, 7)) seg.push('ULANG TAHUN BULAN INI');
      return {
        crm_id: id,
        nama: String(c.nama || ''),
        whatsapp: String(c.whatsapp || ''),
        phone_ok: normalizePhone_(c.whatsapp).length >= 8,
        kota: String(c.kota || ''),
        jenis_pelanggan: String(c.jenis_pelanggan || ''),
        sumber: String(c.sumber || ''),
        status: String(c.status || ''),
        PIC: String(c.PIC || ''),
        tanggal_kunjungan_terakhir: visit,
        tanggal_lahir: /^\d{4}-\d{2}-\d{2}/.test(String(c.tanggal_lahir || '')) ? String(c.tanggal_lahir).substring(0, 10) : '',
        days_since_visit: since,
        total_transaksi: parseNum_(c.total_transaksi),
        outreach_count: agg.count,
        last_outreach: agg.last,
        contacted_today: agg.today,
        open_lead: leadOpen[id] || '',
        segments: seg
      };
    });
    // Prioritas: belum dihubungi hari ini dulu, lalu yang paling lama tidak diajak komunikasi
    rows.sort(function(a, b) {
      if (a.contacted_today !== b.contacted_today) return a.contacted_today ? 1 : -1;
      if (a.last_outreach !== b.last_outreach) return a.last_outreach < b.last_outreach ? -1 : 1;
      return String(a.nama).localeCompare(String(b.nama));
    });

    const templates = getDataAsObjects('OUTREACH_TEMPLATES')
      .filter(function(t) { return String(t.status || 'AKTIF').toUpperCase() !== 'NONAKTIF'; })
      .sort(function(a, b) { return String(a.materi_id).localeCompare(String(b.materi_id)); });

    return { success: true, data: {
      today: today, target: outreachTarget_(), inactiveDays: inactiveDays,
      todayByPic: todayByPic, customers: rows, templates: templates
    } };
  } catch (e) {
    return handleError_('apiOutreachGetBootstrap', e);
  }
}

// Statistik + log aktivitas untuk satu periode (TODAY / WEEK / MONTH). pic kosong = semua PIC.
function apiOutreachGetOverview(token, period, pic) {
  try {
    checkPermission(token, 'outreach', 'read');
    const rg = outreachRange_(period);
    pic = String(pic || '').trim();
    const target = outreachTarget_();

    const periodLogs = getDataAsObjects('OUTREACH_LOGS').filter(function(l) {
      const d = normDate_(l.tanggal);
      return d >= rg.start && d <= rg.end;
    });
    const logs = pic ? periodLogs.filter(function(l) { return String(l.PIC) === pic; }) : periodLogs;

    const customers = {};
    getDataAsObjects('CUSTOMERS').forEach(function(c) { customers[String(c.customer_id)] = c; });
    const leadById = {};
    getDataAsObjects('LEADS').forEach(function(l) { leadById[String(l.lead_id)] = l; });
    // Reservasi hasil outreach = reservasi yang terhubung ke lead dari log (DRAFT & BATAL tidak dihitung)
    const resByLead = {};
    getDataAsObjects('RESERVATIONS').forEach(function(r) {
      const st = String(r.status_reservasi || '').toUpperCase();
      const lid = String(r.lead_id || '').trim();
      if (!lid || st === 'BATAL' || st === 'DRAFT') return;
      (resByLead[lid] || (resByLead[lid] = [])).push(r);
    });

    function compute_(list, tgt) {
      const seen = {}, leadIds = {}, statusCounts = {};
      let actual = 0, response = 0;
      list.forEach(function(l) {
        const k = String(l.crm_id) + '|' + normDate_(l.tanggal) + '|' + String(l.PIC);
        if (!seen[k]) { seen[k] = true; actual++; }
        const st = String(l.status || '').toUpperCase();
        statusCounts[st] = (statusCounts[st] || 0) + 1;
        if (OUTREACH_RESPONDED.indexOf(st) >= 0) response++;
        const lid = String(l.lead_id || '').trim();
        if (lid) leadIds[lid] = true;
      });
      let reservation = 0, revenue = 0;
      Object.keys(leadIds).forEach(function(lid) {
        (resByLead[lid] || []).forEach(function(r) {
          reservation++;
          revenue += parseNum_(r.aktual_revenue) || parseNum_(r.total);
        });
      });
      return {
        target: tgt, actual: actual, response: response,
        responseRate: actual ? Math.round(response / actual * 100) : 0,
        leads: Object.keys(leadIds).length, reservation: reservation, revenue: Math.round(revenue),
        achievement: tgt ? Math.round(actual / tgt * 100) : 0, statusCounts: statusCounts
      };
    }

    // Baris per PIC: anggota tim aktif + PIC lain yang punya log pada periode ini
    const picNames = [];
    getDataAsObjects('TEAM_MARKETING').forEach(function(t) {
      if (String(t.status || '').toUpperCase() === 'AKTIF' && t.nama && picNames.indexOf(String(t.nama)) < 0) picNames.push(String(t.nama));
    });
    periodLogs.forEach(function(l) {
      const n = String(l.PIC || '').trim();
      if (n && picNames.indexOf(n) < 0) picNames.push(n);
    });
    const perPicTarget = target * rg.days;
    const byPic = picNames.map(function(n) {
      const row = compute_(periodLogs.filter(function(l) { return String(l.PIC) === n; }), perPicTarget);
      row.PIC = n;
      return row;
    });
    const picCount = pic ? 1 : Math.max(1, picNames.length);
    const stats = compute_(logs, perPicTarget * picCount);

    const rows = logs.map(function(l) {
      const c = customers[String(l.crm_id)] || {};
      const lead = leadById[String(l.lead_id || '')] || null;
      const rs = lead ? (resByLead[String(lead.lead_id)] || []) : [];
      const o = {};
      Object.keys(l).forEach(function(k) { o[k] = l[k]; });
      o.crm_nama = String(c.nama || '');
      o.whatsapp = String(c.whatsapp || '');
      o.lead_tahap = lead ? String(lead.tahap || '') : '';
      o.reservation_count = rs.length;
      o.reservation_total = Math.round(rs.reduce(function(s, r) { return s + (parseNum_(r.aktual_revenue) || parseNum_(r.total)); }, 0));
      return o;
    }).sort(function(a, b) { return String(b.outreach_id).localeCompare(String(a.outreach_id)); });
    const truncated = rows.length > 500;

    return { success: true, data: {
      range: rg, target: target, picCount: picCount, stats: stats, byPic: byPic,
      logs: truncated ? rows.slice(0, 500) : rows, truncated: truncated
    } };
  } catch (e) {
    return handleError_('apiOutreachGetOverview', e);
  }
}

// Catat outreach (dipanggil saat WhatsApp Web dibuka). Satu customer hanya sekali per hari.
function apiOutreachCreateLog(token, rec) {
  try {
    checkPermission(token, 'outreach', 'create');
    rec = rec || {};
    const crmId = String(rec.crm_id || '').trim();
    if (!crmId) return { success: false, message: 'crm_id wajib diisi.' };
    const cust = getRecordById('CUSTOMERS', 'customer_id', crmId);
    if (!cust) return { success: false, message: 'Data CRM tidak ditemukan.' };
    if (normalizePhone_(cust.whatsapp).length < 8) return { success: false, message: 'Nomor WhatsApp customer belum valid.' };
    const pic = String(rec.PIC || '').trim();
    if (!pic) return { success: false, message: 'PIC wajib dipilih.' };
    const today = todayString();
    const dup = getDataAsObjects('OUTREACH_LOGS').filter(function(l) {
      return String(l.crm_id) === crmId && normDate_(l.tanggal) === today;
    })[0];
    if (dup) {
      return { success: false, code: 'DUPLICATE', message: String(cust.nama) + ' sudah dihubungi hari ini (PIC: ' + (dup.PIC || '-') + ').' };
    }
    const now = nowString();
    const log = {
      outreach_id: generateId('OUT', 'OUTREACH_LOGS', 'outreach_id'),
      crm_id: crmId,
      tanggal: today,
      PIC: pic,
      campaign_id: outreachSafeText_(rec.campaign_id, 60),
      campaign: outreachSafeText_(rec.campaign, 150),
      materi_id: outreachSafeText_(rec.materi_id, 60),
      materi: outreachSafeText_(rec.materi, 150),
      segmen: outreachSafeText_(rec.segmen, 60),
      pesan: outreachSafeText_(rec.pesan, 1500),
      status: 'DIHUBUNGI',
      hasil: '',
      lead_id: '',
      created_at: now,
      updated_at: now
    };
    createRecord('OUTREACH_LOGS', log);
    return { success: true, data: log, message: 'Outreach tercatat.' };
  } catch (e) {
    return handleError_('apiOutreachCreateLog', e);
  }
}

// Buat Lead dari customer di CRM (tanpa input ulang). Bila customer sudah punya Lead aktif, log dihubungkan ke lead itu.
function outreachEnsureLead_(log, opts) {
  opts = opts || {};
  const cust = getRecordById('CUSTOMERS', 'customer_id', log.crm_id);
  if (!cust) throw new Error('Data CRM tidak ditemukan.');
  const crmId = String(cust.customer_id);
  const phone = normalizePhone_(cust.whatsapp);
  const open = getDataAsObjects('LEADS').filter(function(l) {
    const same = String(l.crm_id) === crmId || (!String(l.crm_id || '').trim() && phone && normalizePhone_(l.whatsapp) === phone);
    return same && LEAD_STAGE_CLOSED.indexOf(String(l.tahap || '').toUpperCase()) < 0;
  })[0];
  if (open) return { lead_id: String(open.lead_id), existing: true };

  const now = nowString();
  const potensi = String(opts.nilai_potensi === undefined || opts.nilai_potensi === null ? '' : opts.nilai_potensi).trim();
  const lead = {
    lead_id: generateId('LEAD', 'LEADS', 'lead_id'),
    tanggal: todayString(),
    nama: cust.nama || '',
    whatsapp: cust.whatsapp || '',
    sumber: 'WhatsApp',
    jenis_pelanggan: cust.jenis_pelanggan || '',
    kebutuhan: outreachSafeText_(opts.kebutuhan, 500),
    nilai_potensi: potensi === '' ? '' : Math.max(0, parseNum_(potensi)),
    status: 'AKTIF',
    tahap: 'INTERESTED',
    PIC: log.PIC || '',
    tanggal_followup: normDate_(opts.tanggal_followup),
    catatan: 'Dari Customer Outreach ' + log.outreach_id + (log.campaign ? ' · ' + log.campaign : ''),
    alasan_lost: '',
    created_at: now,
    updated_at: now,
    crm_id: crmId,           // relasi utama: tidak ada CRM duplicate
    masuk_followup: 'YA'     // otomatis masuk jadwal Follow Up
  };
  createRecord('LEADS', lead);
  afterRecordSave_('leads', lead, false); // jadwal Follow Up otomatis (alur Lead existing)
  return { lead_id: lead.lead_id, existing: false };
}

// Update status / hasil komunikasi. Dengan createLead, customer yang tertarik langsung menjadi Lead.
function apiOutreachUpdateLog(token, outreachId, data) {
  try {
    checkPermission(token, 'outreach', 'update');
    __crmCtx = null;
    data = data || {};
    const log = getRecordById('OUTREACH_LOGS', 'outreach_id', outreachId);
    if (!log) return { success: false, message: 'Log outreach tidak ditemukan.' };
    const upd = { updated_at: nowString() };
    if (data.status !== undefined && String(data.status).trim() !== '') {
      const st = String(data.status).toUpperCase().trim();
      if (OUTREACH_STATUSES.indexOf(st) < 0) return { success: false, message: 'Status outreach tidak valid.' };
      upd.status = st;
    }
    if (data.hasil !== undefined) upd.hasil = outreachSafeText_(data.hasil, 1000);

    let leadInfo = null;
    if (data.createLead) {
      if (String(log.lead_id || '').trim()) {
        return { success: false, message: 'Log ini sudah terhubung ke ' + log.lead_id + '.' };
      }
      leadInfo = outreachEnsureLead_(log, data.createLead);
      upd.lead_id = leadInfo.lead_id;
      upd.status = 'TERTARIK';
    }
    updateRecord('OUTREACH_LOGS', 'outreach_id', outreachId, upd);

    let msg = 'Log outreach diperbarui.';
    if (leadInfo) {
      msg = leadInfo.existing
        ? 'Customer sudah punya Lead aktif (' + leadInfo.lead_id + '). Log dihubungkan ke lead tersebut.'
        : 'Lead ' + leadInfo.lead_id + ' dibuat dari CRM dan masuk jadwal Follow-up.';
    }
    return { success: true, data: { outreach_id: outreachId, lead: leadInfo }, message: msg };
  } catch (e) {
    return handleError_('apiOutreachUpdateLog', e);
  }
}

function apiOutreachDeleteLog(token, outreachId) {
  try {
    checkPermission(token, 'outreach', 'delete');
    const log = getRecordById('OUTREACH_LOGS', 'outreach_id', outreachId);
    if (!log) return { success: false, message: 'Log outreach tidak ditemukan.' };
    if (String(log.lead_id || '').trim()) {
      return { success: false, message: 'Log ini sudah menghasilkan Lead (' + log.lead_id + ') sehingga tidak dapat dihapus.' };
    }
    deleteRecord('OUTREACH_LOGS', 'outreach_id', outreachId);
    return { success: true, message: 'Log outreach dihapus.' };
  } catch (e) {
    return handleError_('apiOutreachDeleteLog', e);
  }
}

// Target harian per PIC (default 10). Hanya Admin / Manager.
function apiOutreachSetTarget(token, value) {
  try {
    const session = checkPermission(token, 'outreach', 'update');
    if (['ADMIN', 'MANAGER'].indexOf(session.role) < 0) {
      return { success: false, message: 'Hanya Admin / Manager yang dapat mengubah target.' };
    }
    const n = Math.round(parseNum_(value));
    if (n < 1 || n > 500) return { success: false, message: 'Target harian harus antara 1 dan 500.' };
    const now = nowString();
    const ok = updateRecord('SYSTEM_CONFIG', 'key', OUTREACH_TARGET_KEY, { value: n, updated_at: now });
    if (!ok) {
      createRecord('SYSTEM_CONFIG', { key: OUTREACH_TARGET_KEY, value: n, description: 'Target Customer Outreach per PIC per hari', updated_at: now });
    }
    return { success: true, data: { target: n }, message: 'Target harian diperbarui.' };
  } catch (e) {
    return handleError_('apiOutreachSetTarget', e);
  }
}

/* ==================== METRIC ENGINE / DYNAMIC METRIC LIBRARY ====================
 * Satu-satunya tempat definisi & perhitungan angka (Single Source of Truth) untuk KPI, OKR, Scoreboard, Dashboard, PDCA.
 * - Definisi metrik disimpan di sheet METRICS (konfigurasi, bukan kode). Metrik baru = tambah baris lewat menu Metric Library.
 * - Actual selalu dihitung langsung dari data sumber (getDataAsObjects) -> tidak ada data yang diduplikasi.
 * - Filter: periode, PIC, status, kategori, sumber, segmen + kondisi filter per metrik.
 */
const METRIC_CALC_TYPES = ['COUNT', 'SUM', 'AVERAGE', 'PERCENTAGE', 'GROWTH', 'COMPLETION_RATE', 'CONVERSION_RATE', 'TARGET_ACHIEVEMENT', 'FORMULA', 'BUILTIN'];
const METRIC_RATIO_TYPES = ['PERCENTAGE', 'GROWTH', 'COMPLETION_RATE', 'CONVERSION_RATE', 'TARGET_ACHIEVEMENT', 'AVERAGE'];
const METRIC_PERIODS = ['MONTH', 'YEAR', 'WEEK', 'TODAY', 'ALL'];
const METRIC_OPS = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'contains', 'in', 'notin', 'empty', 'notempty'];
const METRICS_SEEDED_PROPERTY = 'WMC_METRICS_SEEDED_V2';
// Kunci KPI lama (kolom metrik) -> metric di library. KPI lama tetap jalan tanpa mengubah datanya.
const LEGACY_METRIC_MAP = {
  REVENUE_TOTAL: 'MET-REVENUE_TOTAL', REVENUE_POS: 'MET-REV_POS', KONVERSI: 'MET-KONVERSI_LEADS', REPEAT: 'MET-PELANGGAN_KEMBALI',
  LEADS_POTENSIAL: 'MET-LEADS_POTENSIAL', AKTIVITAS: 'MET-AKTIVITAS_SELESAI_QTY', CUSTOMER_BARU: 'MET-CUSTOMER_BARU', CONTENT: 'MET-KONTEN_DIHASILKAN'
};

// Sumber data = modul. Sheet yang belum terdaftar di sini otomatis ikut tersedia (lihat metricSources_).
const METRIC_SOURCES = {
  CRM:          { sheet: 'CUSTOMERS',          label: 'CRM Pelanggan',      date: 'created_at',        pic: 'PIC',          status: 'status',            kategori: 'jenis_pelanggan', sumber: 'sumber',   segmen: 'jenis_pelanggan', value: 'total_nilai_transaksi' },
  LEADS:        { sheet: 'LEADS',              label: 'Leads',              date: 'tanggal',           pic: 'PIC',          status: 'tahap',             kategori: 'jenis_pelanggan', sumber: 'sumber',   segmen: 'jenis_pelanggan', value: 'nilai_potensi' },
  FOLLOWUPS:    { sheet: 'FOLLOWUPS',          label: 'Follow Up',          date: 'tanggal',           pic: 'PIC',          status: 'status',            kategori: 'jenis',           sumber: 'sumber',   segmen: 'hasil_followup',  value: '' },
  OUTREACH:     { sheet: 'OUTREACH_LOGS',      label: 'Customer Outreach',  date: 'tanggal',           pic: 'PIC',          status: 'status',            kategori: 'materi',          sumber: 'campaign', segmen: 'segmen',          value: '' },
  CONTENT:      { sheet: 'CONTENT',            label: 'Konten',             date: 'tanggal',           pic: 'PIC',          status: 'status',            kategori: 'jenis_konten',    sumber: 'platform', segmen: 'target_pelanggan', value: 'views' },
  EVENTS:       { sheet: 'EVENTS',             label: 'Event',              date: 'tanggal_mulai',     pic: 'PIC',          status: 'status',            kategori: 'jenis_event',     sumber: '',         segmen: '',                value: 'aktual_revenue' },
  PARTICIPANTS: { sheet: 'EVENT_PARTICIPANTS', label: 'Peserta Event',      date: 'created_at',        pic: '',             status: 'status_kehadiran',  kategori: 'kategori',        sumber: 'source',   segmen: 'kategori',        value: 'biaya' },
  RESERVATIONS: { sheet: 'RESERVATIONS',       label: 'Reservasi',          date: 'tanggal_reservasi', pic: 'PIC',          status: 'status_reservasi',  kategori: 'paket',           sumber: '',         segmen: '',                value: 'total' },
  ACTIVITIES:   { sheet: 'ACTIVITIES',         label: 'Aktivitas',          date: 'tanggal',           pic: 'user_id|PIC',  status: 'status',            kategori: 'jenis_aktivitas', sumber: 'sumber',   segmen: '',                value: 'qty' },
  CAMPAIGNS:    { sheet: 'CAMPAIGNS',          label: 'Campaign',           date: 'periode_mulai',     pic: 'PIC',          status: 'status',            kategori: '',                sumber: '',         segmen: 'target_pelanggan', value: 'aktual_revenue' },
  POS:          { sheet: 'POS_SALES',          label: 'Keuangan - POS Kasir', date: 'tanggal',         pic: '',             status: '',                  kategori: 'kategori_produk', sumber: '',         segmen: '',                value: 'total' },
  COSTS:        { sheet: 'MARKETING_COSTS',    label: 'Keuangan - Biaya Marketing', date: 'tanggal',   pic: 'PIC',          status: 'status_pembayaran', kategori: 'kategori_biaya',  sumber: 'tipe_promosi', segmen: '',            value: 'jumlah' },
  VOUCHERS:     { sheet: 'VOUCHERS',           label: 'Voucher',            date: 'tanggal_penjualan', pic: 'PIC',          status: 'status',            kategori: 'jenis_voucher',   sumber: '',         segmen: '',                value: 'harga' },
  SPONSORS:     { sheet: 'SPONSORS',           label: 'Sponsor',            date: 'tanggal_deal',      pic: 'PIC',          status: 'status',            kategori: 'kategori_sponsor', sumber: '',        segmen: '',                value: 'nilai_sponsorship' },
  VENDORS:      { sheet: 'VENDORS',            label: 'Vendor',             date: 'created_at',        pic: '',             status: 'status',            kategori: 'kategori_vendor', sumber: '',         segmen: '',                value: '' },
  TEAM:         { sheet: 'TEAM_MARKETING',     label: 'HR - Data Tim',      date: 'tanggal_mulai',     pic: '',             status: 'status',            kategori: 'jabatan',         sumber: '',         segmen: '',                value: '' }
};
const METRIC_SOURCE_EXCLUDED = ['SYSTEM_CONFIG', 'USERS', 'DROPDOWN_OPTIONS', 'METRICS', 'KPI_SETTINGS'];

// Gabungan sumber terdaftar + sheet lain di SHEETS (otomatis, tanpa ubah kode saat modul baru ditambahkan)
function metricSources_() {
  const out = {};
  const used = {};
  Object.keys(METRIC_SOURCES).forEach(function(k) { out[k] = METRIC_SOURCES[k]; used[METRIC_SOURCES[k].sheet] = true; });
  Object.keys(SHEETS).forEach(function(sheet) {
    if (used[sheet] || METRIC_SOURCE_EXCLUDED.indexOf(sheet) >= 0) return;
    const cols = SHEETS[sheet];
    const dateCol = cols.filter(function(c) { return /^tanggal|^date/i.test(c); })[0] || (cols.indexOf('created_at') >= 0 ? 'created_at' : '');
    out[sheet] = {
      sheet: sheet, label: sheet.replace(/_/g, ' '), date: dateCol,
      pic: cols.indexOf('PIC') >= 0 ? 'PIC' : (cols.indexOf('user_id') >= 0 ? 'user_id' : ''),
      status: cols.indexOf('status') >= 0 ? 'status' : '', kategori: '', sumber: '', segmen: '', value: ''
    };
  });
  return out;
}

/* ---------- Periode ---------- */
function metricLastDay_(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); } // m = 1..12
// spec: 'yyyy-MM' | 'yyyy' | 'yyyy-MM-dd..yyyy-MM-dd' | MONTH | YEAR | WEEK | TODAY | ALL
function metricRange_(spec, defaultPeriod) {
  let s = String(spec || '').trim() || String(defaultPeriod || '').trim() || 'MONTH';
  const up = s.toUpperCase();
  const today = todayString();
  if (up === 'MONTH') s = today.substring(0, 7);
  else if (up === 'YEAR') s = today.substring(0, 4);
  else if (up === 'TODAY') s = today + '..' + today;
  else if (up === 'WEEK') s = outreachAddDays_(today, -((new Date(Date.UTC(+today.substring(0, 4), +today.substring(5, 7) - 1, +today.substring(8, 10))).getUTCDay() + 6) % 7)) + '..' + today;
  else if (up === 'ALL') return { key: 'ALL', start: '', end: '', kind: 'ALL' };
  let m;
  if ((m = s.match(/^(\d{4})-(\d{2})$/))) {
    return { key: s, kind: 'MONTH', start: s + '-01', end: s + '-' + String(metricLastDay_(+m[1], +m[2])).padStart(2, '0') };
  }
  if ((m = s.match(/^(\d{4})$/))) return { key: s, kind: 'YEAR', start: s + '-01-01', end: s + '-12-31' };
  if ((m = s.match(/^(\d{4}-\d{2}-\d{2})\.\.(\d{4}-\d{2}-\d{2})$/))) return { key: s, kind: 'RANGE', start: m[1], end: m[2] };
  throw new Error('Format periode tidak valid: ' + s);
}
function metricPrevRange_(r) {
  if (r.kind === 'MONTH') {
    const y = +r.key.substring(0, 4), mo = +r.key.substring(5, 7);
    const py = mo === 1 ? y - 1 : y, pm = mo === 1 ? 12 : mo - 1;
    return metricRange_(py + '-' + String(pm).padStart(2, '0'));
  }
  if (r.kind === 'YEAR') return metricRange_(String(+r.key - 1));
  if (r.kind === 'RANGE') {
    const len = outreachDateDiff_(r.end, r.start) + 1;
    return metricRange_(outreachAddDays_(r.start, -len) + '..' + outreachAddDays_(r.start, -1));
  }
  return { key: 'ALL', start: '', end: '', kind: 'ALL' };
}

/* ---------- Runtime (cache per request: tiap sheet hanya dibaca sekali) ---------- */
function metricRuntime_() {
  const rt = { _data: {}, _headers: {}, _metrics: null, _memo: {}, _stack: [], _members: null };
  rt.rows = function(sheet) {
    if (!rt._data[sheet]) rt._data[sheet] = getDataAsObjects(sheet);
    return rt._data[sheet];
  };
  rt.headers = function(sheet) {
    if (!rt._headers[sheet]) rt._headers[sheet] = getHeaders(sheet);
    return rt._headers[sheet];
  };
  rt.metric = function(id) {
    if (!rt._metrics) {
      ensureMetricsSeeded_();
      rt._metrics = {};
      getDataAsObjects('METRICS').forEach(function(m) { rt._metrics[String(m.metric_id)] = m; });
    }
    return rt._metrics[String(id)] || null;
  };
  rt.allMetrics = function() { rt.metric('-'); return Object.keys(rt._metrics).map(function(k) { return rt._metrics[k]; }); };
  rt.setMetric = function(m) { rt.metric('-'); rt._metrics[String(m.metric_id)] = m; rt._memo = {}; };
  // Nama PIC (boleh beberapa, dipisah koma) -> alias identitas (nama, username, user_id) dari Data Tim
  rt.aliasesFor = function(pic) {
    const names = String(pic || '').split(',').map(function(s) { return s.trim(); }).filter(Boolean);
    if (!names.length) return null;
    if (!rt._members) rt._members = getScorecardMembers_();
    const out = {};
    names.forEach(function(n) {
      const k = n.toLowerCase();
      const mem = rt._members.filter(function(m) { return m.aliases[k]; })[0];
      if (mem) Object.keys(mem.aliases).forEach(function(a) { out[a] = true; }); else out[k] = true;
    });
    return out;
  };
  return rt;
}

/* ---------- Nilai & kondisi ---------- */
function metricField_(row, spec) {
  const alts = String(spec || '').split('|');
  for (let i = 0; i < alts.length; i++) {
    const f = alts[i].trim();
    if (!f) continue;
    const v = row[f];
    if (v !== '' && v !== null && v !== undefined) return v;
  }
  return '';
}
// Nilai angka sebuah baris: 'kolom' | 'a|b' (pertama yang tidak nol) | 'a*b' (perkalian) | '@ACTQTY' (qty aktivitas)
function metricNumber_(row, spec) {
  const s = String(spec || '').trim();
  if (s === '@ACTQTY') return actQty_(row);
  const alts = s.split('|');
  for (let i = 0; i < alts.length; i++) {
    const t = alts[i].trim();
    if (!t) continue;
    let n;
    if (t.indexOf('*') > 0) {
      n = t.split('*').reduce(function(p, f) { return p * parseNum_(row[f.trim()]); }, 1);
    } else {
      n = parseNum_(row[t]);
    }
    if (n) return n;
  }
  return 0;
}
function metricCmp_(a, b) {
  const sa = String(a).trim(), sb = String(b).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(sa) && /^\d{4}-\d{2}-\d{2}/.test(sb)) {
    const x = sa.substring(0, 10), y = sb.substring(0, 10);
    return x < y ? -1 : (x > y ? 1 : 0);
  }
  if (sa !== '' && sb !== '' && isFinite(sa) && isFinite(sb)) { const d = Number(sa) - Number(sb); return d < 0 ? -1 : (d > 0 ? 1 : 0); }
  const u = sa.toUpperCase(), v = sb.toUpperCase();
  return u < v ? -1 : (u > v ? 1 : 0);
}
function metricList_(v) {
  if (Array.isArray(v)) return v.map(function(x) { return String(x).trim().toUpperCase(); });
  return String(v === undefined || v === null ? '' : v).split(',').map(function(x) { return x.trim().toUpperCase(); }).filter(Boolean);
}
// Satu kondisi filter: {field, op, value}. value mendukung @TODAY, @PERIOD_START, @PERIOD_END, {f:kolom_lain}
function metricCond_(row, c, range) {
  const raw = metricField_(row, c.field);
  const op = String(c.op || 'eq').toLowerCase();
  let val = c.value;
  if (typeof val === 'string') {
    const t = val.trim();
    if (t === '@TODAY') val = todayString();
    else if (t === '@PERIOD_START') val = range.start;
    else if (t === '@PERIOD_END') val = range.end;
    else if (/^\{f:[^}]+\}$/.test(t)) val = metricField_(row, t.slice(3, -1));
  }
  const empty = (raw === '' || raw === null || raw === undefined);
  switch (op) {
    case 'empty': return empty;
    case 'notempty': return !empty;
    case 'eq': return metricCmp_(raw, val) === 0 && !(empty && String(val) !== '');
    case 'ne': return metricCmp_(raw, val) !== 0;
    case 'gt': return !empty && metricCmp_(raw, val) > 0;
    case 'gte': return !empty && metricCmp_(raw, val) >= 0;
    case 'lt': return !empty && String(val) !== '' && metricCmp_(raw, val) < 0;
    case 'lte': return !empty && String(val) !== '' && metricCmp_(raw, val) <= 0;
    case 'contains': return String(raw).toUpperCase().indexOf(String(val).toUpperCase()) >= 0;
    case 'in': return metricList_(val).indexOf(String(raw).trim().toUpperCase()) >= 0;
    case 'notin': return metricList_(val).indexOf(String(raw).trim().toUpperCase()) < 0;
    default: return false;
  }
}
function metricParseFilter_(f) {
  if (Array.isArray(f)) return f;
  const s = String(f || '').trim();
  if (!s) return [];
  const arr = JSON.parse(s);
  if (!Array.isArray(arr)) throw new Error('Filter harus berupa daftar kondisi.');
  return arr;
}

/* ---------- Formula custom: angka, {METRIC_ID}, + - * / ( ) ---------- */
function metricFormulaTokens_(src) {
  const tokens = [];
  const re = /\s*(\{[A-Za-z0-9_\-]+\}|\d+(?:\.\d+)?|[+\-*\/()])/g;
  let pos = 0, m;
  src = String(src || '');
  while (pos < src.length) {
    re.lastIndex = pos;
    m = re.exec(src);
    if (!m || m.index !== pos) {
      if (/^\s*$/.test(src.substring(pos))) break;
      throw new Error('Formula tidak valid dekat: "' + src.substring(pos, pos + 12) + '"');
    }
    tokens.push(m[1]);
    pos = re.lastIndex;
  }
  return tokens;
}
function metricFormulaRefs_(src) {
  return metricFormulaTokens_(src).filter(function(t) { return t.charAt(0) === '{'; }).map(function(t) { return t.slice(1, -1); });
}
// Pembagian dengan nol menghasilkan 0 (bukan error)
function metricFormulaEval_(src, getVar) {
  const tokens = metricFormulaTokens_(src);
  if (!tokens.length) throw new Error('Formula kosong.');
  let i = 0;
  function peek() { return tokens[i]; }
  function next() { return tokens[i++]; }
  function expr() {
    let v = term();
    while (peek() === '+' || peek() === '-') { const op = next(); const r = term(); v = op === '+' ? v + r : v - r; }
    return v;
  }
  function term() {
    let v = factor();
    while (peek() === '*' || peek() === '/') { const op = next(); const r = factor(); v = op === '*' ? v * r : (r === 0 ? 0 : v / r); }
    return v;
  }
  function factor() {
    const t = next();
    if (t === undefined) throw new Error('Formula belum lengkap.');
    if (t === '-') return -factor();
    if (t === '+') return factor();
    if (t === '(') { const v = expr(); if (next() !== ')') throw new Error('Tanda kurung formula tidak seimbang.'); return v; }
    if (t.charAt(0) === '{') return getVar(t.slice(1, -1));
    const n = Number(t);
    if (isNaN(n)) throw new Error('Formula tidak valid: ' + t);
    return n;
  }
  const v = expr();
  if (i < tokens.length) throw new Error('Formula tidak valid (sisa: ' + tokens[i] + ').');
  return v;
}

/* ---------- Perhitungan ---------- */
function metricRound_(v, unit) {
  v = Number(v) || 0;
  if (unit === 'Rp') return Math.round(v);
  if (unit === '%') return Math.round(v * 10) / 10;
  return Math.round(v * 100) / 100;
}

// Baris sumber yang lolos filter periode, PIC, dimensi (status/kategori/sumber/segmen), dan kondisi metrik
function metricMatchRows_(rt, m, src, ctx, skipConds) {
  const dateField = String(m.date_field || '').trim() || src.date;
  const picField = String(m.pic_field || '').trim() || src.pic;
  const conds = skipConds ? [] : metricParseFilter_(m.filter);
  const dims = ctx.dims || {};
  const dimList = [];
  ['status', 'kategori', 'sumber', 'segmen'].forEach(function(d) {
    if (String(dims[d] || '').trim() !== '' && src[d]) dimList.push({ field: src[d], op: 'in', value: dims[d] });
  });
  return rt.rows(src.sheet).filter(function(r) {
    if (ctx.range.start && dateField) {
      const d = normDate_(metricField_(r, dateField));
      if (!d || d < ctx.range.start || d > ctx.range.end) return false;
    }
    if (ctx.aliases) {
      if (!picField || !picMatches_(metricField_(r, picField), ctx.aliases)) return false;
    }
    for (let i = 0; i < dimList.length; i++) if (!metricCond_(r, dimList[i], ctx.range)) return false;
    for (let j = 0; j < conds.length; j++) if (!metricCond_(r, conds[j], ctx.range)) return false;
    return true;
  });
}

function metricLeaf_(rt, m, ctx, type, skipConds) {
  const src = metricSources_()[String(m.data_source || '').trim()];
  if (!src) throw new Error('Sumber data "' + m.data_source + '" tidak ditemukan.');
  const rows = metricMatchRows_(rt, m, src, ctx, skipConds);
  const picAware = !!(String(m.pic_field || '').trim() || src.pic);
  const valueField = String(m.value_field || '').trim() || src.value;
  let v = 0;
  if (type === 'SUM' || type === 'AVERAGE') {
    v = rows.reduce(function(s, r) { return s + metricNumber_(r, valueField); }, 0);
    if (type === 'AVERAGE') v = rows.length ? v / rows.length : 0;
  } else if (String(m.distinct_field || '').trim()) {
    const seen = {};
    rows.forEach(function(r) { const x = String(metricField_(r, m.distinct_field)).trim(); if (x) seen[x] = true; });
    v = Object.keys(seen).length;
  } else {
    v = rows.length;
  }
  return { v: v, pic: picAware, n: rows.length };
}

// Pelanggan kembali (aturan lama): pelanggan dengan lebih dari satu reservasi (tidak BATAL), seluruh waktu
function metricBuiltinRepeat_(rt, ctx) {
  const by = {};
  rt.rows('RESERVATIONS').forEach(function(r) {
    if (String(r.status_reservasi).toUpperCase() === 'BATAL') return;
    if (ctx.aliases && !picMatches_(r.PIC, ctx.aliases)) return;
    const cid = String(r.customer_id || '').trim();
    if (cid) by[cid] = (by[cid] || 0) + 1;
  });
  const n = Object.keys(by).filter(function(k) { return by[k] > 1; }).length;
  return { v: n, pic: true, n: n };
}

function metricRef_(rt, id, ctx) {
  const m = rt.metric(id);
  if (!m) throw new Error('Metric "' + id + '" tidak ditemukan di Metric Library.');
  return metricCompute_(rt, m, ctx);
}

function metricCompute_(rt, m, ctx) {
  const id = String(m.metric_id);
  const key = id + '|' + ctx.range.key + '|' + (ctx.aliases ? Object.keys(ctx.aliases).sort().join(',') : '') + '|' + JSON.stringify(ctx.dims || {});
  if (rt._memo[key]) return rt._memo[key];
  if (rt._stack.indexOf(id) >= 0) throw new Error('Referensi metric melingkar: ' + rt._stack.concat([id]).join(' → '));
  rt._stack.push(id);
  try {
    const type = String(m.calculation_type || 'COUNT').toUpperCase();
    const unit = String(m.unit || '');
    let res;
    const parts = [];
    function ref_(rid, c2) {
      const r = metricRef_(rt, rid, c2 || ctx);
      parts.push({ metric_id: rid, nama: (rt.metric(rid) || {}).metric_name || rid, value: r.v, unit: (rt.metric(rid) || {}).unit || '' });
      return r;
    }
    if (type === 'COUNT' || type === 'SUM' || type === 'AVERAGE') {
      res = metricLeaf_(rt, m, ctx, type, false);
    } else if (type === 'PERCENTAGE' || type === 'COMPLETION_RATE' || type === 'CONVERSION_RATE') {
      let num, den;
      if (String(m.numerator_metric || '').trim()) {
        num = ref_(String(m.numerator_metric).trim());
        den = String(m.denominator_metric || '').trim() ? ref_(String(m.denominator_metric).trim()) : metricLeaf_(rt, m, ctx, 'COUNT', true);
      } else {
        num = metricLeaf_(rt, m, ctx, 'COUNT', false);
        den = metricLeaf_(rt, m, ctx, 'COUNT', true);
      }
      res = { v: den.v > 0 ? (num.v / den.v) * 100 : 0, pic: num.pic || den.pic, n: num.n };
    } else if (type === 'GROWTH') {
      const base = String(m.numerator_metric || '').trim();
      if (!base) throw new Error('Metric GROWTH memerlukan Metric Dasar.');
      const cur = ref_(base);
      const prevCtx = { range: metricPrevRange_(ctx.range), aliases: ctx.aliases, dims: ctx.dims };
      const prev = metricRef_(rt, base, prevCtx);
      parts.push({ metric_id: base, nama: 'Periode sebelumnya (' + prevCtx.range.key + ')', value: prev.v, unit: (rt.metric(base) || {}).unit || '' });
      res = { v: prev.v > 0 ? ((cur.v - prev.v) / prev.v) * 100 : (cur.v > 0 ? 100 : 0), pic: cur.pic, n: cur.n };
    } else if (type === 'TARGET_ACHIEVEMENT') {
      const base = String(m.numerator_metric || '').trim();
      const target = parseNum_(m.formula);
      if (!base) throw new Error('Metric TARGET ACHIEVEMENT memerlukan Metric Dasar.');
      const cur = ref_(base);
      res = { v: target > 0 ? (cur.v / target) * 100 : 0, pic: cur.pic, n: cur.n };
    } else if (type === 'FORMULA') {
      let pic = false;
      const v = metricFormulaEval_(m.formula, function(rid) { const r = ref_(rid); if (r.pic) pic = true; return r.v; });
      res = { v: v, pic: pic, n: 0 };
    } else if (type === 'BUILTIN') {
      const b = String(m.data_source || '').replace(/^BUILTIN:/i, '').toUpperCase();
      if (b === 'REPEAT_CUSTOMERS') res = metricBuiltinRepeat_(rt, ctx);
      else throw new Error('Perhitungan bawaan tidak dikenal: ' + b);
    } else {
      throw new Error('Tipe perhitungan tidak dikenal: ' + type);
    }
    const out = { v: metricRound_(res.v, unit), pic: !!res.pic, n: res.n || 0, parts: parts };
    rt._memo[key] = out;
    return out;
  } finally {
    rt._stack.pop();
  }
}

// Titik masuk tunggal untuk semua modul. opts: {period, aliases, dims}
function metricEval_(rt, metricId, opts) {
  opts = opts || {};
  const m = rt.metric(metricId);
  if (!m) throw new Error('Metric "' + metricId + '" tidak ditemukan di Metric Library.');
  const range = metricRange_(opts.period, m.period);
  return metricCompute_(rt, m, { range: range, aliases: opts.aliases || null, dims: opts.dims || {} });
}
function metricIsRatio_(m) {
  return !!m && (METRIC_RATIO_TYPES.indexOf(String(m.calculation_type || '').toUpperCase()) >= 0 || String(m.unit || '') === '%');
}

/* ---------- Integrasi KPI / OKR / PDCA ---------- */
function kpiMetricId_(k) {
  const mid = String((k && k.metric_id) || '').trim();
  if (mid) return mid === 'MANUAL' ? '' : mid;
  return LEGACY_METRIC_MAP[String((k && k.metrik) || '')] || '';
}
// Periode KPI: kosong/MONTH = periode halaman, YEAR = tahun dari periode halaman, ALL, atau 'yyyy-MM' / 'yyyy' eksplisit
function kpiPeriodSpec_(k, base) {
  const p = String((k && k.periode) || '').trim();
  const up = p.toUpperCase();
  if (!p || up === 'MONTH') return base;
  if (up === 'YEAR') return String(base).substring(0, 4);
  if (up === 'ALL') return 'ALL';
  return p;
}
function kpiAliases_(rt, k) {
  return String((k && k.PIC) || '').trim() ? rt.aliasesFor(k.PIC) : null;
}
function metricExists_(id) {
  return !!metricRuntime_().metric(id);
}

/* ---------- Seed bawaan (sekali). Semua bisa diubah / ditambah dari menu Metric Library ---------- */
function metricSeedList_() {
  const L = [];
  function add(key, name, module, type, source, o) {
    o = o || {};
    L.push({
      metric_id: 'MET-' + key, metric_name: name, module: module, description: o.desc || '', calculation_type: type, data_source: source || '',
      filter: o.filter ? JSON.stringify(o.filter) : '', unit: o.unit || '', period: o.period || 'MONTH',
      date_field: o.date || '', value_field: o.value || '', distinct_field: o.distinct || '', pic_field: '',
      numerator_metric: o.num || '', denominator_metric: o.den || '', formula: o.formula || '',
      tampil_dashboard: o.dash ? 'YA' : 'TIDAK', status: 'AKTIF', is_system: 'YA'
    });
  }
  const NOT_CLOSED = ['SELESAI', 'BATAL'];
  // CRM
  add('CUSTOMER_BARU', 'Customer Baru', 'CRM', 'COUNT', 'CRM', { desc: 'Jumlah profil CRM yang dibuat pada periode.' });
  add('CUSTOMER_TOTAL', 'Total Customer', 'CRM', 'COUNT', 'CRM', { period: 'ALL', desc: 'Seluruh profil CRM (semua waktu).' });
  add('CUSTOMER_AKTIF', 'Customer Aktif', 'CRM', 'COUNT', 'CRM', { period: 'ALL', filter: [{ field: 'status', op: 'eq', value: 'AKTIF' }], desc: 'Profil CRM berstatus AKTIF.' });
  add('CUSTOMER_GROWTH', 'Customer Growth', 'CRM', 'GROWTH', '', { unit: '%', num: 'MET-CUSTOMER_BARU', desc: 'Pertumbuhan customer baru dibanding periode sebelumnya.' });
  add('PELANGGAN_KEMBALI', 'Pelanggan Kembali (Repeat)', 'CRM', 'BUILTIN', 'BUILTIN:REPEAT_CUSTOMERS', { desc: 'Pelanggan dengan lebih dari satu reservasi (tidak BATAL).' });
  // Leads
  add('LEADS_BARU', 'Leads Baru', 'Leads', 'COUNT', 'LEADS', { dash: true, desc: 'Jumlah lead yang masuk pada periode.' });
  add('LEADS_POTENSIAL', 'Leads Potensial', 'Leads', 'COUNT', 'LEADS', { filter: [{ field: 'tahap', op: 'in', value: LEAD_STAGE_QUALIFIED }], desc: 'Lead berstatus INTERESTED sampai RESERVED.' });
  add('LEADS_CONVERTED', 'Leads Berhasil (Reserved)', 'Leads', 'COUNT', 'LEADS', { filter: [{ field: 'tahap', op: 'in', value: LEAD_STAGE_CONVERTED }] });
  add('LEADS_LOST', 'Leads Lost', 'Leads', 'COUNT', 'LEADS', { filter: [{ field: 'tahap', op: 'in', value: ['LOST', 'TIDAK BERHASIL'] }] });
  add('KONVERSI_LEADS', 'Conversion Rate Leads', 'Leads', 'CONVERSION_RATE', '', { unit: '%', num: 'MET-LEADS_CONVERTED', den: 'MET-LEADS_BARU', dash: true, desc: 'Leads berhasil / leads baru.' });
  add('LEADS_NILAI_POTENSI', 'Nilai Potensi Leads', 'Leads', 'SUM', 'LEADS', { unit: 'Rp', value: 'nilai_potensi' });
  // Follow Up
  add('FU_TOTAL', 'Jumlah Follow Up', 'Follow Up', 'COUNT', 'FOLLOWUPS', { desc: 'Seluruh jadwal follow up pada periode.' });
  add('FU_SELESAI', 'Follow Up Selesai', 'Follow Up', 'COUNT', 'FOLLOWUPS', { filter: [{ field: 'status', op: 'eq', value: 'SELESAI' }] });
  add('FU_OVERDUE', 'Follow Up Overdue', 'Follow Up', 'COUNT', 'FOLLOWUPS', { dash: true, filter: [{ field: 'status', op: 'notin', value: NOT_CLOSED }, { field: 'tanggal', op: 'lt', value: '@TODAY' }], desc: 'Jadwal sudah lewat dan belum selesai / batal.' });
  add('FU_COMPLETION_RATE', 'Follow Up Completion Rate', 'Follow Up', 'COMPLETION_RATE', '', { unit: '%', num: 'MET-FU_SELESAI', den: 'MET-FU_TOTAL' });
  add('FU_RESERVASI', 'Follow Up Menjadi Reservasi', 'Follow Up', 'COUNT', 'FOLLOWUPS', { filter: [{ field: 'hasil_followup', op: 'eq', value: 'RESERVATION' }] });
  // Customer Outreach
  add('OUTREACH_TOTAL', 'Customer Outreach Dihubungi', 'Customer Outreach', 'COUNT', 'OUTREACH', { dash: true, distinct: '', desc: 'Jumlah customer yang dihubungi via WhatsApp (Outreach Log).' });
  add('OUTREACH_RESPONSE', 'Outreach Direspons', 'Customer Outreach', 'COUNT', 'OUTREACH', { filter: [{ field: 'status', op: 'in', value: OUTREACH_RESPONDED }] });
  add('OUTREACH_RESPONSE_RATE', 'Outreach Response Rate', 'Customer Outreach', 'PERCENTAGE', '', { unit: '%', num: 'MET-OUTREACH_RESPONSE', den: 'MET-OUTREACH_TOTAL' });
  add('OUTREACH_LEAD', 'Lead dari Outreach', 'Customer Outreach', 'COUNT', 'OUTREACH', { filter: [{ field: 'lead_id', op: 'notempty', value: '' }] });
  add('OUTREACH_LEAD_RATE', 'Outreach → Lead Rate', 'Customer Outreach', 'CONVERSION_RATE', '', { unit: '%', num: 'MET-OUTREACH_LEAD', den: 'MET-OUTREACH_TOTAL' });
  // Konten
  add('KONTEN_DIHASILKAN', 'Konten Dihasilkan', 'Konten', 'COUNT', 'CONTENT', { desc: 'Seluruh konten pada periode (semua status).' });
  add('KONTEN_DIPOSTING', 'Konten Diposting', 'Konten', 'COUNT', 'CONTENT', { filter: [{ field: 'status', op: 'in', value: ['TAYANG', 'SELESAI'] }], desc: 'Konten berstatus TAYANG / SELESAI.' });
  add('KONTEN_VIEWS', 'Views Konten', 'Konten', 'SUM', 'CONTENT', { value: 'views' });
  add('KONTEN_ENGAGEMENT', 'Engagement Konten', 'Konten', 'SUM', 'CONTENT', { value: 'engagement' });
  add('KONTEN_LEADS', 'Leads dari Konten', 'Konten', 'SUM', 'CONTENT', { value: 'leads' });
  // Event
  add('EVENT_TOTAL', 'Jumlah Event', 'Event', 'COUNT', 'EVENTS');
  add('EVENT_REVENUE', 'Revenue Event', 'Event', 'SUM', 'EVENTS', { unit: 'Rp', value: 'aktual_revenue' });
  add('EVENT_PESERTA_AKTUAL', 'Peserta Event (Aktual)', 'Event', 'SUM', 'EVENTS', { value: 'aktual_peserta', unit: 'pax' });
  add('EVENT_PESERTA_TERDAFTAR', 'Peserta Event Terdaftar', 'Event', 'COUNT', 'PARTICIPANTS');
  // Reservasi
  const RES_OK = [{ field: 'status_reservasi', op: 'ne', value: 'BATAL' }];
  add('RESERVASI_TOTAL', 'Reservation', 'Reservasi', 'COUNT', 'RESERVATIONS', { filter: RES_OK, desc: 'Jumlah reservasi (tidak BATAL).' });
  add('RESERVASI_PAX', 'Total Pax', 'Reservasi', 'SUM', 'RESERVATIONS', { filter: RES_OK, value: 'jumlah_peserta', unit: 'pax' });
  add('REV_RESERVASI', 'Revenue Reservasi', 'Reservasi', 'SUM', 'RESERVATIONS', { filter: RES_OK, value: 'aktual_revenue|total', unit: 'Rp' });
  add('RESERVASI_RATA_RATA', 'Rata-rata Nilai Reservasi', 'Reservasi', 'AVERAGE', 'RESERVATIONS', { filter: RES_OK, value: 'total', unit: 'Rp' });
  add('RESERVASI_LUNAS', 'Reservasi Lunas', 'Reservasi', 'COUNT', 'RESERVATIONS', { filter: RES_OK.concat([{ field: 'status_pembayaran', op: 'eq', value: 'LUNAS' }]) });
  // Keuangan
  add('REV_POS', 'Penjualan POS Kasir', 'Keuangan', 'SUM', 'POS', { value: 'total|harga*qty', unit: 'Rp' });
  add('REVENUE_TOTAL', 'Revenue', 'Keuangan', 'FORMULA', '', { unit: 'Rp', dash: true, formula: '{MET-REV_RESERVASI}+{MET-EVENT_REVENUE}+{MET-REV_POS}', desc: 'Revenue marketing = reservasi + event + POS Kasir.' });
  add('BIAYA_MARKETING', 'Biaya Marketing', 'Keuangan', 'SUM', 'COSTS', { value: 'jumlah', unit: 'Rp' });
  add('BIAYA_ONLINE', 'Biaya Promosi Online', 'Keuangan', 'SUM', 'COSTS', { value: 'jumlah', unit: 'Rp', filter: [{ field: 'tipe_promosi', op: 'eq', value: 'ONLINE' }] });
  add('BIAYA_OFFLINE', 'Biaya Promosi Offline', 'Keuangan', 'SUM', 'COSTS', { value: 'jumlah', unit: 'Rp', filter: [{ field: 'tipe_promosi', op: 'eq', value: 'OFFLINE' }] });
  add('ROAS', 'ROAS (Revenue / Biaya)', 'Keuangan', 'FORMULA', '', { unit: 'x', formula: '{MET-REVENUE_TOTAL}/{MET-BIAYA_MARKETING}' });
  add('SPONSOR_NILAI', 'Nilai Sponsorship', 'Keuangan', 'SUM', 'SPONSORS', { value: 'nilai_sponsorship', unit: 'Rp' });
  add('VOUCHER_TERJUAL', 'Voucher Terjual', 'Keuangan', 'COUNT', 'VOUCHERS', { filter: [{ field: 'tanggal_penjualan', op: 'notempty', value: '' }] });
  add('REV_VOUCHER', 'Penjualan Voucher', 'Keuangan', 'SUM', 'VOUCHERS', { value: 'harga', unit: 'Rp', filter: [{ field: 'tanggal_penjualan', op: 'notempty', value: '' }], desc: 'Nilai voucher terjual (harga) pada periode, berdasarkan tanggal penjualan.' });
  add('REV_SPONSOR', 'Revenue Sponsor (Deal / Terealisasi)', 'Keuangan', 'SUM', 'SPONSORS', { value: 'nilai_sponsorship', unit: 'Rp', filter: [{ field: 'status', op: 'in', value: ['DEAL', 'TEREALISASI'] }], desc: 'Nilai sponsorship berstatus DEAL / TEREALISASI pada periode (berdasarkan tanggal deal).' });
  // Aktivitas
  add('AKTIVITAS_SELESAI_QTY', 'Pencapaian Aktivitas (Qty Selesai)', 'Aktivitas', 'SUM', 'ACTIVITIES', { value: '@ACTQTY', filter: [{ field: 'status', op: 'eq', value: 'SELESAI' }], desc: 'Total Qty aktivitas berstatus SELESAI.' });
  add('ACT_TOTAL', 'Jumlah Aktivitas', 'Aktivitas', 'COUNT', 'ACTIVITIES');
  add('ACT_SELESAI', 'Activities Selesai', 'Aktivitas', 'COUNT', 'ACTIVITIES', { filter: [{ field: 'status', op: 'eq', value: 'SELESAI' }] });
  add('ACT_COMPLETION_RATE', 'Activities Completion Rate', 'Aktivitas', 'COMPLETION_RATE', '', { unit: '%', num: 'MET-ACT_SELESAI', den: 'MET-ACT_TOTAL' });
  add('ACT_OVERDUE', 'Activities Overdue', 'Aktivitas', 'COUNT', 'ACTIVITIES', { filter: [{ field: 'deadline', op: 'lt', value: '@TODAY' }, { field: 'status', op: 'notin', value: NOT_CLOSED }] });
  add('ACT_ONTIME', 'Activities On Time', 'Aktivitas', 'COUNT', 'ACTIVITIES', { filter: [{ field: 'status', op: 'eq', value: 'SELESAI' }, { field: 'deadline', op: 'notempty', value: '' }, { field: 'updated_at', op: 'lte', value: '{f:deadline}' }], desc: 'Selesai dan terakhir diperbarui sebelum / pada deadline.' });
  add('ACT_ONTIME_RATE', 'Activities On Time Rate', 'Aktivitas', 'PERCENTAGE', '', { unit: '%', num: 'MET-ACT_ONTIME', den: 'MET-ACT_SELESAI', dash: true });
  // HR (Data Tim). Aktivitas per orang tersedia lewat filter PIC pada metrik Aktivitas.
  add('TIM_AKTIF', 'Anggota Tim Aktif', 'HR', 'COUNT', 'TEAM', { period: 'ALL', filter: [{ field: 'status', op: 'eq', value: 'AKTIF' }] });
  // Campaign
  add('CAMPAIGN_REVENUE', 'Revenue Campaign', 'Campaign', 'SUM', 'CAMPAIGNS', { value: 'aktual_revenue', unit: 'Rp' });
  add('CAMPAIGN_LEADS', 'Leads Campaign', 'Campaign', 'SUM', 'CAMPAIGNS', { value: 'aktual_leads' });
  // Public Landing Page (Lead Capture / Reservasi Online / Registrasi Event)
  add('LEADS_LANDING', 'Leads dari Landing Page', 'Landing Page', 'COUNT', 'LEADS', { dash: true, filter: [{ field: 'landing_page_id', op: 'notempty', value: '' }], desc: 'Lead yang masuk melalui public landing page.' });
  add('RESERVASI_LANDING', 'Reservasi dari Landing Page', 'Landing Page', 'COUNT', 'RESERVATIONS', { filter: [{ field: 'landing_page_id', op: 'notempty', value: '' }], desc: 'Reservasi yang masuk melalui form reservasi publik.' });
  add('EVENT_REGISTRATIONS', 'Registrasi Event (Publik)', 'Landing Page', 'COUNT', 'PARTICIPANTS', { dash: true, filter: [{ field: 'source', op: 'eq', value: 'EVENT_REGISTRATION' }], desc: 'Peserta event yang mendaftar via halaman publik.' });
  add('EVENT_CHECKIN', 'Check-in Event', 'Landing Page', 'COUNT', 'PARTICIPANTS', { filter: [{ field: 'source', op: 'eq', value: 'EVENT_REGISTRATION' }, { field: 'status_kehadiran', op: 'eq', value: 'HADIR' }] });
  add('EVENT_CHECKIN_RATE', 'Check-in Rate Event', 'Landing Page', 'PERCENTAGE', '', { unit: '%', num: 'MET-EVENT_CHECKIN', den: 'MET-EVENT_REGISTRATIONS' });
  add('LEADS_POTENSI_NILAI', 'Nilai Potensi Leads', 'Leads', 'SUM', 'LEADS', { value: 'nilai_potensi', unit: 'Rp', desc: 'Total nilai potensi seluruh leads pada periode.' });
  return L;
}

// Menambahkan metrik bawaan yang belum ada (tidak menimpa perubahan user). Sekali per versi seed.
function ensureMetricsSeeded_() {
  try {
    const props = PropertiesService.getScriptProperties();
    if (props.getProperty(METRICS_SEEDED_PROPERTY)) return;
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      if (props.getProperty(METRICS_SEEDED_PROPERTY)) return;
      const sheet = getSS().getSheetByName('METRICS');
      if (!sheet) return;
      const headers = getHeaders('METRICS');
      const have = {};
      getDataAsObjects('METRICS').forEach(function(m) { have[String(m.metric_id)] = true; });
      const now = nowString();
      const rows = metricSeedList_().filter(function(m) { return !have[m.metric_id]; }).map(function(m) {
        m.created_at = now; m.updated_at = now;
        return headers.map(function(h) { return m[h] !== undefined && m[h] !== null ? m[h] : ''; });
      });
      if (rows.length) sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
      props.setProperty(METRICS_SEEDED_PROPERTY, '1');
    } finally {
      lock.releaseLock();
    }
  } catch (e) {
    logError_('ensureMetricsSeeded_', e);
  }
}

/* ---------- API Metric Library ---------- */
function metricIsManager_(session) { return session.role === 'ADMIN' || session.role === 'MANAGER'; }
function metricDimsFrom_(f) {
  const d = {};
  f = f || {};
  ['status', 'kategori', 'sumber', 'segmen'].forEach(function(k) { if (String(f[k] || '').trim() !== '') d[k] = String(f[k]).trim(); });
  return d;
}

function apiMetricGetLibrary(token) {
  try {
    checkPermission(token, 'metrics', 'read');
    const rt = metricRuntime_();
    const metrics = rt.allMetrics().sort(function(a, b) {
      return String(a.module).localeCompare(String(b.module)) || String(a.metric_name).localeCompare(String(b.metric_name));
    });
    const srcs = metricSources_();
    const sources = Object.keys(srcs).map(function(k) {
      const s = srcs[k];
      return { key: k, label: s.label, sheet: s.sheet, fields: rt.headers(s.sheet), date: s.date, pic: s.pic, status: s.status, kategori: s.kategori, sumber: s.sumber, segmen: s.segmen, value: s.value };
    });
    return { success: true, data: { metrics: metrics, sources: sources, calcTypes: METRIC_CALC_TYPES, periods: METRIC_PERIODS, ops: METRIC_OPS } };
  } catch (e) {
    return handleError_('apiMetricGetLibrary', e);
  }
}

// Nilai banyak metrik sekaligus (ids kosong = semua metrik AKTIF). filters: {pic, status, kategori, sumber, segmen}
function apiMetricEvaluate(token, ids, period, filters) {
  try {
    checkPermission(token, 'metrics', 'read');
    const rt = metricRuntime_();
    filters = filters || {};
    const aliases = String(filters.pic || '').trim() ? rt.aliasesFor(filters.pic) : null;
    const dims = metricDimsFrom_(filters);
    const list = (Array.isArray(ids) && ids.length)
      ? ids.map(function(i) { return rt.metric(i); }).filter(Boolean)
      : rt.allMetrics().filter(function(m) { return String(m.status || 'AKTIF').toUpperCase() !== 'NONAKTIF'; });
    const values = {};
    list.forEach(function(m) {
      try {
        const r = metricEval_(rt, m.metric_id, { period: period, aliases: aliases, dims: dims });
        values[m.metric_id] = { value: r.v, pic: r.pic };
      } catch (err) {
        values[m.metric_id] = { error: String(err && err.message ? err.message : err) };
      }
    });
    return { success: true, data: { period: metricRange_(period, '').key, values: values } };
  } catch (e) {
    return handleError_('apiMetricEvaluate', e);
  }
}

// Validasi definisi metrik. Mengembalikan pesan error atau ''.
function metricValidate_(rt, rec, isNew) {
  const type = String(rec.calculation_type || '').toUpperCase();
  if (!String(rec.metric_name || '').trim()) return 'Nama metric wajib diisi.';
  if (METRIC_CALC_TYPES.indexOf(type) < 0 || type === 'BUILTIN') return 'Tipe perhitungan tidak valid.';
  const per = String(rec.period || 'MONTH').toUpperCase();
  if (METRIC_PERIODS.indexOf(per) < 0) return 'Periode bawaan tidak valid.';
  const srcs = metricSources_();
  const src = srcs[String(rec.data_source || '').trim()];
  const needsSource = type === 'COUNT' || type === 'SUM' || type === 'AVERAGE' ||
    (['PERCENTAGE', 'COMPLETION_RATE', 'CONVERSION_RATE'].indexOf(type) >= 0 && !String(rec.numerator_metric || '').trim());
  if (needsSource && !src) return 'Pilih Sumber Data (modul) untuk metric ini.';
  if (src) {
    const headers = rt.headers(src.sheet);
    function chk(field, label) {
      const f = String(field || '').trim();
      if (!f) return '';
      return headers.indexOf(f) < 0 ? label + ' "' + f + '" tidak ada di ' + src.label + '.' : '';
    }
    let e = chk(rec.date_field, 'Field tanggal') || chk(rec.pic_field, 'Field PIC') || chk(rec.distinct_field, 'Field distinct');
    if (e) return e;
    const vf = String(rec.value_field || '').trim();
    if (vf && vf !== '@ACTQTY') {
      const toks = vf.split('|').reduce(function(a, p) { return a.concat(p.split('*')); }, []);
      for (let i = 0; i < toks.length; i++) if (toks[i].trim() && headers.indexOf(toks[i].trim()) < 0) return 'Field nilai "' + toks[i].trim() + '" tidak ada di ' + src.label + '.';
    }
    if ((type === 'SUM' || type === 'AVERAGE') && !vf && !src.value) return 'Metric SUM / AVERAGE memerlukan Field Nilai.';
    let conds;
    try { conds = metricParseFilter_(rec.filter); } catch (err) { return 'Filter tidak valid: ' + err.message; }
    for (let j = 0; j < conds.length; j++) {
      const c = conds[j];
      if (!c || !c.field || headers.indexOf(String(c.field).trim()) < 0) return 'Kolom filter "' + (c && c.field) + '" tidak ada di ' + src.label + '.';
      if (METRIC_OPS.indexOf(String(c.op || 'eq').toLowerCase()) < 0) return 'Operator filter "' + c.op + '" tidak valid.';
    }
  }
  const refs = [];
  ['numerator_metric', 'denominator_metric'].forEach(function(k) { if (String(rec[k] || '').trim()) refs.push(String(rec[k]).trim()); });
  if (type === 'FORMULA') {
    try {
      const fr = metricFormulaRefs_(rec.formula);
      if (!fr.length) return 'Formula harus memuat minimal satu metric, mis. {MET-REVENUE_TOTAL}/{MET-BIAYA_MARKETING}.';
      metricFormulaEval_(rec.formula, function() { return 1; });
      fr.forEach(function(r) { refs.push(r); });
    } catch (err) { return err.message; }
  }
  if (['GROWTH', 'TARGET_ACHIEVEMENT'].indexOf(type) >= 0 && !String(rec.numerator_metric || '').trim()) return 'Pilih Metric Dasar.';
  if (type === 'TARGET_ACHIEVEMENT' && !(parseNum_(rec.formula) > 0)) return 'Isi target (angka > 0) pada kolom Formula / Target.';
  if (['PERCENTAGE', 'COMPLETION_RATE', 'CONVERSION_RATE'].indexOf(type) >= 0 && String(rec.denominator_metric || '').trim() && !String(rec.numerator_metric || '').trim()) return 'Metric Pembagi memerlukan Metric Pembilang.';
  for (let k = 0; k < refs.length; k++) if (!rt.metric(refs[k])) return 'Metric "' + refs[k] + '" tidak ditemukan di library.';
  return '';
}
function metricRefsOf_(m) {
  const refs = [];
  ['numerator_metric', 'denominator_metric'].forEach(function(k) { if (String(m[k] || '').trim()) refs.push(String(m[k]).trim()); });
  if (String(m.calculation_type).toUpperCase() === 'FORMULA') { try { metricFormulaRefs_(m.formula).forEach(function(r) { refs.push(r); }); } catch (e) {} }
  return refs;
}
function metricHasCycle_(rt, startId) {
  function visit(id, path) {
    if (path.indexOf(id) >= 0) return true;
    const m = rt.metric(id);
    if (!m) return false;
    const p2 = path.concat([id]);
    return metricRefsOf_(m).some(function(r) { return visit(r, p2); });
  }
  return visit(startId, []);
}

// Uji metric (belum disimpan juga boleh): kembalikan nilai + rincian komponen
function apiMetricPreview(token, rec, period, filters) {
  try {
    checkPermission(token, 'metrics', 'read');
    rec = rec || {};
    const rt = metricRuntime_();
    const m = {};
    Object.keys(rec).forEach(function(k) { m[k] = rec[k]; });
    m.metric_id = String(m.metric_id || '').trim() || '__PREVIEW__';
    const existing = rt.metric(m.metric_id);
    if (existing && String(existing.is_system).toUpperCase() === 'YA') {
      Object.keys(existing).forEach(function(k) { m[k] = existing[k]; }); // metrik sistem diuji apa adanya
    } else {
      const verr = metricValidate_(rt, m, !existing);
      if (verr) return { success: false, message: verr };
    }
    rt.setMetric(m);
    if (metricHasCycle_(rt, m.metric_id)) return { success: false, message: 'Referensi metric melingkar.' };
    filters = filters || {};
    const aliases = String(filters.pic || '').trim() ? rt.aliasesFor(filters.pic) : null;
    const r = metricEval_(rt, m.metric_id, { period: period, aliases: aliases, dims: metricDimsFrom_(filters) });
    return { success: true, data: { value: r.v, unit: m.unit || '', rows: r.n, parts: r.parts, pic: r.pic, period: metricRange_(period, m.period).key } };
  } catch (e) {
    if (e && !e.code) return { success: false, message: e.message || 'Gagal menguji metric.' };
    return handleError_('apiMetricPreview', e);
  }
}

function apiMetricSave(token, rec) {
  try {
    const session = checkPermission(token, 'metrics', 'update');
    if (!metricIsManager_(session)) return { success: false, message: 'Hanya Admin / Manager yang dapat mengelola Metric Library.' };
    __crmCtx = null;
    rec = rec || {};
    const rt = metricRuntime_();
    const id = String(rec.metric_id || '').trim();
    const existing = id ? rt.metric(id) : null;
    const now = nowString();
    const clean = {};
    ['metric_name', 'module', 'description', 'calculation_type', 'data_source', 'filter', 'unit', 'period', 'date_field', 'value_field', 'distinct_field',
      'pic_field', 'numerator_metric', 'denominator_metric', 'formula', 'tampil_dashboard', 'status'].forEach(function(k) {
      if (rec[k] !== undefined) clean[k] = typeof rec[k] === 'object' ? JSON.stringify(rec[k]) : String(rec[k]).trim();
    });

    if (existing && String(existing.is_system).toUpperCase() === 'YA') {
      // Metrik bawaan dipakai KPI lama: hanya label & tampilan yang boleh diubah (rumus dikunci)
      const allowed = ['metric_name', 'module', 'description', 'tampil_dashboard', 'status'];
      const upd = { updated_at: now };
      allowed.forEach(function(k) { if (clean[k] !== undefined) upd[k] = clean[k]; });
      if (!String(upd.metric_name === undefined ? existing.metric_name : upd.metric_name).trim()) return { success: false, message: 'Nama metric wajib diisi.' };
      updateRecord('METRICS', 'metric_id', id, upd);
      return { success: true, data: { metric_id: id }, message: 'Metric bawaan diperbarui (rumus dikunci agar KPI lama tetap konsisten; gunakan Duplikat untuk membuat varian).' };
    }

    const full = {};
    Object.keys(existing || {}).forEach(function(k) { full[k] = existing[k]; });
    Object.keys(clean).forEach(function(k) { full[k] = clean[k]; });
    full.calculation_type = String(full.calculation_type || '').toUpperCase();
    full.period = String(full.period || 'MONTH').toUpperCase();
    const verr = metricValidate_(rt, full, !existing);
    if (verr) return { success: false, message: verr };

    if (existing) {
      rt.setMetric(full);
      if (metricHasCycle_(rt, id)) return { success: false, message: 'Referensi metric melingkar.' };
      clean.calculation_type = full.calculation_type;
      clean.period = full.period;
      clean.updated_at = now;
      updateRecord('METRICS', 'metric_id', id, clean);
      return { success: true, data: { metric_id: id }, message: 'Metric diperbarui.' };
    }
    const newId = generateId('MET', 'METRICS', 'metric_id');
    full.metric_id = newId;
    rt.setMetric(full);
    if (metricHasCycle_(rt, newId)) return { success: false, message: 'Referensi metric melingkar.' };
    full.is_system = 'TIDAK';
    full.status = full.status || 'AKTIF';
    full.tampil_dashboard = full.tampil_dashboard || 'TIDAK';
    full.created_at = now;
    full.updated_at = now;
    createRecord('METRICS', full);
    return { success: true, data: { metric_id: newId }, message: 'Metric ' + newId + ' dibuat. Langsung bisa dipilih di KPI, OKR, Scoreboard, dan PDCA.' };
  } catch (e) {
    return handleError_('apiMetricSave', e);
  }
}

function apiMetricDelete(token, metricId) {
  try {
    const session = checkPermission(token, 'metrics', 'delete');
    if (!metricIsManager_(session)) return { success: false, message: 'Hanya Admin / Manager yang dapat mengelola Metric Library.' };
    const rt = metricRuntime_();
    const m = rt.metric(metricId);
    if (!m) return { success: false, message: 'Metric tidak ditemukan.' };
    if (String(m.is_system).toUpperCase() === 'YA') return { success: false, message: 'Metric bawaan tidak dapat dihapus. Nonaktifkan bila tidak dipakai.' };
    const users = [];
    getDataAsObjects('KPI_SETTINGS').forEach(function(k) { if (String(k.metric_id) === metricId) users.push('KPI ' + k.nama_kpi); });
    getDataAsObjects('OKR').forEach(function(o) { if (String(o.metric_id) === metricId) users.push('OKR ' + o.sasaran); });
    getDataAsObjects('PDCA').forEach(function(p) { if (String(p.metric_id) === metricId) users.push('PDCA ' + p.program); });
    rt.allMetrics().forEach(function(x) { if (metricRefsOf_(x).indexOf(metricId) >= 0) users.push('Metric ' + x.metric_name); });
    if (users.length) return { success: false, message: 'Metric masih dipakai oleh: ' + users.slice(0, 5).join(', ') + (users.length > 5 ? ' dan ' + (users.length - 5) + ' lainnya' : '') + '.' };
    deleteRecord('METRICS', 'metric_id', metricId);
    return { success: true, message: 'Metric dihapus.' };
  } catch (e) {
    return handleError_('apiMetricDelete', e);
  }
}

// Metrik yang ditandai "Tampil di Dashboard" (konfigurasi di Metric Library, tanpa ubah kode)
function metricDashboardWidgets_() {
  try {
    const rt = metricRuntime_();
    const period = currentMonthKey_();
    return rt.allMetrics().filter(function(m) {
      return String(m.tampil_dashboard).toUpperCase() === 'YA' && String(m.status || 'AKTIF').toUpperCase() !== 'NONAKTIF';
    }).map(function(m) {
      try {
        const r = metricEval_(rt, m.metric_id, { period: period });
        return { metric_id: m.metric_id, nama: m.metric_name, module: m.module, unit: m.unit || '', value: r.v, periode: r.v === undefined ? '' : period };
      } catch (err) {
        return { metric_id: m.metric_id, nama: m.metric_name, module: m.module, unit: m.unit || '', value: 0, error: String(err.message || err) };
      }
    });
  } catch (e) {
    logError_('metricDashboardWidgets_', e);
    return [];
  }
}


// Lengkapi baris KPI_SETTINGS untuk tampilan: KPI lama (hanya kolom metrik) otomatis dipetakan ke metric di library
function kpiDecorate_(rt, k) {
  if (!String(k.metric_id || '').trim()) k.metric_id = String(k.metrik) === 'MANUAL' ? 'MANUAL' : (kpiMetricId_(k) || '');
  const mm = k.metric_id && k.metric_id !== 'MANUAL' ? rt.metric(k.metric_id) : null;
  k.metric_nama = mm ? mm.metric_name : (k.metric_id === 'MANUAL' ? 'Input manual' : '');
}
function metricLookups_() {
  try {
    return metricRuntime_().allMetrics().filter(function(m) { return String(m.status || 'AKTIF').toUpperCase() !== 'NONAKTIF'; })
      .map(function(m) { return { id: m.metric_id, nama: m.metric_name, module: m.module, unit: m.unit || '', ratio: metricIsRatio_(m) }; })
      .sort(function(a, b) { return String(a.module).localeCompare(String(b.module)) || String(a.nama).localeCompare(String(b.nama)); });
  } catch (e) {
    logError_('metricLookups_', e);
    return [];
  }
}

/* ==================== PENGATURAN PILIHAN DROPDOWN ==================== */
// Daftar bawaan (diisi otomatis ke sheet DROPDOWN_OPTIONS saat pertama kali dipakai).
// Setelah itu semua pilihan diatur dari menu Pengaturan di web app.
// Status/tahap yang menggerakkan logika sistem (mis. BERHASIL, LUNAS, SELESAI) sengaja TIDAK bisa diubah.
const OPTION_DEFAULTS = {
  kategori_produk: ['Tiket Masuk', 'Wahana & Permainan', 'Makanan & Minuman', 'Snack', 'Merchandise', 'Paket Grup / Reservasi', 'Voucher', 'Sewa Aula', 'Event & Workshop', 'Lainnya'],
  tipe_promosi: ['ONLINE', 'OFFLINE'],
  'kategori_biaya:ONLINE': ['Iklan Instagram / Meta Ads', 'Iklan TikTok Ads', 'Iklan Google Ads', 'Iklan YouTube', 'Endorse / Influencer', 'Produksi Konten (foto/video)', 'Fee Admin / Freelance Sosmed', 'Website & Tools Marketing', 'Marketplace / Platform Tiket'],
  'kategori_biaya:OFFLINE': ['Banner / Spanduk / Baliho', 'Brosur / Flyer / Poster', 'Iklan Radio', 'Iklan Koran / Majalah', 'Booth / Pameran', 'Kunjungan & Kerjasama Sekolah', 'Sponsorship', 'Merchandise / Giveaway', 'Transport & Operasional Sales'],
  platform: ['Instagram', 'Facebook', 'TikTok', 'WhatsApp', 'Google Business', 'Website', 'Lainnya'],
  jenis_konten: ['Feed', 'Reels / Video', 'Story', 'Promosi', 'Informasi', 'Event'],
  jenis_aktivitas: ['Telepon', 'WhatsApp', 'Kunjungan', 'Meeting', 'Konten', 'Promosi', 'Follow-up', 'Lainnya'],
  jenis_pelanggan: ['Individu', 'Keluarga', 'Grup', 'Sekolah', 'Kantor', 'Komunitas'],
  sumber: ['Instagram', 'Facebook', 'TikTok', 'WhatsApp', 'Google', 'Referral', 'Walk-in', 'EVENT', 'Lainnya'],
  jenis_followup: ['Telepon', 'WhatsApp', 'Kunjungan', 'Email'],
  paket: ['Reguler', 'Paket Sekolah', 'Paket Kantor', 'Paket Ulang Tahun', 'Paket Gathering', 'Custom'],
  jenis_event: ['Event Anak', 'Event Sekolah', 'Event Kantor', 'Festival', 'Promosi', 'Lainnya'],
  kategori_peserta: ['Anak', 'Dewasa', 'Guru/Pendamping', 'VIP', 'Sponsor'],
  jenis_voucher: ['Tiket Masuk', 'Paket Wahana', 'Voucher Ulang Tahun', 'Voucher Sekolah', 'Promo Khusus'],
  jabatan: ['Marketing', 'Senior Marketing', 'Supervisor Marketing', 'Manager Marketing'],
  kategori_sponsor: ['Perusahaan / Brand', 'Bank / Keuangan', 'Media Partner', 'Komunitas', 'Instansi Pemerintah', 'Sekolah / Lembaga Pendidikan', 'Perorangan', 'Lainnya'],
  jenis_sponsorship: ['Dana (Uang Tunai)', 'Barang / Produk', 'Jasa', 'Media Partner', 'Kombinasi'],
  kategori_vendor: ['Percetakan', 'Media Iklan', 'Influencer / KOL', 'Event Organizer', 'Produksi Konten', 'Dekorasi & Perlengkapan', 'Katering', 'Merchandise', 'Lainnya']
};
// Nilai yang dipakai logika laporan, jadi tidak boleh diubah nama / dihapus / dinonaktifkan
const OPTION_LOCKED = { tipe_promosi: ['ONLINE', 'OFFLINE'] };

function optionSort_(a, b) {
  const d = (Number(a.urutan) || 0) - (Number(b.urutan) || 0);
  return d !== 0 ? d : String(a.opsi_id).localeCompare(String(b.opsi_id));
}
function isOptionLocked_(grup, nilai) {
  const l = OPTION_LOCKED[grup];
  return !!l && l.indexOf(String(nilai)) >= 0;
}

// Isi sheet dengan daftar bawaan saat masih kosong. Nilai yang pernah diketik manual di POS / Biaya ikut dimasukkan.
function seedOptionsIfEmpty_() {
  const sheet = getSS().getSheetByName('DROPDOWN_OPTIONS');
  if (!sheet || sheet.getLastRow() > 1) return;
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    if (sheet.getLastRow() > 1) return;
    const groups = {};
    Object.keys(OPTION_DEFAULTS).forEach(function(g) { groups[g] = OPTION_DEFAULTS[g].slice(); });
    function addExtra(g, v) {
      const val = String(v || '').trim();
      if (!val) return;
      if (!groups[g]) groups[g] = [];
      const exists = groups[g].some(function(x) { return String(x).toLowerCase() === val.toLowerCase(); });
      if (!exists) groups[g].push(val);
    }
    try {
      getDataAsObjects('POS_SALES').forEach(function(r) { addExtra('kategori_produk', r.kategori_produk); });
      getDataAsObjects('MARKETING_COSTS').forEach(function(r) {
        const t = String(r.tipe_promosi || '').toUpperCase();
        if (t === 'ONLINE' || t === 'OFFLINE') addExtra('kategori_biaya:' + t, r.kategori_biaya);
      });
    } catch (ignore) {}
    const now = nowString();
    const rows = [];
    let n = 0;
    Object.keys(groups).forEach(function(g) {
      groups[g].forEach(function(v, i) {
        n++;
        rows.push(['OPS-' + String(n).padStart(5, '0'), g, v, i + 1, 'AKTIF', now, now]);
      });
    });
    sheet.getRange(2, 1, rows.length, 7).setValues(rows);
  } finally {
    lock.releaseLock();
  }
}

// Database lama: tambahkan grup pilihan baru sekali saja (flag per fitur), tanpa menyentuh pilihan yang sudah ada
function seedOptionGroupsOnce_(flag, groups) {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty(flag)) return;
  const sheet = getSS().getSheetByName('DROPDOWN_OPTIONS');
  if (!sheet || sheet.getLastRow() < 2) return; // masih kosong: seedOptionsIfEmpty_ yang mengisi
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    if (props.getProperty(flag)) return;
    const rows = getDataAsObjects('DROPDOWN_OPTIONS');
    let max = rows.reduce(function(m, r) {
      const x = String(r.opsi_id).match(/(\d+)\s*$/);
      return x ? Math.max(m, parseInt(x[1], 10)) : m;
    }, 0);
    const now = nowString();
    const add = [];
    groups.forEach(function(g) {
      if (rows.some(function(r) { return r.grup === g; })) return;
      OPTION_DEFAULTS[g].forEach(function(v, i) {
        max++;
        add.push(['OPS-' + String(max).padStart(5, '0'), g, v, i + 1, 'AKTIF', now, now]);
      });
    });
    if (add.length) sheet.getRange(sheet.getLastRow() + 1, 1, add.length, 7).setValues(add);
    props.setProperty(flag, '1');
  } finally {
    lock.releaseLock();
  }
}

function getOptionRows_() {
  seedOptionsIfEmpty_();
  try {
    seedOptionGroupsOnce_(VENDOR_OPTIONS_SEEDED_PROPERTY, ['kategori_vendor']);
    seedOptionGroupsOnce_(SPONSOR_OPTIONS_SEEDED_PROPERTY, ['kategori_sponsor', 'jenis_sponsorship']);
  } catch (e) { logError_('seedOptionGroupsOnce_', e); }
  return getDataAsObjects('DROPDOWN_OPTIONS');
}

function isValidOptionGroup_(grup, rows) {
  if (OPTION_DEFAULTS[grup] && grup.indexOf('kategori_biaya:') !== 0) return true;
  if (grup.indexOf('kategori_biaya:') === 0) {
    const tipe = grup.substring('kategori_biaya:'.length);
    return rows.some(function(r) { return r.grup === 'tipe_promosi' && String(r.nilai) === tipe; });
  }
  return false;
}

// Dipakai semua role: hanya pilihan AKTIF, sudah berurutan -> { grup: [nilai, ...] }
function apiGetOptions(token) {
  try {
    const session = validateSession(token);
    if (!session) return { success: false, code: 'SESSION_EXPIRED', message: 'Sesi berakhir. Silakan login kembali.' };
    const rows = getOptionRows_()
      .filter(function(r) { return String(r.status || 'AKTIF').toUpperCase() !== 'NONAKTIF'; })
      .sort(optionSort_);
    const out = {};
    rows.forEach(function(r) {
      if (!out[r.grup]) out[r.grup] = [];
      out[r.grup].push(String(r.nilai));
    });
    return { success: true, data: out };
  } catch (e) {
    return handleError_('apiGetOptions', e);
  }
}

// Untuk halaman Pengaturan: semua baris termasuk yang NONAKTIF
function apiGetOptionSettings(token) {
  try {
    checkPermission(token, 'opsi', 'read');
    const rows = getOptionRows_().sort(optionSort_).map(function(r) {
      return { opsi_id: r.opsi_id, grup: r.grup, nilai: String(r.nilai), urutan: Number(r.urutan) || 0,
        status: String(r.status || 'AKTIF').toUpperCase(), locked: isOptionLocked_(r.grup, r.nilai) };
    });
    return { success: true, data: { rows: rows } };
  } catch (e) {
    return handleError_('apiGetOptionSettings', e);
  }
}

// Tambah (tanpa opsi_id) atau ubah (dengan opsi_id) satu pilihan
function apiSaveOption(token, rec) {
  try {
    checkPermission(token, 'opsi', 'update');
    rec = rec || {};
    const grup = String(rec.grup || '').trim();
    const nilai = String(rec.nilai || '').trim().replace(/\s+/g, ' ');
    const rows = getOptionRows_();
    if (!isValidOptionGroup_(grup, rows)) return { success: false, message: 'Kelompok pilihan tidak valid.' };
    if (!nilai) return { success: false, message: 'Nama pilihan wajib diisi.' };
    if (nilai.length > 80) return { success: false, message: 'Nama pilihan maksimal 80 karakter.' };
    if (grup === 'tipe_promosi' && /[:,]/.test(nilai)) return { success: false, message: 'Tipe promosi tidak boleh memuat tanda : atau ,' };

    const dupe = rows.some(function(r) {
      return r.grup === grup && String(r.opsi_id) !== String(rec.opsi_id || '') && String(r.nilai).trim().toLowerCase() === nilai.toLowerCase();
    });
    if (dupe) return { success: false, message: '"' + nilai + '" sudah ada di daftar ini.' };

    const now = nowString();
    if (!rec.opsi_id) {
      const maxUrut = rows.filter(function(r) { return r.grup === grup; })
        .reduce(function(m, r) { return Math.max(m, Number(r.urutan) || 0); }, 0);
      createRecord('DROPDOWN_OPTIONS', {
        opsi_id: generateId('OPS', 'DROPDOWN_OPTIONS', 'opsi_id'),
        grup: grup, nilai: nilai, urutan: maxUrut + 1, status: 'AKTIF', created_at: now, updated_at: now
      });
      return { success: true, message: 'Pilihan "' + nilai + '" ditambahkan.' };
    }

    const cur = rows.filter(function(r) { return String(r.opsi_id) === String(rec.opsi_id); })[0];
    if (!cur) return { success: false, message: 'Pilihan tidak ditemukan.' };
    const newStatus = rec.status ? String(rec.status).toUpperCase() : String(cur.status || 'AKTIF').toUpperCase();
    if (isOptionLocked_(cur.grup, cur.nilai) && (nilai !== String(cur.nilai) || newStatus !== 'AKTIF')) {
      return { success: false, message: '"' + cur.nilai + '" dipakai oleh laporan sistem sehingga tidak bisa diubah atau dinonaktifkan.' };
    }
    updateRecord('DROPDOWN_OPTIONS', 'opsi_id', cur.opsi_id, { nilai: nilai, status: newStatus === 'NONAKTIF' ? 'NONAKTIF' : 'AKTIF', updated_at: now });
    // Tipe promosi diganti nama -> kategori biaya miliknya ikut pindah kelompok
    if (cur.grup === 'tipe_promosi' && nilai !== String(cur.nilai)) {
      rows.forEach(function(r) {
        if (r.grup === 'kategori_biaya:' + cur.nilai) updateRecord('DROPDOWN_OPTIONS', 'opsi_id', r.opsi_id, { grup: 'kategori_biaya:' + nilai, updated_at: now });
      });
    }
    return { success: true, message: 'Pilihan diperbarui.' };
  } catch (e) {
    return handleError_('apiSaveOption', e);
  }
}

function apiDeleteOption(token, opsiId) {
  try {
    checkPermission(token, 'opsi', 'delete');
    const rows = getOptionRows_();
    const cur = rows.filter(function(r) { return String(r.opsi_id) === String(opsiId); })[0];
    if (!cur) return { success: false, message: 'Pilihan tidak ditemukan.' };
    if (isOptionLocked_(cur.grup, cur.nilai)) return { success: false, message: '"' + cur.nilai + '" dipakai oleh laporan sistem sehingga tidak bisa dihapus.' };
    deleteRecord('DROPDOWN_OPTIONS', 'opsi_id', cur.opsi_id);
    // Tipe promosi dihapus -> daftar kategori biayanya ikut dihapus
    if (cur.grup === 'tipe_promosi') {
      rows.forEach(function(r) { if (r.grup === 'kategori_biaya:' + cur.nilai) deleteRecord('DROPDOWN_OPTIONS', 'opsi_id', r.opsi_id); });
    }
    return { success: true, message: 'Pilihan "' + cur.nilai + '" dihapus. Data lama yang memakai nilai ini tetap utuh.' };
  } catch (e) {
    return handleError_('apiDeleteOption', e);
  }
}

// Geser urutan satu pilihan ke atas / bawah dalam kelompoknya
function apiMoveOption(token, opsiId, direction) {
  try {
    checkPermission(token, 'opsi', 'update');
    const rows = getOptionRows_();
    const cur = rows.filter(function(r) { return String(r.opsi_id) === String(opsiId); })[0];
    if (!cur) return { success: false, message: 'Pilihan tidak ditemukan.' };
    const list = rows.filter(function(r) { return r.grup === cur.grup; }).sort(optionSort_);
    const idx = list.findIndex(function(r) { return String(r.opsi_id) === String(opsiId); });
    const to = direction === 'up' ? idx - 1 : idx + 1;
    if (to < 0 || to >= list.length) return { success: true, message: '' };
    const moved = list.splice(idx, 1)[0];
    list.splice(to, 0, moved);
    const now = nowString();
    list.forEach(function(r, i) {
      if ((Number(r.urutan) || 0) !== i + 1) updateRecord('DROPDOWN_OPTIONS', 'opsi_id', r.opsi_id, { urutan: i + 1, updated_at: now });
    });
    return { success: true, message: '' };
  } catch (e) {
    return handleError_('apiMoveOption', e);
  }
}

/* ==================== MARKETING SCORECARD (TERINTEGRASI KPI) ==================== */
// Sumber definisi KPI, target, dan bobot = sheet KPI_SETTINGS (sama dengan halaman KPI).
// Aturan penilaian:
//  - Achievement % = Actual / Target x 100 (nilai yang dipakai untuk skor dibatasi maks. 100%)
//  - Weighted Score = Achievement (maks. 100) x Bobot / 100
//  - Total Score = total Weighted Score (dinormalisasi bila total bobot bukan 100)
//  - Target individu = target KPI tim / jumlah marketing aktif (KONVERSI tidak dibagi, karena berupa %)
//  - REVENUE_POS & MANUAL tidak punya PIC, jadi dibagi rata antar marketing aktif
const SCORECARD_RATINGS = [
  { min: 90, label: 'EXCELLENT' },
  { min: 80, label: 'GOOD' },
  { min: 70, label: 'MEETS EXPECTATION' },
  { min: 60, label: 'NEEDS IMPROVEMENT' }
];

function getPerformanceRating_(score) {
  const s = Math.round((Number(score) || 0) * 100) / 100;
  for (let i = 0; i < SCORECARD_RATINGS.length; i++) {
    if (s >= SCORECARD_RATINGS[i].min) return SCORECARD_RATINGS[i].label;
  }
  return 'POOR';
}

function round2_(n) { return Math.round((Number(n) || 0) * 100) / 100; }

// Cocokkan nilai PIC (bisa nama / username / user_id, boleh dipisah koma) dengan alias seorang marketing
function picMatches_(value, aliasMap) {
  const parts = String(value || '').split(',');
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i].trim().toLowerCase();
    if (p && aliasMap[p]) return true;
  }
  return false;
}

// Anggota tim marketing aktif + alias identitasnya (nama, username, user_id)
function getScorecardMembers_() {
  const users = {};
  getDataAsObjects('USERS').forEach(function(u) { users[String(u.user_id)] = u; });
  return getDataAsObjects('TEAM_MARKETING')
    .filter(function(t) { return String(t.status || 'AKTIF').toUpperCase() === 'AKTIF'; })
    .map(function(t) {
      const u = users[String(t.user_id)] || {};
      const aliases = {};
      [t.nama, u.username, t.user_id, u.nama].forEach(function(a) {
        const k = String(a || '').trim().toLowerCase();
        if (k) aliases[k] = true;
      });
      return { team_id: t.team_id, user_id: String(t.user_id || ''), nama: String(t.nama || ''), jabatan: String(t.jabatan || ''), aliases: aliases };
    });
}

// Susun baris scorecard (Target, Actual, Achievement, Bobot, Weighted Score) + Total Score + Rating.
// Actual diambil dari Metric Engine. Aturan target individu:
//  - KPI dengan PIC: hanya untuk PIC tsb (target apa adanya)
//  - metric rasio (% / growth / average): target tidak dibagi; metric hitungan / nilai: target tim dibagi jumlah marketing
//  - metric tanpa dimensi PIC (mis. POS Kasir) & input manual: target dan actual tim dibagi rata antar marketing
function buildScorecard_(defs, sc, member) {
  const personal = !!member;
  let sumWeighted = 0, totalBobot = 0;
  const kpis = [];
  defs.forEach(function(d) {
    const per = kpiPeriodSpec_({ periode: d.periode }, sc.per);
    let target = d.target, aktual = 0;
    const isManual = d.metrik === 'MANUAL' || !d.metric_id;
    if (d.pic && personal && !picMatches_(d.pic, member.aliases)) return;   // KPI milik PIC lain
    if (isManual) {
      if (personal && !d.pic) { target = d.target / sc.mc; aktual = d.aktualManual / sc.mc; } else { aktual = d.aktualManual; }
    } else if (d.pic) {
      aktual = metricEval_(sc.rt, d.metric_id, { period: per, aliases: sc.rt.aliasesFor(d.pic) }).v;
    } else if (!personal) {
      aktual = metricEval_(sc.rt, d.metric_id, { period: per, aliases: null }).v;
    } else {
      const r = metricEval_(sc.rt, d.metric_id, { period: per, aliases: member.aliases });
      if (!r.pic) {
        target = d.target / sc.mc;
        aktual = metricEval_(sc.rt, d.metric_id, { period: per, aliases: null }).v / sc.mc;
      } else {
        if (!d.ratio) target = d.target / sc.mc;
        aktual = r.v;
      }
    }
    const pencapaian = target > 0 ? (aktual / target) * 100 : 0;
    const skor = Math.min(pencapaian, 100) * d.bobot / 100;
    sumWeighted += skor;
    totalBobot += d.bobot;
    kpis.push({
      id: d.id, nama: d.nama, metrik: d.metrik, metric_id: d.metric_id, unit: d.unit,
      target: round2_(target), aktual: round2_(aktual), pencapaian: round2_(pencapaian),
      bobot: d.bobot, skor: round2_(skor)
    });
  });
  const totalSkor = totalBobot > 0 ? round2_((sumWeighted / totalBobot) * 100) : 0;
  return { kpis: kpis, totalBobot: totalBobot, totalSkor: totalSkor, rating: getPerformanceRating_(totalSkor) };
}

function getScorecardData(token, period) {
  try {
    const session = checkPermission(token, 'scorecard', 'read');
    const per = /^\d{4}-\d{2}$/.test(String(period || '')) ? String(period) : currentMonthKey_();

    const rt = metricRuntime_();
    const data = { activities: rt.rows('ACTIVITIES') };

    const defs = getDataAsObjects('KPI_SETTINGS')
      .filter(function(k) { return String(k.status || 'AKTIF').toUpperCase() !== 'NONAKTIF'; })
      .map(function(k) {
        const metrik = String(k.metrik || 'MANUAL');
        const mid = kpiMetricId_(k);
        const mm = mid ? rt.metric(mid) : null;
        return {
          id: k.kpiset_id, nama: k.nama_kpi, metrik: metrik, metric_id: mm ? mid : '', pic: String(k.PIC || '').trim(), periode: String(k.periode || ''),
          target: parseNum_(k.target), bobot: parseNum_(k.bobot), aktualManual: parseNum_(k.aktual_manual),
          ratio: metricIsRatio_(mm), unit: mm ? String(mm.unit || '') : String(k.unit || '')
        };
      });

    if (defs.length === 0) {
      return { success: true, data: { periode: per, employees: [], team: null, totalBobot: 0, memberCount: 0, message: 'Belum ada KPI aktif. Atur KPI di menu KPI terlebih dahulu.' } };
    }

    let members = getScorecardMembers_();
    const memberCount = members.length;
    const isManager = session.role === 'ADMIN' || session.role === 'MANAGER';

    // Role MARKETING hanya boleh melihat scorecard miliknya sendiri
    if (!isManager) {
      members = members.filter(function(m) {
        return m.user_id === String(session.user_id) || m.nama.toLowerCase() === String(session.nama || '').trim().toLowerCase();
      });
      if (members.length === 0) {
        return { success: true, data: { periode: per, employees: [], team: null, totalBobot: 0, memberCount: memberCount, message: 'Akun Anda belum terdaftar sebagai anggota aktif di Data Tim, sehingga scorecard belum bisa ditampilkan.' } };
      }
    }

    const todaySc = todayString();
    function actStats_(aliases) {
      const rows = data.activities.filter(function(a) {
        return monthKey_(a.tanggal) === per && (!aliases || picMatches_(a.user_id || a.PIC, aliases));
      });
      return {
        qty: sumActQty_(rows),
        selesai: sumActQty_(rows.filter(function(a) { return String(a.status).toUpperCase() === 'SELESAI'; })),
        berjalan: sumActQty_(rows.filter(function(a) { return String(a.status).toUpperCase() === 'BERJALAN'; })),
        overdue: rows.filter(function(a) {
          return String(a.deadline || '') !== '' && String(a.deadline) < todaySc && ['SELESAI', 'BATAL'].indexOf(String(a.status).toUpperCase()) < 0;
        }).length
      };
    }
    const scCtx = { rt: rt, per: per, mc: Math.max(memberCount, 1) };
    const employees = members.map(function(m) {
      const sc = buildScorecard_(defs, scCtx, m);
      return { nama: m.nama, jabatan: m.jabatan, kpis: sc.kpis, totalBobot: sc.totalBobot, totalSkor: sc.totalSkor, rating: sc.rating, activityStats: actStats_(m.aliases) };
    });

    let team = null;
    if (isManager) {
      const t = buildScorecard_(defs, scCtx, null);
      team = { nama: 'Tim Marketing (Total)', jabatan: '', kpis: t.kpis, totalBobot: t.totalBobot, totalSkor: t.totalSkor, rating: t.rating, activityStats: actStats_(null) };
    }

    const totalBobot = defs.reduce(function(s, d) { return s + d.bobot; }, 0);
    const okrs = enrichOkrRows_(getDataAsObjects('OKR').filter(function(o) { return String(o.periode) === per; }));
    return { success: true, data: { periode: per, employees: employees, team: team, totalBobot: totalBobot, memberCount: memberCount, okrs: okrs } };
  } catch (e) {
    return handleError_('getScorecardData', e);
  }
}

/* ==================== RINGKASAN POS KASIR & BIAYA MARKETING ==================== */
function posAmount_(p) { return parseNum_(p.total) || (parseNum_(p.harga) * parseNum_(p.qty)); }

function getPosSummary(token) {
  try {
    checkPermission(token, 'pos', 'read');
    const rows = getDataAsObjects('POS_SALES');
    const today = todayString();
    const period = currentMonthKey_();
    const cfg = getConfigMap_();

    const todayAgg = { omzet: 0, qty: 0, baris: 0 };
    const monthAgg = { omzet: 0, qty: 0, baris: 0 };
    const byCat = {};
    const byDay = {};
    rows.forEach(function(p) {
      const d = String(p.tanggal).substring(0, 10);
      const amt = posAmount_(p), q = parseNum_(p.qty);
      if (!byDay[d]) byDay[d] = { tanggal: d, omzet: 0, qty: 0 };
      byDay[d].omzet += amt; byDay[d].qty += q;
      if (d === today) { todayAgg.omzet += amt; todayAgg.qty += q; todayAgg.baris++; }
      if (monthKey_(d) === period) {
        monthAgg.omzet += amt; monthAgg.qty += q; monthAgg.baris++;
        const k = String(p.kategori_produk || 'Tanpa kategori');
        if (!byCat[k]) byCat[k] = { kategori: k, qty: 0, total: 0 };
        byCat[k].qty += q; byCat[k].total += amt;
      }
    });

    const daily = [];
    for (let i = 0; i < 14; i++) {
      const d = Utilities.formatDate(new Date(Date.now() - i * 86400000), TIMEZONE, 'yyyy-MM-dd');
      daily.push(byDay[d] ? { tanggal: d, omzet: Math.round(byDay[d].omzet), qty: byDay[d].qty } : { tanggal: d, omzet: 0, qty: 0 });
    }
    const byCategory = Object.keys(byCat).map(function(k) { return { kategori: k, qty: byCat[k].qty, total: Math.round(byCat[k].total) }; })
      .sort(function(a, b) { return b.total - a.total; });

    const rev = computeRevenueBreakdown_(period);
    const target = getRevenueTarget_();
    return { success: true, data: {
      periode: period,
      hariIni: { omzet: Math.round(todayAgg.omzet), qty: todayAgg.qty, baris: todayAgg.baris },
      bulanIni: { omzet: Math.round(monthAgg.omzet), qty: monthAgg.qty, baris: monthAgg.baris },
      byCategory: byCategory,
      daily: daily,
      kpiRevenue: { target: target, actual: rev.total, pos: rev.pos, pencapaian: target > 0 ? Math.round((rev.total / target) * 1000) / 10 : 0 }
    } };
  } catch (e) {
    return handleError_('getPosSummary', e);
  }
}

function getCostSummary(token) {
  try {
    checkPermission(token, 'costs', 'read');
    const period = currentMonthKey_();
    const rows = getDataAsObjects('MARKETING_COSTS').filter(function(c) { return monthKey_(c.tanggal) === period; });
    const cost = computeCostBreakdown_(period);
    const byCat = {};
    rows.forEach(function(c) {
      const k = String(c.kategori_biaya || 'Lainnya');
      if (!byCat[k]) byCat[k] = { kategori: k, tipe: String(c.tipe_promosi || ''), total: 0 };
      byCat[k].total += parseNum_(c.jumlah);
    });
    const byCategory = Object.keys(byCat).map(function(k) { return { kategori: k, tipe: byCat[k].tipe, total: Math.round(byCat[k].total) }; })
      .sort(function(a, b) { return b.total - a.total; });
    const rev = computeRevenueBreakdown_(period);
    return { success: true, data: {
      periode: period,
      biaya: cost,
      byCategory: byCategory,
      revenue: rev.total,
      roas: cost.total > 0 ? Math.round((rev.total / cost.total) * 10) / 10 : 0,
      rasioBiaya: rev.total > 0 ? Math.round((cost.total / rev.total) * 1000) / 10 : 0
    } };
  } catch (e) {
    return handleError_('getCostSummary', e);
  }
}

// Pelanggan kembali (repeat) = pelanggan dengan 2 reservasi atau lebih (selain BATAL), dihitung langsung dari sheet RESERVATIONS.
// Definisi sama dengan metrik "Pelanggan Kembali (Repeat)" di Metric Library, jadi Dashboard & KPI selalu sejalan.
function repeatCustomerCount_(reservations) {
  const by = {};
  reservations.forEach(function(r) {
    if (String(r.status_reservasi).toUpperCase() === 'BATAL') return;
    const cid = String(r.customer_id || '').trim();
    if (cid) by[cid] = (by[cid] || 0) + 1;
  });
  return Object.keys(by).filter(function(k) { return by[k] >= 2; }).length;
}

/* ==================== DASHBOARD ==================== */
function getDashboardData(token) {
  try {
    checkPermission(token, 'dashboard', 'read');
    const today = todayString();
    const period = currentMonthKey_();
    const cfg = getConfigMap_();

    const customers = getDataAsObjects('CUSTOMERS');
    const leads = getDataAsObjects('LEADS');
    const followups = getDataAsObjects('FOLLOWUPS');
    const reservations = getDataAsObjects('RESERVATIONS');
    const events = getDataAsObjects('EVENTS');
    const participants = getDataAsObjects('EVENT_PARTICIPANTS');
    const vouchers = getDataAsObjects('VOUCHERS');
    const activities = getDataAsObjects('ACTIVITIES');
    const contents = getDataAsObjects('CONTENT');
    const campaigns = getDataAsObjects('CAMPAIGNS');

    // --- Revenue ---
    const revBreak = computeRevenueBreakdown_(period);
    const actualRevenue = revBreak.total;
    const biaya = computeCostBreakdown_(period);
    let posToday = 0;
    getDataAsObjects('POS_SALES').forEach(function(p) {
      if (String(p.tanggal) === today) posToday += parseNum_(p.total) || (parseNum_(p.harga) * parseNum_(p.qty));
    });
    const targetRevenue = getRevenueTarget_();
    const achievement = targetRevenue > 0 ? Math.round((actualRevenue / targetRevenue) * 1000) / 10 : 0;

    // --- KPI live ---
    const kpi = computeKpiNow_();

    // --- Funnel ---
    let jangkauan = 0;
    contents.forEach(function(c) { jangkauan += parseNum_(c.views); });
    const funnel = {
      jangkauan: jangkauan,
      calonPelanggan: leads.length,
      pelangganPotensial: leads.filter(leadQualified_).length,
      reservasi: reservations.filter(function(r) { return String(r.status_reservasi).toUpperCase() !== 'BATAL'; }).length,
      transaksi: reservations.filter(function(r) {
        const s = String(r.status_reservasi).toUpperCase();
        return s === 'LUNAS' || s === 'KUNJUNGAN' || s === 'SELESAI';
      }).length,
      pelangganKembali: repeatCustomerCount_(reservations)
    };

    // --- Funnel Konversi: Total Leads -> Follow Up -> Reservation -> Conversion Rate ---
    const funnelKonversi = {
      totalLeads: leads.filter(function(l) { return monthKey_(l.tanggal) === period; }).length,
      followup: followups.filter(function(f) { return monthKey_(f.tanggal) === period; }).length,
      reservation: reservations.filter(function(r) {
        return String(r.status_reservasi).toUpperCase() !== 'BATAL' && monthKey_(r.tanggal_reservasi) === period;
      }).length
    };
    funnelKonversi.conversion = funnelKonversi.totalLeads > 0
      ? Math.round((funnelKonversi.reservation / funnelKonversi.totalLeads) * 1000) / 10
      : 0;

    // --- Reservasi ---
    function inThisWeek_(d) {
      if (!d) return false;
      const date = new Date(d);
      if (isNaN(date.getTime())) return false;
      const nowD = new Date();
      const day = nowD.getDay() === 0 ? 7 : nowD.getDay();
      const monday = new Date(nowD); monday.setDate(nowD.getDate() - day + 1);
      monday.setHours(0,0,0,0);
      const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6); sunday.setHours(23,59,59,999);
      return date >= monday && date <= sunday;
    }
    const reservasiStats = {
      hariIni: reservations.filter(function(r) { return String(r.tanggal_kunjungan) === today; }).length,
      mingguIni: reservations.filter(function(r) { return inThisWeek_(r.tanggal_kunjungan); }).length,
      bulanIni: reservations.filter(function(r) { return monthKey_(r.tanggal_reservasi) === period; }).length,
      pending: reservations.filter(function(r) {
        const s = String(r.status_reservasi).toUpperCase();
        return s !== 'LUNAS' && s !== 'SELESAI' && s !== 'BATAL';
      }).length,
      lunas: reservations.filter(function(r) { return String(r.status_reservasi).toUpperCase() === 'LUNAS'; }).length
    };

    // --- Event ---
    const activeStatuses = ['PROMOSI', 'PENDAFTARAN', 'PERSIAPAN', 'PELAKSANAAN'];
    const activeEvents = events.filter(function(e) { return activeStatuses.indexOf(String(e.status).toUpperCase()) >= 0; });
    const activeEventIds = {};
    activeEvents.forEach(function(e) { activeEventIds[e.event_id] = true; });
    let potensiRevenue = 0;
    activeEvents.forEach(function(e) { potensiRevenue += parseNum_(e.target_revenue); });
    // Status pembayaran peserta event aktif: LUNAS / REFUND / selain itu (BELUM BAYAR atau kosong) = belum bayar
    const payAgg = { lunas: 0, belum: 0, refund: 0, nilaiLunas: 0, nilaiBelum: 0 };
    participants.filter(function(p) { return activeEventIds[p.event_id]; }).forEach(function(p) {
      const st = String(p.status_pembayaran || '').trim().toUpperCase();
      const biaya = parseNum_(p.biaya);
      if (st === 'LUNAS') { payAgg.lunas++; payAgg.nilaiLunas += biaya; }
      else if (st === 'REFUND') payAgg.refund++;
      else { payAgg.belum++; payAgg.nilaiBelum += biaya; }
    });
    const eventStats = {
      aktif: activeEvents.length,
      pendaftaran: events.filter(function(e) { return String(e.status).toUpperCase() === 'PENDAFTARAN'; }).length,
      peserta: participants.filter(function(p) { return activeEventIds[p.event_id]; }).length,
      pesertaLunas: payAgg.lunas,
      pesertaBelumBayar: payAgg.belum,
      pesertaRefund: payAgg.refund,
      nilaiLunas: Math.round(payAgg.nilaiLunas),
      nilaiBelumBayar: Math.round(payAgg.nilaiBelum),
      potensiRevenue: potensiRevenue,
      list: activeEvents.map(function(e) { return { nama: e.nama_event, status: e.status, tanggal: e.tanggal_mulai, target: parseNum_(e.target_peserta), aktual: parseNum_(e.aktual_peserta) }; })
    };

    // --- CRM ---
    const followupToday = followups.filter(function(f) {
      return String(f.tanggal) === today && String(f.status).toUpperCase() !== 'SELESAI' && String(f.status).toUpperCase() !== 'BATAL';
    });
    const followupLate = followups.filter(function(f) {
      const next = String(f.tanggal_followup_berikutnya || '');
      return next && next < today && String(f.status).toUpperCase() !== 'SELESAI' && String(f.status).toUpperCase() !== 'BATAL';
    });
    const crmStats = {
      pelangganBaru: customers.filter(function(c) { return monthKey_(c.created_at) === period; }).length,
      leadsBaru: leads.filter(function(l) { return monthKey_(l.tanggal) === period; }).length,
      followupHariIni: followupToday.length,
      followupTerlambat: followupLate.length,
      followupTodayList: followupToday.slice(0, 5).map(function(f) {
        return { id: f.followup_id, nama: f.nama || '', tanggal: f.tanggal, jenis: f.jenis, PIC: f.PIC };
      })
    };

    // --- Voucher ---
    const vTerjual = vouchers.filter(function(v) { return String(v.status).toUpperCase() === 'TERJUAL'; });
    const vDigunakan = vouchers.filter(function(v) { return String(v.status).toUpperCase() === 'DIGUNAKAN'; });
    const voucherStats = {
      terjual: vTerjual.length,
      digunakan: vDigunakan.length,
      belumDigunakan: vTerjual.length
    };

    // --- Aktivitas tim (perbandingan Marketing 1 vs Marketing 2) ---
    const teamActs = {};
    const resolveTeam_ = buildTeamNameResolver_();
    activities.filter(function(a) { return monthKey_(a.tanggal) === period; }).forEach(function(a) {
      const pic = resolveTeam_(a.user_id || a.PIC) || 'Lainnya';
      if (!teamActs[pic]) teamActs[pic] = { nama: pic, count: 0, leads: 0, transaksi: 0, revenue: 0 };
      teamActs[pic].count += actQty_(a);
      teamActs[pic].leads += parseNum_(a.leads);
      teamActs[pic].transaksi += parseNum_(a.transaksi);
      teamActs[pic].revenue += parseNum_(a.revenue);
    });
    const teamActivity = Object.keys(teamActs).map(function(k) { return teamActs[k]; });

    // --- Campaign ringkasan ---
    const campaignStats = campaigns.map(function(c) {
      return {
        nama: c.nama_program, status: c.status, PIC: c.PIC,
        targetRevenue: parseNum_(c.target_revenue), aktualRevenue: parseNum_(c.aktual_revenue),
        targetLeads: parseNum_(c.target_leads), aktualLeads: parseNum_(c.aktual_leads)
      };
    });

    const landingStats = {
      leadsBulanIni: leads.filter(function(l) { return monthKey_(l.tanggal) === period && String(l.landing_page_id || '').trim(); }).length,
      reservasiBulanIni: reservations.filter(function(r) { return monthKey_(r.tanggal_reservasi) === period && String(r.landing_page_id || '').trim(); }).length,
      registrasiBulanIni: participants.filter(function(p) { return monthKey_(String(p.created_at || '').substring(0, 10)) === period && String(p.source).toUpperCase() === 'EVENT_REGISTRATION'; }).length
    };

    return {
      success: true,
      data: {
        today: today,
        periode: period,
        revenue: { target: targetRevenue, actual: Math.round(actualRevenue), achievement: achievement, sumber: revBreak, posHariIni: Math.round(posToday) },
        biaya: biaya,
        kpi: kpi,
        funnel: funnel,
        funnelKonversi: funnelKonversi,
        reservasi: reservasiStats,
        event: eventStats,
        crm: crmStats,
        voucher: voucherStats,
        teamActivity: teamActivity,
        campaigns: campaignStats,
        metricWidgets: metricDashboardWidgets_(),
        landing: landingStats,
        totals: {
          customers: customers.length,
          leads: leads.length,
          reservations: reservations.length,
          events: events.length,
          vouchers: vouchers.length,
          activities: sumActQty_(activities),
          contents: contents.length
        }
      }
    };
  } catch (e) {
    return handleError_('getDashboardData', e);
  }
}

/* ==================== REPORTS ==================== */
function getReportData(token, filters) {
  try {
    checkPermission(token, 'reports', 'read');
    filters = filters || {};
    const start = filters.start || '';
    const end = filters.end || '';
    const pic = String(filters.pic || '').toLowerCase();

    function inRange_(dateStr) {
      const d = String(dateStr || '').substring(0, 10);
      if (!d) return false;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    }
    function picMatch_(rowPic) {
      if (!pic) return true;
      return String(rowPic || '').toLowerCase().indexOf(pic) >= 0;
    }

    const activities = getDataAsObjects('ACTIVITIES').filter(function(a) { return inRange_(a.tanggal) && picMatch_(a.user_id); });
    const leads = getDataAsObjects('LEADS').filter(function(l) { return inRange_(l.tanggal) && picMatch_(l.PIC); });
    const followups = getDataAsObjects('FOLLOWUPS').filter(function(f) { return inRange_(f.tanggal) && picMatch_(f.PIC); });
    const reservations = getDataAsObjects('RESERVATIONS').filter(function(r) { return inRange_(r.tanggal_reservasi) && picMatch_(r.PIC); });
    const events = getDataAsObjects('EVENTS').filter(function(e) { return inRange_(e.tanggal_mulai) && picMatch_(e.PIC); });
    const vouchers = getDataAsObjects('VOUCHERS').filter(function(v) { return inRange_(v.tanggal_penjualan) && picMatch_(v.PIC); });
    const contents = getDataAsObjects('CONTENT').filter(function(c) { return inRange_(c.tanggal) && picMatch_(c.PIC); });
    const customers = getDataAsObjects('CUSTOMERS').filter(function(c) { return inRange_(c.created_at) && picMatch_(c.PIC); });
    const campaigns = getDataAsObjects('CAMPAIGNS');
    const posRows = getDataAsObjects('POS_SALES').filter(function(p) { return inRange_(p.tanggal); });
    const costRows = getDataAsObjects('MARKETING_COSTS').filter(function(c) { return inRange_(c.tanggal) && picMatch_(c.PIC); });
    let revPos = 0, costTotal = 0, costOnline = 0, costOffline = 0;
    posRows.forEach(function(p) { revPos += parseNum_(p.total) || (parseNum_(p.harga) * parseNum_(p.qty)); });
    costRows.forEach(function(c) {
      const n = parseNum_(c.jumlah); costTotal += n;
      const t = String(c.tipe_promosi).toUpperCase();
      if (t === 'ONLINE') costOnline += n; else if (t === 'OFFLINE') costOffline += n;
    });

    let revRes = 0, revEvent = 0, revVoucher = 0, revAct = 0;
    reservations.forEach(function(r) { revRes += parseNum_(r.aktual_revenue) || parseNum_(r.total); });
    events.forEach(function(e) { revEvent += parseNum_(e.aktual_revenue); });
    vouchers.filter(function(v) { return ['TERJUAL','DIGUNAKAN'].indexOf(String(v.status).toUpperCase()) >= 0; })
      .forEach(function(v) { revVoucher += parseNum_(v.harga); });
    activities.forEach(function(a) { revAct += parseNum_(a.revenue); });

    const data = {
      filters: { start: start, end: end, pic: pic },
      activities: {
        total: sumActQty_(activities),
        baris: activities.length,
        selesai: sumActQty_(activities.filter(function(a) { return String(a.status).toUpperCase() === 'SELESAI'; })),
        byJenis: (function() {
          const m = {};
          activities.forEach(function(a) {
            const j = String(a.jenis_aktivitas || 'Lainnya');
            if (!m[j]) m[j] = { jenis: j, qty: 0, selesai: 0 };
            const q = actQty_(a);
            m[j].qty += q;
            if (String(a.status).toUpperCase() === 'SELESAI') m[j].selesai += q;
          });
          return Object.keys(m).map(function(k) { return m[k]; }).sort(function(x, y) { return y.qty - x.qty; });
        })(),
        leads: activities.reduce(function(s, a) { return s + parseNum_(a.leads); }, 0),
        transaksi: activities.reduce(function(s, a) { return s + parseNum_(a.transaksi); }, 0),
        revenue: Math.round(revAct),
        list: activities
      },
      leads: {
        total: leads.length,
        qualified: leads.filter(leadQualified_).length,
        berhasil: leads.filter(leadConverted_).length,
        list: leads
      },
      followups: {
        total: followups.length,
        selesai: followups.filter(function(f) { return String(f.status).toUpperCase() === 'SELESAI'; }).length,
        list: followups
      },
      reservations: {
        total: reservations.length,
        lunas: reservations.filter(function(r) { return String(r.status_reservasi).toUpperCase() === 'LUNAS'; }).length,
        pending: reservations.filter(function(r) {
          const s = String(r.status_reservasi).toUpperCase();
          return s !== 'LUNAS' && s !== 'SELESAI' && s !== 'BATAL';
        }).length,
        revenue: Math.round(revRes),
        list: reservations
      },
      events: {
        total: events.length,
        aktif: events.filter(function(e) {
          return ['PROMOSI','PENDAFTARAN','PERSIAPAN','PELAKSANAAN'].indexOf(String(e.status).toUpperCase()) >= 0;
        }).length,
        revenue: Math.round(revEvent),
        list: events
      },
      vouchers: {
        terjual: vouchers.filter(function(v) { return String(v.status).toUpperCase() === 'TERJUAL'; }).length,
        digunakan: vouchers.filter(function(v) { return String(v.status).toUpperCase() === 'DIGUNAKAN'; }).length,
        revenue: Math.round(revVoucher),
        list: vouchers
      },
      contents: {
        total: contents.length,
        views: contents.reduce(function(s, c) { return s + parseNum_(c.views); }, 0),
        leads: contents.reduce(function(s, c) { return s + parseNum_(c.leads); }, 0),
        list: contents
      },
      customers: {
        baru: customers.length,
        list: customers
      },
      campaigns: campaigns,
      pos: { total: Math.round(revPos), baris: posRows.length, list: posRows },
      biaya: { total: Math.round(costTotal), online: Math.round(costOnline), offline: Math.round(costOffline), list: costRows },
      revenue: {
        reservasi: Math.round(revRes),
        event: Math.round(revEvent),
        voucher: Math.round(revVoucher),
        aktivitas: Math.round(revAct),
        pos: Math.round(revPos),
        total: Math.round(revRes + revEvent + revVoucher + revAct + revPos)
      }
    };
    return { success: true, data: data };
  } catch (e) {
    return handleError_('getReportData', e);
  }
}


/* ==================== LAPORAN WHATSAPP (otomatis dari data hari / periode terpilih) ==================== */
const WA_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const WA_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
function waNum_(n) { return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
function waRp_(n) { const v = Math.round(Number(n) || 0); return (v < 0 ? '-' : '') + 'Rp ' + waNum_(Math.abs(v)); }
function waPct_(a, b) { return b > 0 ? Math.round(a / b * 100) + '%' : '0%'; }
function waParts_(ymd) { const p = String(ymd).split('-'); return { y: +p[0], m: +p[1], d: +p[2], dow: new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay() }; }
function waPeriodLabel_(start, end) {
  const a = waParts_(start), b = waParts_(end);
  if (start === end) return WA_DAYS[a.dow] + ', ' + a.d + ' ' + WA_MONTHS[a.m - 1] + ' ' + a.y;
  if (a.y === b.y && a.m === b.m) return a.d + ' – ' + b.d + ' ' + WA_MONTHS[a.m - 1] + ' ' + a.y;
  return a.d + ' ' + WA_MONTHS[a.m - 1] + ' ' + a.y + ' – ' + b.d + ' ' + WA_MONTHS[b.m - 1] + ' ' + b.y;
}

// Data laporan WhatsApp. filters: {start:'yyyy-MM-dd', end:'yyyy-MM-dd', pic:'Nama anggota (opsional)'}
// Setiap section berisi baris teks siap tempel ke WhatsApp; tampilan memilih section mana yang dipakai.
function apiWaReportData(token, filters) {
  try {
    checkPermission(token, 'reports', 'read');
    filters = filters || {};
    const start = String(filters.start || '').trim(), end = String(filters.end || '').trim();
    const re = /^\d{4}-\d{2}-\d{2}$/;
    if (!re.test(start) || !re.test(end)) return { success: false, message: 'Tanggal awal dan akhir wajib diisi.' };
    if (start > end) return { success: false, message: 'Tanggal awal tidak boleh setelah tanggal akhir.' };
    if (outreachDateDiff_(end, start) > 366) return { success: false, message: 'Rentang laporan maksimal 1 tahun.' };

    const picName = String(filters.pic || '').trim();
    const rt = metricRuntime_();
    const al = picName ? rt.aliasesFor(picName) : null;
    const resolveTeam = buildTeamNameResolver_();
    function inR(v) { const d = String(v || '').substring(0, 10); return !!d && d >= start && d <= end; }
    function picOk(v) { return !al || picMatches_(v, al); }
    function up(v) { return String(v || '').trim().toUpperCase(); }
    function perPic(rows, field, label) {
      if (picName) return [];
      const m = {};
      rows.forEach(function(r) { const n = resolveTeam(r[field]) || 'Tanpa PIC'; m[n] = (m[n] || 0) + 1; });
      const names = Object.keys(m).sort(function(a, b) { return m[b] - m[a]; });
      if (names.length < 2) return [];
      return names.map(function(n) { return '   – ' + n + ': ' + waNum_(m[n]) + ' ' + label; });
    }
    const sections = [];
    function add(id, emoji, title, lines) { sections.push({ id: id, emoji: emoji, title: title, lines: lines }); }

    // Customer Outreach
    const outreach = getDataAsObjects('OUTREACH_LOGS').filter(function(o) { return inR(o.tanggal) && picOk(o.PIC); });
    const oResp = outreach.filter(function(o) { return OUTREACH_RESPONDED.indexOf(up(o.status)) >= 0; }).length;
    const oLead = outreach.filter(function(o) { return String(o.lead_id || '').trim() !== ''; }).length;
    add('outreach', '📞', 'Customer Outreach', [
      '• Customer dihubungi: ' + waNum_(outreach.length)
    ].concat(perPic(outreach, 'PIC', 'customer')).concat([
      '• Merespons: ' + waNum_(oResp) + ' (' + waPct_(oResp, outreach.length) + ')',
      '• Menjadi lead: ' + waNum_(oLead)
    ]));

    // Leads
    const leads = getDataAsObjects('LEADS').filter(function(l) { return inR(l.tanggal) && picOk(l.PIC); });
    let leadVal = 0; leads.forEach(function(l) { leadVal += parseNum_(l.nilai_potensi); });
    const lLines = ['• Leads baru: ' + waNum_(leads.length)].concat(perPic(leads, 'PIC', 'lead')).concat([
      '• Leads potensial: ' + waNum_(leads.filter(leadQualified_).length),
      '• Leads berhasil (reserved): ' + waNum_(leads.filter(leadConverted_).length)
    ]);
    if (leadVal > 0) lLines.push('• Nilai potensi: ' + waRp_(leadVal));
    add('leads', '🧲', 'Leads', lLines);

    // Follow up
    const allFu = getDataAsObjects('FOLLOWUPS').filter(function(f) { return picOk(f.PIC); });
    const fuRange = allFu.filter(function(f) { return inR(f.tanggal) && up(f.status) !== 'BATAL'; });
    const fuDone = fuRange.filter(function(f) { return up(f.status) === 'SELESAI'; }).length;
    const fuLate = allFu.filter(function(f) { return up(f.status) === 'TERJADWAL' && String(f.tanggal || '').substring(0, 10) < end && String(f.tanggal || '') !== ''; }).length;
    const fuLines = [
      '• Follow up terjadwal: ' + waNum_(fuRange.length),
      '• Sudah selesai: ' + waNum_(fuDone) + ' · menunggu: ' + waNum_(fuRange.length - fuDone)
    ];
    if (fuLate > 0) fuLines.push('• Terlambat (belum dikerjakan): ' + waNum_(fuLate));
    add('followup', '📞', 'Follow Up', fuLines);

    // Peserta event (tidak punya PIC -> hanya untuk laporan seluruh tim)
    if (!picName) {
      const parts = getDataAsObjects('EVENT_PARTICIPANTS');
      const events = getDataAsObjects('EVENTS');
      const newP = parts.filter(function(p) { return inR(p.created_at); });
      function payCount(list, st) { return list.filter(function(p) { const s = up(p.status_pembayaran); return st === 'LUNAS' ? s === 'LUNAS' : (s !== 'LUNAS' && s !== 'REFUND'); }).length; }
      const activeIds = {};
      events.forEach(function(e) { if (['PROMOSI', 'PENDAFTARAN', 'PERSIAPAN', 'PELAKSANAAN'].indexOf(up(e.status)) >= 0) activeIds[e.event_id] = true; });
      const actP = parts.filter(function(p) { return activeIds[p.event_id]; });
      add('event', '🎪', 'Event', [
        '• Peserta baru mendaftar: ' + waNum_(newP.length) + (newP.length ? ' (lunas ' + waNum_(payCount(newP, 'LUNAS')) + ' · belum bayar ' + waNum_(payCount(newP, 'BELUM')) + ')' : ''),
        '• Event aktif: ' + waNum_(Object.keys(activeIds).length) + ' · total peserta ' + waNum_(actP.length),
        '• Peserta lunas: ' + waNum_(payCount(actP, 'LUNAS')) + ' · belum bayar: ' + waNum_(payCount(actP, 'BELUM'))
      ]);
    }

    // Reservasi
    const resAll = getDataAsObjects('RESERVATIONS').filter(function(r) { return up(r.status_reservasi) !== 'BATAL' && picOk(r.PIC); });
    const resNew = resAll.filter(function(r) { return inR(r.tanggal_reservasi); });
    let resVal = 0, resPax = 0;
    resNew.forEach(function(r) { resVal += parseNum_(r.aktual_revenue) || parseNum_(r.total); resPax += parseNum_(r.jumlah_peserta); });
    add('reservasi', '🎫', 'Reservasi', [
      '• Reservasi baru: ' + waNum_(resNew.length) + (resPax ? ' (' + waNum_(resPax) + ' pax)' : ''),
      '• Nilai reservasi: ' + waRp_(resVal),
      '• Jadwal kunjungan: ' + waNum_(resAll.filter(function(r) { return inR(r.tanggal_kunjungan); }).length) + ' reservasi'
    ]);

    // Pelanggan baru CRM
    const cust = getDataAsObjects('CUSTOMERS').filter(function(c) { return inR(c.created_at) && picOk(c.PIC); });
    add('crm', '🤝', 'CRM', ['• Pelanggan baru: ' + waNum_(cust.length)]);

    // Aktivitas marketing
    const acts = getDataAsObjects('ACTIVITIES').filter(function(a) { return inR(a.tanggal) && (picOk(a.user_id) || picOk(a.PIC)); });
    const aLines = [];
    if (!acts.length) aLines.push('• Belum ada aktivitas tercatat');
    else {
      const byJ = {};
      acts.forEach(function(a) {
        const j = String(a.jenis_aktivitas || 'Lainnya');
        if (!byJ[j]) byJ[j] = { qty: 0, selesai: 0 };
        const q = actQty_(a); byJ[j].qty += q;
        if (up(a.status) === 'SELESAI') byJ[j].selesai += q;
      });
      aLines.push('• Total aktivitas: ' + waNum_(sumActQty_(acts)) + ' (selesai ' + waNum_(sumActQty_(acts.filter(function(a) { return up(a.status) === 'SELESAI'; }))) + ')');
      Object.keys(byJ).sort(function(a, b) { return byJ[b].qty - byJ[a].qty; }).slice(0, 12).forEach(function(j) {
        aLines.push('   – ' + j + ': ' + waNum_(byJ[j].qty));
      });
    }
    add('aktivitas', '✅', 'Aktivitas Marketing', aLines);

    // Konten
    const cont = getDataAsObjects('CONTENT').filter(function(c) { return inR(c.tanggal) && picOk(c.PIC); });
    let views = 0, eng = 0; cont.forEach(function(c) { views += parseNum_(c.views); eng += parseNum_(c.engagement); });
    add('konten', '📱', 'Konten', [
      '• Konten dibuat: ' + waNum_(cont.length) + ' (tayang ' + waNum_(cont.filter(function(c) { return ['TAYANG', 'SELESAI'].indexOf(up(c.status)) >= 0; }).length) + ')',
      '• Views: ' + waNum_(views) + ' · engagement: ' + waNum_(eng)
    ]);

    // Voucher
    const vch = getDataAsObjects('VOUCHERS').filter(function(v) { return picOk(v.PIC); });
    const vSold = vch.filter(function(v) { return inR(v.tanggal_penjualan) && ['TERJUAL', 'DIGUNAKAN'].indexOf(up(v.status)) >= 0; });
    let vVal = 0; vSold.forEach(function(v) { vVal += parseNum_(v.harga); });
    add('voucher', '🎟️', 'Voucher', [
      '• Voucher terjual: ' + waNum_(vSold.length) + ' (' + waRp_(vVal) + ')',
      '• Voucher digunakan: ' + waNum_(vch.filter(function(v) { return inR(v.tanggal_penggunaan); }).length)
    ]);

    if (!picName) {
      // POS Kasir
      const pos = getDataAsObjects('POS_SALES').filter(function(p) { return inR(p.tanggal); });
      let posTotal = 0; const byCat = {};
      pos.forEach(function(p) {
        const amt = posAmount_(p); posTotal += amt;
        const k = String(p.kategori_produk || 'Lainnya'); byCat[k] = (byCat[k] || 0) + amt;
      });
      const pLines = ['• Pendapatan POS Kasir: ' + waRp_(posTotal) + ' (' + waNum_(pos.length) + ' transaksi)'];
      Object.keys(byCat).sort(function(a, b) { return byCat[b] - byCat[a]; }).slice(0, 5).forEach(function(k) { pLines.push('   – ' + k + ': ' + waRp_(byCat[k])); });
      add('pos', '🧾', 'POS Kasir', pLines);

      // Revenue sesuai pengaturan sumber Actual Revenue (sama dengan widget Dashboard)
      const bd = computeRevenueBreakdown_(start + '..' + end);
      const rLines = bd.items.map(function(i) { return '• ' + i.label + ': ' + waRp_(i.value); });
      rLines.push('*Total Revenue: ' + waRp_(bd.total) + '*');
      add('revenue', '💰', 'Pendapatan / Revenue', rLines);

      // Pencapaian target bulanan (bulan dari tanggal akhir)
      const mStart = end.substring(0, 8) + '01';
      const bdM = mStart === start ? bd : computeRevenueBreakdown_(mStart + '..' + end);
      const target = getRevenueTarget_();
      const e = waParts_(end);
      add('target', '🎯', 'Pencapaian Target Bulan Ini', [
        '• Revenue 1 – ' + e.d + ' ' + WA_MONTHS[e.m - 1] + ': ' + waRp_(bdM.total),
        '• Target bulanan: ' + waRp_(target),
        '• Pencapaian: ' + (target > 0 ? (Math.round(bdM.total / target * 1000) / 10).toString().replace('.', ',') + '%' : '-')
      ]);
    }

    // Biaya marketing
    const costs = getDataAsObjects('MARKETING_COSTS').filter(function(c) { return inR(c.tanggal) && picOk(c.PIC); });
    let cTot = 0, cOn = 0, cOff = 0;
    costs.forEach(function(c) { const n = parseNum_(c.jumlah); cTot += n; if (up(c.tipe_promosi) === 'ONLINE') cOn += n; else if (up(c.tipe_promosi) === 'OFFLINE') cOff += n; });
    add('biaya', '💸', 'Biaya Marketing', [
      '• Total biaya: ' + waRp_(cTot),
      '• Online: ' + waRp_(cOn) + ' · Offline: ' + waRp_(cOff)
    ]);

    return { success: true, data: { start: start, end: end, pic: picName, periodLabel: waPeriodLabel_(start, end), sections: sections, generatedAt: nowString() } };
  } catch (e) {
    return handleError_('apiWaReportData', e);
  }
}

/* ==================== PUBLIC LANDING PAGES (tanpa login) ====================
 * Alur: Campaign -> Landing Page (publik) -> Lead / Reservasi / Registrasi Event
 *       -> CRM (tanpa duplikasi via nomor WhatsApp) -> Follow Up -> Reservation -> Revenue
 * Dipanggil dari Public.html melalui google.script.run TANPA token.
 */
/* ---------- Form Builder landing page: kolom form yang bisa ditentukan sendiri ---------- */
const LANDING_STD_FIELDS = {
  nama: 'Nama', whatsapp: 'Nomor WhatsApp', email: 'Email', kota: 'Kota',
  jenis_pelanggan: 'Jenis Pelanggan', minat: 'Kebutuhan / Minat', jumlah_peserta: 'Jumlah Peserta',
  tanggal_rencana: 'Rencana Tanggal Kunjungan', tanggal_kunjungan: 'Tanggal Kunjungan', paket: 'Paket',
  umur: 'Umur', sekolah: 'Sekolah', kategori: 'Kategori', catatan: 'Catatan'
};
const LANDING_CUSTOM_TYPES = ['text', 'textarea', 'number', 'date', 'select', 'email', 'tel'];
// Kolom yang punya kolom sendiri di database (selain itu digabung ke catatan sebagai "Label: nilai")
const LANDING_NATIVE = {
  LEAD: ['nama', 'whatsapp', 'jenis_pelanggan', 'minat', 'jumlah_peserta', 'tanggal_rencana', 'email', 'kota'],
  RESERVASI: ['nama', 'whatsapp', 'tanggal_kunjungan', 'tanggal_rencana', 'jumlah_peserta', 'paket', 'email', 'kota'],
  EVENT: ['nama', 'whatsapp', 'umur', 'sekolah', 'kategori', 'email', 'kota']
};
const LANDING_DEFAULT_FIELDS = {
  LEAD: ['nama', 'whatsapp', 'jenis_pelanggan', 'minat'],
  RESERVASI: ['nama', 'whatsapp', 'tanggal_kunjungan', 'jumlah_peserta', 'paket', 'minat'],
  EVENT: ['nama', 'whatsapp', 'umur', 'sekolah', 'kategori']
};
const LANDING_BASE_KEY = 'public_base_url';

// Normalisasi konfigurasi form_fields -> [{key,label,required,placeholder,type,options,custom}]
function landingFields_(page) {
  const tipe = String(page.tipe || 'LEAD').toUpperCase();
  let raw = [];
  try {
    const a = JSON.parse(String(page.form_fields || '[]'));
    if (Array.isArray(a)) raw = a;
  } catch (e) {}
  if (!raw.length) raw = (LANDING_DEFAULT_FIELDS[tipe] || LANDING_DEFAULT_FIELDS.LEAD).slice();
  const out = [];
  const seen = {};
  raw.forEach(function(x) {
    const it = (x && typeof x === 'object') ? x : { key: x };
    const key = String(it.key || '').trim();
    if (!key || seen[key]) return;
    const custom = /^x_[a-z0-9_]{1,40}$/i.test(key);
    if (!custom && !LANDING_STD_FIELDS[key]) return;
    let label = String(it.label || '').trim().substring(0, 80);
    if (!label) label = custom ? key.replace(/^x_/, '').replace(/_/g, ' ') : LANDING_STD_FIELDS[key];
    const f = { key: key, label: label, required: it.required === true || it.required === 'true', custom: custom };
    if (it.placeholder) f.placeholder = String(it.placeholder).substring(0, 120);
    if (custom) {
      const ty = String(it.type || 'text').toLowerCase();
      f.type = LANDING_CUSTOM_TYPES.indexOf(ty) >= 0 ? ty : 'text';
      if (f.type === 'select') {
        f.options = (Array.isArray(it.options) ? it.options : String(it.options || '').split(','))
          .map(function(o) { return String(o).trim().substring(0, 80); }).filter(String).slice(0, 30);
      }
    }
    seen[key] = true;
    out.push(f);
  });
  // Nama & WhatsApp selalu ada, wajib, dan di urutan awal
  ['whatsapp', 'nama'].forEach(function(k) {
    let idx = -1;
    out.forEach(function(f, i) { if (f.key === k) idx = i; });
    const f = idx >= 0 ? out.splice(idx, 1)[0] : { key: k, label: LANDING_STD_FIELDS[k], custom: false };
    f.required = true;
    out.unshift(f);
  });
  if (tipe === 'RESERVASI') {
    if (!seen.jumlah_peserta) out.push({ key: 'jumlah_peserta', label: LANDING_STD_FIELDS.jumlah_peserta, required: true, custom: false });
    if (!seen.tanggal_kunjungan && !seen.tanggal_rencana) out.push({ key: 'tanggal_kunjungan', label: LANDING_STD_FIELDS.tanggal_kunjungan, required: true, custom: false });
    out.forEach(function(f) {
      if (f.key === 'jumlah_peserta' || f.key === 'tanggal_kunjungan' || f.key === 'tanggal_rencana') f.required = true;
    });
  }
  return out;
}

// Validasi data kiriman pengunjung berdasarkan konfigurasi form. Mengembalikan pesan error atau ''.
function landingValidate_(fields, data) {
  data = data || {};
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    const v = String(data[f.key] === undefined || data[f.key] === null ? '' : data[f.key]).trim();
    if (v.length > 600) return f.label + ' terlalu panjang.';
    if (!v) {
      if (f.required) return f.label + ' wajib diisi.';
      continue;
    }
    if (f.key === 'whatsapp' && normalizePhone_(v).length < 8) return 'Nomor WhatsApp tidak valid.';
    if ((f.key === 'email' || f.type === 'email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Format ' + f.label + ' tidak valid.';
    if (f.type === 'number' && isNaN(Number(String(v).replace(',', '.')))) return f.label + ' harus berupa angka.';
    if (f.type === 'select' && f.options && f.options.length && f.options.indexOf(v) < 0) return 'Pilihan ' + f.label + ' tidak valid.';
  }
  return '';
}

// Isian kolom yang tidak punya kolom sendiri -> teks "Label: nilai · Label: nilai"
function landingExtras_(fields, data, tipe) {
  const native = LANDING_NATIVE[String(tipe).toUpperCase()] || [];
  const parts = [];
  fields.forEach(function(f) {
    if (native.indexOf(f.key) >= 0) return;
    const v = String(data[f.key] === undefined || data[f.key] === null ? '' : data[f.key]).trim();
    if (v) parts.push(f.label + ': ' + v);
  });
  return parts.join(' · ');
}

// Rapikan alamat dasar: buang query/hash, garis miring akhir, dan nama file (index.html / public.html)
function landingNormalizeBase_(v) {
  let s = String(v || '').trim().replace(/[?#].*$/, '').replace(/\/+$/, '');
  s = s.replace(/\/(index|public)\.html?$/i, '').replace(/\/+$/, '');
  return s;
}
function landingIsGithubPages_(base) {
  return /^https?:\/\/[^\/]+\.github\.io(\/|$)/i.test(String(base || ''));
}

function landingBaseUrl_() {
  try {
    const r = getRecordById('SYSTEM_CONFIG', 'key', LANDING_BASE_KEY);
    return r ? landingNormalizeBase_(r.value) : '';
  } catch (e) { return ''; }
}

function landingPublicUrl_(slug) {
  const base = landingBaseUrl_();
  // GitHub Pages: pakai public.html?page=slug (selalu bisa dibuka, tanpa trik 404)
  if (base && landingIsGithubPages_(base)) return base + '/public.html?page=' + slug;
  if (base) return base + '/' + slug;
  const exec = getPublicAppUrl_();
  return exec ? exec + '?page=' + slug : '?page=' + slug;
}

function apiLandingGetSettings(token) {
  try {
    checkPermission(token, 'landingpages', 'read');
    return { success: true, data: { base_url: landingBaseUrl_(), exec_url: getPublicAppUrl_() } };
  } catch (e) {
    return handleError_('apiLandingGetSettings', e);
  }
}

function apiLandingSaveSettings(token, baseUrl) {
  try {
    const session = checkPermission(token, 'landingpages', 'update');
    if (['ADMIN', 'MANAGER'].indexOf(session.role) < 0) {
      return { success: false, message: 'Hanya Admin / Manager yang dapat mengubah alamat publik.' };
    }
    let v = landingNormalizeBase_(baseUrl);
    if (v && !/^https?:\/\/[^\s?#]+$/i.test(v)) {
      return { success: false, message: 'Alamat tidak valid. Contoh: https://promo.wonderlandsamarinda.com' };
    }
    const now = nowString();
    const ok = updateRecord('SYSTEM_CONFIG', 'key', LANDING_BASE_KEY, { value: v, updated_at: now });
    if (!ok) createRecord('SYSTEM_CONFIG', { key: LANDING_BASE_KEY, value: v, description: 'Alamat dasar URL publik landing page (domain sendiri)', updated_at: now });
    return { success: true, data: { base_url: v }, message: v ? 'Alamat publik disimpan.' : 'Alamat publik direset ke link bawaan.' };
  } catch (e) {
    return handleError_('apiLandingSaveSettings', e);
  }
}

function getPublicAppUrl_() {
  try { return ScriptApp.getService().getUrl(); } catch (e) { return ''; }
}

function findLanding_(slug) {
  const s = String(slug || '').trim().toLowerCase();
  if (!s) return null;
  return getDataAsObjects('LANDING_PAGES').filter(function(p) {
    return String(p.slug).toLowerCase() === s;
  })[0] || null;
}

function isLandingActive_(page) {
  if (String(page.status || 'AKTIF').toUpperCase() !== 'AKTIF') return false;
  const today = todayString();
  if (String(page.periode_mulai || '').trim() && String(page.periode_mulai) > today) return false;
  if (String(page.periode_selesai || '').trim() && String(page.periode_selesai) < today) return false;
  return true;
}

function buildUtm_(utm) {
  utm = utm || {};
  const parts = [];
  ['source', 'medium', 'campaign', 'term', 'content'].forEach(function(k) {
    if (String(utm[k] || '').trim()) parts.push('utm_' + k + '=' + String(utm[k]).trim());
  });
  return parts.length ? ' · UTM: ' + parts.join('&') : '';
}

// Konfigurasi halaman publik (aman: hanya data halaman yang diminta)
function pubGetLandingPage(slug) {
  try {
    const page = findLanding_(slug);
    if (!page) return { success: false, message: 'Halaman tidak ditemukan.' };
    if (!isLandingActive_(page)) return { success: false, code: 'INACTIVE', message: 'Halaman campaign ini sedang tidak aktif.' };

    const fieldCfg = landingFields_(page);
    const formFields = fieldCfg.map(function(f) { return f.key; });
    const campaign = page.campaign_id
      ? (getRecordById('CAMPAIGNS', 'campaign_id', page.campaign_id) || {})
      : {};

    const out = {
      slug: page.slug, judul: page.judul, deskripsi: page.deskripsi,
      banner_url: page.banner_url || '', tipe: page.tipe, penawaran: page.penawaran || '',
      cta_label: page.cta_label || 'Kirim', source: page.source || 'Landing Page',
      campaign: String(campaign.nama_program || ''), form_fields: formFields, fields: fieldCfg,
      biaya: parseNum_(page.biaya), kuota: parseNum_(page.kuota), event: null
    };
    if (String(page.tipe) === 'EVENT') {
      const ev = crmCtx_().findEvent(page.event_id);
      if (!ev) return { success: false, message: 'Event untuk halaman ini tidak ditemukan.' };
      const terisi = getDataAsObjects('EVENT_PARTICIPANTS').filter(function(p) {
        return String(p.event_id) === String(page.event_id);
      }).length;
      const kuota = parseNum_(page.kuota) || parseNum_(ev.target_peserta);
      out.event = {
        nama: String(ev.nama_event || ''), tanggal_mulai: String(ev.tanggal_mulai || ''),
        tanggal_selesai: String(ev.tanggal_selesai || ''), lokasi: String(ev.lokasi || ''),
        deskripsi: String(ev.deskripsi || ''), biaya: out.biaya || parseNum_(ev.anggaran),
        kuota: kuota, terisi: terisi, sisa: kuota > 0 ? Math.max(0, kuota - terisi) : null
      };
    }
    return { success: true, data: out };
  } catch (e) {
    return handleError_('pubGetLandingPage', e);
  }
}

// Lead Capture publik -> sheet LEADS (otomatis: CRM link, jadwal Follow Up)
function pubSubmitLead(slug, data) {
  try {
    __crmCtx = null;
    const page = findLanding_(slug);
    if (!page) return { success: false, message: 'Halaman tidak ditemukan.' };
    if (String(page.tipe) !== 'LEAD') return { success: false, message: 'Halaman ini bukan form Lead.' };
    if (!isLandingActive_(page)) return { success: false, code: 'INACTIVE', message: 'Campaign sedang tidak aktif.' };
    data = data || {};
    const fieldCfg = landingFields_(page);
    const vErr = landingValidate_(fieldCfg, data);
    if (vErr) return { success: false, message: vErr };
    const nama = String(data.nama || '').trim();
    const wa = normalizePhone_(data.whatsapp);
    const now = nowString();
    // Idempotency: nomor yang sudah punya Lead aktif tidak dibuat ganda (aman dari submit berulang)
    const open = getDataAsObjects('LEADS').filter(function(l) {
      return normalizePhone_(l.whatsapp) === wa &&
        LEAD_STAGE_CLOSED.indexOf(String(l.tahap || '').toUpperCase()) < 0;
    })[0];
    if (open) {
      return { success: true, data: { lead_id: open.lead_id, duplicate: true },
        message: 'Anda sudah terdaftar. Tim kami akan segera menghubungi Anda.' };
    }
    const catatan = 'Dari Landing Page "' + page.judul + '" (' + page.slug + ')' +
      (String(data.jumlah_peserta || '').trim() ? ' · Pax: ' + String(data.jumlah_peserta).trim() : '') +
      (String(data.tanggal_rencana || '').trim() ? ' · Rencana kunjungan: ' + String(data.tanggal_rencana).trim() : '') +
      (landingExtras_(fieldCfg, data, 'LEAD') ? ' · ' + landingExtras_(fieldCfg, data, 'LEAD') : '') +
      buildUtm_(data.utm);
    const lead = {
      lead_id: generateId('LEAD', 'LEADS', 'lead_id'),
      tanggal: todayString(),
      nama: nama,
      whatsapp: String(data.whatsapp || '').trim(),
      sumber: String(page.source || '').trim() || 'Landing Page',
      jenis_pelanggan: String(data.jenis_pelanggan || '').trim(),
      kebutuhan: outreachSafeText_(data.minat || data.kebutuhan, 500),
      nilai_potensi: '',
      status: 'AKTIF',
      tahap: 'NEW',
      PIC: String(page.PIC || ''),
      tanggal_followup: todayString(),   // otomatis masuk jadwal Follow Up hari ini
      catatan: outreachSafeText_(catatan, 900),
      alasan_lost: '',
      created_at: now,
      updated_at: now,
      crm_id: '',
      masuk_followup: 'YA',
      landing_page_id: page.page_id
    };
    lead.email = String(data.email || '').trim();
    lead.kota = String(data.kota || '').trim();
    linkLeadToCrm_(lead, false, null);   // SATU nomor WhatsApp = SATU profil CRM
    createRecord('LEADS', lead);
    scheduleFollowupFromLead_(lead, now);
    return { success: true, data: { lead_id: lead.lead_id, duplicate: false },
      message: 'Terima kasih! Data Anda tersimpan.' };
  } catch (e) {
    return handleError_('pubSubmitLead', e);
  }
}

// Reservasi Online publik -> sheet RESERVATIONS (nomor reservasi unik otomatis, CRM auto-create bila belum ada)
function pubSubmitReservation(slug, data) {
  try {
    __crmCtx = null;
    const page = findLanding_(slug);
    if (!page) return { success: false, message: 'Halaman tidak ditemukan.' };
    if (String(page.tipe) !== 'RESERVASI') return { success: false, message: 'Halaman ini bukan form Reservasi.' };
    if (!isLandingActive_(page)) return { success: false, code: 'INACTIVE', message: 'Campaign sedang tidak aktif.' };
    data = data || {};
    const nama = String(data.nama || '').trim();
    const wa = normalizePhone_(data.whatsapp);
    const tglKunjungan = String(data.tanggal_kunjungan || data.tanggal_rencana || '').trim();
    const pax = Math.round(parseNum_(data.jumlah_peserta));
    const fieldCfg = landingFields_(page);
    const vErr = landingValidate_(fieldCfg, data);
    if (vErr) return { success: false, message: vErr };
    if (!nama) return { success: false, message: 'Nama wajib diisi.' };
    if (wa.length < 8) return { success: false, message: 'Nomor WhatsApp tidak valid.' };
    if (!tglKunjungan) return { success: false, message: 'Tanggal kunjungan wajib diisi.' };
    if (!pax || pax < 1) return { success: false, message: 'Jumlah peserta minimal 1.' };
    const now = nowString();
    let cust = crmCtx_().findCustomer(wa);
    if (!cust) {
      const cid = createCrmFromLead_({
        nama: nama, whatsapp: String(data.whatsapp || '').trim(),
        sumber: String(page.source || '').trim() || 'Landing Page',
        jenis_pelanggan: '', kebutuhan: data.minat || '', PIC: page.PIC || '',
        email: String(data.email || '').trim(), kota: String(data.kota || '').trim()
      }, now);
      cust = { customer_id: cid };
    }
    const nomor = generateId('RSV', 'RESERVATIONS', 'nomor_reservasi');
    const catatan = '[Reservasi Online - Landing Page "' + page.judul + '" (' + page.slug + ')] ' +
      (data.minat ? 'Minat: ' + data.minat + '. ' : '') +
      (landingExtras_(fieldCfg, data, 'RESERVASI') ? landingExtras_(fieldCfg, data, 'RESERVASI') + '. ' : '') + buildUtm_(data.utm);
    const res = {
      reservation_id: generateId('RES', 'RESERVATIONS', 'reservation_id'),
      nomor_reservasi: nomor,
      customer_id: String(cust.customer_id),
      tanggal_reservasi: todayString(),
      tanggal_kunjungan: tglKunjungan,
      jumlah_peserta: pax,
      paket: String(data.paket || '').trim(),
      wahana: '', aula: '', sound: '', makanan: '', snack: '', tambahan: '',
      harga: '', diskon: 0,
      total: parseNum_(page.biaya) * pax || '',
      uang_muka: 0, sisa_pembayaran: '',
      status_pembayaran: 'BELUM BAYAR',
      status_reservasi: 'PERTANYAAN',   // Inquiry -> lanjut follow up internal
      PIC: String(page.PIC || ''),
      catatan: outreachSafeText_(catatan, 900),
      created_at: now, updated_at: now,
      lead_id: '',
      landing_page_id: page.page_id
    };
    createRecord('RESERVATIONS', res);
    return { success: true, data: { reservation_id: res.reservation_id, nomor_reservasi: nomor },
      message: 'Reservasi tersimpan.' };
  } catch (e) {
    return handleError_('pubSubmitReservation', e);
  }
}

// Registrasi Event publik -> sheet EVENT_PARTICIPANTS (Registration ID unik + cek kuota + anti-duplikasi)
function pubRegisterEvent(slug, data) {
  try {
    __crmCtx = null;
    const page = findLanding_(slug);
    if (!page) return { success: false, message: 'Halaman tidak ditemukan.' };
    if (String(page.tipe) !== 'EVENT') return { success: false, message: 'Halaman ini bukan form Registrasi Event.' };
    if (!isLandingActive_(page)) return { success: false, code: 'INACTIVE', message: 'Pendaftaran sedang tidak aktif.' };
    data = data || {};
    const nama = String(data.nama || '').trim();
    const wa = normalizePhone_(data.whatsapp);
    const fieldCfg = landingFields_(page);
    const vErr = landingValidate_(fieldCfg, data);
    if (vErr) return { success: false, message: vErr };
    if (!nama) return { success: false, message: 'Nama wajib diisi.' };
    const ev = crmCtx_().findEvent(page.event_id);
    if (!ev) return { success: false, message: 'Event tidak ditemukan.' };

    const existingAll = getDataAsObjects('EVENT_PARTICIPANTS');
    // Idempotency: nomor sama + event sama -> kembalikan registrasi yang sudah ada (aman dari submit berulang)
    const dup = existingAll.filter(function(p) {
      return String(p.event_id) === String(page.event_id) && normalizePhone_(p.whatsapp) === wa;
    })[0];
    if (dup) {
      return { success: true, data: { registration_id: dup.nomor_peserta || dup.participant_id, duplicate: true },
        message: 'Anda sudah terdaftar pada event ini.' };
    }
    // Cek kuota
    const kuota = parseNum_(page.kuota) || parseNum_(ev.target_peserta);
    const terisi = existingAll.filter(function(p) { return String(p.event_id) === String(page.event_id); }).length;
    if (kuota > 0 && terisi >= kuota) {
      return { success: false, code: 'FULL', message: 'Kuota event sudah penuh. Silakan hubungi kami via WhatsApp.' };
    }

    const now = nowString();
    const part = {
      participant_id: generateId('PTC', 'EVENT_PARTICIPANTS', 'participant_id'),
      event_id: String(page.event_id),
      customer_id: '',
      nomor_peserta: generateId('REG', 'EVENT_PARTICIPANTS', 'nomor_peserta'),
      nama: nama,
      umur: String(data.umur || '').trim(),
      sekolah: String(data.sekolah || '').trim(),
      whatsapp: String(data.whatsapp || '').trim(),
      kategori: String(data.kategori || '').trim() || 'Anak',
      biaya: parseNum_(page.biaya),
      status_pembayaran: 'BELUM BAYAR',
      status_kehadiran: 'TERDAFTAR',
      created_at: now, updated_at: now,
      crm_id: '', source: 'EVENT_REGISTRATION',
      checked_in_at: '',
      catatan: outreachSafeText_(landingExtras_(fieldCfg, data, 'EVENT'), 900),
      email: String(data.email || '').trim(),
      kota: String(data.kota || '').trim()
    };
    // CRM: pakai profil yang sudah ada bila nomor terdaftar, buat baru bila belum (anti-duplikasi)
    const c = crmCtx_().findCustomer(wa);
    part.crm_id = c ? String(c.customer_id) : createCrmFromParticipant_(part, now);
    createRecord('EVENT_PARTICIPANTS', part);
    return { success: true, data: { registration_id: part.nomor_peserta, participant_id: part.participant_id, duplicate: false },
      message: 'Pendaftaran berhasil.' };
  } catch (e) {
    return handleError_('pubRegisterEvent', e);
  }
}

/* ==================== EVENT CHECK-IN & EXPORT (admin) ==================== */
// Check-in peserta by Registration ID (nomor_peserta / participant_id) - dipakai untuk scan QR
function apiEventCheckin(token, key) {
  try {
    checkPermission(token, 'participants', 'update');
    key = String(key || '').trim();
    if (!key) return { success: false, message: 'Registration ID tidak valid.' };
    const rows = getDataAsObjects('EVENT_PARTICIPANTS');
    const p = rows.filter(function(r) {
      return String(r.nomor_peserta) === key || String(r.participant_id) === key;
    })[0];
    if (!p) return { success: false, message: 'Peserta tidak ditemukan.' };
    if (String(p.status_kehadiran).toUpperCase() === 'HADIR') {
      return { success: true, data: { participant_id: p.participant_id, nomor_peserta: p.nomor_peserta, already: true },
        message: p.nama + ' sudah check-in sebelumnya.' };
    }
    updateRecord('EVENT_PARTICIPANTS', 'participant_id', p.participant_id,
      { status_kehadiran: 'HADIR', checked_in_at: nowString(), updated_at: nowString() });
    return { success: true, data: { participant_id: p.participant_id, nomor_peserta: p.nomor_peserta, already: false },
      message: 'Check-in berhasil: ' + p.nama + ' (' + (p.nomor_peserta || p.participant_id) + ').' };
  } catch (e) {
    return handleError_('apiEventCheckin', e);
  }
}

// Export seluruh peserta (CSV) untuk diunduh di frontend
function apiExportParticipants(token) {
  try {
    checkPermission(token, 'participants', 'read');
    const evMap = {};
    getDataAsObjects('EVENTS').forEach(function(e) { evMap[String(e.event_id)] = String(e.nama_event || ''); });
    const rows = getDataAsObjects('EVENT_PARTICIPANTS');
    function csv_(v) {
      v = String(v === undefined || v === null ? '' : v);
      return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    }
    const head = ['Event', 'Registration ID', 'Nama', 'WhatsApp', 'Umur', 'Sekolah/Instansi', 'Kategori',
      'Biaya', 'Status Pembayaran', 'Kehadiran', 'Check-in At', 'Sumber', 'CRM ID', 'Tanggal Daftar'];
    const lines = [head.join(',')];
    rows.forEach(function(p) {
      lines.push([
        evMap[String(p.event_id)] || p.event_id, p.nomor_peserta || '', p.nama || '', p.whatsapp || '',
        p.umur || '', p.sekolah || '', p.kategori || '', parseNum_(p.biaya),
        p.status_pembayaran || '', p.status_kehadiran || '', p.checked_in_at || '',
        p.source || '', p.crm_id || '', String(p.created_at || '').substring(0, 10)
      ].map(csv_).join(','));
    });
    return { success: true, data: { csv: lines.join('\n'), count: rows.length } };
  } catch (e) {
    return handleError_('apiExportParticipants', e);
  }
}

/* ==================== UTILITY FUNCTIONS ==================== */
function nowString() {
  return Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}

function todayString() {
  return Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd');
}

function hashPassword(password) {
  const raw = PASSWORD_SALT + '::' + password;
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw, Utilities.Charset.UTF_8);
  return digest.map(function(b) {
    return (b < 0 ? b + 256 : b).toString(16).padStart(2, '0');
  }).join('');
}

// Fungsi utilitas yang bisa dipanggil dari editor (opsional)
function getDatabaseInfo() {
  try {
    const id = PropertiesService.getScriptProperties().getProperty(DB_ID_PROPERTY);
    if (!id) return 'Database belum dibuat. Jalankan setupSystem().';
    const ss = SpreadsheetApp.openById(id);
    const sheets = ss.getSheets().map(function(s) {
      return s.getName() + ' (' + Math.max(0, s.getLastRow() - 1) + ' baris)';
    });
    return 'Spreadsheet ID: ' + id + '\nURL: ' + ss.getUrl() + '\n\nSheets:\n' + sheets.join('\n');
  } catch (e) {
    return 'Error: ' + e.message;
  }
}

// Reset database (HATI-HATI: menghapus referensi DB; data spreadsheet lama tidak dihapus)
function resetDatabaseReference() {
  PropertiesService.getScriptProperties().deleteProperty(DB_ID_PROPERTY);
  return 'Referensi database dihapus. Jalankan setupSystem() untuk membuat database baru.';
}

/* ==================== ERROR HANDLING ==================== */
function logError_(context, error) {
  try {
    Logger.log('[ERROR][' + context + '] ' + (error && error.message ? error.message : String(error)) + ' | ' + (error && error.stack ? error.stack : ''));
  } catch (e) {}
}

function handleError_(context, error) {
  logError_(context, error);
  const code = error && error.code ? error.code : 'SERVER_ERROR';
  let message = 'Terjadi kesalahan saat memproses data. Silakan coba lagi.';
  if (code === 'SESSION_EXPIRED') message = 'Sesi berakhir. Silakan login kembali.';
  else if (code === 'PERMISSION_DENIED') message = 'Anda tidak memiliki izin untuk aksi ini.';
  else if (code === 'NOT_INITIALIZED') message = 'Database belum diinisialisasi. Jalankan setupSystem().';
  else if (code === 'DB_NOT_FOUND') message = 'Spreadsheet database tidak ditemukan.';
  return { success: false, code: code, message: message };
}
