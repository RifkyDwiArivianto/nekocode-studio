/* Panel Network dan backend tiruan (mock.json) */
import { $, esc } from './util.js';
import { LINES, MOOD, miko, mikoSay } from './miko.js';
import { mnavTo } from './palette.js';
import { S } from './state.js';
import { touch } from './storage.js';
import { fo, showFile } from './editor.js';
import { log } from './preview.js';

/* ---------- Network + backend tiruan (mock.json) ---------- */
function nkNetClient(M){
  var F=window.fetch,id=0;if(!F)return;
  function post(o){try{parent.postMessage(Object.assign({type:'NEKO_NET'},o),'*')}catch(e){}}
  function rx(s){return s.replace(/[.*+?^$(){}|[\]\\]/g,'\\$&')}
  function route(m,u){
    var p=u.replace(/^[a-z][a-z0-9+.-]*:\/\/[^\/]+/i,'').split(/[?#]/)[0]||'/';
    for(var k in M){
      var s=k.split(/\s+/),mt=s.length>1?s[0].toUpperCase():'*',pat=s.length>1?s.slice(1).join(' '):k,names=[];
      if(mt!=='*'&&mt!==m)continue;
      var re=new RegExp('^'+rx(pat).replace(/:(\w+)/g,function(_,n){names.push(n);return '([^/]+)'})+'/?$');
      var x=re.exec(p)||re.exec(u.split(/[?#]/)[0]);
      if(x){var par={};names.forEach(function(n,i){par[n]=decodeURIComponent(x[i+1])});return{spec:M[k],par:par}}
    }
    return null;
  }
  function fill(v,par){
    if(typeof v==='string'&&v.charAt(0)===':'&&par.hasOwnProperty(v.slice(1))){var q=par[v.slice(1)];return q!==''&&!isNaN(q)?Number(q):q}
    if(Array.isArray(v))return v.map(function(x){return fill(x,par)});
    if(v&&typeof v==='object'){var o={};for(var k in v)o[k]=fill(v[k],par);return o}
    return v;
  }
  window.fetch=function(input,init){
    var u=typeof input==='string'?input:(input&&input.url)||String(input),
        m=((init&&init.method)||(input&&input.method)||'GET').toUpperCase(),t0=Date.now(),n=++id,r=route(m,u);
    if(r){
      var sp=r.spec,isS=sp&&typeof sp==='object'&&!Array.isArray(sp)&&('body' in sp||'status' in sp||'delay' in sp||'headers' in sp);
      var st=(isS&&+sp.status)||200,body=fill(isS?sp.body:sp,r.par),dl=isS&&sp.delay!=null?+sp.delay||0:200;
      var txt=typeof body==='string'?body:JSON.stringify(body===undefined?null:body);
      return new Promise(function(res){setTimeout(function(){
        post({id:n,method:m,url:u,status:st,ms:Date.now()-t0,mock:1,body:txt.slice(0,1500)});
        res(new Response(st===204||st===205||st===304?null:txt,{status:st,headers:Object.assign({'Content-Type':typeof body==='string'?'text/plain':'application/json'},isS&&sp.headers||{})}));
      },dl)});
    }
    return F.apply(this,arguments).then(function(res){
      res.clone().text().then(function(t){post({id:n,method:m,url:u,status:res.status,ms:Date.now()-t0,body:t.slice(0,1500)})},function(){post({id:n,method:m,url:u,status:res.status,ms:Date.now()-t0})});
      return res;
    },function(e){post({id:n,method:m,url:u,status:0,ms:Date.now()-t0,err:String(e&&e.message||e)});throw e});
  };
}
let mockBadSig='',netErrSaid=false,netMockSaid=false;
export function nkNetHook(){
  const f=S.cur&&S.cur.files.find(x=>x.n==='mock.json');let mocks='{}';
  if(f){try{JSON.parse(f.c);mocks=f.c}catch(e){if(mockBadSig!==f.c){mockBadSig=f.c;setTimeout(()=>log('warn','mock.json bukan JSON yang valid, jadi diabaikan.'),300)}}}
  return '<script>('+nkNetClient.toString()+')('+mocks.replace(/<\/script/gi,'<\\/script').replace(/<!--/g,'<\\!--')+');<\/script>';
}
Object.assign(LINES,{net_err:['Request {u} gagal ({s}). Cek alamatnya, atau buat mock.json biar Miko yang jawab~','Hmm, {u} balasnya {s}. Coba lihat tab Network, Senpai!'],net_mock:['Request itu Miko jawab pakai data tiruan dari mock.json~','Mock aktif! Frontend-mu bisa jalan tanpa server 🐾']});
Object.assign(MOOD,{net_err:'worry',net_mock:'happy'});
export function mkMakeMock(){
  if(fo('mock.json')){mnavTo('code');showFile('mock.json');return}
  S.cur.files.push({n:'mock.json',c:JSON.stringify({'GET /api/users':[{id:1,name:'Miko'},{id:2,name:'Neko'}],'GET /api/users/:id':{id:':id',name:'Pengguna'},'POST /api/login':{status:200,delay:600,body:{token:'abc123'}}},null,2)});
  touch();mnavTo('code');showFile('mock.json');miko('mock.json dibuat! Tiap rute di situ akan Miko jawab saat kodemu memanggil fetch~','happy');
}
function netEmpty(){
  const d=document.createElement('div');d.className='ne';
  const has=S.cur&&fo('mock.json');
  d.textContent=has?'Belum ada request. mock.json aktif: rute di dalamnya dijawab Miko.':'Belum ada request. Panggil fetch(\'/api/…\') di kodemu, atau pakai mock.json sebagai backend tiruan.';
  const b=document.createElement('button');b.type='button';b.textContent=has?'Buka mock.json':'Buat mock.json (backend tiruan)';b.onclick=mkMakeMock;d.appendChild(b);return d;
}
export function netReset(){const c=$('net');if(!c)return;c.textContent='';c.appendChild(netEmpty());c.dataset.empty='1';S.netCount=0;netErrSaid=netMockSaid=false;const n=$('net-n');if(n)n.classList.add('hide')}
export function conTab(t){$('logs').classList.toggle('hide',t!=='c');$('net').classList.toggle('hide',t!=='n');$('ct-c').classList.toggle('on',t==='c');$('ct-n').classList.toggle('on',t==='n')}
export function netAdd(d){
  const c=$('net');if(c.dataset.empty!=='0'){c.textContent='';c.dataset.empty='0'}
  const method=String(d.method||'GET').slice(0,8),url=String(d.url||'').slice(0,300),status=+d.status||0,ms=+d.ms||0;
  const bad=!!d.err||status<200||status>=400;
  let u=url;try{if(/^https?:/i.test(u)){const x=new URL(u);u=x.host+x.pathname}}catch(e){}
  const row=document.createElement('div');row.className='nr';
  const head=document.createElement('button');head.type='button';head.className='nh';
  head.innerHTML='<b class="m">'+esc(method)+'</b><span class="u">'+esc(u)+'</span>'+(d.mock?'<i class="mk">MOCK</i>':'')+'<em class="'+(bad?'bad':'ok')+'">'+(d.err?'ERR':status)+'</em><small>'+ms+'ms</small>';
  const det=document.createElement('pre');det.className='nd hide';
  let body=d.err?String(d.err):String(d.body||'(tanpa isi)');
  if(!d.err){try{body=JSON.stringify(JSON.parse(body),null,2)}catch(e){}}
  det.textContent=body.slice(0,2000);
  head.onclick=()=>det.classList.toggle('hide');
  row.append(head,det);c.appendChild(row);
  while(c.children.length>100)c.removeChild(c.firstChild);
  c.scrollTop=c.scrollHeight;
  if($('net').classList.contains('hide')){S.netCount++;const n=$('net-n');n.textContent=S.netCount;n.classList.remove('hide')}
  if(bad&&!netErrSaid){netErrSaid=true;mikoSay('net_err',{u:u.slice(0,40),s:d.err?'gagal terhubung':status})}
  else if(d.mock&&!netMockSaid){netMockSaid=true;mikoSay('net_mock')}
}
