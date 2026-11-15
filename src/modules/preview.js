/* Preview: gabung file jadi dokumen iframe, lint, riwayat versi, RUN */
import { $, esc } from './util.js';
import { S } from './state.js';
import { MS, ST, bucket, miko, mikoSay, mkLine, stSave } from './miko.js';
import { bump, sfx } from './audio.js';
import { touch } from './storage.js';
import { HEAD, ext, fo, isHtml } from './editor.js';
import { nkBundle, nkHasImports } from './bundler.js';
import { netAdd, netReset, nkNetHook } from './network.js';
import { NK_TX, ensureBabel } from './transpile.js';
import { L } from '../lib.js';

/* ---------- Preview ---------- */
const HOOK=`<script>var __nkt=Date.now(),__nkn=0;setInterval(function(){__nkt=Date.now()},400);function __nkg(){if((++__nkn&4095)===0&&Date.now()-__nkt>3000)throw new Error('Loop berjalan lebih dari 3 detik tanpa henti, dihentikan oleh NekoCode')};(function(){var s=function(l,a){try{parent.postMessage({type:'NEKO_LOG',level:l,msg:a.map(function(x){if(typeof x==='object'){try{return JSON.stringify(x)}catch(e){return String(x)}}return x}).join(' ')},'*')}catch(e){}};['log:info','error:error','warn:warn'].forEach(function(p){var q=p.split(':'),o=console[q[0]];console[q[0]]=function(){var a=[].slice.call(arguments);s(q[1],a);o.apply(console,a)}});window.onerror=function(m,u,l){s('error',[m+' (Baris '+l+')'])};addEventListener('unhandledrejection',function(e){s('error',['Promise ditolak: '+(e.reason&&e.reason.message||e.reason)])})})();<\/script>`;
function pfile(){
  const hs=S.cur.files.filter(f=>isHtml(f.n)),a=fo(S.kind);
  if(!hs.length)return null;
  if(a&&isHtml(a.n)){S.cur.main=a.n;return a}
  return hs.find(f=>f.n===S.cur.main)||hs[0];
}
export function merge(hook){
  const pf=pfile();
  if(!pf)return '<p style="font-family:sans-serif;padding:20px">Belum ada file HTML di proyek ini. Tambahkan lewat tombol +.</p>';
  const find=h=>{const n=h.replace(/^\.?\//,'').split(/[?#]/)[0];return S.cur.files.find(f=>f.n===n)};
  let h=pf.c;
  h=h.replace(/<link\b[^>]*>/gi,m=>{
    if(!/rel=["']?stylesheet/i.test(m))return m;
    const r=m.match(/href=["']([^"']+)["']/i),f=r&&find(r[1]);
    return f&&ext(f.n)==='css'?'<style>\n'+f.c.replace(/<\/style/gi,'<\\/style')+'\n</style>':m;
  });
  h=h.replace(/<!--[\s\S]*?-->|<script\b([^>]*)>([\s\S]*?)<\/script>/gi,(m,a,body)=>{
    if(m.charAt(1)==='!')return m;
    const ty=(a.match(/\btype\s*=\s*["']?([^"'\s>]+)/i)||[])[1]||'',mod=/module/i.test(ty);
    if(ty&&!mod&&!/javascript|ecmascript/i.test(ty))return m;
    const sm=a.match(/\bsrc\s*=\s*["']([^"']+)["']/i);let code=body;
    let tsx=false;if(sm){const f=find(sm[1]);if(!f||!/^(m?js|jsx|tsx?)$/.test(ext(f.n)))return m;code=f.c;tsx=NK_TX.test(f.n)}
    if(tsx||(mod&&nkHasImports(code))){const nm=sm?find(sm[1]).n:'(inline)';return '<script'+a.replace(/\s+src\s*=\s*["'][^"']*["']/i,'').replace(/\s+type\s*=\s*["']?module["']?/i,'')+'>\n'+nkBundle(code,nm,hook).replace(/<\/script/gi,'<\\/script')+'\n<\/script>'}
    if(hook)code=L.guard(code,mod);
    return '<script'+a.replace(/\s+src\s*=\s*["'][^"']*["']/i,'')+'>\n'+code.replace(/<\/script/gi,'<\\/script')+'\n<\/script>';
  });
  if(!/name=["']viewport["']/.test(h)){const m='<meta name="viewport" content="width=device-width, initial-scale=1.0">';h=HEAD.test(h)?h.replace(HEAD,x=>x+'\n  '+m):m+'\n'+h}
  if(hook){const m=h.match(HEAD)||h.match(/<html[^>]*>/i),HK=HOOK+nkNetHook();h=m?h.slice(0,m.index+m[0].length)+HK+h.slice(m.index+m[0].length):HK+h}
  return h;
}
export function applySandbox(){const v='allow-scripts allow-modals allow-forms'+(S.cur.ls?' allow-same-origin':'');$('ifr').setAttribute('sandbox',v);$('ifr2').setAttribute('sandbox',v)}
function explain(m){
  let r;
  if(r=m.match(/(\S+) is not defined/))return '"'+r[1]+'" belum didefinisikan. Cek ejaan nama, atau urutan <script> (yang mendefinisikan harus di atas).';
  if(r=m.match(/Cannot read propert(?:y|ies) of (null|undefined) \(reading '([^']+)'\)/))return 'Mengakses "'+r[2]+'" dari '+r[1]+'. Biasanya elemen tidak ketemu: cek id/selector, atau script jalan sebelum elemennya ada (taruh <script> di akhir <body>).';
  if(/Cannot set propert(?:y|ies) of (null|undefined)/.test(m))return 'Mengisi properti dari elemen yang tidak ketemu (null). Cek id/selector dan posisi <script>.';
  if(r=m.match(/(\S+) is not a function/))return '"'+r[1]+'" bukan fungsi. Cek ejaan, atau isinya mungkin bukan fungsi.';
  if(/Unexpected end of input/.test(m))return 'Ada kurung atau kurawal yang belum ditutup.';
  if(/Unexpected token|Invalid or unexpected token/.test(m))return 'Salah sintaks: ada karakter di tempat yang tidak semestinya (cek koma, kurung, kutip).';
  if(/Assignment to constant variable/.test(m))return 'Variabel const tidak bisa diisi ulang. Pakai let kalau nilainya berubah.';
  if(r=m.match(/Identifier '([^']+)' has already been declared/))return '"'+r[1]+'" dideklarasikan dua kali. Ganti nama atau hapus salah satu.';
  if(/Loop berjalan lebih dari/.test(m))return 'Loop tidak pernah berhenti. Cek kondisi berhenti dan apakah variabelnya berubah di tiap putaran.';
  if(/Failed to fetch|NetworkError/.test(m))return 'Permintaan jaringan gagal. Cek alamat URL dan koneksi internet.';
  return null;
}
function lint(){
  const pf=pfile();if(!pf)return[];
  const out=[],h=pf.c,at=i=>h.slice(0,i).split('\n').length;
  const blank=s=>s.replace(/[^\n]/g,' ');
  const strip=h.replace(/<!--[\s\S]*?-->/g,blank).replace(/<(script|style)\b[\s\S]*?<\/\1>/gi,blank);
  const VOID=/^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/,LEN=/^(p|li|dt|dd|tr|td|th|option|thead|tbody|tfoot|colgroup|caption|html|head|body)$/;
  const st=[],re=/<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g;let m;
  while((m=re.exec(strip))){
    const tg=m[2].toLowerCase();
    if(!m[1]){if(!VOID.test(tg)&&!m[4])st.push({t:tg,i:m.index});continue}
    let k=st.length-1;while(k>=0&&st[k].t!==tg)k--;
    if(k<0){if(!VOID.test(tg))out.push('Baris '+at(m.index)+': </'+tg+'> tidak punya tag pembuka.');continue}
    for(let j=st.length-1;j>k;j--)if(!LEN.test(st[j].t))out.push('Baris '+at(st[j].i)+': <'+st[j].t+'> belum ditutup.');
    st.length=k;
  }
  st.forEach(x=>{if(!LEN.test(x.t))out.push('Baris '+at(x.i)+': <'+x.t+'> belum ditutup.')});
  const im=/<img\b(?![^>]*\balt\s*=)[^>]*>/gi;while((m=im.exec(strip)))out.push('Baris '+at(m.index)+': <img> belum punya atribut alt.');
  const names=new Set(S.cur.files.map(f=>f.n)),local=u=>!/^(https?:|data:|\/\/|#|mailto:|blob:)/i.test(u);
  const rf=/<link\b[^>]*rel=["']?stylesheet[^>]*href=["']([^"']+)["']|<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']?stylesheet|<script\b[^>]*\bsrc=["']([^"']+)["']/gi;
  const nc=h.replace(/<!--[\s\S]*?-->/g,blank);
  while((m=rf.exec(nc))){const u=(m[1]||m[2]||m[3]||'').replace(/^\.?\//,'').split(/[?#]/)[0];if(u&&local(u)&&!names.has(u))out.push('"'+u+'" dipanggil di HTML tapi tidak ada di proyek.')}
  const allHtml=S.cur.files.filter(f=>isHtml(f.n)).map(f=>f.c).join('\n');
  S.cur.files.forEach(f=>{if(/^(css|m?js)$/.test(ext(f.n))&&!allHtml.includes(f.n)&&f.c.trim())out.push(f.n+' belum dipanggil di HTML, jadi belum terbaca di preview.')});
  const ids={},idr=/\bid\s*=\s*["']([^"']+)["']/gi;while((m=idr.exec(strip))){ids[m[1]]=(ids[m[1]]||0)+1}
  Object.keys(ids).forEach(k=>{if(ids[k]>1)out.push('id "'+k+'" dipakai '+ids[k]+' kali (harus unik).')});
  return [...new Set(out)];
}
const sigOf=fs=>JSON.stringify(fs.map(f=>[f.n,f.c]));
export function snap(){
  const h=S.cur.hist=S.cur.hist||[],s=sigOf(S.cur.files);
  if(h[0]&&h[0].s===s)return;
  h.unshift({t:Date.now(),s});if(h.length>10)h.length=10;touch();
}
export function openHist(){
  const h=S.cur.hist||[];
  $('hlist').innerHTML=h.length?h.map((x,i)=>`<div class="row" data-i="${i}"><div class="nm"><b>${new Date(x.t).toLocaleString('id-ID',{dateStyle:'short',timeStyle:'medium'})}</b><small>${JSON.parse(x.s).length} file</small></div><button>Pulihkan</button></div>`).join(''):'<small style="color:var(--mu)">Belum ada riwayat. Tekan RUN setelah mengubah kode.</small>';
  $('m-hist').classList.add('show');
}
let lastHints='';
export function run(quiet){
  if(ensureBabel(()=>run(quiet)))return;
  netReset();$('ifr').srcdoc=merge(true);
  if(quiet)return;
  sfx('run');snap();const was=S.runErr;S.runErr=false;ST.runs++;ST.hrs[bucket(new Date().getHours())]++;stSave();
  const hs=lint(),sig=hs.join('|');
  if(hs.length){
    if(sig!==lastHints){hs.slice(0,4).forEach(x=>log('hint',x));if(hs.length>4)log('hint','...dan '+(hs.length-4)+' petunjuk lain.')}
    miko(hs[0],'think');
  }
  clearTimeout(S.tOk);S.tOk=setTimeout(()=>{if(S.runErr)return;S.errStreak=0;if(hs.length)return;
    if(was){ST.fixes++;stSave()}
    const ms=MS.runs.includes(ST.runs)?['m_runs',ST.runs]:(was&&MS.fixes.includes(ST.fixes))?['m_fix',ST.fixes]:null;
    if(was||ms){sfx('happy');bump()}
    if(ms)mikoSay(ms[0],{n:ms[1]});else mikoSay(was?'fixed':'ok');
  },900);
  lastHints=sig;
}
addEventListener('message',e=>{
  if(e.source!==$('ifr').contentWindow&&e.source!==$('ifr2').contentWindow)return;
  const d=e.data;if(d&&d.type==='NEKO_LOG')log(d.level,d.msg);else if(d&&d.type==='NEKO_NET')netAdd(d);
});
export function log(level,msg){
  const d=document.createElement('div'),t=esc(String(msg).length>2000?String(msg).slice(0,2000)+'…':msg);
  d.innerHTML=level==='hint'?`<b style="color:#fbbf24">[HINT]</b> <span style="color:#fde68a">${t}</span>`:level==='error'?`<b style="color:#f87171">[ERROR]</b> <span style="color:#fca5a5">${t}</span>`:level==='warn'?`<b style="color:#facc15">[WARN]</b> <span style="color:#fde68a">${t}</span>`:`<b style="color:var(--pk)">[LOG]</b> ${t}`;
  if(level==='error'){const hx=explain(String(msg));if(hx)d.insertAdjacentHTML('beforeend','<div class="hint">Petunjuk: '+esc(hx)+'</div>');sfx('error');let first=false;if(!S.runErr){S.runErr=true;S.errStreak++;first=true}miko(first&&S.errStreak>=3?mkLine('err3'):(hx||mkLine('err')),'worry');if(innerWidth<1024&&S.tab!=='console'){S.errs++;badge()}}
  const c=$('logs');while(c.children.length>=200)c.removeChild(c.firstChild);
  c.appendChild(d);c.scrollTop=c.scrollHeight;
}
export const badge=()=>{$('badge').textContent=S.errs;$('badge').classList.toggle('hide',!S.errs)};
