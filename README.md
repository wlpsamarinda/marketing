# Wonderland Marketing Center — PWA

Frontend statis (GitHub Pages) + Google Apps Script sebagai API JSON.

## 1. Update Google Apps Script
1. Ganti isi `Code.gs` di proyek GAS dengan `Code.gs` terbaru (fungsi `doPost` kini jadi API gateway; `initializeSystem` tidak dibuka lewat web).
2. Jika database belum ada: di editor GAS, pilih fungsi `initializeSystem` → Run (sekali saja).
3. Deploy → Deployment baru (atau Kelola deployment → Edit → Versi baru) → Jenis **Aplikasi Web**:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Salin URL berakhiran `/exec`.

## 2. Isi config.js
```js
GAS_URL: 'https://script.google.com/macros/s/XXXX/exec'
```

## 3. Deploy ke GitHub Pages
1. Buat repo, upload **isi folder ini** (index.html, public.html, 404.html, .nojekyll, config.js, dll.) ke root repo.
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`.
3. Buka `https://USERNAME.github.io/REPO/` → login (akun awal `admin` / `admin123`, wajib diganti).

## 4. Link Landing Page
Di menu **Landing Pages → Pengaturan**, isi Base URL: `https://USERNAME.github.io/REPO`
Link jadi `https://USERNAME.github.io/REPO/<slug>` (404.html mengalihkan ke `public.html?page=<slug>`).

## 5. Pasang di HP
Buka URL di Chrome (Android) → tombol "📲 Pasang Aplikasi" / menu ⋮ → *Install app*. iPhone: Safari → Share → *Add to Home Screen*.

## Catatan
- Setiap mengubah file aplikasi, naikkan `VERSION` di `sw.js` (mis. `wmc-v2`) agar cache diperbarui.
- Setiap mengubah `Code.gs`, deploy ulang versi baru di GAS.
- Aplikasi butuh internet untuk data (API tidak di-cache); hanya tampilan yang tersedia offline.
