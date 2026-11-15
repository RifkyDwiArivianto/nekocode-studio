/* Modul ES antar-file (import/export) untuk preview */
import { S } from './state.js';
import { ext, fo } from './editor.js';
import { NK_GLOB, NK_TX, nkCompile } from './transpile.js';
import { L } from '../lib.js';

/* ---------- Modul ES antar-file (import/export) ---------- */
const nkNorm=p=>{const o=[];for(const x of String(p).split('/')){if(x==='..')o.pop();else if(x&&x!=='.')o.push(x)}return o.join('/')};
const nkRel=sp=>/^\.{0,2}\//.test(sp);
const nkFind=sp=>{const n=nkNorm(sp);return [n,n+'.js',n+'.mjs',n+'.jsx',n+'.tsx',n+'.ts',n+'/index.js'].find(c=>S.cur.files.some(f=>f.n===c))||null};
export const nkHasImports=c=>/\bfrom\s*['"]\.{1,2}\/|\bimport\s*['"]\.{1,2}\//.test(c);
function nkTransform(code,deps){
  let n=0;const tail=[];
  const reqE=spec=>{
    if(nkRel(spec)){const r=nkFind(spec);if(r){deps.push(r);return 'await __req('+JSON.stringify(r)+')'}return 'await __req('+JSON.stringify('?'+spec)+')'}
    if(NK_GLOB[spec])return 'await (function(){var g=window.'+NK_GLOB[spec]+';if(!g)throw new Error('+JSON.stringify('"'+spec+'" belum dimuat. Tambahkan <script> CDN-nya di HTML.')+');return Object.assign({default:g},g)})()';
    return 'await import('+JSON.stringify(spec)+')';
  };
  const bind=x=>x.split(',').map(t=>t.trim()).filter(Boolean).map(t=>{const m=t.match(/^([\w$]+)\s+as\s+([\w$]+)$/);return m?m[1]+':'+m[2]:t}).join(',');
  code=code.replace(/(^|[\n;}])([ \t]*)import\s*(?:([\w$]+)\s*,?\s*)?(?:\{([^}]*)\}|\*\s*as\s+([\w$]+))?\s*(?:from\s*)?(['"])([^'"\n]+)\6[ \t]*;?/g,
    (m,pre,sp,def,named,ns,q,spec)=>{
      const v='__m'+(n++);let o=pre+sp+'const '+v+'='+reqE(spec)+';';
      if(def)o+='const '+def+'='+v+'.default;';
      if(named)o+='const {'+bind(named)+'}='+v+';';
      if(ns)o+='const '+ns+'='+v+';';
      return o;
    });
  code=code.replace(/(^|[\n;}])([ \t]*)export\s+default\s+(async\s+function\*?|function\*?|class)\s+([\w$]+)/g,(m,pre,sp,kw,nm)=>{tail.push('__exp.default='+nm+';');return pre+sp+kw+' '+nm});
  code=code.replace(/(^|[\n;}])([ \t]*)export\s+default\s+/g,(m,pre,sp)=>pre+sp+'__exp.default=');
  code=code.replace(/(^|[\n;}])([ \t]*)export\s+(async\s+function\*?|function\*?|class)\s+([\w$]+)/g,(m,pre,sp,kw,nm)=>{tail.push('__exp.'+nm+'='+nm+';');return pre+sp+kw+' '+nm});
  code=code.replace(/(^|[\n;}])([ \t]*)export\s+(const|let|var)\s+([\w$]+)/g,(m,pre,sp,kw,nm)=>{tail.push('__exp.'+nm+'='+nm+';');return pre+sp+kw+' '+nm});
  code=code.replace(/(^|[\n;}])([ \t]*)export\s*\{([^}]*)\}\s*(?:from\s*(['"])([^'"\n]+)\4)?[ \t]*;?/g,(m,pre,sp,list,q,spec)=>{
    const it=list.split(',').map(t=>t.trim()).filter(Boolean).map(t=>{const mm=t.match(/^([\w$]+)(?:\s+as\s+([\w$]+))?$/);return mm?[mm[1],mm[2]||mm[1]]:null}).filter(Boolean);
    if(spec){const v='__m'+(n++);return pre+sp+'{const '+v+'='+reqE(spec)+';'+it.map(i=>'__exp.'+i[1]+'='+v+'.'+i[0]+';').join('')+'}'}
    it.forEach(i=>tail.push('__exp.'+i[1]+'='+i[0]+';'));return pre+sp;
  });
  code=code.replace(/(^|[\n;}])([ \t]*)export\s*\*\s*from\s*(['"])([^'"\n]+)\3[ \t]*;?/g,(m,pre,sp,q,spec)=>pre+sp+'Object.assign(__exp,'+reqE(spec)+');');
  return code+'\n'+tail.join('');
}
export function nkBundle(entryCode,entryName,hook){
  const seen={},parts=[],J=JSON.stringify;
  function emit(name,src){
    if(NK_TX.test(name)){try{src=nkCompile(name,src)}catch(e){src='throw new Error('+J('Kesalahan di '+name+': '+String(e.message).split('\n')[0])+')'}}
    const d=[],t=nkTransform(src,d);
    let w='__M['+J(name)+']=async function(__exp){\n'+t+'\n};';
    if(hook){try{w=L.guard(w,false)}catch(e){}}
    parts.push(w);
    d.forEach(x=>{if(seen[x])return;seen[x]=1;const f=fo(x),e=ext(x);
      if(e==='css')parts.push('__M['+J(x)+']=async function(){var s=document.createElement("style");s.textContent='+J(f.c)+';document.head.appendChild(s)};');
      else if(e==='json')parts.push('__M['+J(x)+']=async function(e){e.default=JSON.parse('+J(f.c)+')};');
      else emit(x,f.c);
    });
  }
  seen[entryName]=1;emit(entryName,entryCode);
  return 'var __M={},__C={};async function __req(n){var c=__C[n];if(c)return c.e;if(n.charAt(0)==="?")throw new Error("Modul "+n.slice(1)+" tidak ada di proyek ini");c=__C[n]={e:{}};var f=__M[n];if(!f)throw new Error("Modul tidak ditemukan: "+n);await f(c.e);return c.e}\n'+parts.join('\n')+'\n__req('+J(entryName)+').catch(function(e){console.error(e&&e.message?e.message:e)});';
}
