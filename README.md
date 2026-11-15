# NekoCode Studio

Web playground HTML/CSS/JS bertema wibu, lengkap dengan Miko-chan. Isi dan perilaku aplikasi sama dengan versi satu file HTML; yang berubah hanya struktur kodenya.

## Menjalankan

```bash
npm install
npm run dev            # server lokal (bisa dibuka dari HP lewat IP laptop)
npm run build          # hasil di dist/ untuk hosting
npm run build:single   # hasil satu file di dist-single/index.html
```

## Struktur

```
index.html            kerangka HTML (isi body sama persis dengan versi lama)
src/
  main.js             titik masuk: import gaya + boot aplikasi
  lib.js              CodeMirror 6, js-beautify, acorn, dan guard loop (objek L)
  styles/             CSS dipecah per bagian; urutan di index.css = urutan cascade
  modules/
    util.js           helper dasar ($, esc, uid, ls, I)
    state.js          state bersama (objek S) untuk variabel yang berubah lintas modul
    miko.js           Miko-chan: wajah, mood, bubble, mata, colek, sapaan
    audio.js          suara karakter dan efek bunyi
    palette.js        palet perintah (Ctrl+K) dan cari & ganti
    templates.js      template proyek
    storage.js        IndexedDB dan normalisasi format lama
    editor.js         editor CodeMirror, tab dan file
    bundler.js        modul ES antar-file untuk preview
    emmet.js          Emmet ringan
    network.js        panel Network dan mock.json
    transpile.js      JSX/TypeScript (Babel) dan bingkai perangkat
    preview.js        gabung file, iframe, lint, riwayat, RUN
    actions.js        unduh, ZIP, tema, simpan, rapikan, buka file
    projects.js       proyek, cadangan, validasi impor
    ui.js             tab layar, bar simbol, event handler, init
```

Variabel yang dulu global dan diubah dari banyak bagian (`cur`, `view`, `tab`, `projects`, dst.) sekarang diakses lewat `S`, misalnya `S.cur`, `S.view`.

## Deploy

- **GitHub Pages**: push ke branch `main`, lalu di Settings > Pages pilih Source "GitHub Actions". Workflow sudah ada di `.github/workflows/deploy.yml`.
- **Netlify**: hubungkan repo; `netlify.toml` sudah mengatur build dan folder publish.

Catatan: data proyek tersimpan di IndexedDB per alamat situs. Pindah alamat (misalnya dari file lokal ke domain hosting) berarti data lama tidak ikut; pakai fitur Cadangkan lalu impor.
