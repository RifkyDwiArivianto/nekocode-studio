/* State bersama (variabel yang berubah lintas modul) */
import { ls } from './util.js';

/* Variabel yang diubah dari beberapa modul dikumpulkan di sini. */
export const S = {
  featPrev: {},
  accIns: 0,
  accDel: 0,
  tOk: 0,
  runErr: false,
  errStreak: 0,
  sndOn: ls.get('nk_snd')!=='0',
  db: null,
  projects: [],
  cur: null,
  kind: '',
  states: {},
  view: null,
  wrapOn: ls.get('nk_wrap')===null?innerWidth<1024:ls.get('nk_wrap')==='1',
  fsz: +ls.get('nk_fs')||14,
  netCount: 0,
  devMode: 'r',
  errs: 0,
  tab: 'code',
};
