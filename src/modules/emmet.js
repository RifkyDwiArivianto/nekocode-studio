/* Emmet ringan (Tab di file HTML) */
import { S } from './state.js';
import { isHtml } from './editor.js';

/* ---------- Emmet ringan (Tab di file HTML) ---------- */
const EM_VOID=/^(img|input|br|hr|meta|link|area|base|col|embed|source|track|wbr)$/;
const EM_TAGS=new Set('div p ul ol li a span h1 h2 h3 h4 h5 h6 img input button form section header footer nav main table tr td th thead tbody label select option textarea article aside small strong em i b br hr pre code canvas video audio iframe svg script style link meta title body head html figure figcaption details summary dialog blockquote'.split(' '));
const EM_DEF={a:{href:''},img:{src:'',alt:''},input:{type:'text'},link:{rel:'stylesheet',href:''},script:{src:''},form:{action:''}};
function emSplit(t,ch){const out=[];let d=0,c='';for(const x of t){if(x==='['||x==='{')d++;else if(x===']'||x==='}')d--;if(x===ch&&!d){out.push(c);c=''}else c+=x}out.push(c);return out}
function emNode(t){
  const m=t.match(/^([a-zA-Z][\w-]*)?((?:[#.][\w$-]+)*)((?:\[[^\]]*\])*)(\{[^}]*\})?(\*\d+)?$/);
  if(!m||(!m[1]&&!m[2]&&!m[3]&&!m[4]))return null;
  const o={tag:m[1]||'div',id:'',cls:[],attrs:[],text:m[4]?m[4].slice(1,-1):null,n:m[5]?Math.min(+m[5].slice(1),50):1,kids:[]};
  (m[2].match(/[#.][\w$-]+/g)||[]).forEach(x=>x[0]==='#'?o.id=x.slice(1):o.cls.push(x.slice(1)));
  (m[3].match(/\[[^\]]*\]/g)||[]).forEach(b=>{for(const q of b.slice(1,-1).matchAll(/([\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"']+)))?/g))o.attrs.push([q[1],q[2]??q[3]??q[4]??''])});
  return o;
}
function emEl(nd,ind,k){
  const S=x=>x.replace(/\$+/g,m=>String(k).padStart(m.length,'0'));
  const at=[];
  if(nd.id)at.push(['id',S(nd.id)]);
  if(nd.cls.length)at.push(['class',nd.cls.map(S).join(' ')]);
  nd.attrs.forEach(a=>at.push([a[0],S(a[1])]));
  const df=EM_DEF[nd.tag]||{};Object.keys(df).forEach(d=>{if(!at.some(a=>a[0]===d))at.push([d,df[d]])});
  const open='<'+nd.tag+at.map(a=>' '+a[0]+'="'+a[1]+'"').join('')+'>';
  if(EM_VOID.test(nd.tag))return ind+open+'\n';
  if(nd.kids.length)return ind+open+'\n'+emRender(nd.kids,ind+'  ')+ind+'</'+nd.tag+'>\n';
  return ind+open+(nd.text!=null?S(nd.text):'\u0000')+'</'+nd.tag+'>\n';
}
function emRender(list,ind){let o='';list.forEach(nd=>{for(let k=1;k<=nd.n;k++)o+=emEl(nd,ind,k)});return o}
function emExpand(ab){
  if(ab==='!'||ab==='html:5')return '<!DOCTYPE html>\n<html lang="id">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Dokumen</title>\n</head>\n<body>\n  \u0000\n</body>\n</html>';
  const lv=emSplit(ab,'>').map(l=>emSplit(l,'+').map(emNode));
  if(lv.some(l=>l.some(x=>!x)))return null;
  if(lv.length===1&&lv[0].length===1){const n=lv[0][0];if(!n.id&&!n.cls.length&&!n.attrs.length&&n.text==null&&n.n===1&&!EM_TAGS.has(n.tag))return null}
  for(let i=1;i<lv.length;i++){const pr=lv[i-1];pr[pr.length-1].kids=lv[i]}
  return emRender(lv[0],'').replace(/\n$/,'');
}
export function mkEmmet(v){
  const st=v.state,r=st.selection.main;
  if(!r.empty||!isHtml(S.kind))return false;
  const line=st.doc.lineAt(r.head),before=line.text.slice(0,r.head-line.from),m=before.match(/(\S+)$/);
  if(!m||m[1].includes('<'))return false;
  const pre=st.doc.sliceString(Math.max(0,r.head-20000),r.head);
  for(const t of ['script','style'])if(pre.lastIndexOf('<'+t)>pre.lastIndexOf('</'+t))return false;
  const ex=emExpand(m[1]);if(!ex)return false;
  const ind=before.match(/^\s*/)[0];
  let txt=ex.split('\n').map((l,i)=>i?ind+l:l).join('\n');
  const mk=txt.indexOf('\u0000'),pos=mk<0?txt.length:mk;txt=txt.replace(/\u0000/g,'');
  const from=r.head-m[1].length;
  v.dispatch({changes:{from,to:r.head,insert:txt},selection:{anchor:from+pos},scrollIntoView:true,userEvent:'input'});
  return true;
}
