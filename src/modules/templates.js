/* Template proyek starter */

/* ---------- Template ---------- */
export const F=(n,c)=>({n,c});
const DOC=(title,head,body)=>`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
${head}
</head>
<body>
${body}
</body>
</html>`;
export const TEMPLATES={
 kosong:{n:'Kosong (1 file HTML)',ls:false,files:[F('index.html',DOC('Proyek Baru','  <style>\n    body { font-family: system-ui, sans-serif; padding: 24px; }\n  </style>','  <h1>Hello World!</h1>\n  <p>Mulai ngoding di NekoCode Studio.</p>\n  <script>\n    console.log("Halo dari NekoCode!");\n  <\/script>'))]},
 landing:{n:'Landing page (1 file HTML)',ls:false,files:[F('index.html',DOC('Landing Page','  <style>\n    * { box-sizing: border-box; }\n    body { margin: 0; font-family: system-ui, sans-serif; color: #222; }\n    .hero { padding: 64px 20px; text-align: center; background: linear-gradient(135deg, #ff65a3, #a855f7); color: #fff; }\n    .hero button { margin-top: 16px; padding: 12px 24px; border: 0; border-radius: 999px; font-weight: 700; }\n    .grid { display: grid; gap: 16px; padding: 24px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }\n    .card { padding: 20px; border-radius: 14px; background: #f5f3ff; }\n  </style>','  <header class="hero">\n    <h1>Nama Produkmu</h1>\n    <p>Satu kalimat yang menjelaskan manfaatnya.</p>\n    <button id="cta">Mulai Sekarang</button>\n  </header>\n  <section class="grid">\n    <div class="card"><h3>Cepat</h3><p>Deskripsi singkat.</p></div>\n    <div class="card"><h3>Mudah</h3><p>Deskripsi singkat.</p></div>\n    <div class="card"><h3>Murah</h3><p>Deskripsi singkat.</p></div>\n  </section>\n  <script>\n    document.getElementById("cta").addEventListener("click", () => alert("Terima kasih!"));\n  <\/script>'))]},
 todo:{n:'To-do list (1 file, pakai localStorage)',ls:true,files:[F('index.html',DOC('To-do','  <style>\n    body { font-family: system-ui, sans-serif; background: #f5f3ff; }\n    main { max-width: 420px; margin: 24px auto; padding: 0 16px; }\n    form { display: flex; gap: 8px; }\n    input { flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #ccc; }\n    button { padding: 10px 14px; border: 0; border-radius: 8px; background: #a855f7; color: #fff; }\n    li { background: #fff; margin-top: 8px; padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; }\n    li.done span { text-decoration: line-through; opacity: .5; }\n  </style>','  <main>\n    <h1>To-do</h1>\n    <form id="f"><input id="t" placeholder="Tulis tugas..." autocomplete="off"><button>Tambah</button></form>\n    <ul id="list"></ul>\n  </main>\n  <script>\n    let todos = [];\n    try { todos = JSON.parse(localStorage.getItem("todos") || "[]"); } catch (e) {}\n    const list = document.getElementById("list");\n    function save() { try { localStorage.setItem("todos", JSON.stringify(todos)); } catch (e) {} }\n    function render() {\n      list.innerHTML = "";\n      todos.forEach((t, i) => {\n        const li = document.createElement("li");\n        if (t.done) li.className = "done";\n        li.innerHTML = "<span></span><button>x</button>";\n        li.firstChild.textContent = t.text;\n        li.firstChild.onclick = () => { t.done = !t.done; save(); render(); };\n        li.lastChild.onclick = () => { todos.splice(i, 1); save(); render(); };\n        list.appendChild(li);\n      });\n    }\n    document.getElementById("f").addEventListener("submit", e => {\n      e.preventDefault();\n      const v = document.getElementById("t").value.trim();\n      if (v) { todos.push({ text: v, done: false }); save(); render(); e.target.reset(); }\n    });\n    render();\n  <\/script>'))]},
 multi:{n:'Contoh banyak file (HTML + 2 CSS + 2 JS)',ls:false,files:[
  F('index.html',DOC('Contoh Banyak File','  <!-- Urutan <link> dan <script> menentukan urutan pemuatan. -->\n  <link rel="stylesheet" href="theme.css">\n  <link rel="stylesheet" href="style.css">','  <main class="box">\n    <h1 id="judul">Halo!</h1>\n    <p id="hasil">Belum ada klik.</p>\n    <button id="tombol">Klik aku</button>\n  </main>\n\n  <!-- utils.js harus di atas app.js karena app.js memakai fungsinya -->\n  <script src="utils.js"><\/script>\n  <script src="app.js"><\/script>')),
  F('theme.css','/* Warna dipisah di sini supaya gampang ganti tema */\n:root {\n  --bg: #fdf2f8;\n  --card: #ffffff;\n  --aksen: #ff65a3;\n  --teks: #3b0764;\n}\n'),
  F('style.css','/* Tata letak, memakai variabel dari theme.css */\nbody {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  background: var(--bg);\n  color: var(--teks);\n  font-family: system-ui, sans-serif;\n}\n.box {\n  background: var(--card);\n  padding: 28px;\n  border-radius: 16px;\n  text-align: center;\n  box-shadow: 0 8px 30px rgba(168, 85, 247, .2);\n}\nbutton {\n  padding: 10px 20px;\n  border: 0;\n  border-radius: 999px;\n  background: var(--aksen);\n  color: #fff;\n  font-weight: 700;\n}\n'),
  F('utils.js','// Fungsi bantu yang dipakai file lain\nfunction $(id) {\n  return document.getElementById(id);\n}\n\nfunction sapaan(jam) {\n  if (jam < 11) return "Selamat pagi";\n  if (jam < 15) return "Selamat siang";\n  if (jam < 19) return "Selamat sore";\n  return "Selamat malam";\n}\n'),
  F('app.js','// Logika utama, memakai $() dan sapaan() dari utils.js\nlet klik = 0;\n\n$("judul").textContent = sapaan(new Date().getHours()) + "!";\n\n$("tombol").addEventListener("click", () => {\n  klik++;\n  $("hasil").textContent = "Sudah diklik " + klik + " kali.";\n  console.log("klik ke-" + klik);\n});\n')]},
 react:{n:'React + JSX (tanpa build)',ls:false,files:[F('index.html',DOC('React','  <script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.development.js"><\/script>\n  <script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.development.js"><\/script>\n  <style>\n    body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #f5f3ff; }\n  </style>','  <div id="root"></div>\n  <script type="module" src="main.jsx"><\/script>')),F('main.jsx',`import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
`),F('App.jsx',`import React, { useState } from 'react';

export default function App() {
  const [n, setN] = useState(0);
  return (
    <div style={{ textAlign: 'center' }}>
      <h1>React di NekoCode</h1>
      <button onClick={() => setN(n + 1)} style={{ padding: '10px 18px', fontSize: 18 }}>
        Diklik {n} kali
      </button>
    </div>
  );
}
`)]},
 vue:{n:'Vue 3 (CDN, 1 file)',ls:false,files:[F('index.html',DOC('Vue','  <script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"><\/script>\n  <style>\n    body { font-family: system-ui, sans-serif; padding: 24px; }\n    button { padding: 8px 16px; font-size: 16px; }\n  </style>',`  <div id="app">
    <h1>{{ pesan }}</h1>
    <button @click="n++">Diklik {{ n }} kali</button>
  </div>
  <script>
    const { createApp, ref } = Vue;
    createApp({
      setup() {
        const n = ref(0);
        return { n, pesan: 'Vue di NekoCode' };
      }
    }).mount('#app');
  <\/script>`))]},
 alpine:{n:'Alpine.js (CDN, 1 file)',ls:false,files:[F('index.html',DOC('Alpine','  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"><\/script>\n  <style>\n    body { font-family: system-ui, sans-serif; padding: 24px; }\n    button { padding: 8px 16px; font-size: 16px; }\n  </style>',`  <div x-data="{ n: 0, buka: false }">
    <button @click="n++">Diklik <span x-text="n"></span> kali</button>
    <button @click="buka = !buka">Tampilkan pesan</button>
    <p x-show="buka" x-transition>Halo dari Alpine di NekoCode!</p>
  </div>`))]},
 tailwind:{n:'Tailwind CSS (CDN, 1 file)',ls:false,files:[F('index.html',DOC('Tailwind','  <script src="https://cdn.tailwindcss.com"><\/script>',`  <main class="min-h-screen grid place-items-center bg-violet-50 p-6">
    <div class="max-w-sm w-full rounded-2xl bg-white p-6 shadow-lg text-center">
      <h1 class="text-2xl font-bold text-violet-700">Tailwind di NekoCode</h1>
      <p class="mt-2 text-slate-600">Ubah class di elemen ini dan lihat hasilnya langsung.</p>
      <button class="mt-4 rounded-xl bg-pink-500 px-5 py-2 font-semibold text-white active:scale-95">Klik aku</button>
    </div>
  </main>`))]},
 ts:{n:'TypeScript (main.ts)',ls:false,files:[F('index.html',DOC('TypeScript','  <style>\n    body { font-family: system-ui, sans-serif; padding: 24px; }\n  </style>','  <h1>TypeScript</h1>\n  <pre id="out"></pre>\n  <script type="module" src="main.ts"><\/script>')),F('main.ts',`type Todo = { id: number; teks: string; selesai: boolean };

const daftar: Todo[] = [{ id: 1, teks: 'Belajar TypeScript', selesai: false }];

function tambah(teks: string): Todo {
  const t: Todo = { id: daftar.length + 1, teks, selesai: false };
  daftar.push(t);
  return t;
}

tambah('Coba NekoCode');
document.getElementById('out')!.textContent = daftar.map(t => t.id + '. ' + t.teks).join('\\n');
console.log('Total:', daftar.length);
`)]}
};
