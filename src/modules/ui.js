/* UI: tab layar, bar simbol, event handler, init */
import { $, I, esc, ls } from './util.js';
import { miko } from './miko.js';
import { S } from './state.js';
import { sfx } from './audio.js';
import { TEMPLATES } from './templates.js';
import { dbDel, dbPut, flush, mkProject, touch } from './storage.js';
import { addFile, delFile, loadProject, replaceDoc, showFile, wrapComp } from './editor.js';
import { mkEmmet } from './emmet.js';
import { conTab, netReset } from './network.js';
import { fitDev } from './transpile.js';
import { applySandbox, badge, merge, openHist, run, snap } from './preview.js';
import { THEMES, exportProject, exportZip, format, openFiles, saveFile, setTheme } from './actions.js';
import { backup, bkInfo, openProj, renderList, restore } from './projects.js';
import { L } from '../lib.js';

/* ---------- UI ---------- */
function setTab(t){
  S.tab=t;document.body.dataset.tab=t;
  document.querySelectorAll('.mt').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  if(t==='console'){S.errs=0;badge()}
  if(t!=='code'&&document.activeElement)document.activeElement.blur();
}
let baseH=0;
function syncVp(){
  const v=window.visualViewport,h=v?v.height:innerHeight;
  baseH=Math.max(baseH,innerHeight,h);
  document.documentElement.style.setProperty('--app-h',h+'px');
  document.documentElement.classList.toggle('kb',innerWidth<1024&&h<baseH*.78);
  if(v&&scrollY)scrollTo(0,0);
}
const SYM=[['⇥','  '],['<','<'],['>','>'],['/','/'],['"','""',1],["'","''",1],['=','='],['{ }','{}',1],['( )','()',1],['[ ]','[]',1],[';',';'],[':',':'],['#','#'],['class','class=""',1],['div','<div></div>',6],['</>','</>']];
export function init(){
  S.view=new L.EditorView({parent:$('cm'),state:L.EditorState.create({doc:''})});
  const TOOLS=[['undo','Undo','undo'],['redo','Redo','redo'],['//','Komentar','toggleComment'],['indent','Geser kanan','indentMore'],['outdent','Geser kiri','indentLess'],['dupl','Duplikat baris','copyLineDown'],['search','Cari & ganti','openSearchPanel']];
  $('sym').innerHTML=TOOLS.map((x,i)=>`<button data-t="${i}" title="${x[1]}" class="tl mono">${x[0]==='//'?'//':I(x[0])}</button>`).join('')+'<span class="sep"></span>'+SYM.map((s,i)=>`<button data-i="${i}" class="mono">${esc(s[0])}</button>`).join('');
  let rep=false,tmr=0,ivl=0;const stopRep=()=>{clearTimeout(tmr);clearInterval(ivl)};
  const doTool=b=>{L[TOOLS[b.dataset.t][2]](S.view);S.view.focus()};
  $('sym').addEventListener('pointerdown',e=>{rep=false;stopRep();const b=e.target.closest('button[data-t]');if(!b||!TOOLS[b.dataset.t][3])return;tmr=setTimeout(()=>{rep=true;doTool(b);ivl=setInterval(()=>doTool(b),70)},350)});
  ['pointerup','pointercancel','pointerleave'].forEach(n=>$('sym').addEventListener(n,stopRep));
  $('sym').addEventListener('click',e=>{const b=e.target.closest('button[data-t]');if(!b)return;if(rep){rep=false;return}doTool(b)});
  $('sym').addEventListener('pointerdown',e=>{if(e.target.closest('button'))e.preventDefault()});
  $('sym').addEventListener('wheel',e=>{const y=e.deltaMode===1?e.deltaY*16:e.deltaY;if(Math.abs(y)>Math.abs(e.deltaX)){$('sym').scrollLeft+=y;e.preventDefault()}},{passive:false});
  $('sym').addEventListener('click',e=>{
    const b=e.target.closest('button[data-i]');if(!b)return;
    const s=SYM[b.dataset.i],r=S.view.state.selection.main;
    if(s[0]==='⇥'&&mkEmmet(S.view)){S.view.focus();return}
    S.view.dispatch({changes:{from:r.from,to:r.to,insert:s[1]},selection:{anchor:r.from+s[1].length-(s[2]||0)},scrollIntoView:true});S.view.focus();
  });
  $('tpl').innerHTML=Object.keys(TEMPLATES).map(k=>`<option value="${k}">${esc(TEMPLATES[k].n)}</option>`).join('');
  $('tabs').addEventListener('click',e=>{const b=e.target.closest('.tab');if(!b)return;if(e.target.closest('.tx'))delFile();else if(b.dataset.add)addFile();else if(b.dataset.k!==S.kind)showFile(b.dataset.k)});
  const sb=()=>{$('snd-u').setAttribute('href',S.sndOn?'#i-vol':'#i-mute');$('snd-t').textContent='Suara: '+(S.sndOn?'Nyala':'Mati')};sb();
  $('b-snd').onclick=()=>{S.sndOn=!S.sndOn;ls.set('nk_snd',S.sndOn?'1':'0');sb();sfx('click');miko(S.sndOn?'Suara dinyalakan desu! 🔊':'Suara dimatikan~ 🔇')};
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.id!=='b-run'&&b.id!=='b-snd'&&b.id!=='b-ref')sfx('click')});
  const menu=$('menu'),closeMenu=()=>menu.classList.remove('show');
  $('b-menu').onclick=e=>{e.stopPropagation();bkInfo();menu.classList.toggle('show')};
  menu.addEventListener('click',e=>{if(e.target.closest('button'))closeMenu()});
  document.addEventListener('click',e=>{if(!e.target.closest('#menu'))closeMenu()});
  $('b-zip').onclick=exportZip;$('b-exp').onclick=exportProject;
  $('b-theme').onclick=()=>{const c=document.documentElement.dataset.theme||'sakura',i=THEMES.findIndex(x=>x[0]===c);setTheme(THEMES[(i+1)%THEMES.length][0],true)};
  $('b-stop').onclick=()=>{$('ifr').srcdoc='<body style="font-family:sans-serif;padding:16px;color:#666">Preview dihentikan. Tekan RUN untuk menjalankan lagi.</body>';miko('Preview dihentikan.')};
  setTheme(ls.get('nk_theme')||'sakura');
  $('b-run').onclick=()=>{run();if(innerWidth<1024)setTab('preview')};
  $('b-ref').onclick=()=>run();
  $('b-save').onclick=saveFile;
  $('b-open').onclick=()=>$('fin').click();
  $('fin').onchange=e=>{openFiles(e.target.files);e.target.value=''};
  $('b-fmt').onclick=format;
  $('b-copy').onclick=async()=>{const t=S.view.state.doc.toString();try{await navigator.clipboard.writeText(t)}catch(e){const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove()}miko('Kode disalin ke clipboard desu!')};
  $('b-clr').onclick=()=>{if(confirm('Kosongkan '+S.kind+'? (masih bisa di-undo)')){replaceDoc('');miko('File dikosongkan!')}};
  $('ct-c').onclick=()=>conTab('c');$('ct-n').onclick=()=>{conTab('n');S.netCount=0;$('net-n').classList.add('hide')};
  $('b-cc').onclick=()=>{if(!$('net').classList.contains('hide')){netReset();return}$('logs').innerHTML='<div style="color:#6b7280;font-style:italic">Console dibersihkan.</div>'};
  $('b-full').onclick=()=>{$('ifr2').srcdoc=merge(true);$('m-full').classList.add('show')};
  const cf=()=>{$('ifr2').srcdoc='';$('m-full').classList.remove('show')};
  $('b-fclose').onclick=cf;
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){cf();closeMenu();$('m-new').classList.remove('show');$('m-hist').classList.remove('show');$('m-proj').classList.remove('show')}});
  $('seg').onclick=e=>{
    const b=e.target.closest('button');if(!b)return;
    [...$('seg').children].forEach(x=>x.classList.toggle('on',x===b));
    S.devMode=b.dataset.m;fitDev();
  };
  new ResizeObserver(fitDev).observe($('wrap'));
  document.querySelectorAll('.mt').forEach(b=>b.onclick=()=>setTab(b.dataset.t));
  $('m-close').onclick=()=>$('m-proj').classList.remove('show');
  $('m-proj').onclick=e=>{if(e.target===$('m-proj'))$('m-proj').classList.remove('show')};
  $('ls').onchange=()=>{S.cur.ls=$('ls').checked;touch();applySandbox();run(true)};
  $('b-new').onclick=async()=>{
    const k=$('tpl').value,tp=TEMPLATES[k],name=$('nname').value.trim()||(k==='kosong'?'Proyek Baru':tp.n.replace(/ \(.*\)$/,''));
    await flush();const p=mkProject(name,tp);S.projects.push(p);await dbPut(p);loadProject(p);$('m-new').classList.remove('show');
  };
  $('n-close').onclick=()=>$('m-new').classList.remove('show');
  $('m-new').onclick=e=>{if(e.target===$('m-new'))$('m-new').classList.remove('show')};
  $('b-projs').onclick=openProj;
  $('b-newp').onclick=()=>{$('nname').value='';$('m-new').classList.add('show')};
  const FS=[12,13,14,16,18],setFs=()=>{document.documentElement.style.setProperty('--cmfs',S.fsz+'px');$('fs-t').textContent='Ukuran huruf: '+S.fsz;S.view.requestMeasure()};
  $('b-fs').onclick=()=>{S.fsz=FS[(FS.indexOf(S.fsz)+1)%FS.length];ls.set('nk_fs',S.fsz);setFs()};
  setFs();
  const wl=()=>{$('wr-t').textContent='Lipat baris: '+(S.wrapOn?'Nyala':'Mati')};wl();
  $('b-wrap').onclick=()=>{
    S.wrapOn=!S.wrapOn;ls.set('nk_wrap',S.wrapOn?'1':'0');
    const e=wrapComp.reconfigure(S.wrapOn?L.EditorView.lineWrapping:[]);
    for(const k in S.states)S.states[k]=S.states[k].update({effects:e}).state;
    S.view.dispatch({effects:e});wl();
  };
  $('b-hist').onclick=openHist;
  $('h-close').onclick=()=>$('m-hist').classList.remove('show');
  $('m-hist').onclick=e=>{if(e.target===$('m-hist'))$('m-hist').classList.remove('show')};
  $('hlist').onclick=e=>{
    const r=e.target.closest('.row'),b=e.target.closest('button');if(!r||!b)return;
    const x=(S.cur.hist||[])[+r.dataset.i];
    if(!x||!confirm('Kembalikan proyek ke versi ini? Versi sekarang disimpan dulu di riwayat.'))return;
    snap();S.cur.files=JSON.parse(x.s).map(a=>({n:a[0],c:a[1]}));touch();
    $('m-hist').classList.remove('show');loadProject(S.cur);miko('Versi dikembalikan desu!');
  };
  $('plist').onclick=async e=>{
    const b=e.target.closest('button'),row=e.target.closest('.row');if(!b||!row)return;
    const p=S.projects.find(x=>x.id===row.dataset.id);if(!p)return;
    if(b.dataset.a==='open'){await flush();loadProject(p);$('m-proj').classList.remove('show')}
    else if(b.dataset.a==='ren'){const n=prompt('Nama baru:',p.name);if(n&&n.trim()){p.name=n.trim();p.updated=Date.now();await dbPut(p);if(p.id===S.cur.id)$('pn-t').textContent=p.name;renderList()}}
    else if(b.dataset.a==='del'){
      if(S.projects.length<2){alert('Minimal harus ada satu proyek.');return}
      if(!confirm('Hapus proyek "'+p.name+'"? Tidak bisa dikembalikan kecuali ada cadangan.'))return;
      S.projects=S.projects.filter(x=>x!==p);await dbDel(p.id);
      if(p.id===S.cur.id){const n=[...S.projects].sort((a,b)=>b.updated-a.updated)[0];loadProject(n)}
      renderList();
    }
  };
  $('b-bk').onclick=backup;
  $('b-rs').onclick=()=>$('rin').click();
  $('rin').onchange=e=>{restore(e.target.files[0]);e.target.value=''};
  if(window.visualViewport){visualViewport.addEventListener('resize',syncVp);visualViewport.addEventListener('scroll',syncVp)}
  addEventListener('resize',syncVp);
  addEventListener('orientationchange',()=>{baseH=0;setTimeout(syncVp,300)});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()});
  addEventListener('pagehide',flush);
  syncVp();
}
