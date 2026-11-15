/* Penyimpanan proyek (IndexedDB) dan normalisasi format lama */
import { uid } from './util.js';
import { miko } from './miko.js';
import { S } from './state.js';

/* ---------- Penyimpanan (IndexedDB) ---------- */
let saveT=0;
export const idb=()=>new Promise((res,rej)=>{const r=indexedDB.open('nekocode',1);r.onupgradeneeded=()=>r.result.createObjectStore('p',{keyPath:'id'});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
export const tx=(m,f)=>new Promise((res,rej)=>{const t=S.db.transaction('p',m),q=f(t.objectStore('p'));t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error||new Error('abort'))});
export const dbPut=p=>S.db?tx('readwrite',s=>s.put(p)):Promise.resolve();
export const dbDel=id=>S.db?tx('readwrite',s=>s.delete(id)):Promise.resolve();
export function touch(){S.cur.updated=Date.now();clearTimeout(saveT);saveT=setTimeout(flush,500)}
export async function flush(){clearTimeout(saveT);if(!S.cur)return;try{await dbPut(S.cur)}catch(e){miko('Gagal menyimpan, coba Cadangkan dulu ya 😿')}}
export function mkProject(name,t){return{id:uid(),name,ls:!!t.ls,updated:Date.now(),files:t.files.map(f=>({n:f.n,c:f.c}))}}
/* proyek format lama (html/css/js tetap) diubah ke daftar file */
export function norm(p){
  if(Array.isArray(p.files))return p;
  const o=p.files||{},c=o.css||'',j=o.js||'';let h=o.html||'';
  if(c.trim()&&!/href=["']\.?\/?style\.css["']/i.test(h))h=/<\/head>/i.test(h)?h.replace(/<\/head>/i,()=>'  <link rel="stylesheet" href="style.css">\n</head>'):'<link rel="stylesheet" href="style.css">\n'+h;
  if(j.trim()&&!/src=["']\.?\/?script\.js["']/i.test(h)){const s='<script src="script.js"><\/script>\n',i=h.toLowerCase().lastIndexOf('</body>');h=i>=0?h.slice(0,i)+s+h.slice(i):h+'\n'+s}
  const fs=[{n:'index.html',c:h}];
  if(c.trim())fs.push({n:'style.css',c});
  if(j.trim())fs.push({n:'script.js',c:j});
  p.files=fs;return p;
}
