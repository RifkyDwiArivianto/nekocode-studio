/* Editor CodeMirror: state per file, tab, tambah/hapus file */
import { $, I, esc, ls } from './util.js';
import { S } from './state.js';
import { miko, mkWatch, userActive } from './miko.js';
import { mkSearchPhrases } from './palette.js';
import { touch } from './storage.js';
import { mkEmmet } from './emmet.js';
import { applySandbox, run } from './preview.js';
import { saveFile } from './actions.js';
import { L } from '../lib.js';

/* ---------- Editor ---------- */
export const HEAD=/<head(?=[\s>])[^>]*>/i; /* bukan <header> */
export const wrapComp=new L.Compartment();
export const ext=n=>((n.match(/\.([^.]+)$/)||[])[1]||'').toLowerCase();
export const isHtml=n=>/\.html?$/i.test(n);
export const fo=n=>S.cur.files.find(f=>f.n===n);
const langFor=n=>{const e=ext(n);return e==='html'||e==='htm'?[L.html()]:e==='css'?[L.css()]:['js','mjs','json'].includes(e)?[L.javascript()]:['jsx','ts','tsx'].includes(e)?[L.javascript({jsx:e!=='ts',typescript:e!=='jsx'})]:[]};
function mkState(doc,name){
  const ex=[...mkSearchPhrases(),L.lineNumbers(),L.history(),L.drawSelection(),L.highlightActiveLine(),L.indentOnInput(),L.bracketMatching(),L.closeBrackets(),L.autocompletion(),L.highlightSelectionMatches(),
    L.keymap.of([{key:'Tab',run:mkEmmet},...L.closeBracketsKeymap,...L.defaultKeymap,...L.searchKeymap,...L.historyKeymap,...L.completionKeymap,L.indentWithTab,
      {key:'Mod-Enter',run:()=>{run();return true}},{key:'Mod-s',run:()=>{saveFile();return true}}]),
    ...langFor(name),L.oneDark,
    L.EditorView.updateListener.of(u=>{if(u.docChanged){const f=fo(name);if(f){f.c=u.state.doc.toString();info(u.state);touch();userActive();mkWatch(u,name)}}})];
  ex.push(wrapComp.of(S.wrapOn?L.EditorView.lineWrapping:[]));
  return L.EditorState.create({doc,extensions:ex});
}
const info=st=>{$('info').textContent=S.kind+' · '+st.doc.lines+' baris'};
function renderTabs(){
  const many=S.cur.files.length>1;
  $('tabs').innerHTML=S.cur.files.map(f=>`<button class="tab mono${f.n===S.kind?' on':''}" data-k="${esc(f.n)}">${esc(f.n)}${f.n===S.kind&&many?'<span class="tx" title="Hapus file ini">'+I('x')+'</span>':''}</button>`).join('')+`<button class="tab add" data-add="1" title="Tambah file">${I('plus')}</button>`;
  const on=$('tabs').querySelector('.tab.on');if(on)$('tabs').scrollLeft=Math.max(0,on.offsetLeft-24);
}
export function showFile(n){
  if(S.view&&S.kind&&fo(S.kind))S.states[S.kind]=S.view.state;
  S.kind=n;
  const st=S.states[n]||mkState(fo(n).c,n);
  S.view.setState(st);info(st);renderTabs();
  S.view.scrollDOM.scrollTop=0;
}
export function loadProject(p){S.featPrev={};S.accIns=0;S.accDel=0;
  S.cur=p;S.states={};ls.set('nk_last',p.id);
  $('pn-t').textContent=p.name;$('ls').checked=!!p.ls;
  S.kind='';showFile(p.files[0].n);applySandbox();run(true);
}
export function replaceDoc(text){S.view.dispatch({changes:{from:0,to:S.view.state.doc.length,insert:text},selection:{anchor:0}})}
export function addFile(){
  const n=(prompt('Nama file baru (contoh: style.css, app.js, about.html):','')||'').trim();
  if(!n)return;
  if(!/^[\w\-. ]+\.(html?|css|m?js|jsx|tsx?|json|txt)$/i.test(n)){alert('Nama tidak valid. Pakai huruf/angka tanpa garis miring, dan akhiri dengan .html, .css, .js, .json, atau .txt');return}
  if(fo(n)){alert('File itu sudah ada.');return}
  S.cur.files.push({n,c:isHtml(n)?'<!DOCTYPE html>\n<html lang="id">\n<head>\n  <meta charset="UTF-8">\n  <title>'+n+'</title>\n</head>\n<body>\n\n</body>\n</html>':''});
  touch();showFile(n);
  miko(ext(n)==='css'?'File CSS dibuat. Pasang <link rel="stylesheet" href="'+n+'"> di HTML ya~':/^m?js$/.test(ext(n))?'File JS dibuat. Pasang <script src="'+n+'"> di HTML ya~':'File dibuat desu!');
}
export function delFile(){
  if(S.cur.files.length<2)return;
  const n=S.kind;
  if(!confirm('Hapus "'+n+'" dari proyek ini?'))return;
  S.cur.files=S.cur.files.filter(f=>f.n!==n);delete S.states[n];S.kind='';
  touch();showFile(S.cur.files[0].n);miko('File '+n+' dihapus.');
}
