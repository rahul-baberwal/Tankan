/* Tankan scoring engine — pure functions, no DOM. Works in browser and Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TKEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PUNCT = /[\s.,;:!?'"“”‘’()\[\]{}\-–—_\/\\|।॥…]/g;

  function tokenize(text) {
    var t = String(text || '').trim();
    return t ? t.split(/\s+/) : [];
  }
  function chars(s) { return Array.from(String(s)); }
  function loose(w) { return w.replace(PUNCT, '').toLowerCase(); }

  /* Word-level alignment. Typed words are compared with the passage prefix;
     the untouched tail of the passage is free (semi-global alignment).
     Costs: exact 0 | same word, different case/punctuation = 0.5 (half) |
     wrong word, extra word, skipped word = 1 (full). */
  function align(refWords, typedWords) {
    var n = typedWords.length, m = refWords.length;
    var W = m + 1;
    var cost = new Float32Array((n + 1) * W);
    var op = new Uint8Array((n + 1) * W); // 1 ok,2 half,3 sub,4 extra(typed),5 skip(ref)
    var i, j, c, best, o;
    for (j = 1; j <= m; j++) { cost[j] = j; op[j] = 5; }
    for (i = 1; i <= n; i++) { cost[i * W] = i; op[i * W] = 4; }
    for (i = 1; i <= n; i++) {
      for (j = 1; j <= m; j++) {
        var a = typedWords[i - 1], b = refWords[j - 1];
        var dc, dop;
        if (a === b) { dc = 0; dop = 1; }
        else if (loose(a) === loose(b) && loose(a) !== '') { dc = 0.5; dop = 2; }
        else { dc = 1; dop = 3; }
        best = cost[(i - 1) * W + (j - 1)] + dc; o = dop;
        c = cost[(i - 1) * W + j] + 1;           // extra typed word
        if (c < best) { best = c; o = 4; }
        c = cost[i * W + (j - 1)] + 1;           // skipped passage word
        if (c < best) { best = c; o = 5; }
        cost[i * W + j] = best; op[i * W + j] = o;
      }
    }
    // trailing passage is free: choose end column with least cost, prefer nearer to n
    var endJ = 0, endCost = Infinity;
    for (j = 0; j <= m; j++) {
      c = cost[n * W + j];
      if (c < endCost || (c === endCost && Math.abs(j - n) < Math.abs(endJ - n))) { endCost = c; endJ = j; }
    }
    var ops = [];
    i = n; j = endJ;
    while (i > 0 || j > 0) {
      o = op[i * W + j];
      if (i === 0) o = 5; else if (j === 0) o = 4;
      if (o === 1 || o === 2 || o === 3) {
        ops.push({ t: o === 1 ? 'ok' : o === 2 ? 'half' : 'sub', typed: typedWords[i - 1], ref: refWords[j - 1] });
        i--; j--;
      } else if (o === 4) { ops.push({ t: 'extra', typed: typedWords[i - 1] }); i--; }
      else { ops.push({ t: 'skip', ref: refWords[j - 1] }); j--; }
    }
    ops.reverse();
    return { ops: ops, refUsed: endJ };
  }

  function weakChars(ops) {
    var map = {};
    ops.forEach(function (p) {
      if (p.t !== 'sub') return;
      var a = chars(p.typed), b = chars(p.ref);
      for (var k = 0; k < b.length; k++) {
        if (a[k] !== b[k]) { map[b[k]] = (map[b[k]] || 0) + 1; break; }
      }
    });
    return Object.keys(map).map(function (k) { return { ch: k, n: map[k] }; })
      .sort(function (x, y) { return y.n - x.n; }).slice(0, 8);
  }

  /* stats: {passage, typed, elapsedSec, keyDepressions, wrongPresses, backspaces, rules}
     rules: {targetWpm, targetKdph, maxErrPct} */
  function evaluate(s) {
    var refWords = tokenize(s.passage);
    var typedText = String(s.typed || '');
    var typedWords = tokenize(typedText);
    var endsOpen = typedText.length > 0 && !/\s$/.test(typedText);
    var res = align(refWords, typedWords);
    var ops = res.ops;

    // last word still being typed (time ran out mid-word) is not a mistake
    var partial = false;
    if (endsOpen && ops.length) {
      var last = ops[ops.length - 1];
      if (last.t === 'sub' && last.ref && last.ref.indexOf(last.typed) === 0) {
        last.t = 'partial'; partial = true;
      }
    }
    var full = 0, half = 0, typedCount = 0;
    ops.forEach(function (p) {
      if (p.t === 'sub' || p.t === 'extra' || p.t === 'skip') full++;
      else if (p.t === 'half') half++;
      if (p.t !== 'skip' && p.t !== 'partial') typedCount++;
    });
    var mistakes = full + half / 2;
    var minutes = Math.max(s.elapsedSec, 1) / 60;
    var typedChars = chars(typedText).length;
    var gross = typedChars / 5 / minutes;
    var net = Math.max(0, (typedChars / 5 - mistakes) / minutes);
    var kdph = (s.keyDepressions || typedChars) / minutes * 60;
    var wordAcc = typedCount ? Math.max(0, 100 * (1 - mistakes / typedCount)) : 0;
    var errPct = typedCount ? 100 * mistakes / typedCount : 0;
    var presses = Math.max(s.keyDepressions || 0, 1);
    var keyAcc = Math.max(0, 100 * (1 - (s.wrongPresses || 0) / presses));

    var r = s.rules || {};
    var reasons = [], pass = true;
    if (r.targetKdph) {
      if (kdph < r.targetKdph) { pass = false; reasons.push('Key depressions per hour ' + Math.round(kdph) + ' is below ' + r.targetKdph + '.'); }
    } else if (r.targetWpm) {
      if (net < r.targetWpm) { pass = false; reasons.push('Net speed ' + net.toFixed(1) + ' WPM is below ' + r.targetWpm + ' WPM.'); }
    }
    if (r.maxErrPct != null && errPct > r.maxErrPct) {
      pass = false; reasons.push('Mistakes ' + errPct.toFixed(1) + '% are above the ' + r.maxErrPct + '% limit.');
    }
    if (typedCount === 0) { pass = false; reasons = ['Nothing typed.']; }

    return {
      ops: ops, partial: partial, fullMistakes: full, halfMistakes: half, mistakes: mistakes,
      typedWords: typedCount, typedChars: typedChars, keyDepressions: s.keyDepressions || typedChars,
      backspaces: s.backspaces || 0, gross: gross, net: net, kdph: kdph,
      wordAccuracy: wordAcc, errorPct: errPct, keyAccuracy: keyAcc,
      weak: weakChars(ops), pass: pass, reasons: reasons, elapsedSec: s.elapsedSec
    };
  }

  /* Build one long passage block from a pool of paragraphs. */
  function rng(seed) { var x = seed >>> 0 || 1; return function () { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
  function buildPassage(pool, targetWords, seed) {
    var rand = rng(seed || (Date.now() & 0xffffffff));
    var idx = pool.map(function (_, i) { return i; });
    for (var i = idx.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)); var t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
    var out = [], count = 0, k = 0;
    while (count < targetWords) {
      var p = pool[idx[k % idx.length]]; k++;
      out.push(p); count += tokenize(p).length;
      if (k > pool.length * 4) break;
    }
    return out.join(' ');
  }

  return { tokenize: tokenize, align: align, evaluate: evaluate, buildPassage: buildPassage, chars: chars, loose: loose, rng: rng };
});
