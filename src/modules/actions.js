/* Aksi: unduh, ZIP, tema, simpan, rapikan kode, buka file */
import { $, ls, uid } from './util.js';
import { miko, mikoSay } from './miko.js';
import { S } from './state.js';
import { dbPut, flush, touch } from './storage.js';
import { ext, fo, isHtml, loadProject, replaceDoc, showFile } from './editor.js';
import { merge, run } from './preview.js';
import { L } from '../lib.js';

/* ---------- Aksi ---------- */
export const dl=(name,text,type)=>{const u=URL.createObjectURL(new Blob([text],{type:type+';charset=utf-8'})),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500)};
const slug=s=>(s||'nekocode').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'nekocode';
function crc32(u){
  if(!crc32.t){crc32.t=[];for(let n=0,c;n<256;n++){c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;crc32.t[n]=c}}
  let c=-1;for(let i=0;i<u.length;i++)c=crc32.t[(c^u[i])&255]^(c>>>8);return(c^-1)>>>0;
}
function makeZip(files){
  const enc=new TextEncoder(),parts=[],cd=[],d=new Date();let off=0;
  const dt=(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1),dd=((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate();
  for(const f of files){
    const nb=enc.encode(f.n),db=enc.encode(f.c),crc=crc32(db),lh=new DataView(new ArrayBuffer(30)),ch=new DataView(new ArrayBuffer(46));
    lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(10,dt,true);lh.setUint16(12,dd,true);lh.setUint32(14,crc,true);lh.setUint32(18,db.length,true);lh.setUint32(22,db.length,true);lh.setUint16(26,nb.length,true);
    ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(12,dt,true);ch.setUint16(14,dd,true);ch.setUint32(16,crc,true);ch.setUint32(20,db.length,true);ch.setUint32(24,db.length,true);ch.setUint16(28,nb.length,true);ch.setUint32(42,off,true);
    parts.push(new Uint8Array(lh.buffer),nb,db);cd.push(new Uint8Array(ch.buffer),nb);off+=30+nb.length+db.length;
  }
  const csz=cd.reduce((s,x)=>s+x.length,0),en=new DataView(new ArrayBuffer(22));
  en.setUint32(0,0x06054b50,true);en.setUint16(8,files.length,true);en.setUint16(10,files.length,true);en.setUint32(12,csz,true);en.setUint32(16,off,true);
  return new Blob([...parts,...cd,new Uint8Array(en.buffer)],{type:'application/zip'});
}
const dlb=(name,blob)=>{const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500)};
export function exportZip(){dlb(slug(S.cur.name)+'.zip',makeZip(S.cur.files));miko('ZIP berisi '+S.cur.files.length+' file sudah diunduh desu!')}
export function exportProject(){dl(slug(S.cur.name)+'.nekocode.json',JSON.stringify({app:'nekocode',v:1,projects:[{...S.cur,hist:undefined}]}),'application/json');miko('Proyek diekspor. Temanmu bisa membukanya lewat menu Pulihkan dari cadangan.')}
export const THEMES=[['sakura','Sakura'],['cyber','Cyber'],['akatsuki','Akatsuki']];
export function setTheme(k,say){
  if(!THEMES.some(x=>x[0]===k))k='sakura';
  document.documentElement.dataset.theme=k;ls.set('nk_theme',k);
  const nm=THEMES.find(x=>x[0]===k)[1];$('thm-t').textContent='Tema: '+nm;
  if(say)mikoSay('theme',{tema:nm});
}
export function saveFile(){dl(slug(S.cur.name)+'.html',merge(false),'text/html');miko('HTML tersimpan sebagai satu file desu! 💾')}
export function format(){
  const src=S.view.state.doc.toString(),e=ext(S.kind);
  if(!src.trim()){miko('File ini masih kosong sempai~');return}
  if(!['html','htm','css','js','mjs','json'].includes(e)){miko('Rapikan hanya untuk file HTML, CSS, dan JS ya');return}
  try{
    const o={indent_size:2,indent_char:' ',wrap_line_length:0,preserve_newlines:true,max_preserve_newlines:1,end_with_newline:false};
    const out=e==='html'||e==='htm'?L.beautify.html(src,{...o,indent_inner_html:true,extra_liners:[],unformatted:['pre','textarea','code']}):e==='css'?L.beautify.css(src,o):L.beautify.js(src,o);
    if(out===src){miko('Kode sudah rapi desu ✨');return}
    replaceDoc(out);miko('Kode berhasil dirapikan sempai! ✨');
  }catch(x){miko('Aww, gagal merapikan kode 😿')}
}
/* Buka file: ada HTML -> proyek baru berisi semua file terpilih; hanya CSS/JS -> ditambahkan ke proyek aktif */
export async function openFiles(list){
  const arr=[...list];if(!arr.length)return;
  const rd=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res({n:f.name,c:String(r.result||'')});r.onerror=rej;r.readAsText(f)});
  let fs;try{fs=await Promise.all(arr.map(rd))}catch(e){miko('Aww, file tidak bisa dibuka 😿');return}
  const first=fs.find(f=>isHtml(f.n));
  if(first){
    await flush();
    fs.sort((a,b)=>(isHtml(b.n)?1:0)-(isHtml(a.n)?1:0));
    const p={id:uid(),name:first.n.replace(/\.[^.]+$/,'')||'Proyek',ls:false,updated:Date.now(),files:fs};
    S.projects.push(p);await dbPut(p);loadProject(p);
    miko(fs.length>1?fs.length+' file dibuka sebagai proyek baru desu!':'File '+first.n+' dibuka sebagai proyek baru desu!');
  }else{
    S.states[S.kind]=S.view.state;
    let last='',n=0;
    for(const f of fs){
      const ex=fo(f.n);
      if(ex){if(!confirm('File "'+f.n+'" sudah ada di proyek ini. Timpa?'))continue;ex.c=f.c;delete S.states[f.n]}else S.cur.files.push(f);
      last=f.n;n++;
    }
    if(!n)return;
    touch();S.kind='';showFile(last);run(true);
    miko(n+' file ditambahkan. Pasang di HTML lewat <link> atau <script src> supaya terbaca di preview.');
  }
}
