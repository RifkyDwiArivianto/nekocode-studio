/* Titik masuk: gaya + boot aplikasi */
import './styles/index.css';
import { ls } from './modules/util.js';
import { greet, miko } from './modules/miko.js';
import { F, TEMPLATES } from './modules/templates.js';
import { S } from './modules/state.js';
import { dbPut, idb, mkProject, norm, tx } from './modules/storage.js';
import { loadProject } from './modules/editor.js';
import { init } from './modules/ui.js';

/* ---------- Boot ---------- */
(async function(){
  init();
  try{S.db=await idb();S.projects=(await tx('readonly',s=>s.getAll())||[]).map(norm)}catch(e){S.db=null;miko('Penyimpanan browser tidak tersedia, jangan lupa Cadangkan ya 😿')}
  try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
  if(!S.projects.length){
    const old=ls.get('neko_code');   /* migrasi dari versi lama */
    const p=mkProject(old?'Proyek lama':'Proyek Baru',old?{ls:false,files:[F('index.html',old)]}:TEMPLATES.kosong);
    S.projects.push(p);await dbPut(p);
  }
  const last=ls.get('nk_last');
  loadProject(S.projects.find(p=>p.id===last)||[...S.projects].sort((a,b)=>b.updated-a.updated)[0]);
  setTimeout(greet,700);
})();
