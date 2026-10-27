const assert = require('assert');
const E = require('../www/js/engine.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

const ref = 'The quick brown fox jumps over the lazy dog near the river bank today.';

t('perfect typing has zero mistakes', () => {
  const r = E.evaluate({ passage: ref, typed: ref, elapsedSec: 60, keyDepressions: ref.length, rules: { targetWpm: 10, maxErrPct: 5 } });
  assert.strictEqual(r.fullMistakes, 0);
  assert.strictEqual(r.halfMistakes, 0);
  assert.strictEqual(r.pass, true);
  assert.ok(Math.abs(r.net - ref.length / 5) < 0.01);
});

t('wrong word is one full mistake', () => {
  const typed = ref.replace('brown', 'brwn');
  const r = E.evaluate({ passage: ref, typed, elapsedSec: 60 });
  assert.strictEqual(r.fullMistakes, 1);
  assert.strictEqual(r.halfMistakes, 0);
});

t('case or punctuation only is a half mistake', () => {
  const typed = ref.replace('The', 'the').replace('today.', 'today');
  const r = E.evaluate({ passage: ref, typed, elapsedSec: 60 });
  assert.strictEqual(r.fullMistakes, 0);
  assert.strictEqual(r.halfMistakes, 2);
  assert.strictEqual(r.mistakes, 1);
});

t('skipped word counts once, not a cascade', () => {
  const typed = ref.replace('jumps ', '');
  const r = E.evaluate({ passage: ref, typed, elapsedSec: 60 });
  assert.strictEqual(r.fullMistakes, 1);
});

t('extra word counts once', () => {
  const typed = ref.replace('lazy', 'very lazy');
  const r = E.evaluate({ passage: ref, typed, elapsedSec: 60 });
  assert.strictEqual(r.fullMistakes, 1);
});

t('untyped passage tail is free', () => {
  const typed = 'The quick brown fox ';
  const r = E.evaluate({ passage: ref, typed, elapsedSec: 60 });
  assert.strictEqual(r.fullMistakes, 0);
  assert.strictEqual(r.typedWords, 4);
});

t('word cut off by the timer is not a mistake', () => {
  const typed = 'The quick brown fox jum';
  const r = E.evaluate({ passage: ref, typed, elapsedSec: 60 });
  assert.strictEqual(r.fullMistakes, 0);
  assert.strictEqual(r.partial, true);
});

t('Hindi words compare by code points', () => {
  const hi = 'भारत एक विशाल देश है और यहाँ अनेक भाषाएँ बोली जाती हैं।';
  const ok = E.evaluate({ passage: hi, typed: hi, elapsedSec: 30 });
  assert.strictEqual(ok.fullMistakes, 0);
  const bad = E.evaluate({ passage: hi, typed: hi.replace('विशाल', 'विशल'), elapsedSec: 30 });
  assert.strictEqual(bad.fullMistakes, 1);
  const dandaOnly = E.evaluate({ passage: hi, typed: hi.replace('हैं।', 'हैं'), elapsedSec: 30 });
  assert.strictEqual(dandaOnly.halfMistakes, 1);
});

t('DEST pass uses key depressions per hour', () => {
  const r = E.evaluate({ passage: ref, typed: ref, elapsedSec: 60, keyDepressions: 100, rules: { targetKdph: 8000, maxErrPct: 5 } });
  assert.strictEqual(r.pass, false);
  const r2 = E.evaluate({ passage: ref, typed: ref, elapsedSec: 60, keyDepressions: 150, rules: { targetKdph: 8000 } });
  assert.strictEqual(r2.kdph, 9000);
  assert.strictEqual(r2.pass, true);
});

t('error limit fails the test even at good speed', () => {
  const bad = ref.split(' ').map((w, i) => (i % 3 === 0 ? 'xx' : w)).join(' ');
  const r = E.evaluate({ passage: ref, typed: bad, elapsedSec: 30, rules: { targetWpm: 5, maxErrPct: 5 } });
  assert.strictEqual(r.pass, false);
});

t('empty input fails cleanly', () => {
  const r = E.evaluate({ passage: ref, typed: '', elapsedSec: 10 });
  assert.strictEqual(r.pass, false);
  assert.strictEqual(r.net, 0);
});

t('buildPassage reaches the word target', () => {
  const pool = ['one two three four five', 'six seven eight nine ten', 'alpha beta gamma delta epsilon'];
  const p = E.buildPassage(pool, 40, 7);
  assert.ok(E.tokenize(p).length >= 40);
});

t('large input stays fast', () => {
  const big = Array.from({ length: 700 }, (_, i) => 'word' + (i % 50)).join(' ');
  const typed = big.replace('word7 ', '');
  const t0 = Date.now();
  const r = E.evaluate({ passage: big, typed, elapsedSec: 600 });
  assert.ok(Date.now() - t0 < 1500);
  assert.ok(r.fullMistakes >= 1 && r.fullMistakes <= 3);
});

console.log('\n' + n + ' tests passed');
