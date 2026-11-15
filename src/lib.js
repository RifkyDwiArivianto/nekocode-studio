/* Pembungkus library pihak ketiga (CodeMirror 6, js-beautify, acorn).
   Seluruh aplikasi mengaksesnya lewat objek `L`. */
import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import {
  defaultKeymap, history, historyKeymap, indentWithTab, undo, redo,
  cursorCharLeft, cursorCharRight, cursorLineUp, cursorLineDown,
  toggleComment, indentMore, indentLess, copyLineDown,
} from '@codemirror/commands';
import { bracketMatching, indentOnInput } from '@codemirror/language';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches, openSearchPanel } from '@codemirror/search';
import { parse } from 'acorn';
import jsBeautify from 'js-beautify/js/lib/beautify.js';
import cssBeautify from 'js-beautify/js/lib/beautify-css.js';
import htmlBeautify from 'js-beautify/js/lib/beautify-html.js';

/* Sisipkan __nkg() ke setiap badan loop supaya loop tak berujung bisa dihentikan. */
function guard(code, isModule) {
  let ast;
  try {
    ast = parse(code, {
      ecmaVersion: 'latest',
      sourceType: isModule ? 'module' : 'script',
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
    });
  } catch {
    return code;
  }
  const ins = [];
  (function walk(n) {
    if (!n || typeof n.type !== 'string') return;
    if (/^(While|DoWhile|For|ForIn|ForOf)Statement$/.test(n.type)) {
      const b = n.body;
      if (b.type === 'BlockStatement') ins.push([b.start + 1, '__nkg();']);
      else { ins.push([b.start, '{__nkg();']); ins.push([b.end, '}']); }
    }
    for (const k in n) {
      if (k === 'type' || k === 'start' || k === 'end') continue;
      const v = n[k];
      Array.isArray(v) ? v.forEach(walk) : v && typeof v.type === 'string' && walk(v);
    }
  })(ast);
  ins.sort((a, b) => b[0] - a[0]);
  for (const [pos, txt] of ins) code = code.slice(0, pos) + txt + code.slice(pos);
  return code;
}

export const L = {
  EditorView, EditorState, Compartment, keymap, lineNumbers, highlightActiveLine, drawSelection,
  defaultKeymap, history, historyKeymap, indentWithTab, bracketMatching, indentOnInput,
  html, css, javascript, oneDark,
  closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap,
  searchKeymap, highlightSelectionMatches, openSearchPanel,
  beautify: {
    html: htmlBeautify.html_beautify,
    css: cssBeautify.css_beautify,
    js: jsBeautify.js_beautify,
  },
  guard,
  undo, redo, cursorCharLeft, cursorCharRight, cursorLineUp, cursorLineDown,
  toggleComment, indentMore, indentLess, copyLineDown,
};
