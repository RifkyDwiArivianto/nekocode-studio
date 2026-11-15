/* Suara: suara karakter Miko dan efek bunyi UI (Web Audio) */
import { $ } from './util.js';
import { THEME, mkFace } from './miko.js';
import { S } from './state.js';

/* suara karakter tanpa kata: tiap huruf jadi bunyi bernada, teks bubble muncul sinkron */
const AU={sakura:{type:'triangle',base:640,lp:3400},cyber:{type:'square',base:780,lp:2600},akatsuki:{type:'sawtooth',base:420,lp:1700}};
const SC=[0,2,4,7,9,12,14,16];
let vTm=[],vMaster=null;
export function stopVoice(){
  vTm.forEach(clearTimeout);vTm=[];
  if(vMaster){try{vMaster.disconnect()}catch(e){}vMaster=null}
  const f=mkFace();if(f)f.classList.remove('talk');
}
export function mikoVoice(s,mood,auto){
  const chars=[...s],marks=[],el=$('miko'),f=mkFace(),th=AU[THEME()]||AU.sakura;
  const ms={happy:1.12,worry:.88,sleepy:.8,shy:1.05}[mood]||1;
  const step=Math.max(.025,Math.min(.06,5/chars.length));
  let ac=null;
  if(S.sndOn&&navigator.userActivation&&navigator.userActivation.hasBeenActive){
    try{
      actx=actx||new(window.AudioContext||window.webkitAudioContext)();
      if(actx.state==='suspended')actx.resume();
      ac=actx;vMaster=ac.createGain();vMaster.gain.value=auto?.25:.5;vMaster.connect(ac.destination);
    }catch(e){ac=null}
  }
  const base=ac?ac.currentTime+.04:0;let tt=0,k=0;
  chars.forEach(ch=>{
    marks.push(tt);
    if(/\p{L}/u.test(ch)){
      if(ac&&k++%2===0){
        try{
          const fq=th.base*ms*Math.pow(2,SC[ch.toLowerCase().codePointAt(0)%8]/12),t=base+tt;
          const o=ac.createOscillator(),g=ac.createGain(),lp=ac.createBiquadFilter();
          o.type=th.type;o.frequency.setValueAtTime(fq,t);o.frequency.exponentialRampToValueAtTime(fq*1.04,t+.08);
          lp.type='lowpass';lp.frequency.value=th.lp;
          g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.3,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+.1);
          o.connect(lp);lp.connect(g);g.connect(vMaster);o.start(t);o.stop(t+.11);
        }catch(e){}
      }
      tt+=step;
    }else if(/[,、]/.test(ch))tt+=.14;
    else if(/[.!?…。！？]/.test(ch))tt+=.24;
    else tt+=step*.8;
  });
  if(f)f.classList.add('talk');
  chars.forEach((c,i)=>vTm.push(setTimeout(()=>{el.textContent=chars.slice(0,i+1).join('')},marks[i]*1000)));
  vTm.push(setTimeout(()=>{if(f)f.classList.remove('talk')},tt*1000+120));
  return tt*1000;
}
export const bump=()=>{const f=mkFace();f.classList.remove('bounce');void f.offsetWidth;f.classList.add('bounce')};
/* ---------- Suara ---------- */
let actx=null,lastSnd=0;
export function sfx(type){
  if(!S.sndOn)return;
  const now0=Date.now();if(type==='error'&&now0-lastSnd<400)return;lastSnd=now0;
  try{
    actx=actx||new(window.AudioContext||window.webkitAudioContext)();
    if(actx.state==='suspended')actx.resume();
    const o=actx.createOscillator(),g=actx.createGain(),n=actx.currentTime;
    o.connect(g);g.connect(actx.destination);
    if(type==='click'){o.type='sine';o.frequency.setValueAtTime(800,n);o.frequency.exponentialRampToValueAtTime(400,n+.05);g.gain.setValueAtTime(.1,n);g.gain.linearRampToValueAtTime(.01,n+.05);o.start(n);o.stop(n+.05)}
    else if(type==='run'){o.type='triangle';o.frequency.setValueAtTime(300,n);o.frequency.exponentialRampToValueAtTime(900,n+.15);g.gain.setValueAtTime(.15,n);g.gain.linearRampToValueAtTime(.01,n+.15);o.start(n);o.stop(n+.15)}
    else if(type==='poke'){o.type='triangle';o.frequency.setValueAtTime(620,n);o.frequency.exponentialRampToValueAtTime(980,n+.07);o.frequency.exponentialRampToValueAtTime(720,n+.14);g.gain.setValueAtTime(.12,n);g.gain.linearRampToValueAtTime(.01,n+.15);o.start(n);o.stop(n+.15)}
     else if(type==='happy'){o.type='sine';[523,659,784].forEach((q,k)=>o.frequency.setValueAtTime(q,n+k*.08));g.gain.setValueAtTime(.14,n);g.gain.linearRampToValueAtTime(.01,n+.28);o.start(n);o.stop(n+.28)}
     else{o.type='sawtooth';o.frequency.setValueAtTime(200,n);o.frequency.setValueAtTime(150,n+.1);g.gain.setValueAtTime(.2,n);g.gain.linearRampToValueAtTime(.01,n+.2);o.start(n);o.stop(n+.2)}
  }catch(e){}
}
