/* Palet perintah (Ctrl+K) serta cari & ganti */
import { $ } from './util.js';
import { S } from './state.js';
import { showFile } from './editor.js';
import { conTab, mkMakeMock } from './network.js';
import { L } from '../lib.js';

/* ---------- Palet perintah (Ctrl+K / tombol di header) + cari & ganti ---------- */
export function mkSearchPhrases(){
  const E=L.EditorState;
  return E&&E.phrases?[E.phrases.of({'Find':'Cari','Replace':'Ganti','next':'berikut','previous':'sebelum','all':'semua','match case':'huruf besar/kecil','regexp':'regex','by word':'kata utuh','replace':'ganti','replace all':'ganti semua','close':'tutup'})]:[];
}
export const mnavTo=t=>{const b=document.querySelector('#mnav [data-t="'+t+'"]');if(b)b.click()};
function openFind(){
  const k=L.searchKeymap.find(x=>x.key==='Mod-f');if(!k||!S.view)return;
  mnavTo('code');setTimeout(()=>{S.view.focus();k.run(S.view)},40);
}
function goLine(n){
  if(!S.view)return;mnavTo('code');
  const pos=S.view.state.doc.line(n).from;
  S.view.dispatch({selection:{anchor:pos},effects:L.EditorView.scrollIntoView(pos,{y:'center'})});
  setTimeout(()=>S.view.focus(),60);
}
function palFilter(items,q){
  const toks=q.toLowerCase().split(/\s+/).filter(Boolean);
  if(!toks.length)return items;
  return items.map(it=>{
    const h=(it.t+' '+(it.k||'')).toLowerCase();let sc=0;
    for(const w of toks){const i=h.indexOf(w);if(i<0)return null;sc+=i===0?0:i<4?1:2}
    return{it,sc};
  }).filter(Boolean).sort((a,b)=>a.sc-b.sc).map(x=>x.it);
}
let palSel=0,palList=[];
function palItems(){
  const clk=id=>()=>{const b=$(id);if(b)b.click()};
  const lb=(id,d)=>{const b=$(id);return(b&&b.textContent||'').trim()||d};
  const A=(g,t,run,k,keep)=>({g,t,run,k,keep});
  const arr=[
    A('Aksi','Jalankan (Run)',clk('b-run'),'run jalan preview'),
    A('Aksi','Cari & ganti',openFind,'find replace search cari'),
    A('Aksi','Pergi ke baris…',()=>{$('palq').value=':';palRender()},'goto line baris',true),
    A('Aksi','Rapikan kode',clk('b-fmt'),'format beautify'),
    A('Aksi','Salin file ini',clk('b-copy'),'copy'),
    A('Aksi','Refresh preview',clk('b-ref'),'reload muat ulang'),
    A('Aksi','Layar penuh preview',clk('b-full'),'fullscreen'),
    A('Aksi','Bersihkan Console',clk('b-cc'),'clear log'),
    A('Aksi','Kosongkan file ini',clk('b-clr'),'hapus isi clear'),
    A('Tampilan','Kode',()=>mnavTo('code'),'editor'),
    A('Tampilan','Hasil',()=>mnavTo('preview'),'preview'),
    A('Tampilan','Console',()=>{mnavTo('console');conTab('c')},'log error'),
    A('Tampilan','Network',()=>{mnavTo('console');conTab('n')},'request fetch api'),
    A('Proyek','Buat/buka mock.json (backend tiruan)',mkMakeMock,'mock api fetch backend'),
    A('Proyek','Proyek saya',clk('b-projs')),
    A('Proyek','Proyek baru',clk('b-newp')),
    A('Proyek','Buka file',clk('b-open'),'import upload'),
    A('Proyek','Simpan sebagai HTML',clk('b-save'),'download'),
    A('Proyek','Ekspor semua file (ZIP)',clk('b-zip'),'zip download'),
    A('Proyek','Bagikan proyek (JSON)',clk('b-exp'),'share'),
    A('Proyek','Riwayat versi',clk('b-hist'),'history restore'),
    A('Proyek','Cadangkan semua proyek',clk('b-bk'),'backup'),
    A('Proyek','Pulihkan dari cadangan',clk('b-rs'),'restore'),
    A('Pengaturan',lb('b-snd','Suara'),clk('b-snd'),'suara sound audio'),
    A('Pengaturan',lb('b-theme','Tema'),clk('b-theme'),'tema theme warna'),
    A('Pengaturan',lb('b-fs','Ukuran huruf'),clk('b-fs'),'font size'),
    A('Pengaturan',lb('b-wrap','Lipat baris'),clk('b-wrap'),'wrap')
  ];
  (S.cur&&S.cur.files||[]).forEach(f=>arr.push(A('File',f.n,()=>{mnavTo('code');showFile(f.n)},'file buka tab')));
  return arr;
}
function palRender(){
  const q=$('palq').value,list=$('pall');list.textContent='';
  let items;const m=q.match(/^\s*:\s*(\d*)\s*$/);
  if(m){
    const max=S.view?S.view.state.doc.lines:1,n=Math.min(Math.max(+m[1]||1,1),max);
    items=[{g:'',t:'Pergi ke baris '+n+' (maks '+max+')',run:()=>goLine(n)}];
  }else items=palFilter(palItems(),q);
  palList=items;palSel=Math.min(palSel,Math.max(items.length-1,0));
  if(!items.length){const d=document.createElement('div');d.className='pg';d.textContent='Miko nggak nemu itu… coba kata lain~';list.appendChild(d);return}
  let g=null;
  items.forEach((it,i)=>{
    if(!q&&it.g!==g){g=it.g;const h=document.createElement('div');h.className='pg';h.textContent=g;list.appendChild(h)}
    const b=document.createElement('button');b.type='button';b.className='pi'+(i===palSel?' on':'');b.textContent=it.t;b.onclick=()=>palRun(i);
    if(q&&it.g){const sm=document.createElement('small');sm.textContent=it.g;b.appendChild(sm)}
    list.appendChild(b);
  });
  const on=list.querySelector('.pi.on');if(on&&on.scrollIntoView)on.scrollIntoView({block:'nearest'});
}
function palRun(i){const it=palList[i];if(!it)return;if(it.keep){it.run();$('palq').focus();return}closePal();setTimeout(it.run,80)}
function openPal(){palSel=0;$('palq').value='';$('palm').classList.add('show');palRender();$('palq').focus()}
function closePal(){$('palm').classList.remove('show');$('palq').blur()}
$('b-pal').onclick=openPal;
$('palm').addEventListener('click',e=>{if(e.target.id==='palm')closePal()});
$('palq').addEventListener('input',()=>{palSel=0;palRender()});
$('palq').addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();palSel=(palSel+(e.key==='ArrowDown'?1:-1)+palList.length)%Math.max(palList.length,1);palRender()}
  else if(e.key==='Enter'){e.preventDefault();palRun(palSel)}
  else if(e.key==='Escape')closePal();
});
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&!e.altKey&&e.key.toLowerCase()==='k'){e.preventDefault();$('palm').classList.contains('show')?closePal():openPal()}
},true);
