/* Miko-chan: wajah, mood, bubble teks, statistik perjalanan, mata, colek, sapaan, pengingat istirahat */
import { $, ls } from './util.js';
import { S } from './state.js';
import { bump, mikoVoice, sfx, stopVoice } from './audio.js';

/* ---------- Miko: wajah, bubble, mood ---------- */
export const THEME=()=>document.documentElement.dataset.theme||'sakura';
export const LINES={
  ok:['Kode kamu berhasil di-run! ✨','Yatta! Jalan mulus desu~','Preview-nya cantik, Senpai! 🌸','Bersih, nggak ada error. Miko bangga~','Sugoi! Satu langkah lagi makin rapi.'],
  fixed:['Yatta! Error-nya hilang, Senpai hebat! 🎉','Nah, gitu dong! Dari merah jadi hijau~ ✨','Debug berhasil! Miko sampai lompat nih 🐾'],
  err:['Aww, ada error… tenang, kita cari bareng 😿','Semua dev pernah merah di console kok~','Hmm, ada yang nyangkut. Cek tab Console ya, Senpai!'],
  err3:['Sudah beberapa kali error ya… tarik napas dulu, Senpai 🍵','Kalau mentok, coba jalankan satu bagian saja dulu. Pelan-pelan nggak apa-apa~','Miko di sini kok. Istirahat semenit, nanti matanya lebih jernih 💗'],
  idle:['Senpai masih di sana? Miko nungguin nih~','Minum dulu yuk, kodenya nggak akan kabur 🐾','Zzz… eh, Miko ketiduran sebentar. Lanjut kapan, Senpai?'],
  poke:['Nyaa! Jangan dicolek terus~','Hehe, ada apa, Senpai?','Geli, tau! 😸','Miko di sini kok, lanjut ngoding yuk!'],
  easter:['Waaah! Miko jadi pusing muter-muter! 🌀 Sugoi!'],
  rest:['Sudah {n} menit ngoding! Regangkan badan sebentar, Senpai 🍵','{n} menit nonstop… minum air dulu yuk, Senpai 💧'],
  theme:['Tema {tema} aktif desu!'],
  c_log:['Pasang console.log? Detektif debug beraksi 🔍','Jejak log ditinggal… nanti jangan lupa dibersihkan ya~'],
  c_alert:['alert()? Popup bisa bikin pengunjung kaget lho~','Popup lagi? Coba pakai elemen di halaman, biar lebih halus.'],
  c_todo:['Ada TODO nih. Janji ke diri sendiri jangan ditinggal ya 📝'],
  c_anim:['@keyframes! Animasi ya? Miko suka yang gerak-gerak ✨'],
  c_grad:['Gradasi warna… cantik! 🌈'],
  c_dbg:['debugger! Kode akan berhenti di sini kalau DevTools terbuka.'],
  c_imp:['!important lagi? Itu jalan pintas; nanti CSS-nya susah dirawat.'],
  c_fetch:['Ambil data dari internet? Jangan lupa tangani kalau gagal, ya (try/catch).'],
  c_eval:['eval()? Miko deg-degan… itu berisiko, ada cara yang lebih aman.'],
  c_del:['Wah, bersih-bersih besar! Kalau menyesal, Ctrl+Z masih ada~','Banyak yang dihapus. Mulai ulang biar lebih rapi? Semangat!'],
  m_runs:['Run ke-{n}! Senpai sudah sejauh ini, Miko terharu 🎉','{n} kali run! Jari Senpai pasti makin lincah ✨'],
  m_fix:['{n} error sudah Senpai taklukkan! Debugger sejati 🏅','Error ke-{n} yang berhasil diberesin. Sugoi!'],
  m_streak:['Hari ke-{n} berturut-turut! Miko bangga banget 🔥','{n} hari tanpa putus. Konsisten itu keren, Senpai!'],
  habit_same:['Biasanya Senpai ngoding {part}, dan sekarang juga {part}. Konsisten ya~','Waktu {part} lagi, seperti biasa. Miko hafal kebiasaan Senpai 🐾'],
  habit_diff:['Tumben jam segini, biasanya Senpai ngoding {part}~','Wah, bukan waktu biasanya! Biasanya Senpai ngoding {part}.'],
  stats:['Total {r} run, {f} error teratasi, streak {s} hari. Miko catat semuanya 📒','Senpai sudah run {r} kali dan beresin {f} error. Hebat~']
};
const TL={
  cyber:{
    ok:['[OK] Eksekusi sukses. Tidak ada anomali, Senpai.','Compile bersih. Sistem stabil.'],
    fixed:['Patch diterapkan. Error teratasi. Kerja bagus.'],
    err:['[WARN] Anomali di console. Aku bantu lacak.','Exception terdeteksi. Cek Console, Senpai.'],
    err3:['Error berulang terdeteksi. Saran: jeda 1 menit, lalu trace dari baris pertama.'],
    idle:['Standby… menunggu input, Senpai.','Sistem idle. Aku tetap online.'],
    poke:['Sentuhan terdeteksi. Hai, Senpai.','Ping diterima. Pong.'],
    easter:['Rotasi penuh selesai. Gyroscope-ku baik-baik saja.'],
    rest:['Uptime {n} menit. Disarankan istirahat singkat.'],
    theme:['Tema {tema} aktif. Antarmuka diperbarui.'],
    c_log:['Telemetri dipasang. Jangan lupa dilepas sebelum rilis.'],
    c_alert:['alert() terdeteksi. Antarmuka jadi blocking, Senpai.'],
    c_todo:['Tugas tertunda terdeteksi. Masukkan ke antrean.'],
    c_imp:['Override !important. Rantai specificity jadi rapuh.'],
    c_eval:['PERINGATAN: eval() terdeteksi. Risiko injeksi tinggi.'],
    c_del:['Penghapusan massal dikonfirmasi. Undo masih tersedia.'],
    m_runs:['Eksekusi ke-{n} tercatat. Performa konsisten.'],
    m_fix:['{n} bug dieliminasi. Rekam jejak solid.'],
    m_streak:['Uptime beruntun {n} hari. Stabil.'],
    habit_same:['Pola terdeteksi: sesi {part}. Jadwal cocok.'],
    habit_diff:['Anomali jadwal. Biasanya sesi {part}.'],
    stats:['Log: {r} eksekusi, {f} bug fixed, streak {s} hari.']
  },
  akatsuki:{
    ok:['Hmph, jalan juga. Bukan berarti aku khawatir tadi.','Lumayan. Aku nggak akan bilang "bagus" dua kali.'],
    fixed:['C-cuma beres satu error aja… tapi ya, hebat sih. Sedikit.','Nah, begitu. Dari tadi harusnya bisa kan?'],
    err:['Cih, error. Tenang, aku bantu… bukan karena kamu spesial.','Kamu ceroboh, tapi ya sudah, kita benerin bareng.'],
    err3:['Sudah berkali-kali error… istirahat dulu sana. Aku bukan peduli, cuma bosan lihatnya.'],
    idle:['…Kamu ke mana? B-bukan berarti aku nungguin.','Hmph, ditinggal lagi.'],
    poke:['J-jangan sentuh sembarangan!','Apa sih? …Ya sudah, sekali lagi nggak apa-apa.'],
    easter:['KYAA! Berhenti muter-muterin aku!'],
    rest:['{n} menit nonstop? Istirahat sana, aku nggak mau kamu tumbang.'],
    theme:['Tema {tema}. Selera yang… lumayan.'],
    c_log:['Pasang log? Detektif amatir… ya, silakan.'],
    c_alert:['alert()? Serius? Menyebalkan buat pengunjung tahu.'],
    c_todo:['TODO itu bukan hiasan. Kerjakan.'],
    c_imp:['!important? Malas ya… hati-hati sendiri nanti.'],
    c_eval:['E-eval?! Kamu mau kodenya jebol?!'],
    c_del:['Dihapus semua? Ya sudah… tapi jangan nangis kalau butuh lagi.'],
    m_runs:['Run ke-{n}. …Lumayan tekun. Sedikit.'],
    m_fix:['{n} error beres. B-bukan berarti aku kagum.'],
    m_streak:['{n} hari berturut-turut… hmph, konsisten juga.'],
    habit_same:['{part} lagi, kan? Aku sudah hafal kebiasaanmu. …Bukan stalker!'],
    habit_diff:['Jam segini? Biasanya kan {part}. Ada apa?'],
    stats:['{r} run, {f} error beres, {s} hari beruntun. Aku cuma… ngitung kok.']
  }
};
export const MOOD={c_log:'think',c_alert:'think',c_todo:'think',c_anim:'happy',c_grad:'happy',c_dbg:'think',c_imp:'think',c_fetch:'think',c_eval:'worry',c_del:'shy',m_runs:'happy',m_fix:'happy',m_streak:'happy',habit_same:'happy',habit_diff:'think',stats:'happy',ok:'happy',fixed:'happy',err:'worry',err3:'worry',idle:'sleepy',poke:'shy',easter:'happy',rest:'sleepy',theme:'happy'};
let tWatch=0,lastTalk=0,lastCmt=0,cmtN={},lastLine='',idleN=0,tType=0,tHide=0,tMood=0,tIdle=0;
export const mkFace=()=>$('mk-face');
function setMood(m,hold){
  const f=mkFace();if(!f)return;f.dataset.m=m||'idle';clearTimeout(tMood);
  if(m&&m!=='idle')tMood=setTimeout(()=>{f.dataset.m='idle'},hold||6000);
}
export function mkLine(ev,vars){
  const pool=(TL[THEME()]||{})[ev]||LINES[ev];if(!pool)return ev;
  let t,k=0;do{t=pool[Math.floor(Math.random()*pool.length)]}while(t===lastLine&&pool.length>1&&++k<6);
  lastLine=t;return t.replace(/\{(\w+)\}/g,(_,x)=>(vars&&vars[x])||'');
}
export function miko(t,mood,auto){
  lastTalk=Date.now();
  const el=$('miko'),b=el.parentNode,f=mkFace();
  stopVoice();clearTimeout(tHide);
  if(mood)setMood(mood,auto?25000:6000);
  const s='"'+t+'"';el.textContent='';b.classList.add('show');
  const dur=mikoVoice(s,mood||(f&&f.dataset.m)||'idle',auto);
  tHide=setTimeout(()=>b.classList.remove('show'),Math.min(11000,3200+dur));
  if(!auto)userActive();
}
export function mikoSay(ev,vars,auto){miko(mkLine(ev,vars),MOOD[ev]||'happy',auto)}
function armIdle(){
  clearTimeout(tIdle);
  tIdle=setTimeout(()=>{if(document.hidden){armIdle();return}mikoSay('idle',null,true);idleN++;if(idleN<3)armIdle()},idleN?150000:90000);
}
export function userActive(){idleN=0;const f=mkFace();if(f&&f.dataset.m==='sleepy')setMood('idle');armIdle()}
/* ingatan perjalanan */
export const ST=(()=>{let d={runs:0,fixes:0,streak:0,best:0,last:'',hrs:[0,0,0,0],habit:''};try{Object.assign(d,JSON.parse(ls.get('nk_stats')||'{}'))}catch(e){}if(!Array.isArray(d.hrs)||d.hrs.length!==4)d.hrs=[0,0,0,0];return d})();
export const stSave=()=>ls.set('nk_stats',JSON.stringify(ST));
const dayKey=d=>d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
export const bucket=h=>h>=5&&h<11?0:h>=11&&h<17?1:h>=17&&h<21?2:3;
const PART=['pagi','siang','sore','malam'];
export const MS={runs:[10,50,100,250,500,1000],fixes:[5,25,100],streak:[3,7,14,30]};
/* mata mengikuti kursor / posisi mengetik */
let ptr={x:innerWidth/2,y:innerHeight/2},lookUntil=0,lookRaf=0,lookRaf2=0;
function aim(x,y){
  const f=mkFace();if(!f||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  const r=f.getBoundingClientRect(),dx=x-(r.left+r.width/2),dy=y-(r.top+r.height/2),d=Math.hypot(dx,dy)||1,k=Math.min(1,d/160);
  f.style.setProperty('--ex',(dx/d*1.8*k).toFixed(2)+'px');f.style.setProperty('--ey',(dy/d*1.2*k).toFixed(2)+'px');
}
['pointermove','pointerdown'].forEach(n=>addEventListener(n,e=>{ptr.x=e.clientX;ptr.y=e.clientY;if(Date.now()<lookUntil||lookRaf)return;lookRaf=requestAnimationFrame(()=>{lookRaf=0;aim(ptr.x,ptr.y)})},{passive:true}));
function mkLook(x,y,hold){lookUntil=Date.now()+hold;aim(x,y);setTimeout(()=>aim(ptr.x,ptr.y),hold+30)}
/* Miko membaca kode yang diketik */
const FEAT={log:/console\.log\s*\(/g,alert:/\balert\s*\(/g,todo:/\b(?:TODO|FIXME)\b/g,anim:/@keyframes\b/g,grad:/(?:linear|radial|conic)-gradient\s*\(/g,dbg:/\bdebugger\b/g,imp:/!important/g,fetch:/\bfetch\s*\(/g,eval:/\beval\s*\(/g};
function mkCount(t){const o={};for(const k in FEAT){const m=t.match(FEAT[k]);o[k]=m?m.length:0}return o}
let mkSt=null,mkKey='';
export function mkWatch(u,name){
  const key=((typeof S.cur!=='undefined'&&S.cur&&S.cur.id)||'')+':'+name;
  if(!(key in S.featPrev))S.featPrev[key]=mkCount(u.startState.doc.toString());
  u.changes.iterChanges((fa,ta,fb,tb)=>{S.accDel+=ta-fa;S.accIns+=tb-fb});
  mkSt=u.state;mkKey=key;clearTimeout(tWatch);tWatch=setTimeout(mkAnalyze,1500);
  if(!lookRaf2)lookRaf2=requestAnimationFrame(()=>{lookRaf2=0;try{const c=u.view.coordsAtPos(u.state.selection.main.head);if(c)mkLook(c.left,c.top,1800)}catch(e){}});
}
function mkAnalyze(){
  if(!mkSt)return;
  const now=mkCount(mkSt.doc.toString()),prev=S.featPrev[mkKey]||{},del=S.accDel,ins=S.accIns;S.accDel=S.accIns=0;S.featPrev[mkKey]=now;
  if(Date.now()-lastTalk<4000||Date.now()-lastCmt<25000)return;
  let ev=null;
  for(const k in now){if(now[k]>(prev[k]||0)&&(cmtN[k]||0)<2){ev='c_'+k;cmtN[k]=(cmtN[k]||0)+1;break}}
  if(!ev&&del>=250&&del>ins*3&&(cmtN.del||0)<3){ev='c_del';cmtN.del=(cmtN.del||0)+1}
  if(ev){lastCmt=Date.now();mikoSay(ev)}
}
/* colek Miko */
let pokes=0,tPoke=0;
function poke(){
  const f=mkFace();pokes++;clearTimeout(tPoke);tPoke=setTimeout(()=>{pokes=0},4000);
  bump();
  if(pokes>=5){pokes=0;f.classList.add('spin');setTimeout(()=>f.classList.remove('spin'),900);sfx('happy');mikoSay('easter');return}
  sfx('poke');
  if(ST.runs>=5&&Math.random()<.3){mikoSay('stats',{r:ST.runs,f:ST.fixes,s:ST.streak});return}
  mikoSay('poke');
}
mkFace().addEventListener('click',poke);
/* sapaan awal: sesuai jam, tema, dan lama tidak berkunjung */
const GREET={
  sakura:{n:'Halo, aku Miko, partner ngodingmu! Colek wajahku kapan saja ya~ 🐾',a:d=>'Selamat datang kembali! '+d+' hari nggak ketemu, Miko kangen~ 🌸',l:'Sudah larut, Senpai… jangan lupa tidur ya 🌙',d:(w,p)=>'Selamat '+w+', Senpai! Lanjut ngerjain "'+p+'"?'},
  cyber:{n:'Sistem online. Aku Miko, asisten koding. Sentuh avatar untuk interaksi.',a:d=>'Sesi baru setelah '+d+' hari. Semua modul siap.',l:'Jam operasional kritis. Disarankan tidur, Senpai.',d:(w,p)=>'Selamat '+w+'. Proyek "'+p+'" siap dilanjutkan.'},
  akatsuki:{n:'Hmph. Aku Miko. Jangan bikin aku repot ya.',a:d=>'Akhirnya muncul juga, '+d+' hari! …B-bukan berarti aku nungguin.',l:'Sudah selarut ini masih ngoding? Tidur sana!',d:(w,p)=>'Selamat '+w+'. "'+p+'" lagi? Ya sudah, ayo.'}
};
export function greet(){
  const g=GREET[THEME()]||GREET.sakura,now=new Date(),h=now.getHours(),bk=bucket(h);
  const w=h<11?'pagi':h<15?'siang':h<18?'sore':'malam';
  const last=+ls.get('nk_visit')||0;ls.set('nk_visit',String(Date.now()));
  const days=last?Math.floor((Date.now()-last)/864e5):-1;
  const today=dayKey(now);let sk=0;
  if(ST.last!==today){const y=new Date(now);y.setDate(y.getDate()-1);ST.streak=ST.last===dayKey(y)?ST.streak+1:1;ST.best=Math.max(ST.best,ST.streak);ST.last=today;if(MS.streak.includes(ST.streak))sk=ST.streak}
  let habit=null;const tot=ST.hrs.reduce((x,y)=>x+y,0);
  if(tot>=30&&ST.habit!==today){const top=ST.hrs.indexOf(Math.max(...ST.hrs));if(ST.hrs[top]/tot>=.55)habit=[bk===top?'habit_same':'habit_diff',{part:PART[top]}]}
  const nm=(typeof S.cur!=='undefined'&&S.cur&&S.cur.name)||'proyekmu';
  let t;
  if(days<0)t=g.n;
  else if(days>=2)t=g.a(days);
  else if(sk){t=mkLine('m_streak',{n:sk});bump()}
  else if(habit){t=mkLine(habit[0],habit[1]);ST.habit=today}
  else if(h>=23||h<4)t=g.l;
  else t=g.d(w,nm)+(ST.streak>=2?' (hari ke-'+ST.streak+' beruntun 🔥)':'');
  stSave();miko(t,'happy',true);
}
/* pengingat istirahat tiap 45 menit */
(function(){const t0=Date.now();let br=0;setInterval(()=>{const m=(Date.now()-t0)/6e4;if(m>=45*(br+1)){br++;mikoSay('rest',{n:45*br},true)}},60000)})();
armIdle();
