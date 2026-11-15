/* Helper dasar: selektor DOM, escape HTML, id unik, localStorage aman, ikon SVG */

export const $=id=>document.getElementById(id);
export const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
export const uid=()=>'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
export const ls={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
export const I=n=>'<svg class="i"><use href="#i-'+n+'"/></svg>';
