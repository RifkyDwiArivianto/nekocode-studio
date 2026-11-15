/* Penerjemah JSX/TypeScript (Babel, dimuat saat dibutuhkan) dan bingkai perangkat */
import { $ } from './util.js';
import { miko } from './miko.js';
import { S } from './state.js';
import { ext } from './editor.js';
import { log } from './preview.js';

/* ---------- Penerjemah JSX/TypeScript (Babel, dimuat saat dibutuhkan) + bingkai perangkat ---------- */
export const NK_TX=/\.(jsx|tsx?)$/i;
export const NK_GLOB={react:'React','react-dom':'ReactDOM','react-dom/client':'ReactDOM',vue:'Vue'};
let babelState=0;
export function nkCompile(name,code){
  const B=window.Babel;if(!B)throw new Error('Penerjemah belum dimuat');
  const e=ext(name),ts=e==='ts'||e==='tsx',jsx=e==='jsx'||e==='tsx',presets=[];
  if(ts)presets.push(['typescript',{isTSX:jsx,allExtensions:true}]);
  if(jsx)presets.push(['react',{runtime:'classic'}]);
  return B.transform(code,{filename:name,presets,sourceType:'module'}).code;
}
export function ensureBabel(cb){
  if(window.Babel||!S.cur||!S.cur.files.some(f=>NK_TX.test(f.n)))return false;
  if(babelState)return true;
  babelState=1;miko('Memuat penerjemah JSX/TypeScript sebentar ya~','think');
  const sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/@babel/standalone@7/babel.min.js';
  sc.onload=()=>{babelState=0;miko('Penerjemah siap! Menjalankan lagi~','happy');cb()};
  sc.onerror=()=>{babelState=0;log('error','Gagal memuat penerjemah JSX/TypeScript. Butuh koneksi internet untuk pertama kali.')};
  document.head.appendChild(sc);return true;
}
export function fitDev(){
  const w=$('wrap'),dv=$('dv'),f=$('ifr');if(!w||!dv)return;
  if(S.devMode==='r'){dv.className='';dv.style.cssText='';f.style.cssText='';w.classList.remove('dvm');return}
  const dw=S.devMode==='m'?375:768,dh=S.devMode==='m'?667:1024,b=10,aw=w.clientWidth-16,ah=w.clientHeight-16;
  if(aw<=0||ah<=0)return;
  const k=Math.max(.2,Math.min(1,(aw-2*b)/dw,(ah-2*b)/dh));
  w.classList.add('dvm');dv.className='dev'+(S.devMode==='t'?' tab':'');
  dv.style.width=(dw*k+2*b)+'px';dv.style.height=(dh*k+2*b)+'px';
  f.style.cssText='position:absolute;left:'+b+'px;top:'+b+'px;width:'+dw+'px;height:'+dh+'px;transform:scale('+k+');transform-origin:0 0';
}
