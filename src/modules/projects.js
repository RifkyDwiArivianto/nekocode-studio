/* Proyek, cadangan, dan validasi data impor */
import { $, I, esc, ls, uid } from './util.js';
import { miko } from './miko.js';
import { S } from './state.js';
import { dbPut, flush, norm } from './storage.js';
import { loadProject } from './editor.js';
import { dl } from './actions.js';

/* ---------- Proyek, cadangan ---------- */
export function bkInfo(){const bk=+ls.get('nk_backup')||0;$('bkinfo').textContent=bk?'Terakhir dicadangkan: '+new Date(bk).toLocaleDateString('id-ID'):'Belum pernah dicadangkan'}
export function renderList(){
  bkInfo();
  $('plist').innerHTML=[...S.projects].sort((a,b)=>b.updated-a.updated).map(p=>`<div class="row${p.id===S.cur.id?' cur':''}" data-id="${esc(p.id)}"><div class="nm"><b>${esc(p.name)}</b><small>${p.files.length} file · ${new Date(p.updated).toLocaleString('id-ID',{dateStyle:'short',timeStyle:'short'})}</small></div><button data-a="open">Buka</button><button data-a="ren" title="Ganti nama">${I('edit')}</button><button data-a="del" title="Hapus">${I('trash')}</button></div>`).join('');
}
export const openProj=()=>{renderList();$('m-proj').classList.add('show')};
export async function backup(){
  await flush();
  dl('nekocode-cadangan-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify({app:'nekocode',v:1,projects:S.projects}),'application/json');
  ls.set('nk_backup',Date.now());renderList();miko('Cadangan diunduh, simpan baik-baik ya! 💾');
}
/* data impor tidak tepercaya: bentuk dan tipe divalidasi, ls selalu false */
function cleanProject(p){
  if(!p||typeof p!=='object'||!Array.isArray(p.files))return null;
  const files=p.files.filter(f=>f&&typeof f.n==='string'&&typeof f.c==='string'&&f.n.length>0&&f.n.length<=100&&!/[\/\\\x00-\x1f]/.test(f.n)).map(f=>({n:f.n,c:f.c}));
  if(!files.length)return null;
  return{id:/^p[a-z0-9]{3,30}$/.test(p.id)?p.id:uid(),name:String(p.name||'Proyek').slice(0,40),ls:false,updated:+p.updated||Date.now(),files};
}
export async function restore(file){
  if(!file)return;
  try{
    const data=JSON.parse(await file.text());
    if(data.app!=='nekocode'||!Array.isArray(data.projects))throw 0;
    let n=0;
    let reload=false;
    for(const raw of data.projects){
      if(!raw||typeof raw!=='object'||!raw.files)continue;
      const p=cleanProject(norm(raw));if(!p)continue;
      const ex=S.projects.find(x=>x.id===p.id);
      if(ex){if(p.updated<=ex.updated)continue;Object.assign(ex,p,{ls:ex.ls});if(S.cur&&ex.id===S.cur.id)reload=true}else S.projects.push(p);
      await dbPut(ex||p);n++;
    }
    if(reload)loadProject(S.cur);
    renderList();miko(n+' proyek dipulihkan desu! 📦');
  }catch(e){miko('File cadangan tidak valid 😿')}
}
