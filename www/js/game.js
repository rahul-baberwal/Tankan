/* Word rain: a small typing game. Works for English and Hindi because it compares whole words. */
(function () {
  'use strict';
  var $ = TK.$;
  var EN = ['file', 'desk', 'letter', 'office', 'record', 'clerk', 'train', 'river', 'market', 'school', 'water', 'forest', 'budget', 'notice', 'ticket', 'signal', 'engine', 'platform', 'village', 'farmer', 'doctor', 'library', 'station', 'payment', 'receipt', 'account', 'register', 'passage', 'keyboard', 'accuracy', 'practice', 'examination', 'department', 'certificate', 'application', 'secretary', 'government', 'department', 'procedure', 'transport'];
  var HI = ['देश', 'पानी', 'किसान', 'विद्यालय', 'कार्यालय', 'पत्र', 'रेल', 'नदी', 'बाज़ार', 'वृक्ष', 'शिक्षा', 'स्वास्थ्य', 'सरकार', 'परीक्षा', 'अभ्यास', 'टिकट', 'गाँव', 'पुस्तक', 'मित्र', 'त्योहार', 'समाचार', 'अधिकारी', 'प्रमाणपत्र', 'आवेदन', 'लिपिक'];
  var cv = $('#gcv'), g = cv.getContext('2d'), input = $('#gIn');
  var W = cv.width, H = cv.height;
  var st = null, raf = 0;
  var best = TK.store.get('gameBest', 0);
  $('#gBest').textContent = best;

  function ui() {
    $('#gScore').textContent = st ? st.score : 0;
    $('#gLevel').textContent = st ? st.level : 1;
    $('#gLives').textContent = st ? '❤️'.repeat(Math.max(0, st.lives)) || '💔' : '❤️❤️❤️';
  }
  function start() {
    var list = $('#gLang').value === 'hi' ? HI : EN;
    st = { list: list, words: [], parts: [], score: 0, level: 1, lives: 3, cleared: 0, spawn: 0, last: performance.now(), over: false, combo: 0 };
    $('#gOver').classList.add('hide');
    input.value = ''; input.disabled = false; input.focus(); ui();
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  }
  function spawn() {
    var w = st.list[Math.floor(Math.random() * st.list.length)];
    g.font = '28px ' + getComputedStyle(document.body).fontFamily;
    var width = g.measureText(w).width + 24;
    st.words.push({ t: w, x: 20 + Math.random() * (W - width - 40), y: -30, v: 34 + st.level * 9 + Math.random() * 14, w: width });
  }
  function boom(x, y) {
    for (var i = 0; i < 16; i++) st.parts.push({ x: x, y: y, vx: (Math.random() - .5) * 280, vy: (Math.random() - .8) * 260, life: 1, c: ['#15a6f0', '#f6a31b', '#1f9d55', '#fff'][i % 4] });
  }
  function loop(now) {
    if (!st) return;
    var dt = Math.min(0.05, (now - st.last) / 1000); st.last = now;
    if (!st.over) {
      st.spawn -= dt;
      if (st.spawn <= 0) { spawn(); st.spawn = Math.max(0.7, 2.3 - st.level * 0.16); }
      st.words.forEach(function (w) { w.y += w.v * dt; });
      for (var i = st.words.length - 1; i >= 0; i--) {
        if (st.words[i].y > H - 14) { st.words.splice(i, 1); st.lives--; st.combo = 0; TK.click(300); ui(); if (st.lives <= 0) end(); }
      }
    }
    st.parts.forEach(function (p) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 600 * dt; p.life -= dt * 1.6; });
    st.parts = st.parts.filter(function (p) { return p.life > 0; });
    draw();
    raf = requestAnimationFrame(loop);
  }
  function draw() {
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#0c1b2a'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#12304a'; g.fillRect(0, H - 14, W, 14);
    g.font = '28px ' + getComputedStyle(document.body).fontFamily; g.textBaseline = 'middle';
    var typed = input.value.trim();
    st.words.forEach(function (w) {
      var match = typed && w.t.indexOf(typed) === 0;
      g.fillStyle = match ? '#15a6f0' : '#1b3a55';
      var r = 12, x = w.x, y = w.y - 20, h = 40;
      g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w.w, y, x + w.w, y + h, r); g.arcTo(x + w.w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w.w, y, r); g.fill();
      g.fillStyle = '#fff'; g.fillText(w.t, x + 12, w.y + 1);
    });
    st.parts.forEach(function (p) { g.globalAlpha = Math.max(0, p.life); g.fillStyle = p.c; g.fillRect(p.x, p.y, 5, 5); });
    g.globalAlpha = 1;
    if (st.combo > 2) { g.fillStyle = '#f6a31b'; g.font = '700 22px ' + getComputedStyle(document.body).fontFamily; g.fillText('combo ×' + st.combo, 20, 26); }
  }
  function end() {
    st.over = true; input.disabled = true;
    if (st.score > best) { best = st.score; TK.store.set('gameBest', best); $('#gBest').textContent = best; }
    $('#gOverTxt').textContent = 'Score ' + st.score + ' · level ' + st.level + ' · best ' + best;
    $('#gOver').classList.remove('hide');
  }
  function submit() {
    if (!st || st.over) return;
    var v = input.value.trim(); input.value = '';
    if (!v) return;
    var hit = -1;
    st.words.forEach(function (w, i) { if (w.t === v && (hit < 0 || w.y > st.words[hit].y)) hit = i; });
    if (hit < 0) { st.combo = 0; TK.click(300); return; }
    var w = st.words.splice(hit, 1)[0];
    st.combo++; st.score += w.t.length * 10 + st.combo * 2; st.cleared++;
    if (st.cleared % 8 === 0) st.level++;
    boom(w.x + w.w / 2, w.y); TK.click(1800); ui();
  }
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); submit(); } });
  $('#gStart').addEventListener('click', start);
  $('#gAgain').addEventListener('click', start);
  window.TKGame = { onShow: function () { draw0(); }, onHide: function () { cancelAnimationFrame(raf); st = null; $('#gOver').classList.add('hide'); } };
  function draw0() { g.fillStyle = '#0c1b2a'; g.fillRect(0, 0, W, H); g.fillStyle = '#9fb7ca'; g.font = '30px ' + getComputedStyle(document.body).fontFamily; g.textAlign = 'center'; g.fillText('Press Play, then type the falling words', W / 2, H / 2); g.textAlign = 'left'; ui(); }
})();
